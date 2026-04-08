import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import {
  formatDistance,
  formatSpeed,
  formatDuration,
  msToKmh,
  averageSpeed,
  maxSpeed,
} from '../utils/gps';
import FloatingButton from '../components/FloatingButton';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function RecordingScreen() {
  const navigation = useNavigation<NavProp>();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    status,
    points,
    distance,
    elapsed,
    currentPosition,
    stopTracking,
    tick,
  } = useGPSStore();

  useEffect(() => {
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentSpeed = currentPosition?.speed ?? 0;
  const avg = averageSpeed(points);
  const max = maxSpeed(points);

  const handleStop = () => {
    stopTracking();
    navigation.navigate('SaveRoute');
  };

  return (
    <View style={styles.container}>
      {/* Big timer */}
      <Text style={styles.timer}>{formatDuration(elapsed)}</Text>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridIcon}>📏</Text>
          <Text style={styles.gridValue}>{formatDistance(distance)}</Text>
          <Text style={styles.gridLabel}>km</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridIcon}>⚡</Text>
          <Text style={styles.gridValue}>{formatSpeed(currentSpeed)}</Text>
          <Text style={styles.gridLabel}>km/h</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridIcon}>📊</Text>
          <Text style={styles.gridValue}>{msToKmh(avg).toFixed(1)}</Text>
          <Text style={styles.gridLabel}>moy. km/h</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridIcon}>🚀</Text>
          <Text style={styles.gridValue}>{msToKmh(max).toFixed(1)}</Text>
          <Text style={styles.gridLabel}>max km/h</Text>
        </View>
      </View>

      {/* GPS points counter */}
      <Text style={styles.pointsCount}>📍 {points.length} points GPS</Text>

      {/* Status indicator */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, status === 'recording' && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {status === 'recording' ? 'Enregistrement en cours...' : 'En pause'}
        </Text>
      </View>

      {/* Stop button */}
      <View style={styles.buttonContainer}>
        <FloatingButton
          icon="⏹"
          label="Arrêter l'enregistrement"
          variant="danger"
          size="lg"
          onPress={handleStop}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  timer: {
    color: COLORS.text,
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  gridItem: {
    width: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  gridValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  gridLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  pointsCount: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textSecondary,
  },
  statusDotActive: {
    backgroundColor: COLORS.danger,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
