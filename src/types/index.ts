// ─── GPS Point ────────────────────────────────────────────
export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: number; // Unix ms
  speed: number; // m/s (raw from device)
  altitude: number | null;
}

// ─── Saved Route ──────────────────────────────────────────
export type RouteType = 'bike' | 'walk';

export interface SavedRoute {
  id: string;
  name: string;
  type: RouteType;
  date: string; // ISO 8601
  duration: number; // seconds
  distance: number; // meters
  avgSpeed: number; // m/s
  maxSpeed: number; // m/s
  points: GPSPoint[];
  thumbnailUri?: string;
}

// ─── Recording State ─────────────────────────────────────
export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

// ─── Replay State ────────────────────────────────────────
export type PlaybackSpeed = 1 | 2 | 5 | 10;

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

// ─── Ghost Mode ──────────────────────────────────────────
export interface GhostComparison {
  /** positive = user ahead, negative = user behind (seconds) */
  deltaSeconds: number;
  ghostCaught: boolean;
}

// ─── Map Region ──────────────────────────────────────────
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// ─── Navigation params ──────────────────────────────────
export type RootStackParamList = {
  MainTabs: undefined;
  Recording: undefined;
  SaveRoute: undefined;
  Replay: { routeId: string };
  Ghost: { routeId: string };
};

export type BottomTabParamList = {
  Map: undefined;
  Library: undefined;
};
