import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouteStore } from '../stores/routeStore';
import { useReplayStore } from '../stores/replayStore';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList, PlaybackSpeed } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useCustomStore } from '../stores/customStore';
import { formatDistance, formatSpeed, msToKmh } from '../utils/gps';
import FloatingButton from '../components/FloatingButton';
import SpeedSelector from '../components/SpeedSelector';
import ProgressBar from '../components/ProgressBar';
import LeafletMap, { MapPolyline, MapMarker } from '../components/LeafletMap';

type ScreenRouteProp = RouteProp<RootStackParamList, 'Replay'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReplayScreen() {
  const { params } = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavProp>();
  const colors = useThemeStore((s) => s.colors);
  const custom = useCustomStore();
  const { getRoute, loadRoutes, routes } = useRouteStore();
  const {
    points: replayPoints,
    totalDuration,
    status,
    speed,
    currentIndex,
    elapsedMs,
    loadRoute,
    play,
    pause,
    stop,
    setSpeed,
    seekTo,
    reset,
  } = useReplayStore();

  // Load routes if not loaded yet
  useEffect(() => {
    if (routes.length === 0) {
      loadRoutes();
    }
  }, []);

  // Load route points when available
  useEffect(() => {
    const route = getRoute(params.routeId);
    if (route) {
      loadRoute(route.points);
    }
  }, [params.routeId, routes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const route = getRoute(params.routeId);

  // Current position
  const currentPoint = replayPoints[currentIndex];
  const progress = totalDuration > 0 ? elapsedMs / (totalDuration * 1000) : 0;
  const elapsedSec = elapsedMs / 1000;

  // Fit bounds for the route
  const fitBounds = useMemo(() => {
    if (replayPoints.length === 0) return undefined;
    const lats = replayPoints.map((p) => p.latitude);
    const lngs = replayPoints.map((p) => p.longitude);
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [replayPoints]);

  // Polylines: ghost track + animated track
  const polylines = useMemo<MapPolyline[]>(() => {
    const lines: MapPolyline[] = [];
    const allCoords = replayPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
    if (allCoords.length >= 2) {
      lines.push({
        id: 'ghost-track',
        coordinates: allCoords,
        color: custom.ghostTrackColor,
        width: 3,
        dashed: true,
      });
    }
    const current = allCoords.slice(0, currentIndex + 1);
    if (current.length >= 2) {
      lines.push({
        id: 'replay-track',
        coordinates: current,
        color: custom.trackColor,
        width: 4,
      });
    }
    return lines;
  }, [replayPoints, currentIndex]);

  // Cursor marker
  const markers = useMemo<MapMarker[]>(() => {
    if (!currentPoint) return [];
    return [{
      id: 'cursor',
      coordinate: { latitude: currentPoint.latitude, longitude: currentPoint.longitude },
      emoji: custom.userIcon.endsWith('-dot') ? '●' : custom.userIcon,
    }];
  }, [currentPoint, route?.type]);

  if (!route) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const typeLabel = route.type === 'bike' ? 'Vélo' : 'Marche';

  return (
    <View style={styles.container}>
      {/* Map */}
      <LeafletMap
        tileUrl={colors.tileUrl}
        fitBounds={fitBounds}
        polylines={polylines}
        markers={markers}
        style={styles.map}
      />

      {/* Bottom controls overlay */}
      <View style={[styles.controls, { backgroundColor: colors.overlay, borderColor: colors.border }]}> 
        {/* Route name */}
        <View style={styles.routeHeader}>
          <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
          <Text style={[styles.routeType, { color: colors.primaryDark, backgroundColor: colors.surfaceLight }]}>{typeLabel}</Text>
        </View>

        {/* Live stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vitesse</Text>
            <Text style={[styles.statValue, { color: colors.text }]}> 
              {currentPoint ? formatSpeed(currentPoint.speed) : '0.0'} km/h
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
            <Text style={[styles.statValue, { color: colors.text }]}> 
              {formatDistance(route.distance)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vit. moy.</Text>
            <Text style={[styles.statValue, { color: colors.text }]}> 
              {msToKmh(route.avgSpeed).toFixed(1)} km/h
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar
          progress={Math.min(progress, 1)}
          elapsed={elapsedSec}
          total={totalDuration}
          onSeek={seekTo}
        />

        {/* Speed selector */}
        <SpeedSelector
          currentSpeed={speed}
          onSpeedChange={(s: PlaybackSpeed) => setSpeed(s)}
        />

        {/* Play controls */}
        <View style={styles.playControls}>
          <FloatingButton
            icon={status === 'playing' ? '⏸' : '▶️'}
            label={status === 'playing' ? 'Pause' : 'Lecture'}
            variant="primary"
            size="md"
            onPress={status === 'playing' ? pause : play}
          />
          <FloatingButton
            icon="⏹"
            label="Stop"
            variant="ghost"
            size="md"
            onPress={() => {
              stop();
              navigation.goBack();
            }}
          />
        </View>

        {status === 'finished' && (
          <Text style={[styles.finishedText, { color: colors.success }]}>Lecture terminée</Text>
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.lg,
  },
  controls: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  routeName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  routeType: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  playControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  finishedText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
