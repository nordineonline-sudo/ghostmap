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
  lastMatchedIdx: number; // monotonic advancement index

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
  lastMatchedIdx: 0,

  loadGhost: (points: GPSPoint[]) => {
    set({ ghostPoints: points, ghostPosition: null, ghostStartTime: null, lastMatchedIdx: 0 });
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
    const { ghostPoints, ghostStartTime, lastMatchedIdx } = get();
    if (!ghostStartTime || ghostPoints.length < 2) return;

    const elapsedMs = Date.now() - ghostStartTime;
    const ghostStart = ghostPoints[0].timestamp;

    // Search for closest ghost point starting from lastMatchedIdx (monotonic advancement)
    // Look ahead up to 50 points from last position to allow some flexibility
    const searchStart = Math.max(0, lastMatchedIdx - 2);
    const searchEnd = Math.min(ghostPoints.length, lastMatchedIdx + 50);

    let minDist = Infinity;
    let closestGhostIdx = lastMatchedIdx;
    for (let i = searchStart; i < searchEnd; i++) {
      const d = haversineDistance(userPoint, ghostPoints[i]);
      if (d < minDist) {
        minDist = d;
        closestGhostIdx = i;
      }
    }

    // Only advance forward (allow small backward steps of 2 for GPS jitter)
    const newMatchedIdx = Math.max(lastMatchedIdx, closestGhostIdx);
    set({ lastMatchedIdx: newMatchedIdx });

    // Interpolate time between the two surrounding ghost points for better accuracy
    let ghostTimeToUser: number;
    if (newMatchedIdx === 0) {
      ghostTimeToUser = 0;
    } else if (newMatchedIdx >= ghostPoints.length - 1) {
      ghostTimeToUser = (ghostPoints[ghostPoints.length - 1].timestamp - ghostStart) / 1000;
    } else {
      // Use the matched point's timestamp
      ghostTimeToUser = (ghostPoints[newMatchedIdx].timestamp - ghostStart) / 1000;
    }

    // Time elapsed for the user
    const userElapsed = elapsedMs / 1000;

    // delta > 0 means user is ahead (faster), delta < 0 means behind
    const deltaSeconds = ghostTimeToUser - userElapsed;

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
      lastMatchedIdx: 0,
    });
  },
}));
