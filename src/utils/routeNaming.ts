import * as Location from 'expo-location';
import type { GPSPoint, RouteNamingMethod } from '../types';

function formatDateTime(date: Date): string {
  const datePart = date.toLocaleDateString('fr-FR');
  const timePart = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

function pickCity(address: Location.LocationGeocodedAddress): string | null {
  return (
    address.city ??
    address.district ??
    address.subregion ??
    address.region ??
    address.name ??
    address.country ??
    null
  );
}

export async function resolveStartingCity(point: GPSPoint): Promise<string | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: point.latitude,
      longitude: point.longitude,
    });
    const address = addresses[0];
    return address ? pickCity(address) : null;
  } catch {
    return null;
  }
}

export function formatRouteName(
  city: string | null,
  namingMethod: RouteNamingMethod,
  startedAt: Date,
): string {
  const cityLabel = city?.trim();
  const dateLabel = formatDateTime(startedAt);
  const fallbackLabel = `Parcours ${dateLabel}`;

  if (namingMethod === 'date') {
    return fallbackLabel;
  }

  if (!cityLabel) {
    return fallbackLabel;
  }

  if (namingMethod === 'city') {
    return cityLabel;
  }

  return `${cityLabel} - ${dateLabel}`;
}