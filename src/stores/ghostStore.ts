import { create } from 'zustand';
import { GPSPoint, GhostComparison } from '../types';
import { interpolatePosition, haversineDistance } from '../utils/gps';

interface GhostState {
  // ─── Ghost reference ────────────────────
  ghostPoints: GPSPoint[];
  ghostStartTime: number | null; // when user pressed start (Unix ms)

  // ─── Ghost position ─────────────────────
  ghostPosition: { latitude: number; longitude: number } | null;

  // ─── Comparison ─────────────────────────
  comparison: GhostComparison;

  // ─── Actions ────────────────────────────
  loadGhost: (points: GPSPoint[]) => void;
  start: () => void;
  updateGhostPosition: () => void;
  updateComparison: (userPoint: GPSPoint) => void;
  reset: () => void;
}

export const useGhostStore = create<GhostState>((set, get) => ({
  ghostPoints: [],
  ghostStartTime: null,
  ghostPosition: null,
  comparison: { deltaSeconds: 0, ghostCaught: false },

  loadGhost: (points: GPSPoint[]) => {
    set({ ghostPoints: points, ghostPosition: null, ghostStartTime: null });
  },

  start: () => {
    set({ ghostStartTime: Date.now() });
  },

  updateGhostPosition: () => {
    const { ghostPoints, ghostStartTime } = get();
    if (!ghostStartTime || ghostPoints.length === 0) return;

    const elapsedMs = Date.now() - ghostStartTime;
    const pos = interpolatePosition(ghostPoints, elapsedMs);
    set({ ghostPosition: pos });
  },

  updateComparison: (userPoint: GPSPoint) => {
    const { ghostPoints, ghostStartTime } = get();
    if (!ghostStartTime || ghostPoints.length < 2) return;

    const elapsedMs = Date.now() - ghostStartTime;
    const ghostStart = ghostPoints[0].timestamp;

    // Find closest ghost point to user
    let minDist = Infinity;
    let closestGhostIdx = 0;
    for (let i = 0; i < ghostPoints.length; i++) {
      const d = haversineDistance(userPoint, ghostPoints[i]);
      if (d < minDist) {
        minDist = d;
        closestGhostIdx = i;
      }
    }

    // Time it took the ghost to reach this point
    const ghostTimeToClosest =
      (ghostPoints[closestGhostIdx].timestamp - ghostStart) / 1000;

    // Time elapsed for the user
    const userElapsed = elapsedMs / 1000;

    // delta > 0 means user is ahead (faster), delta < 0 means behind
    const deltaSeconds = ghostTimeToClosest - userElapsed;

    // Check if user has "caught" (passed) the ghost
    const ghostCurrentPos = interpolatePosition(ghostPoints, elapsedMs);
    let ghostCaught = false;
    if (ghostCurrentPos) {
      const distToGhost = haversineDistance(userPoint, {
        ...userPoint,
        latitude: ghostCurrentPos.latitude,
        longitude: ghostCurrentPos.longitude,
      });
      // If user is within 20m of ghost position but ahead in time
      if (distToGhost < 20 && deltaSeconds > 0) {
        ghostCaught = true;
      }
    }

    set({ comparison: { deltaSeconds, ghostCaught } });
  },

  reset: () => {
    set({
      ghostPoints: [],
      ghostStartTime: null,
      ghostPosition: null,
      comparison: { deltaSeconds: 0, ghostCaught: false },
    });
  },
}));
