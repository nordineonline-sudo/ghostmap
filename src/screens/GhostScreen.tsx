import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useGhostStore } from '../stores/ghostStore';
import { useRouteStore } from '../stores/routeStore';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import FloatingButton from '../components/FloatingButton';
import StatsOverlay from '../components/StatsOverlay';
import GhostIndicator from '../components/GhostIndicator';
import LeafletMap, { MapPolyline, MapMarker } from '../components/LeafletMap';

type ScreenRouteProp = RouteProp<RootStackParamList, 'Ghost'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function GhostScreen() {
  const { params } = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavProp>();
  const ghostTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const themeColors = useThemeStore((s) => s.colors);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | undefined>();

  // Stores
  const { getRoute, loadRoutes, routes } = useRouteStore();
  const gps = useGPSStore();
  const ghost = useGhostStore();

  // Load routes if needed
  useEffect(() => {
    if (routes.length === 0) loadRoutes();
  }, []);

  // Load ghost reference
  useEffect(() => {
    const route = getRoute(params.routeId);
    if (route) {
      ghost.loadGhost(route.points);
    }
  }, [params.routeId, routes]);

  // Set initial center from ghost points
  useEffect(() => {
    if (ghost.ghostPoints.length > 0 && !mapCenter) {
      setMapCenter({ latitude: ghost.ghostPoints[0].latitude, longitude: ghost.ghostPoints[0].longitude });
    }
  }, [ghost.ghostPoints]);

  // Ghost animation timer
  useEffect(() => {
    if (gps.status === 'recording' && ghost.ghostStartTime) {
      ghostTimerRef.current = setInterval(() => {
        ghost.updateGhostPosition();
        if (gps.currentPosition) {
          ghost.updateComparison(gps.currentPosition);
        }
      }, 500);
    }
    return () => {
      if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
    };
  }, [gps.status, ghost.ghostStartTime]);

  // Elapsed time ticker
  useEffect(() => {
    if (gps.status === 'recording') {
      tickTimerRef.current = setInterval(gps.tick, 1000);
    }
    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [gps.status]);

  // Center map on user position during recording
  useEffect(() => {
    if (gps.currentPosition && gps.status === 'recording') {
      setMapCenter({ latitude: gps.currentPosition.latitude, longitude: gps.currentPosition.longitude });
    }
  }, [gps.currentPosition, gps.status]);

  // Cleanup
  useEffect(() => {
    return () => {
      gps.reset();
      ghost.reset();
    };
  }, []);

  const route = getRoute(params.routeId);

  // Polylines
  const polylines = useMemo<MapPolyline[]>(() => {
    const lines: MapPolyline[] = [];
    const ghostCoords = ghost.ghostPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
    if (ghostCoords.length >= 2) {
      lines.push({ id: 'ghost-track', coordinates: ghostCoords, color: COLORS.trackGhost, width: 4, dashed: true });
    }
    const userCoords = gps.points.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
    if (userCoords.length >= 2) {
      lines.push({ id: 'user-track', coordinates: userCoords, color: COLORS.trackBlue, width: 4 });
    }
    return lines;
  }, [ghost.ghostPoints, gps.points]);

  // Markers
  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = [];
    if (ghost.ghostPosition) {
      m.push({ id: 'ghost', coordinate: { latitude: ghost.ghostPosition.latitude, longitude: ghost.ghostPosition.longitude }, emoji: '👻', opacity: 0.6 });
    }
    if (gps.currentPosition) {
      m.push({ id: 'user', coordinate: { latitude: gps.currentPosition.latitude, longitude: gps.currentPosition.longitude }, emoji: route?.type === 'bike' ? '🚴' : '🚶' });
    }
    return m;
  }, [ghost.ghostPosition, gps.currentPosition, route?.type]);

  const handleStart = useCallback(async () => {
    if (gps.status === 'idle' || gps.status === 'stopped') {
      await gps.startTracking(3000);
      ghost.start();
    } else if (gps.status === 'recording') {
      gps.stopTracking();
      navigation.navigate('SaveRoute');
    }
  }, [gps.status]);

  if (!route) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const isRecording = gps.status === 'recording';

  return (
    <View style={styles.container}>
      <LeafletMap
        tileUrl={themeColors.tileUrl}
        center={mapCenter}
        zoom={15}
        polylines={polylines}
        markers={markers}
        showUserLocation={isRecording}
        userLocation={gps.currentPosition ? { latitude: gps.currentPosition.latitude, longitude: gps.currentPosition.longitude } : undefined}
        style={styles.map}
      />

      {/* Ghost header */}
      <View style={styles.ghostHeader}>
        <Text style={styles.ghostHeaderText}>
          👻 Mode Fantôme — {route.name}
        </Text>
      </View>

      {/* Ghost comparison indicator */}
      {isRecording && (
        <GhostIndicator
          deltaSeconds={ghost.comparison.deltaSeconds}
          ghostCaught={ghost.comparison.ghostCaught}
        />
      )}

      {/* Stats overlay */}
      {isRecording && (
        <StatsOverlay
          distance={gps.distance}
          speed={gps.currentPosition?.speed ?? 0}
          elapsed={gps.elapsed}
        />
      )}

      {/* Start/Stop button */}
      <View style={styles.buttonContainer}>
        <FloatingButton
          icon={isRecording ? '⏹' : '▶'}
          label={isRecording ? 'Arrêter' : 'Démarrer le Ghost'}
          variant={isRecording ? 'danger' : 'success'}
          size="lg"
          onPress={handleStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
  },
  ghostHeader: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  ghostHeaderText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
