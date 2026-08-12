import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import { formatDuration } from '../utils/gps';

interface Props {
  progress: number; // 0..1
  elapsed: number; // seconds
  total: number; // seconds
  onSeek: (value: number) => void;
}

export default function ProgressBar({ progress, elapsed, total, onSeek }: Props) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatDuration(elapsed)}</Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatDuration(total)}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { backgroundColor: colors.surfaceLight }]}>
          <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZE.sm,
    fontVariant: ['tabular-nums'],
  },
  barContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barBackground: {
    flex: 1,
    borderRadius: 3,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
