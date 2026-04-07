// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

interface CollectBody {
  amapPoiId: string;
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
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CollectBody = await request.json();
    const { amapPoiId, baiduPoiId, name, address, lat, lng, visited, rating, notes, visitedAt } = body;

    const sourceUrl = `https://ditu.amap.com/place/${amapPoiId}`;
    const baiduSourceUrl = baiduPoiId ? `https://map.baidu.com/?uid=${baiduPoiId}` : null;

    // Resolve current user id
    const userRows = (await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `) as { id: string }[];
    if (!userRows.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userRows[0].id;

    // Check if restaurant already exists
    const existing = (await sql`
      SELECT id FROM restaurants WHERE amap_poi_id = ${amapPoiId} LIMIT 1
    `) as { id: string }[];

    if (!visited) {
      if (existing.length > 0) {
        return Response.json({ duplicate: true, error: 'This restaurant is already in your collection.' }, { status: 409 });
      }
      await sql`
        INSERT INTO restaurants (name, address, lat, lng, amap_poi_id, source_url, baidu_poi_id, baidu_source_url, added_by)
        VALUES (${name}, ${address}, ${lat}, ${lng}, ${amapPoiId}, ${sourceUrl}, ${baiduPoiId ?? null}, ${baiduSourceUrl}, ${userId})
      `;
      return Response.json({ success: true });
    }

    // Visited: create restaurant if needed, then add visit record
    let restaurantId: string;
    if (existing.length > 0) {
      restaurantId = existing[0].id;
    } else {
      const inserted = (await sql`
        INSERT INTO restaurants (name, address, lat, lng, amap_poi_id, source_url, baidu_poi_id, baidu_source_url, added_by)
        VALUES (${name}, ${address}, ${lat}, ${lng}, ${amapPoiId}, ${sourceUrl}, ${baiduPoiId ?? null}, ${baiduSourceUrl}, ${userId})
        RETURNING id
      `) as { id: string }[];
      restaurantId = inserted[0].id;
    }

    const visitDate = visitedAt ? new Date(visitedAt) : new Date();
    await sql`
      INSERT INTO visits (restaurant_id, user_id, rating, notes, visited_at)
      VALUES (
        ${restaurantId},
        ${userId},
        ${rating ?? null},
        ${notes ?? null},
        ${visitDate}
      )
    `;

    return Response.json({ success: true });
  } catch (e) {
    console.error('[/api/collect]', e);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
