// Copyright (C) 2026 Icarus. All rights reserved.
import postgres from 'postgres';
import { gcj02ToWgs84, bd09ToGcj02 } from '@/app/lib/coords';

const sql = postgres(process.env.DATABASE_URL!, { ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : 'require' });

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        lat DECIMAL(10, 7),
        lng DECIMAL(10, 7),
        amap_poi_id VARCHAR(50),
        source_url TEXT,
        added_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
        notes TEXT,
        visited_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE restaurants
        ADD COLUMN IF NOT EXISTS baidu_poi_id VARCHAR(64),
        ADD COLUMN IF NOT EXISTS baidu_source_url TEXT,
        ADD COLUMN IF NOT EXISTS coord_type TEXT
    `;

    // One-time: normalise legacy provider-native coords to WGS-84. Coords were
    // stored raw in the source provider's system (GCJ-02 for amap-linked rows,
    // BD-09 for baidu-only rows). Guarded by coord_type so it runs only once.
    const legacy = (await sql`
      SELECT id, lat::text AS lat, lng::text AS lng, amap_poi_id
      FROM restaurants WHERE coord_type IS NULL AND lat IS NOT NULL AND lng IS NOT NULL
    `) as { id: string; lat: string; lng: string; amap_poi_id: string | null }[];
    for (const row of legacy) {
      const la = parseFloat(row.lat);
      const ln = parseFloat(row.lng);
      const gcj = row.amap_poi_id ? { lat: la, lng: ln } : bd09ToGcj02(la, ln);
      const wgs = gcj02ToWgs84(gcj.lat, gcj.lng);
      await sql`UPDATE restaurants SET lat = ${wgs.lat}, lng = ${wgs.lng}, coord_type = 'wgs84' WHERE id = ${row.id}`;
    }

    // Prevent duplicate restaurants per provider. Partial indexes because both
    // POI IDs are optional (a restaurant may have only one of them).
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS restaurants_amap_poi_id_key
        ON restaurants (amap_poi_id) WHERE amap_poi_id IS NOT NULL
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS restaurants_baidu_poi_id_key
        ON restaurants (baidu_poi_id) WHERE baidu_poi_id IS NOT NULL
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL,
        user_id TEXT,
        method TEXT,
        path TEXT NOT NULL,
        status_code INTEGER,
        duration_ms INTEGER,
        error_message TEXT,
        user_agent TEXT,
        ip TEXT
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS logs_created_at_idx ON logs (created_at DESC)
    `;

    return Response.json({ message: 'Migration completed.' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
