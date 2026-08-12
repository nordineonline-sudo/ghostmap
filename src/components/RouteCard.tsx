import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import type { SavedRoute } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';
import { useThemeStore } from '../stores/themeStore';

interface Props {
  route: SavedRoute;
  onPress: () => void;
  onReplay?: () => void;
  onGhost?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export default function RouteCard({
  route,
  onPress,
  onReplay,
  onGhost,
  onShare,
  onDelete,
}: Props) {
  const colors = useThemeStore((s) => s.colors);
  const icon = route.type === 'bike' ? 'Velo' : 'Walk';
  const typeLabel = route.type === 'bike' ? 'Vélo' : 'Marche';
  const dateStr = new Date(route.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {route.thumbnailUri ? (
          <Image
            source={{ uri: route.thumbnailUri }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.surfaceLight }] }>
            <View style={[styles.thumbnailBadge, { backgroundColor: route.type === 'bike' ? colors.bike : colors.walk }]}>
              <Text style={styles.thumbnailBadgeText}>{icon}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {route.name}
          </Text>
          <Text style={[styles.type, { color: colors.primaryDark, backgroundColor: colors.surfaceLight }]}>{typeLabel}</Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>

        <View style={styles.statsRow}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {formatDistance(route.distance)} km
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {formatDuration(route.duration)}
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {msToKmh(route.avgSpeed).toFixed(1)} km/h
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {onReplay && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onReplay}>
              <Text style={[styles.actionText, { color: colors.white }]}>Lecture</Text>
            </TouchableOpacity>
          )}
          {onGhost && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.ghostBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={onGhost}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>Ghost</Text>
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={onShare}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>Partager</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: colors.danger }]}
              onPress={onDelete}
            >
              <Text style={[styles.actionText, { color: colors.white }]}>Suppr.</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  thumbnailContainer: {
    width: 100,
    minHeight: 140,
  },
  thumbnail: {
    flex: 1,
    width: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  thumbnailBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    flex: 1,
  },
  type: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginLeft: SPACING.sm,
  },
  date: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  stat: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  ghostBtn: {},
  shareBtn: {},
  deleteBtn: {
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
