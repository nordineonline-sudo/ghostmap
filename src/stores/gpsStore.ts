import { create } from 'zustand';
import * as Location from 'expo-location';
import type { GPSPoint, RecordingDraft, RecordingStatus, RouteType } from '../types';
import { totalDistance } from '../utils/gps';
import { clearPendingRecordingDraft, loadPendingRecordingDraft, savePendingRecordingDraft } from '../utils/recordingDraft';
import { resolveStartingCity } from '../utils/routeNaming';

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
  startCity: string | null;
  pendingDraftId: string | null;
  routeType: RouteType;

  // ─── Actions ─────────────────────────────
  requestPermissions: () => Promise<boolean>;
  startTracking: (intervalMs?: number) => Promise<void>;
  stopTracking: () => void;
  reset: () => void;
  tick: () => void; // update elapsed time each second
  persistDraft: () => Promise<void>;
  loadPendingDraft: () => Promise<boolean>;
  setRouteType: (type: RouteType) => void;
}

export const useGPSStore = create<GPSState>((set, get) => ({
  status: 'idle',
  locationSubscription: null,
  currentPosition: null,
  points: [],
  distance: 0,
  startTime: null,
  elapsed: 0,
  startCity: null,
  pendingDraftId: null,
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

    const startCity = await resolveStartingCity(initialPoint);

    set({
      status: 'recording',
      points: [initialPoint],
      currentPosition: initialPoint,
      distance: 0,
      startTime: Date.now(),
      elapsed: 0,
      startCity,
      pendingDraftId: `route_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    });

    await get().persistDraft();

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
        get().persistDraft().catch(() => {});
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
      startCity: null,
      pendingDraftId: null,
      routeType: 'bike',
    });
    clearPendingRecordingDraft().catch(() => {});
  },

  tick: () => {
    const { startTime, status } = get();
    if (status === 'recording' && startTime) {
      set({ elapsed: (Date.now() - startTime) / 1000 });
    }
  },
  persistDraft: async () => {
    const { pendingDraftId, points, startTime, startCity, routeType, status } = get();
    if (status !== 'recording' || !pendingDraftId || !startTime || points.length === 0) {
      return;
    }

    const draft: RecordingDraft = {
      id: pendingDraftId,
      startedAt: new Date(startTime).toISOString(),
      startCity,
      routeType,
      points,
    };

    await savePendingRecordingDraft(draft);
  },
  loadPendingDraft: async () => {
    const draft = await loadPendingRecordingDraft();
    if (!draft) {
      return false;
    }

    const points = [...draft.points];
    const distance = totalDistance(points);
    const currentPosition = points[points.length - 1] ?? null;

    set({
      status: 'stopped',
      locationSubscription: null,
      currentPosition,
      points,
      distance,
      startTime: new Date(draft.startedAt).getTime(),
      elapsed: (Date.now() - new Date(draft.startedAt).getTime()) / 1000,
      startCity: draft.startCity,
      pendingDraftId: draft.id,
      routeType: draft.routeType,
    });

    return true;
  },
  setRouteType: (type) => {
    set({ routeType: type });
  },
}));
