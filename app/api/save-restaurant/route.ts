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

interface RestaurantMatch {
  id: string;
  amap_poi_id: string | null;
  baidu_poi_id: string | null;
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

    // Fill in any provider ID/URL the existing row is missing (e.g. the same
    // place saved earlier via one provider only).
    const enrichRestaurant = async (row: RestaurantMatch) => {
      if ((row.amap_poi_id || !amapPoiId) && (row.baidu_poi_id || !baiduPoiId)) return;
      await sql`
        UPDATE restaurants SET
          amap_poi_id = COALESCE(amap_poi_id, ${amapPoiId ?? null}),
          source_url = COALESCE(source_url, ${sourceUrl}),
          baidu_poi_id = COALESCE(baidu_poi_id, ${baiduPoiId ?? null}),
          baidu_source_url = COALESCE(baidu_source_url, ${baiduSourceUrl})
        WHERE id = ${row.id}
      `;
    };

    // Find a restaurant matching either POI ID.
    const findMatch = async (): Promise<RestaurantMatch | null> => {
      const rows = (await sql`
        SELECT id, amap_poi_id, baidu_poi_id FROM restaurants
        WHERE
          (amap_poi_id IS NOT NULL AND amap_poi_id = ${amapPoiId ?? ''})
          OR (baidu_poi_id IS NOT NULL AND baidu_poi_id = ${baiduPoiId ?? ''})
        LIMIT 1
      `) as RestaurantMatch[];
      return rows[0] ?? null;
    };

    // Atomically get-or-create the restaurant. The unique indexes on
    // amap_poi_id / baidu_poi_id turn a lost check-then-insert race into a
    // 23505 unique violation, which we recover from by re-reading the row.
    const getOrCreateRestaurant = async (): Promise<{ id: string; existed: boolean }> => {
      const match = await findMatch();
      if (match) {
        await enrichRestaurant(match);
        return { id: match.id, existed: true };
      }
      try {
        const inserted = (await sql`
          INSERT INTO restaurants
            (name, address, lat, lng, amap_poi_id, source_url, baidu_poi_id, baidu_source_url, added_by)
          VALUES
            (${name}, ${address}, ${lat}, ${lng}, ${amapPoiId ?? null}, ${sourceUrl}, ${baiduPoiId ?? null}, ${baiduSourceUrl}, ${userId})
          RETURNING id
        `) as { id: string }[];
        return { id: inserted[0].id, existed: false };
      } catch (err) {
        if ((err as { code?: string }).code !== '23505') throw err;
        const raced = await findMatch();
        if (!raced) throw err;
        await enrichRestaurant(raced);
        return { id: raced.id, existed: true };
      }
    };

    if (!visited) {
      const { existed } = await getOrCreateRestaurant();
      if (existed) {
        return Response.json({ duplicate: true, error: 'This restaurant is already in your collection.' }, { status: 409 });
      }
      return Response.json({ success: true });
    }

    const { id: restaurantId } = await getOrCreateRestaurant();

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
