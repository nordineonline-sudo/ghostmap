import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import { formatDistance, formatSpeed, formatDuration } from '../utils/gps';

interface Props {
  distance: number; // meters
  speed: number; // m/s
  elapsed: number; // seconds
  compact?: boolean;
}

export default function StatsOverlay({ distance, speed, elapsed, compact }: Props) {
  const colors = useThemeStore((s) => s.colors);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
        <StatBadge label="Distance" value={`${formatDistance(distance)} km`} colors={colors} />
        <StatBadge label="Vitesse" value={`${formatSpeed(speed)} km/h`} colors={colors} />
        <StatBadge label="Temps" value={formatDuration(elapsed)} colors={colors} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          label="Distance"
          value={formatDistance(distance)}
          unit="km"
          accent={colors.primary}
          colors={colors}
        />
        <StatCard
          label="Vitesse"
          value={formatSpeed(speed)}
          unit="km/h"
          accent={colors.accent}
          colors={colors}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label="Durée"
          value={formatDuration(elapsed)}
          unit=""
          accent={colors.success}
          colors={colors}
          wide
        />
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  unit,
  accent,
  colors,
  wide,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
  colors: ReturnType<typeof useThemeStore.getState>['colors'];
  wide?: boolean;
}) {
  return (
    <View style={[styles.card, wide && styles.cardWide, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
      <View style={[styles.cardAccent, { backgroundColor: accent }]} />
      <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.cardValue, { color: colors.text }]}>
        {value}
        {unit ? <Text style={[styles.cardUnit, { color: colors.textSecondary }]}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function StatBadge({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeStore.getState>['colors'];
}) {
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.badgeValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.md,
    right: SPACING.md,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  card: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  cardWide: {
    flex: 1,
  },
  cardAccent: {
    width: 36,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  cardLabel: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  cardUnit: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
  },
  badge: {
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
