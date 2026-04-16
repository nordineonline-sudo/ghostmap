import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useKeepAwake } from 'expo-keep-awake';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useThemeStore } from '../stores/themeStore';
import { useCustomStore } from '../stores/customStore';
import { RootStackParamList } from '../types';
import StatsOverlay from '../components/StatsOverlay';
import LeafletMap, { MapPolyline, MapMarker } from '../components/LeafletMap';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<NavProp>();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const COLORS = useThemeStore((s) => s.colors);
  const custom = useCustomStore();
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | undefined>();
  const [zoom, setZoom] = useState(custom.defaultZoom);

  // Keep screen awake if enabled
  useKeepAwake('map', { isEnabled: custom.keepAwake });

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

  // Request permissions on mount & get initial location
  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission requise',
          'GhostMap a besoin de la localisation GPS pour fonctionner.',
        );
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMapCenter({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {}
    })();
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Center map on current position during recording
  useEffect(() => {
    if (currentPosition && status === 'recording') {
      setMapCenter({ latitude: currentPosition.latitude, longitude: currentPosition.longitude });
    }
  }, [currentPosition, status]);

  const handleStartStop = useCallback(async () => {
    if (status === 'idle' || status === 'stopped') {
      await startTracking(4000);
    } else if (status === 'recording') {
      stopTracking();
      navigation.navigate('SaveRoute');
    }
  }, [status, startTracking, stopTracking, navigation]);

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
    setZoom((z) => Math.min(z + 1, 19));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 1, 3));
  }, []);

  const polylines = useMemo<MapPolyline[]>(() => {
    if (points.length < 2) return [];
    return [{
      id: 'track',
      coordinates: points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      color: custom.trackColor,
      width: 4,
    }];
  }, [points, custom.trackColor]);

  const markers = useMemo<MapMarker[]>(() => {
    if (!currentPosition) return [];
    const isDot = custom.userIcon.endsWith('-dot');
    return [{
      id: 'user',
      coordinate: { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
      emoji: isDot ? '●' : custom.userIcon,
    }];
  }, [currentPosition, custom.userIcon]);

  const currentSpeed = currentPosition?.speed ?? 0;

  return (
    <View style={styles.container}>
      <LeafletMap
        tileUrl={COLORS.tileUrl}
        center={mapCenter}
        zoom={zoom}
        polylines={polylines}
        markers={markers}
        showUserLocation
        userLocation={currentPosition ? { latitude: currentPosition.latitude, longitude: currentPosition.longitude } : undefined}
        userDotColor={custom.userIconColor || custom.trackColor}
      />

      {/* Version watermark */}
      <Text style={styles.versionBadge}>
        GhostMap v0.9.5.0{'\n'}mehiradev corp{'\n'}powered by Claude
      </Text>

      {/* Compact stats during recording */}
      {status === 'recording' && (
        <View style={styles.statsBar}>
          <StatsOverlay
            distance={distance}
            speed={currentSpeed}
            elapsed={elapsed}
            compact
          />
        </View>
      )}

      {/* Right-side small buttons */}
      <View style={styles.sideButtons}>
        <TouchableOpacity style={styles.sideBtn} onPress={handleZoomIn} activeOpacity={0.7}>
          <Text style={styles.sideBtnIcon}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={handleZoomOut} activeOpacity={0.7}>
          <Text style={styles.sideBtnIcon}>﹣</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={centerOnUser}
          activeOpacity={0.7}
        >
          <Text style={styles.sideBtnIcon}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sideBtn,
            { backgroundColor: status === 'recording' ? COLORS.danger : COLORS.primary },
          ]}
          onPress={handleStartStop}
          activeOpacity={0.7}
        >
          <Text style={styles.sideBtnIcon}>
            {status === 'recording' ? '⏹' : '⏺'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  versionBadge: {
    position: 'absolute',
    top: 50,
    right: 8,
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'right',
    lineHeight: 11,
  },
  statsBar: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 60,
  },
  sideButtons: {
    position: 'absolute',
    bottom: 16,
    right: 12,
    gap: 10,
  },
  sideBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sideBtnIcon: {
    fontSize: 18,
  },
});
