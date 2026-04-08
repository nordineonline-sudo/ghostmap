import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { useThemeStore } from '../stores/themeStore';
import { RootStackParamList } from '../types';
import StatsOverlay from '../components/StatsOverlay';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<NavProp>();
  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const COLORS = useThemeStore((s) => s.colors);

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
      }
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

  // Center map on current position
  useEffect(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, [currentPosition]);

  const handleStartStop = useCallback(async () => {
    if (status === 'idle' || status === 'stopped') {
      await startTracking(4000);
    } else if (status === 'recording') {
      stopTracking();
      navigation.navigate('SaveRoute');
    }
  }, [status, startTracking, stopTracking, navigation]);

  const centerOnUser = useCallback(async () => {
    if (mapRef.current) {
      try {
        const loc = await import('expo-location').then((m) =>
          m.getCurrentPositionAsync({ accuracy: m.Accuracy.Balanced }),
        );
        mapRef.current.animateToRegion(
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          500,
        );
      } catch {
        if (currentPosition) {
          mapRef.current.animateToRegion(
            {
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            500,
          );
        }
      }
    }
  }, [currentPosition]);

  const polylineCoords = points.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const currentSpeed = currentPosition?.speed ?? 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation={status === 'recording'}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="none"
      >
        <UrlTile
          urlTemplate={COLORS.tileUrl}
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.trackBlue}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {currentPosition && (
          <Marker
            coordinate={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            }}
            title="Position actuelle"
          />
        )}
      </MapView>

      {/* Version watermark */}
      <Text style={styles.versionBadge}>
        GhostMap v0.9.1.0{'\n'}mehiradev corp{'\n'}powered by Claude
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
  map: {
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
