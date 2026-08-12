import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';
import LeafletMap, { MapMarker, MapPolyline } from '../components/LeafletMap';
import StatsOverlay from '../components/StatsOverlay';
import { useCustomStore } from '../stores/customStore';
import { useGPSStore } from '../stores/gpsStore';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<NavProp>();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = useThemeStore((s) => s.colors);
  const custom = useCustomStore();
  const insets = useSafeAreaInsets();
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | undefined>();
  const [zoom, setZoom] = useState(custom.defaultZoom);

  useEffect(() => {
    if (custom.keepAwake) {
      activateKeepAwakeAsync('map').catch(() => {});
      return () => {
        deactivateKeepAwake('map').catch(() => {});
      };
    }

    deactivateKeepAwake('map').catch(() => {});
    return undefined;
  }, [custom.keepAwake]);

  const {
    status,
    currentPosition,
    points,
    distance,
    elapsed,
    startTracking,
    stopTracking,
    tick,
    requestPermissions,
  } = useGPSStore();

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission requise', 'GhostMap a besoin de la localisation GPS pour fonctionner.');
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMapCenter({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {}
    })();
  }, [requestPermissions]);

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(tick, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, tick]);

  useEffect(() => {
    if (currentPosition && status === 'recording') {
      setMapCenter({ latitude: currentPosition.latitude, longitude: currentPosition.longitude });
    }
  }, [currentPosition, status]);

  const handleStartStop = useCallback(async () => {
    if (status === 'idle' || status === 'stopped') {
      await startTracking(4000);
      return;
    }

    if (status === 'recording') {
      stopTracking();
      navigation.navigate('SaveRoute');
    }
  }, [navigation, startTracking, status, stopTracking]);

  const centerOnUser = useCallback(async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMapCenter({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      if (currentPosition) {
        setMapCenter({ latitude: currentPosition.latitude, longitude: currentPosition.longitude });
      }
    }
  }, [currentPosition]);

  const handleZoomIn = useCallback(() => {
    setZoom((value) => Math.min(value + 1, 19));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((value) => Math.max(value - 1, 3));
  }, []);

  const polylines = useMemo<MapPolyline[]>(() => {
    if (points.length < 2) {
      return [];
    }

    return [
      {
        id: 'track',
        coordinates: points.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
        color: custom.trackColor,
        width: 4,
      },
    ];
  }, [custom.trackColor, points]);

  const markers = useMemo<MapMarker[]>(() => {
    if (!currentPosition) {
      return [];
    }

    return [
      {
        id: 'user',
        coordinate: { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
        emoji: custom.userIcon.endsWith('-dot') ? '●' : custom.userIcon,
      },
    ];
  }, [currentPosition, custom.userIcon]);

  return (
    <View style={styles.container}>
      <LeafletMap
        tileUrl={colors.tileUrl}
        center={mapCenter}
        zoom={zoom}
        polylines={polylines}
        markers={markers}
        showUserLocation
        userLocation={currentPosition ? { latitude: currentPosition.latitude, longitude: currentPosition.longitude } : undefined}
        userDotColor={custom.userIconColor || custom.trackColor}
      />

      {status === 'recording' && (
        <View style={[styles.statsBar, { top: insets.top + 12 }]}> 
          <StatsOverlay distance={distance} speed={currentPosition?.speed ?? 0} elapsed={elapsed} compact />
        </View>
      )}

      <View style={[styles.sideButtons, { top: insets.top + 12 }]}> 
        <TouchableOpacity
          style={[styles.sideBtn, { backgroundColor: colors.overlay, borderColor: colors.border }]}
          onPress={handleZoomIn}
          activeOpacity={0.7}
        >
          <Text style={[styles.sideBtnIcon, { color: colors.text }]}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideBtn, { backgroundColor: colors.overlay, borderColor: colors.border }]}
          onPress={handleZoomOut}
          activeOpacity={0.7}
        >
          <Text style={[styles.sideBtnIcon, { color: colors.text }]}>﹣</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideBtn, { backgroundColor: colors.overlay, borderColor: colors.border }]}
          onPress={centerOnUser}
          activeOpacity={0.7}
        >
          <Text style={[styles.sideBtnIcon, { color: colors.text }]}>◎</Text>
        </TouchableOpacity>
        <FloatingButton
          icon={status === 'recording' ? '⏹' : '⏺'}
          label={status === 'recording' ? 'Arreter' : 'Demarrer'}
          variant={status === 'recording' ? 'danger' : 'primary'}
          size="md"
          onPress={handleStartStop}
          style={styles.actionButton}
        />
      </View>

      <Text style={[styles.versionBadge, { color: `${colors.text}55` }]}>GhostMap v1.0.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    position: 'absolute',
    left: 70,
    right: 60,
  },
  sideButtons: {
    position: 'absolute',
    right: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'flex-end',
  },
  sideBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  sideBtnIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButton: {
    minWidth: 132,
  },
  versionBadge: {
    position: 'absolute',
    left: SPACING.lg,
    bottom: 10,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
