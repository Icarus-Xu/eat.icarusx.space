// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { geocodeAddressList } from '@/app/lib/amap';
import { searchPoiByName } from '@/app/lib/baidu';
import { gcj02ToWgs84, bd09ToGcj02 } from '@/app/lib/coords';
import { logApiRequest } from '@/app/lib/log';

export async function GET(request: Request) {
  return logApiRequest('/api/geocode-search', request, async () => {
    const session = await auth();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const provider = searchParams.get('provider') ?? 'amap';
    if (!q) return Response.json({ error: 'Missing q' }, { status: 400 });

    if (provider === 'baidu') {
      const pois = await searchPoiByName(q);
      const results = pois.slice(0, 5).map((poi) => {
        const gcj02 = bd09ToGcj02(poi.lat, poi.lng);
        const wgs84 = gcj02ToWgs84(gcj02.lat, gcj02.lng);
        return { name: poi.name, address: poi.address, ...wgs84 };
      });
      return Response.json({ results });
    }

    const candidates = await geocodeAddressList(q);
    const results = candidates.map((c) => {
      const wgs84 = gcj02ToWgs84(c.lat, c.lng);
      return { name: c.name, address: c.address, ...wgs84 };
    });
    return Response.json({ results });
  });
}
