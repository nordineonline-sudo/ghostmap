import { GPSPoint } from '../types';

const EARTH_RADIUS = 6371000; // meters

/** Haversine distance between two GPS points (meters). */
export function haversineDistance(a: GPSPoint, b: GPSPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(x));
}

/** Total distance of a points array (meters). */
export function totalDistance(points: GPSPoint[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += haversineDistance(points[i - 1], points[i]);
  }
  return d;
}

/** Average speed across points (m/s). Ignores zero-speed entries. */
export function averageSpeed(points: GPSPoint[]): number {
  const moving = points.filter((p) => p.speed > 0.3);
  if (moving.length === 0) return 0;
  return moving.reduce((sum, p) => sum + p.speed, 0) / moving.length;
}

/** Max speed in a points array (m/s). */
export function maxSpeed(points: GPSPoint[]): number {
  return points.reduce((max, p) => Math.max(max, p.speed), 0);
}

/** m/s → km/h */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/** meters → km string with 2 decimals */
export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2);
}

/** m/s → "12.3 km/h" */
export function formatSpeed(ms: number): string {
  return msToKmh(ms).toFixed(1);
}

/** seconds → "HH:MM:SS" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Compute elapsed time between first and last point (seconds). */
export function elapsedTime(points: GPSPoint[]): number {
  if (points.length < 2) return 0;
  return (points[points.length - 1].timestamp - points[0].timestamp) / 1000;
}

/**
 * Find the ghost's position at a given elapsed time.
 * Returns the interpolated lat/lng on the ghost route.
 */
export function interpolatePosition(
  points: GPSPoint[],
  elapsedMs: number,
): { latitude: number; longitude: number } | null {
  if (points.length === 0) return null;
  const startTs = points[0].timestamp;
  const targetTs = startTs + elapsedMs;

  if (targetTs <= points[0].timestamp) {
    return { latitude: points[0].latitude, longitude: points[0].longitude };
  }
  if (targetTs >= points[points.length - 1].timestamp) {
    const last = points[points.length - 1];
    return { latitude: last.latitude, longitude: last.longitude };
  }

  for (let i = 1; i < points.length; i++) {
    if (points[i].timestamp >= targetTs) {
      const prev = points[i - 1];
      const next = points[i];
      const ratio =
        (targetTs - prev.timestamp) / (next.timestamp - prev.timestamp);
      return {
        latitude: prev.latitude + (next.latitude - prev.latitude) * ratio,
        longitude: prev.longitude + (next.longitude - prev.longitude) * ratio,
      };
    }
  }
  return null;
}

/**
 * Compute the delta (seconds) between the user and the ghost.
 * Finds the closest ghost point to the user's current position
 * and compares timestamps.
 */
export function computeGhostDelta(
  userPoint: GPSPoint,
  ghostPoints: GPSPoint[],
  ghostElapsedMs: number,
): number {
  if (ghostPoints.length < 2) return 0;

  // Find the ghost segment closest to the user position
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < ghostPoints.length; i++) {
    const d = haversineDistance(userPoint, ghostPoints[i]);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  const ghostStart = ghostPoints[0].timestamp;
  const ghostTimeAtClosest = ghostPoints[closestIdx].timestamp - ghostStart;
  const userElapsed = userPoint.timestamp - (userPoint.timestamp - ghostElapsedMs);

  // Positive = user ahead, negative = user behind
  return (ghostTimeAtClosest - userElapsed) / 1000;
}
