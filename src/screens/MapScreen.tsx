import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGPSStore } from '../stores/gpsStore';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';
import StatsOverlay from '../components/StatsOverlay';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<NavProp>();
  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const centerOnUser = useCallback(() => {
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
          latitude: 48.8566, // Paris default
          longitude: 2.3522,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="none"
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Blue trace of the recorded path */}
        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.trackBlue}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Current position marker */}
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

      {/* Stats overlay during recording */}
      {status === 'recording' && (
        <StatsOverlay
          distance={distance}
          speed={currentSpeed}
          elapsed={elapsed}
        />
      )}

      {/* My location button */}
      <TouchableOpacity
        style={styles.myLocationBtn}
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Floating record button */}
      <View style={styles.buttonContainer}>
        <FloatingButton
          icon={status === 'recording' ? '⏹' : '▶'}
          label={status === 'recording' ? 'Arrêter' : 'Enregistrer'}
          variant={status === 'recording' ? 'danger' : 'primary'}
          size="lg"
          onPress={handleStartStop}
        />
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
  myLocationBtn: {
    position: 'absolute',
    bottom: 110,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationIcon: {
    fontSize: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
