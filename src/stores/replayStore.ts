import { create } from 'zustand';
import { GPSPoint, PlaybackSpeed, PlaybackStatus } from '../types';

interface ReplayState {
  // ─── Source data ─────────────────────────
  points: GPSPoint[];
  totalDuration: number; // seconds

  // ─── Playback state ─────────────────────
  status: PlaybackStatus;
  speed: PlaybackSpeed;
  currentIndex: number;
  elapsedMs: number;
  intervalId: ReturnType<typeof setInterval> | null;

  // ─── Actions ────────────────────────────
  loadRoute: (points: GPSPoint[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  seekTo: (ratio: number) => void; // 0..1
  reset: () => void;
}

const TICK_MS = 50; // 20fps animation

export const useReplayStore = create<ReplayState>((set, get) => ({
  points: [],
  totalDuration: 0,
  status: 'idle',
  speed: 1,
  currentIndex: 0,
  elapsedMs: 0,
  intervalId: null,

  loadRoute: (points: GPSPoint[]) => {
    const duration =
      points.length >= 2
        ? (points[points.length - 1].timestamp - points[0].timestamp) / 1000
        : 0;
    set({
      points,
      totalDuration: duration,
      status: 'idle',
      currentIndex: 0,
      elapsedMs: 0,
      speed: 1,
    });
  },

  play: () => {
    const { points, status } = get();
    if (points.length < 2 || status === 'playing') return;

    const id = setInterval(() => {
      const { elapsedMs, points, speed, totalDuration } = get();
      const newElapsed = elapsedMs + TICK_MS * speed;
      const startTs = points[0].timestamp;
      const targetTs = startTs + newElapsed;

      // Find the current index
      let idx = get().currentIndex;
      while (idx < points.length - 1 && points[idx + 1].timestamp <= targetTs) {
        idx++;
      }

      if (newElapsed >= totalDuration * 1000) {
        get().stop();
        set({ status: 'finished', currentIndex: points.length - 1 });
        return;
      }

      set({ elapsedMs: newElapsed, currentIndex: idx });
    }, TICK_MS);

    set({ status: 'playing', intervalId: id });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ status: 'paused', intervalId: null });
  },

  stop: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ status: 'idle', intervalId: null, currentIndex: 0, elapsedMs: 0 });
  },

  setSpeed: (speed: PlaybackSpeed) => {
    set({ speed });
  },

  seekTo: (ratio: number) => {
    const { totalDuration, points } = get();
    const targetMs = ratio * totalDuration * 1000;
    const startTs = points[0]?.timestamp ?? 0;
    const targetTs = startTs + targetMs;

    let idx = 0;
    while (idx < points.length - 1 && points[idx + 1].timestamp <= targetTs) {
      idx++;
    }
    set({ elapsedMs: targetMs, currentIndex: idx });
  },

  reset: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      points: [],
      totalDuration: 0,
      status: 'idle',
      speed: 1,
      currentIndex: 0,
      elapsedMs: 0,
      intervalId: null,
    });
  },
}));
