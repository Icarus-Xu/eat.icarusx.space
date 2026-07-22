// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logApiRequest } from '@/app/lib/log';

const AMAP_KEY = process.env.AMAP_WEB_SERVICE_KEY!;
const BAIDU_AK = process.env.BAIDU_MAP_AK!;

// Proxies a provider static-map image so the server-side key is never exposed.
// Restaurant coords are stored raw in the source provider's own system
// (GCJ-02 from Amap, BD-09 from Baidu), so they are passed straight through
// to that provider's static map without any conversion.
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

    const c = `${lng},${lat}`;
    let upstream: string;
    if (provider === 'baidu') {
      upstream =
        `https://api.map.baidu.com/staticimage/v2?ak=${BAIDU_AK}` +
        `&center=${c}&zoom=16&width=448&height=160&scale=2&markers=${c}&markerStyles=m,,0xE4572E`;
    } else {
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
