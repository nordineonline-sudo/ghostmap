import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouteStore } from '../stores/routeStore';
import { useReplayStore } from '../stores/replayStore';
import { RootStackParamList, PlaybackSpeed } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { formatDistance, formatSpeed, formatDuration, msToKmh } from '../utils/gps';
import FloatingButton from '../components/FloatingButton';
import SpeedSelector from '../components/SpeedSelector';
import ProgressBar from '../components/ProgressBar';

type ScreenRouteProp = RouteProp<RootStackParamList, 'Replay'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReplayScreen() {
  const { params } = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<NavProp>();
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

  const polylineCoords = useMemo(
    () => replayPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    [replayPoints],
  );

  // Current track = points up to current index
  const currentTrack = useMemo(
    () => polylineCoords.slice(0, currentIndex + 1),
    [polylineCoords, currentIndex],
  );

  // Current position
  const currentPoint = replayPoints[currentIndex];
  const progress = totalDuration > 0 ? elapsedMs / (totalDuration * 1000) : 0;
  const elapsedSec = elapsedMs / 1000;

  // Map region — center on the route
  const mapRegion = useMemo(() => {
    if (replayPoints.length === 0) return undefined;
    const lats = replayPoints.map((p) => p.latitude);
    const lngs = replayPoints.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.3 + 0.002,
      longitudeDelta: (maxLng - minLng) * 1.3 + 0.002,
    };
  }, [replayPoints]);

  if (!route) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const icon = route.type === 'bike' ? '🚴' : '🚶';

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        mapType="none"
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Full ghost track (faint) */}
        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.ghostOverlay}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* Animated replay track (blue) */}
        {currentTrack.length >= 2 && (
          <Polyline
            coordinates={currentTrack}
            strokeColor={COLORS.trackBlue}
            strokeWidth={4}
            lineCap="round"
          />
        )}

        {/* Cursor marker */}
        {currentPoint && (
          <Marker
            coordinate={{
              latitude: currentPoint.latitude,
              longitude: currentPoint.longitude,
            }}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerIcon}>{icon}</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom controls overlay */}
      <View style={styles.controls}>
        {/* Route name */}
        <Text style={styles.routeName}>
          {icon} {route.name}
        </Text>

        {/* Live stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Vitesse</Text>
            <Text style={styles.statValue}>
              {currentPoint ? formatSpeed(currentPoint.speed) : '0.0'} km/h
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {formatDistance(route.distance)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Vit. moy.</Text>
            <Text style={styles.statValue}>
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
          <Text style={styles.finishedText}>✅ Lecture terminée</Text>
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
  },
  controls: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  routeName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.text,
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
    color: COLORS.success,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  markerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 24,
  },
});
