// Copyright (C) 2026 Icarus. All rights reserved.
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export interface RestaurantRow {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visited: boolean;
  maxRating: number | null;
  lastVisitedAt: string | null;
  notes: string | null;
}

export async function fetchAllRestaurants(): Promise<RestaurantRow[]> {
  type Row = {
    id: string; name: string; address: string; lat: string; lng: string;
    max_rating: string | null; last_visited_at: string | null; notes: string | null;
  };
  const rows = (await sql`
    SELECT
      r.id,
      r.name,
      r.address,
      r.lat::text,
      r.lng::text,
      MAX(v.rating)::text        AS max_rating,
      MAX(v.visited_at)::text    AS last_visited_at,
      (
        SELECT v2.notes
        FROM visits v2
        WHERE v2.restaurant_id = r.id
        ORDER BY v2.visited_at DESC
        LIMIT 1
      ) AS notes
    FROM restaurants r
    LEFT JOIN visits v ON v.restaurant_id = r.id
    GROUP BY r.id, r.name, r.address
    ORDER BY r.created_at DESC
  `) as Row[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    visited: row.last_visited_at !== null,
    maxRating: row.max_rating !== null ? parseFloat(row.max_rating) : null,
    lastVisitedAt: row.last_visited_at ?? null,
    notes: row.notes ?? null,
  }));
}
