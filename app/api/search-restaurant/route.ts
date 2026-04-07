// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { searchPoiByName } from '@/app/lib/amap';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q')?.trim();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 });

  const location =
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

  const pois = await searchPoiByName(q, location);
  return NextResponse.json({ pois });
}
