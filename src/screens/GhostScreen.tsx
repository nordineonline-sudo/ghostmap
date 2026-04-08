import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useGhostStore } from '../stores/ghostStore';
import { useRouteStore } from '../stores/routeStore';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';
import StatsOverlay from '../components/StatsOverlay';
import GhostIndicator from '../components/GhostIndicator';

type ScreenRouteProp = RouteProp<RootStackParamList, 'Ghost'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function GhostScreen() {
  const { params } = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavProp>();
  const mapRef = useRef<MapView>(null);
  const ghostTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Center map on user position
  useEffect(() => {
    if (gps.currentPosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: gps.currentPosition.latitude,
          longitude: gps.currentPosition.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, [gps.currentPosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      gps.reset();
      ghost.reset();
    };
  }, []);

  const route = getRoute(params.routeId);

  // Ghost polyline
  const ghostPolyline = useMemo(
    () =>
      ghost.ghostPoints.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    [ghost.ghostPoints],
  );

  // User polyline
  const userPolyline = useMemo(
    () =>
      gps.points.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    [gps.points],
  );

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

  const icon = route.type === 'bike' ? '🚴' : '🚶';
  const isRecording = gps.status === 'recording';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: ghost.ghostPoints[0]?.latitude ?? 48.8566,
          longitude: ghost.ghostPoints[0]?.longitude ?? 2.3522,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="none"
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Ghost track (gray dashed) */}
        {ghostPolyline.length >= 2 && (
          <Polyline
            coordinates={ghostPolyline}
            strokeColor={COLORS.trackGhost}
            strokeWidth={4}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* User live track (blue) */}
        {userPolyline.length >= 2 && (
          <Polyline
            coordinates={userPolyline}
            strokeColor={COLORS.trackBlue}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Ghost cursor */}
        {ghost.ghostPosition && (
          <Marker
            coordinate={ghost.ghostPosition}
            opacity={0.6}
          >
            <View style={styles.ghostMarker}>
              <Text style={styles.ghostMarkerText}>👻</Text>
            </View>
          </Marker>
        )}

        {/* User cursor */}
        {gps.currentPosition && (
          <Marker
            coordinate={{
              latitude: gps.currentPosition.latitude,
              longitude: gps.currentPosition.longitude,
            }}
          >
            <View style={styles.userMarker}>
              <Text style={styles.userMarkerText}>{icon}</Text>
            </View>
          </Marker>
        )}
      </MapView>

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
  ghostMarker: {
    backgroundColor: 'rgba(156, 163, 175, 0.4)',
    borderRadius: 20,
    padding: 4,
  },
  ghostMarkerText: {
    fontSize: 28,
  },
  userMarker: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarkerText: {
    fontSize: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
