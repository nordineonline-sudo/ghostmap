import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface Props {
  deltaSeconds: number;
  ghostCaught: boolean;
}

export default function GhostIndicator({ deltaSeconds, ghostCaught }: Props) {
  if (ghostCaught) {
    return (
      <View style={[styles.container, styles.caught]}>
        <Text style={styles.caughtText}>🏆 Fantôme rattrapé !</Text>
      </View>
    );
  }

  const isAhead = deltaSeconds > 0;
  const sign = isAhead ? '+' : '';
  const seconds = Math.round(deltaSeconds);
  const color = isAhead ? COLORS.success : COLORS.danger;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={styles.label}>vs Fantôme</Text>
      <Text style={[styles.delta, { color }]}>
        {sign}{seconds}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.ghost,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
  },
  caught: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  caughtText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  delta: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginTop: 2,
  },
});
