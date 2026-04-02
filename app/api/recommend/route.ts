// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import postgres from 'postgres';
import { haversineDistance } from '@/app/lib/amap';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const DEFAULT_RADIUS_M = 3000;

export interface RestaurantCard {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceM: number;
  visited: boolean;
  rating: number | null;
  notes: string | null;
  lastVisitedAt: string | null;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: 'Missing lat/lng' }, { status: 400 });
  }
  const radiusM = parseFloat(searchParams.get('radius') ?? String(DEFAULT_RADIUS_M));

  // Fetch all restaurants with their best visit record (highest rating, most recent)
  type Row = {
    id: string; name: string; address: string; lat: string; lng: string;
    max_rating: string | null; last_visited_at: string | null; notes: string | null;
  };
  const rows = (await sql`
    SELECT
      r.id,
      r.name,
      r.address,
      r.lat,
      r.lng,
      MAX(v.rating)::text AS max_rating,
      MAX(v.visited_at)::text AS last_visited_at,
      (
        SELECT v2.notes
        FROM visits v2
        WHERE v2.restaurant_id = r.id
        ORDER BY v2.visited_at DESC
        LIMIT 1
      ) AS notes
    FROM restaurants r
    LEFT JOIN visits v ON v.restaurant_id = r.id
    GROUP BY r.id, r.name, r.address, r.lat, r.lng
  `) as Row[];

  // Annotate with distance and filter by radius
  const nearby = rows
    .map((row) => {
      const rLat = parseFloat(row.lat);
      const rLng = parseFloat(row.lng);
      const distanceM = haversineDistance(lat, lng, rLat, rLng);
      const rating = row.max_rating !== null ? parseFloat(row.max_rating) : null;
      return {
        id: row.id,
        name: row.name,
        address: row.address,
        lat: rLat,
        lng: rLng,
        distanceM,
        visited: row.last_visited_at !== null,
        rating,
        notes: row.notes ?? null,
        lastVisitedAt: row.last_visited_at ?? null,
      } as RestaurantCard;
    })
    .filter((r) => r.distanceM <= radiusM);

  const visited = nearby.filter((r) => r.visited);
  const unvisited = nearby.filter((r) => !r.visited);
  const goodVisited = visited.filter((r) => r.rating !== null && r.rating >= 3);
  const badVisited = visited.filter((r) => r.rating !== null && r.rating < 3);

  const result: RestaurantCard[] = [];

  // Slot 1: 1 good visited
  const goodPick = pickRandom(goodVisited, 1);
  result.push(...goodPick);

  // Slot 2-3: 2 unvisited
  const unvisitedPick = pickRandom(unvisited, 2);
  result.push(...unvisitedPick);

  // Fill remaining slots up to 3
  if (result.length < 3) {
    const used = new Set(result.map((r) => r.id));
    // Prefer remaining good visited, then unvisited, then bad visited as last resort
    const fallbackPool = [
      ...goodVisited.filter((r) => !used.has(r.id)),
      ...unvisited.filter((r) => !used.has(r.id)),
      ...(visited.length > 0 ? badVisited.filter((r) => !used.has(r.id)) : []),
    ];
    const extra = pickRandom(fallbackPool, 3 - result.length);
    result.push(...extra);
  }

  return Response.json(result);
}
