import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../stores/themeStore';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

const MENU_ICONS: Record<string, string> = {
  Map: '🗺️',
  Library: '📚',
  Settings: '⚙️',
};

const MENU_LABELS: Record<string, string> = {
  Map: 'Carte',
  Library: 'Parcours',
  Settings: 'Paramètres',
};

const AUTO_HIDE_DELAY_MS = 3000;

// Custom tab bar: a floating hamburger button replaces the bottom tab bar so
// it never overlaps the Android system navigation bar/gestures. The menu it
// reveals closes itself automatically after a short delay of inactivity.
export default function HamburgerMenu({ state, navigation }: BottomTabBarProps) {
  const colors = useThemeStore((s) => s.colors);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      clearHideTimer();
      hideTimer.current = setTimeout(() => setOpen(false), AUTO_HIDE_DELAY_MS);
    }
    return clearHideTimer;
  }, [open, clearHideTimer]);

  const toggleMenu = useCallback(() => setOpen((o) => !o), []);

  const handleSelect = useCallback(
    (routeName: string) => {
      setOpen(false);
      navigation.navigate(routeName);
    },
    [navigation],
  );

  return (
    <>
      {open && <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />}
      <View style={[styles.container, { top: insets.top + SPACING.sm, left: SPACING.md }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabIcon, { color: colors.text }]}>{open ? '✕' : '☰'}</Text>
        </TouchableOpacity>

        {open && (
          <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              return (
                <TouchableOpacity
                  key={route.key}
                  style={[styles.menuItem, focused && { backgroundColor: `${colors.primary}22` }]}
                  onPress={() => handleSelect(route.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuIcon}>{MENU_ICONS[route.name] ?? '•'}</Text>
                  <Text style={[styles.menuLabel, { color: focused ? colors.primary : colors.text }]}>
                    {MENU_LABELS[route.name] ?? route.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'flex-start',
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 20,
  },
  menu: {
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingVertical: SPACING.xs,
    minWidth: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
