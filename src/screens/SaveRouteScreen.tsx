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
import { RootStackParamList, RouteType, SavedRoute } from '../types';
import {
  totalDistance,
  averageSpeed,
  maxSpeed as calcMaxSpeed,
  elapsedTime,
  formatDistance,
  formatDuration,
  formatSpeed,
} from '../utils/gps';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function SaveRouteScreen() {
  const navigation = useNavigation<NavProp>();
  const { points, distance, elapsed, reset: resetGPS } = useGPSStore();
  const { addRoute } = useRouteStore();

  // Auto-fill name: "Parcours 07/04/2026 14:30"
  const now = new Date();
  const defaultName = `Parcours ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

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
        name: name.trim(),
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>💾 Sauvegarder le parcours</Text>

        {/* Stats summary */}
        <View style={styles.statsContainer}>
          <StatItem label="Distance" value={`${formatDistance(dist)} km`} icon="📏" />
          <StatItem label="Durée" value={formatDuration(dur)} icon="⏱️" />
          <StatItem label="Vitesse moy." value={`${formatSpeed(avg)} km/h`} icon="⚡" />
          <StatItem label="Vitesse max" value={`${formatSpeed(max)} km/h`} icon="🚀" />
          <StatItem label="Points GPS" value={`${points.length}`} icon="📍" />
        </View>

        {/* Name input */}
        <Text style={styles.label}>Nom du parcours</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex : Tour du lac, Trajet bureau..."
          placeholderTextColor={COLORS.textSecondary}
          autoFocus
        />

        {/* Type selector */}
        <Text style={styles.label}>Type d'activité</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'bike' && styles.typeBtnActive]}
            onPress={() => setType('bike')}
          >
            <Text style={styles.typeIcon}>🚴</Text>
            <Text
              style={[styles.typeLabel, type === 'bike' && styles.typeLabelActive]}
            >
              Vélo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'walk' && styles.typeBtnActive]}
            onPress={() => setType('walk')}
          >
            <Text style={styles.typeIcon}>🚶</Text>
            <Text
              style={[styles.typeLabel, type === 'walk' && styles.typeLabelActive]}
            >
              Marche
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <FloatingButton
            icon="💾"
            label="Sauvegarder"
            onPress={handleSave}
            variant="primary"
            size="lg"
            loading={saving}
            style={styles.saveBtn}
          />
          <FloatingButton
            icon="🗑️"
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
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  typeIcon: {
    fontSize: 24,
  },
  typeLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: COLORS.primary,
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
