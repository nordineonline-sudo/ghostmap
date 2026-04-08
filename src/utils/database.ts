import * as SQLite from 'expo-sqlite';
import { SavedRoute } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('ghostmap.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        duration REAL NOT NULL,
        distance REAL NOT NULL,
        avgSpeed REAL NOT NULL,
        maxSpeed REAL NOT NULL,
        points TEXT NOT NULL,
        thumbnailUri TEXT
      );
    `);
  }
  return db;
}

export async function insertRouteIfNotExists(route: SavedRoute): Promise<boolean> {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT OR IGNORE INTO routes (id, name, type, date, duration, distance, avgSpeed, maxSpeed, points, thumbnailUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      route.id,
      route.name,
      route.type,
      route.date,
      route.duration,
      route.distance,
      route.avgSpeed,
      route.maxSpeed,
      JSON.stringify(route.points),
      route.thumbnailUri ?? null,
    ],
  );
  return result.changes > 0;
}

export async function insertRoute(route: SavedRoute): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO routes (id, name, type, date, duration, distance, avgSpeed, maxSpeed, points, thumbnailUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      route.id,
      route.name,
      route.type,
      route.date,
      route.duration,
      route.distance,
      route.avgSpeed,
      route.maxSpeed,
      JSON.stringify(route.points),
      route.thumbnailUri ?? null,
    ],
  );
}

export async function getAllRoutes(): Promise<SavedRoute[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    type: string;
    date: string;
    duration: number;
    distance: number;
    avgSpeed: number;
    maxSpeed: number;
    points: string;
    thumbnailUri: string | null;
  }>('SELECT * FROM routes ORDER BY date DESC');

  return rows.map((row) => ({
    ...row,
    type: row.type as SavedRoute['type'],
    points: JSON.parse(row.points),
    thumbnailUri: row.thumbnailUri ?? undefined,
  }));
}

export async function getRouteById(id: string): Promise<SavedRoute | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{
    id: string;
    name: string;
    type: string;
    date: string;
    duration: number;
    distance: number;
    avgSpeed: number;
    maxSpeed: number;
    points: string;
    thumbnailUri: string | null;
  }>('SELECT * FROM routes WHERE id = ?', [id]);

  if (!row) return null;

  return {
    ...row,
    type: row.type as SavedRoute['type'],
    points: JSON.parse(row.points),
    thumbnailUri: row.thumbnailUri ?? undefined,
  };
}

export async function deleteRoute(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM routes WHERE id = ?', [id]);
}
