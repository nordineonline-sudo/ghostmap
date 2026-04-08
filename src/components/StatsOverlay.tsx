import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { formatDistance, formatSpeed, formatDuration } from '../utils/gps';

interface Props {
  distance: number; // meters
  speed: number; // m/s
  elapsed: number; // seconds
  compact?: boolean;
}

export default function StatsOverlay({ distance, speed, elapsed, compact }: Props) {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <StatBadge label="Distance" value={`${formatDistance(distance)} km`} />
        <StatBadge label="Vitesse" value={`${formatSpeed(speed)} km/h`} />
        <StatBadge label="Temps" value={formatDuration(elapsed)} />
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
          icon="📏"
        />
        <StatCard
          label="Vitesse"
          value={formatSpeed(speed)}
          unit="km/h"
          icon="⚡"
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label="Durée"
          value={formatDuration(elapsed)}
          unit=""
          icon="⏱️"
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
  icon,
  wide,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>
        {value}
        {unit ? <Text style={styles.cardUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
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
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cardWide: {
    flex: 1,
  },
  cardIcon: {
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.xs,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  cardUnit: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
  },
  badge: {
    alignItems: 'center',
  },
  badgeLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  badgeValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
