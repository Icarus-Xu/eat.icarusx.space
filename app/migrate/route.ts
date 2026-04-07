// Copyright (C) 2026 Icarus. All rights reserved.
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

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
        ADD COLUMN IF NOT EXISTS baidu_source_url TEXT
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
