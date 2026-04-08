// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import postgres from 'postgres';
import { logApiRequest } from '@/app/lib/log';

const sql = postgres(process.env.DATABASE_URL!, { ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : 'require' });

interface CollectBody {
  amapPoiId?: string | null;
  baiduPoiId?: string | null;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visited: boolean;
  rating?: number | null;
  notes?: string | null;
  visitedAt?: string | null;
}

export async function POST(request: Request) {
  return logApiRequest('/api/save-restaurant', request, async () => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CollectBody = await request.json();
    const { amapPoiId, baiduPoiId, name, address, lat, lng, visited, rating, notes, visitedAt } = body;

    if (!amapPoiId && !baiduPoiId) {
      return Response.json({ error: 'At least one POI ID is required.' }, { status: 400 });
    }

    const sourceUrl = amapPoiId ? `https://ditu.amap.com/place/${amapPoiId}` : null;
    const baiduSourceUrl = baiduPoiId ? `https://map.baidu.com/?uid=${baiduPoiId}` : null;

    const userRows = (await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `) as { id: string }[];
    if (!userRows.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userRows[0].id;

    // Duplicate check: match on either POI ID
    const existing = (await sql`
      SELECT id FROM restaurants
      WHERE
        (amap_poi_id IS NOT NULL AND amap_poi_id = ${amapPoiId ?? ''})
        OR (baidu_poi_id IS NOT NULL AND baidu_poi_id = ${baiduPoiId ?? ''})
      LIMIT 1
    `) as { id: string }[];

    if (!visited) {
      if (existing.length > 0) {
        return Response.json({ duplicate: true, error: 'This restaurant is already in your collection.' }, { status: 409 });
      }
      await sql`
        INSERT INTO restaurants
          (name, address, lat, lng, amap_poi_id, source_url, baidu_poi_id, baidu_source_url, added_by)
        VALUES
          (${name}, ${address}, ${lat}, ${lng}, ${amapPoiId ?? null}, ${sourceUrl}, ${baiduPoiId ?? null}, ${baiduSourceUrl}, ${userId})
      `;
      return Response.json({ success: true });
    }

    let restaurantId: string;
    if (existing.length > 0) {
      restaurantId = existing[0].id;
    } else {
      const inserted = (await sql`
        INSERT INTO restaurants
          (name, address, lat, lng, amap_poi_id, source_url, baidu_poi_id, baidu_source_url, added_by)
        VALUES
          (${name}, ${address}, ${lat}, ${lng}, ${amapPoiId ?? null}, ${sourceUrl}, ${baiduPoiId ?? null}, ${baiduSourceUrl}, ${userId})
        RETURNING id
      `) as { id: string }[];
      restaurantId = inserted[0].id;
    }

    const visitDate = visitedAt ? new Date(visitedAt) : new Date();
    await sql`
      INSERT INTO visits (restaurant_id, user_id, rating, notes, visited_at)
      VALUES (${restaurantId}, ${userId}, ${rating ?? null}, ${notes ?? null}, ${visitDate})
    `;

    return Response.json({ success: true });
  } catch (e) {
    console.error('[/api/save-restaurant]', e);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
  }); // logApiRequest
}
