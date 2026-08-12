import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouteStore } from '../stores/routeStore';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList, RouteType, SavedRoute } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import RouteCard from '../components/RouteCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useThemeStore((s) => s.colors);
  const { routes, loading, loadRoutes, deleteRoute } = useRouteStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<RouteType | 'all'>('all');

  useEffect(() => {
    loadRoutes();
  }, []);

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteRoute(id),
      },
    ]);
  };

  const handleShare = async (route: SavedRoute) => {
    try {
      const gmr = {
        version: 1,
        app: 'GhostMap',
        exportedAt: new Date().toISOString(),
        routes: [route],
      };
      const safeName = route.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}.gmr`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(gmr), {
        encoding: 'utf8',
      });

      // Try native file sharing first (best for .gmr attachment)
      try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/octet-stream',
            dialogTitle: `Partager "${route.name}"`,
          });
          return;
        }
      } catch (shareErr) {
        console.warn('expo-sharing failed, falling back to RN Share:', shareErr);
      }

      // Fallback: use React Native Share API (text-based)
      await Share.share({
        title: `GhostMap - ${route.name}`,
        message: `Voici mon parcours "${route.name}" sur GhostMap !\n\n${JSON.stringify(gmr)}`,
      });
    } catch (e: any) {
      console.error('Share error:', e);
      Alert.alert('Erreur de partage', e?.message || 'Impossible de partager le parcours.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Mes parcours</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Retrouvez vos sorties et relancez un ghost en quelques secondes.</Text>
        </View>
        <Text style={[styles.count, { color: colors.primaryDark }]}>
          {filteredRoutes.length} parcours
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un trajet"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'bike', 'walk'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              { backgroundColor: filter === f ? colors.primary : colors.surface, borderColor: filter === f ? colors.primary : colors.border },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? colors.white : colors.textSecondary },
              ]}
            >
              {f === 'all' ? 'Tous' : f === 'bike' ? 'Vélo' : 'Marche'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Routes list */}
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRoutes}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyBadge, { backgroundColor: colors.surfaceLight }]}> 
              <Text style={[styles.emptyBadgeText, { color: colors.primaryDark }]}>Trajets</Text>
            </View>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {search || filter !== 'all'
                ? 'Aucun parcours trouvé'
                : 'Aucun parcours enregistré\nLancez votre premier tracking !'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onPress={() => navigation.navigate('Replay', { routeId: item.id })}
            onReplay={() => navigation.navigate('Replay', { routeId: item.id })}
            onGhost={() => navigation.navigate('Ghost', { routeId: item.id })}
            onShare={() => handleShare(item)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    maxWidth: 240,
  },
  count: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  searchRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZE.md,
    padding: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  emptyBadgeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
