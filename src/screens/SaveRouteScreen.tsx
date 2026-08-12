import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useRouteStore } from '../stores/routeStore';
import { useCustomStore } from '../stores/customStore';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList, RouteType, SavedRoute } from '../types';
import {
  totalDistance,
  averageSpeed,
  maxSpeed as calcMaxSpeed,
  elapsedTime,
  formatDistance,
  formatDuration,
  formatSpeed,
} from '../utils/gps';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';
import { formatRouteName } from '../utils/routeNaming';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function SaveRouteScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useThemeStore((s) => s.colors);
  const { points, startCity, reset: resetGPS } = useGPSStore();
  const { addRoute } = useRouteStore();
  const routeNamingMethod = useCustomStore((s) => s.routeNamingMethod);

  const now = new Date();
  const defaultName = formatRouteName(startCity, routeNamingMethod, now);

  const [name, setName] = useState(defaultName);
  const [type, setType] = useState<RouteType>('bike');
  const [saving, setSaving] = useState(false);

  const dist = totalDistance(points);
  const avg = averageSpeed(points);
  const max = calcMaxSpeed(points);
  const dur = elapsedTime(points);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom requis', 'Veuillez donner un nom à votre parcours.');
      return;
    }

    setSaving(true);
    try {
      const route: SavedRoute = {
        id: `route_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: name.trim() || defaultName,
        type,
        date: new Date().toISOString(),
        duration: dur,
        distance: dist,
        avgSpeed: avg,
        maxSpeed: max,
        points: [...points],
      };

      await addRoute(route);
      resetGPS();
      Alert.alert('✅ Parcours sauvegardé', `"${route.name}" ajouté à votre bibliothèque.`, [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le parcours.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert('Supprimer ?', 'Voulez-vous vraiment supprimer cet enregistrement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          resetGPS();
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Sauvegarder le parcours</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vérifiez les chiffres, nommez la sortie, puis ajoutez-la à votre bibliothèque.</Text>
        </View>

        {/* Stats summary */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <StatItem label="Distance" value={`${formatDistance(dist)} km`} accent={colors.primary} colors={colors} />
          <StatItem label="Durée" value={formatDuration(dur)} accent={colors.accent} colors={colors} />
          <StatItem label="Vitesse moy." value={`${formatSpeed(avg)} km/h`} accent={colors.success} colors={colors} />
          <StatItem label="Vitesse max" value={`${formatSpeed(max)} km/h`} accent={colors.warning} colors={colors} />
          <StatItem label="Points GPS" value={`${points.length}`} accent={colors.primaryDark} colors={colors} />
        </View>

        {/* Name input */}
        <Text style={[styles.label, { color: colors.text }]}>Nom du parcours</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Ex : Tour du lac, Trajet bureau..."
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />

        {/* Type selector */}
        <Text style={[styles.label, { color: colors.text }]}>Type d'activité</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              {
                backgroundColor: colors.surface,
                borderColor: type === 'bike' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setType('bike')}
          >
            <View style={[styles.typePill, { backgroundColor: colors.bike }]} />
            <Text
              style={[styles.typeLabel, { color: type === 'bike' ? colors.primaryDark : colors.textSecondary }]}
            >
              Vélo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              {
                backgroundColor: colors.surface,
                borderColor: type === 'walk' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setType('walk')}
          >
            <View style={[styles.typePill, { backgroundColor: colors.walk }]} />
            <Text
              style={[styles.typeLabel, { color: type === 'walk' ? colors.primaryDark : colors.textSecondary }]}
            >
              Marche
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <FloatingButton
            icon="✓"
            label="Sauvegarder"
            onPress={handleSave}
            variant="primary"
            size="lg"
            loading={saving}
            style={styles.saveBtn}
          />
          <FloatingButton
            icon="✕"
            label="Supprimer"
            onPress={handleDiscard}
            variant="danger"
            size="md"
            style={styles.discardBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StatItem({
  label,
  value,
  accent,
  colors,
}: {
  label: string;
  value: string;
  accent: string;
  colors: ReturnType<typeof useThemeStore.getState>['colors'];
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  statsContainer: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statAccent: {
    width: 10,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    fontSize: FONT_SIZE.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    paddingVertical: SPACING.md,
  },
  typePill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.md,
    alignItems: 'center',
  },
  saveBtn: {
    width: '100%',
  },
  discardBtn: {
    width: '60%',
  },
});
