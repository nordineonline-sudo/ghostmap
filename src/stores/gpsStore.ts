import { create } from 'zustand';
import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';
import { GPSPoint, RecordingStatus, RouteType } from '../types';
import { totalDistance } from '../utils/gps';
import {
  saveRecoverySnapshot,
  clearRecoverySnapshot,
  SNAPSHOT_INTERVAL_POINTS,
} from '../utils/recoverySession';

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

  // ─── Recovery ────────────────────────────
  /** Stable ID assigned at session start for deduplication on recovery. */
  sessionId: string | null;
  /** Activity type selected by the user; defaults to 'bike'. */
  routeType: RouteType;

  // ─── Actions ─────────────────────────────
  requestPermissions: () => Promise<boolean>;
  startTracking: (intervalMs?: number) => Promise<void>;
  stopTracking: () => void;
  reset: () => void;
  setRouteType: (type: RouteType) => void;
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
  sessionId: null,
  routeType: 'bike',

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

    const sessionId = uuidv4();
    const startTime = Date.now();

    set({
      status: 'recording',
      points: [initialPoint],
      currentPosition: initialPoint,
      distance: 0,
      startTime,
      elapsed: 0,
      sessionId,
    });

    // Write initial snapshot
    saveRecoverySnapshot({
      id: sessionId,
      points: [initialPoint],
      type: get().routeType,
      startTime,
      distance: 0,
      autoRecovered: true,
    }).catch(console.error);

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

        const { points, sessionId: sid, startTime: st, routeType } = get();
        const updatedPoints = [...points, point];
        const updatedDistance = totalDistance(updatedPoints);
        set({
          currentPosition: point,
          points: updatedPoints,
          distance: updatedDistance,
        });

        // Persist snapshot every SNAPSHOT_INTERVAL_POINTS new points
        if (updatedPoints.length % SNAPSHOT_INTERVAL_POINTS === 0 && sid && st) {
          saveRecoverySnapshot({
            id: sid,
            points: updatedPoints,
            type: routeType,
            startTime: st,
            distance: updatedDistance,
            autoRecovered: true,
          }).catch(console.error);
        }
      },
    );

    set({ locationSubscription: sub });
  },

  stopTracking: () => {
    const { locationSubscription } = get();
    locationSubscription?.remove();
    // Clear the recovery snapshot – user is now on SaveRoute screen and will
    // explicitly save or discard the session.
    clearRecoverySnapshot().catch(console.error);
    set({ status: 'stopped', locationSubscription: null });
  },

  reset: () => {
    const { locationSubscription } = get();
    locationSubscription?.remove();
    clearRecoverySnapshot().catch(console.error);
    set({
      status: 'idle',
      locationSubscription: null,
      currentPosition: null,
      points: [],
      distance: 0,
      startTime: null,
      elapsed: 0,
      sessionId: null,
      routeType: 'bike',
    });
  },

  setRouteType: (type: RouteType) => {
    set({ routeType: type });
  },

  tick: () => {
    const { startTime, status } = get();
    if (status === 'recording' && startTime) {
      set({ elapsed: (Date.now() - startTime) / 1000 });
    }
  },
}));
