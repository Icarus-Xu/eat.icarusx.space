// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { searchPoiByName as searchAmap } from '@/app/lib/amap';
import { searchPoiByName as searchBaidu } from '@/app/lib/baidu';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q')?.trim();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const provider = searchParams.get('provider') ?? 'amap';

  if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 });

  if (provider === 'baidu') {
    const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const pois = await searchBaidu(q, location, 1);
    return NextResponse.json({
      pois: pois.map((p) => ({ id: p.uid, name: p.name, address: p.address, lat: p.lat, lng: p.lng })),
    });
  }

  const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
  const pois = await searchAmap(q, location);
  return NextResponse.json({ pois });
}
