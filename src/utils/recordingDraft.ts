import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecordingDraft, SavedRoute, RouteNamingMethod } from '../types';
import { averageSpeed, elapsedTime, maxSpeed, totalDistance } from './gps';
import { formatRouteName, resolveStartingCity } from './routeNaming';

const STORAGE_KEY = '@ghostmap_pending_recording';

export async function savePendingRecordingDraft(draft: RecordingDraft): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export async function loadPendingRecordingDraft(): Promise<RecordingDraft | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) {
    return null;
  }

  try {
    const draft = JSON.parse(json) as RecordingDraft;
    if (!draft || !Array.isArray(draft.points) || !draft.id) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export async function clearPendingRecordingDraft(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function buildSavedRouteFromDraft(
  draft: RecordingDraft,
  namingMethod: RouteNamingMethod,
): Promise<SavedRoute> {
  const startedAt = new Date(draft.startedAt);
  const startCity = draft.startCity ?? (draft.points[0] ? await resolveStartingCity(draft.points[0]) : null);
  const points = [...draft.points];

  return {
    id: draft.id,
    name: formatRouteName(startCity, namingMethod, startedAt),
    type: draft.routeType,
    date: startedAt.toISOString(),
    duration: elapsedTime(points),
    distance: totalDistance(points),
    avgSpeed: averageSpeed(points),
    maxSpeed: maxSpeed(points),
    points,
  };
}