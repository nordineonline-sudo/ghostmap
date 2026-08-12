import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function FloatingButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
}: Props) {
  const colors = useThemeStore((s) => s.colors);

  const bgColor = {
    primary: colors.primary,
    danger: colors.danger,
    ghost: colors.surfaceLight,
    success: colors.success,
  }[variant];

  const textColor = variant === 'ghost' ? colors.text : colors.white;

  const sizeStyle = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
    md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
    lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  }[size];

  const fontSize = {
    sm: FONT_SIZE.sm,
    md: FONT_SIZE.md,
    lg: FONT_SIZE.lg,
  }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: bgColor },
        sizeStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>
          {icon ? `${icon} ` : ''}
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
});
