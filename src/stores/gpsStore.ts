import { create } from 'zustand';
import * as Location from 'expo-location';
import { GPSPoint, RecordingStatus } from '../types';
import { totalDistance } from '../utils/gps';

interface GPSState {
  // ─── Status ──────────────────────────────
  status: RecordingStatus;
  locationSubscription: Location.LocationSubscription | null;

  // ─── Live data ───────────────────────────
  currentPosition: GPSPoint | null;
  points: GPSPoint[];
  distance: number; // meters
  startTime: number | null; // Unix ms
  elapsed: number; // seconds

  // ─── Actions ─────────────────────────────
  requestPermissions: () => Promise<boolean>;
  startTracking: (intervalMs?: number) => Promise<void>;
  stopTracking: () => void;
  reset: () => void;
  tick: () => void; // update elapsed time each second
}

export const useGPSStore = create<GPSState>((set, get) => ({
  status: 'idle',
  locationSubscription: null,
  currentPosition: null,
  points: [],
  distance: 0,
  startTime: null,
  elapsed: 0,

  requestPermissions: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  startTracking: async (intervalMs = 4000) => {
    const granted = await get().requestPermissions();
    if (!granted) return;

    // Get initial position
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    const initialPoint: GPSPoint = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: loc.timestamp,
      speed: Math.max(loc.coords.speed ?? 0, 0),
      altitude: loc.coords.altitude,
    };

    set({
      status: 'recording',
      points: [initialPoint],
      currentPosition: initialPoint,
      distance: 0,
      startTime: Date.now(),
      elapsed: 0,
    });

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: intervalMs,
        distanceInterval: 5, // at least 5m between updates
      },
      (location) => {
        const point: GPSPoint = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          speed: Math.max(location.coords.speed ?? 0, 0),
          altitude: location.coords.altitude,
        };

        const { points } = get();
        const updatedPoints = [...points, point];
        set({
          currentPosition: point,
          points: updatedPoints,
          distance: totalDistance(updatedPoints),
        });
      },
    );

    set({ locationSubscription: sub });
  },

  stopTracking: () => {
    const { locationSubscription } = get();
    locationSubscription?.remove();
    set({ status: 'stopped', locationSubscription: null });
  },

  reset: () => {
    const { locationSubscription } = get();
    locationSubscription?.remove();
    set({
      status: 'idle',
      locationSubscription: null,
      currentPosition: null,
      points: [],
      distance: 0,
      startTime: null,
      elapsed: 0,
    });
  },

  tick: () => {
    const { startTime, status } = get();
    if (status === 'recording' && startTime) {
      set({ elapsed: (Date.now() - startTime) / 1000 });
    }
  },
}));
