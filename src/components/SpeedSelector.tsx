import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlaybackSpeed } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface Props {
  currentSpeed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

const SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10];

export default function SpeedSelector({ currentSpeed, onSpeedChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vitesse</Text>
      <View style={styles.row}>
        {SPEEDS.map((speed) => (
          <TouchableOpacity
            key={speed}
            onPress={() => onSpeedChange(speed)}
            style={[
              styles.button,
              speed === currentSpeed && styles.activeButton,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                speed === currentSpeed && styles.activeText,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surfaceLight,
    minWidth: 50,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.white,
  },
});
