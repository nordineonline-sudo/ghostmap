/**
 * recoverySession.ts
 *
 * Persists an active recording snapshot to a local JSON file so that if the
 * app crashes or the battery dies before the user manually saves a route, the
 * session can be detected and auto-recovered on next launch.
 *
 * Write cadence: every SNAPSHOT_INTERVAL_POINTS new GPS points (not every
 * single point) to keep disk I/O reasonable.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { GPSPoint, RouteType } from '../types';

export const SNAPSHOT_INTERVAL_POINTS = 10;

export interface RecoverySnapshot {
  /** Stable ID used for deduplication – set once at session start. */
  id: string;
  points: GPSPoint[];
  type: RouteType;
  startTime: number; // Unix ms
  distance: number; // meters
  /** Flag so consumers know this was auto-recovered. */
  autoRecovered: true;
}

const SNAPSHOT_PATH = `${FileSystem.documentDirectory}recovery_session.json`;

/** Persist the current session state to disk. */
export async function saveRecoverySnapshot(snapshot: RecoverySnapshot): Promise<void> {
  await FileSystem.writeAsStringAsync(SNAPSHOT_PATH, JSON.stringify(snapshot), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

/** Load a previously persisted snapshot, or null if none exists. */
export async function loadRecoverySnapshot(): Promise<RecoverySnapshot | null> {
  try {
    const info = await FileSystem.getInfoAsync(SNAPSHOT_PATH);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(SNAPSHOT_PATH, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const parsed = JSON.parse(content) as RecoverySnapshot;
    // Basic validation
    if (!parsed.id || !Array.isArray(parsed.points) || parsed.points.length === 0) {
      await clearRecoverySnapshot();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Remove the snapshot file once the session has been saved or discarded. */
export async function clearRecoverySnapshot(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(SNAPSHOT_PATH);
    if (info.exists) {
      await FileSystem.deleteAsync(SNAPSHOT_PATH, { idempotent: true });
    }
  } catch {
    // best-effort
  }
}
