// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import postgres from 'postgres';
import { logApiRequest } from '@/app/lib/log';
import { amapPlaceUrl, baiduPlaceUrl } from '@/app/lib/provider-links';
import { gcj02ToWgs84, bd09ToGcj02 } from '@/app/lib/coords';

const sql = postgres(process.env.DATABASE_URL!, { ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : 'require' });

export interface RestaurantVisit {
  id: string;
  userName: string;
  rating: number | null;
  notes: string | null;
  visitedAt: string;
}

export interface RestaurantDetail {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  amapPoiId: string | null;
  baiduPoiId: string | null;
  addedByName: string | null;
  createdAt: string;
  visits: RestaurantVisit[];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return logApiRequest('/api/restaurant/[id]', request, async () => {
    const session = await auth();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const rows = (await sql`
      SELECT r.id, r.name, r.address, r.lat::text, r.lng::text,
             r.amap_poi_id, r.baidu_poi_id, r.created_at::text, u.name AS added_by_name
      FROM restaurants r
      LEFT JOIN users u ON u.id = r.added_by
      WHERE r.id = ${id}
      LIMIT 1
    `) as {
      id: string; name: string; address: string; lat: string; lng: string;
      amap_poi_id: string | null; baidu_poi_id: string | null;
      created_at: string; added_by_name: string | null;
    }[];

    if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 });
    const r = rows[0];

    const visitRows = (await sql`
      SELECT v.id, v.rating::text, v.notes, v.visited_at::text, u.name AS user_name
      FROM visits v
      JOIN users u ON u.id = v.user_id
      WHERE v.restaurant_id = ${id}
      ORDER BY v.visited_at DESC
    `) as {
      id: string; rating: string | null; notes: string | null;
      visited_at: string; user_name: string;
    }[];

    const detail: RestaurantDetail = {
      id: r.id,
      name: r.name,
      address: r.address,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      amapPoiId: r.amap_poi_id ?? null,
      baiduPoiId: r.baidu_poi_id ?? null,
      addedByName: r.added_by_name ?? null,
      createdAt: r.created_at,
      visits: visitRows.map((v) => ({
        id: v.id,
        userName: v.user_name,
        rating: v.rating !== null ? parseFloat(v.rating) : null,
        notes: v.notes ?? null,
        visitedAt: v.visited_at,
      })),
    };

    return Response.json(detail);
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return logApiRequest('/api/restaurant/[id]', request, async () => {
    const session = await auth();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { provider, poiId, name, address, lat, lng } = (await request.json()) as {
      provider?: 'amap' | 'baidu'; poiId?: string; name?: string; address?: string; lat?: number; lng?: number;
    };

    if (!poiId || !name?.trim() || (provider !== 'amap' && provider !== 'baidu') || typeof lat !== 'number' || typeof lng !== 'number') {
      return Response.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    // Incoming coords are in the search provider's system; store as WGS-84.
    const gcj = provider === 'baidu' ? bd09ToGcj02(lat, lng) : { lat, lng };
    const wgs = gcj02ToWgs84(gcj.lat, gcj.lng);

    try {
      const updated = (provider === 'amap'
        ? await sql`
            UPDATE restaurants SET
              name = ${name.trim()}, address = ${address?.trim() ?? ''}, lat = ${wgs.lat}, lng = ${wgs.lng},
              amap_poi_id = ${poiId}, source_url = ${amapPlaceUrl(poiId)}, coord_type = 'wgs84'
            WHERE id = ${id} RETURNING id`
        : await sql`
            UPDATE restaurants SET
              name = ${name.trim()}, address = ${address?.trim() ?? ''}, lat = ${wgs.lat}, lng = ${wgs.lng},
              baidu_poi_id = ${poiId}, baidu_source_url = ${baiduPlaceUrl(poiId)}, coord_type = 'wgs84'
            WHERE id = ${id} RETURNING id`) as { id: string }[];

      if (!updated.length) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json({ success: true });
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        return Response.json({ duplicate: true, error: 'Another restaurant is already linked to this place.' }, { status: 409 });
      }
      throw e;
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return logApiRequest('/api/restaurant/[id]', request, async () => {
    const session = await auth();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // visits rows are removed via ON DELETE CASCADE
    const deleted = (await sql`
      DELETE FROM restaurants WHERE id = ${id} RETURNING id
    `) as { id: string }[];

    if (!deleted.length) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ success: true });
  });
}
