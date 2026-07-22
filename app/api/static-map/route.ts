// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { wgs84ToGcj02, wgs84ToBd09 } from '@/app/lib/coords';
import { logApiRequest } from '@/app/lib/log';

const AMAP_KEY = process.env.AMAP_WEB_SERVICE_KEY!;
const BAIDU_AK = process.env.BAIDU_MAP_AK!;

// Proxies a provider static-map image so the server-side key is never exposed.
// Restaurant coords are stored as WGS-84; converted here to the requested
// provider's coordinate system (GCJ-02 for Amap, BD-09 for Baidu).
export async function GET(req: NextRequest) {
  return logApiRequest('/api/static-map', req, async () => {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lng = parseFloat(searchParams.get('lng') ?? '');
    const provider = searchParams.get('provider') === 'baidu' ? 'baidu' : 'amap';
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
    }

    let upstream: string;
    if (provider === 'baidu') {
      const b = wgs84ToBd09(lat, lng);
      const c = `${b.lng},${b.lat}`;
      // Baidu zoom runs lower in scale than Amap's; 18 pairs with Amap 16 here.
      upstream =
        `https://api.map.baidu.com/staticimage/v2?ak=${BAIDU_AK}` +
        `&center=${c}&zoom=18&width=448&height=160&scale=2&markers=${c}&markerStyles=m,,0xE4572E`;
    } else {
      const g = wgs84ToGcj02(lat, lng);
      const c = `${g.lng},${g.lat}`;
      upstream =
        `https://restapi.amap.com/v3/staticmap?key=${AMAP_KEY}` +
        `&location=${c}&zoom=16&size=448*160&scale=2&markers=mid,0xE4572E,:${c}`;
    }

    const res = await fetch(upstream);
    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Static map unavailable' }, { status: 502 });
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Map for a fixed point never changes; let the browser cache it.
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  });
}
