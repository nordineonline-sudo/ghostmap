import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
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
  const colors = useThemeStore((s) => s.colors);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Enregistrement actif</Text>
        <Text style={[styles.timer, { color: colors.text }]}>{formatDuration(elapsed)}</Text>
        <Text style={[styles.heroHint, { color: colors.textSecondary }]}>GhostMap suit votre allure en continu.</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.gridMetric, { color: colors.primaryDark }]}>Distance</Text>
          <Text style={[styles.gridValue, { color: colors.text }]}>{formatDistance(distance)}</Text>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>km</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.gridMetric, { color: colors.accent }]}>Instantanée</Text>
          <Text style={[styles.gridValue, { color: colors.text }]}>{formatSpeed(currentSpeed)}</Text>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>km/h</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.gridMetric, { color: colors.success }]}>Moyenne</Text>
          <Text style={[styles.gridValue, { color: colors.text }]}>{msToKmh(avg).toFixed(1)}</Text>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>km/h</Text>
        </View>
        <View style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.gridMetric, { color: colors.warning }]}>Max</Text>
          <Text style={[styles.gridValue, { color: colors.text }]}>{msToKmh(max).toFixed(1)}</Text>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>km/h</Text>
        </View>
      </View>

      {/* GPS points counter */}
      <Text style={[styles.pointsCount, { color: colors.textSecondary }]}>{points.length} points GPS</Text>

      {/* Status indicator */}
      <View style={[styles.statusRow, { backgroundColor: colors.surfaceLight }]}> 
        <View style={[styles.statusDot, { backgroundColor: status === 'recording' ? colors.danger : colors.textSecondary }]} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  heroCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: SPACING.sm,
  },
  heroHint: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  gridItem: {
    width: '45%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  gridMetric: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  gridValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  gridLabel: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  pointsCount: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
