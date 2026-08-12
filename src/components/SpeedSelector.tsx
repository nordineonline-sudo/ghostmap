import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PlaybackSpeed } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  currentSpeed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

const SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10];

export default function SpeedSelector({ currentSpeed, onSpeedChange }: Props) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Vitesse</Text>
      <View style={styles.row}>
        {SPEEDS.map((speed) => (
          <TouchableOpacity
            key={speed}
            onPress={() => onSpeedChange(speed)}
            style={[
              styles.button,
              { backgroundColor: speed === currentSpeed ? colors.primary : colors.surfaceLight },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: speed === currentSpeed ? colors.white : colors.textSecondary },
              ]}
            >
              ×{speed}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
