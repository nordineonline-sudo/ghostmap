import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SavedRoute } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';

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
  const icon = route.type === 'bike' ? '🚴' : '🚶';
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
      style={styles.container}
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
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>{icon}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {icon} {route.name}
          </Text>
          <Text style={styles.type}>{typeLabel}</Text>
        </View>
        <Text style={styles.date}>{dateStr}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            📏 {formatDistance(route.distance)} km
          </Text>
          <Text style={styles.stat}>
            ⏱️ {formatDuration(route.duration)}
          </Text>
          <Text style={styles.stat}>
            ⚡ {msToKmh(route.avgSpeed).toFixed(1)} km/h
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {onReplay && (
            <TouchableOpacity style={styles.actionBtn} onPress={onReplay}>
              <Text style={styles.actionText}>▶️ Replay</Text>
            </TouchableOpacity>
          )}
          {onGhost && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.ghostBtn]}
              onPress={onGhost}
            >
              <Text style={styles.actionText}>👻 Ghost</Text>
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={onShare}
            >
              <Text style={styles.actionText}>📤</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={onDelete}
            >
              <Text style={styles.actionText}>🗑️</Text>
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  thumbnailContainer: {
    width: 100,
    minHeight: 140,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 36,
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
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    flex: 1,
  },
  type: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginLeft: SPACING.sm,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  stat: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  ghostBtn: {
    backgroundColor: COLORS.surfaceLight,
  },
  shareBtn: {
    backgroundColor: COLORS.surfaceLight,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    marginLeft: 'auto',
  },
  actionText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
