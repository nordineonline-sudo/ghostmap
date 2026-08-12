import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  deltaSeconds: number;
  ghostCaught: boolean;
  topOffset?: number;
}

export default function GhostIndicator({ deltaSeconds, ghostCaught, topOffset = 60 }: Props) {
  const colors = useThemeStore((s) => s.colors);

  if (ghostCaught) {
    return (
      <View style={[styles.container, styles.caught, { top: topOffset, borderColor: colors.success, backgroundColor: `${colors.success}1A` }]}> 
        <Text style={[styles.caughtText, { color: colors.success }]}>Fantôme rattrapé</Text>
      </View>
    );
  }

  const isAhead = deltaSeconds > 0;
  const sign = isAhead ? '+' : '';
  const seconds = Math.round(deltaSeconds);
  const color = isAhead ? colors.success : colors.danger;

  return (
    <View style={[styles.container, { top: topOffset, borderColor: color, backgroundColor: colors.overlay }]}> 
      <Text style={[styles.label, { color: colors.textSecondary }]}>vs Fantôme</Text>
      <Text style={[styles.delta, { color }]}>
        {sign}{seconds}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
  },
  caught: {},
  caughtText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  label: {
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
