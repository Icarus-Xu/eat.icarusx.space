// Copyright (C) 2026 Viture Inc. All rights reserved.
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
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

    return Response.json({ message: 'Migration completed.' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
