// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchPoiByName as searchAmap } from '@/app/lib/amap';
import { searchPoiByName as searchBaidu } from '@/app/lib/baidu';
import { bd09ToGcj02 } from '@/app/lib/coords';

interface CrossSearchBody {
  name: string;
  lat: number;
  lng: number;
  sourceProvider: 'amap' | 'baidu';
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, lat, lng, sourceProvider }: CrossSearchBody = await req.json();

  if (sourceProvider === 'amap') {
    // Source is Amap (GCJ-02) → search Baidu with coordtype=2
    const pois = await searchBaidu(name, { lat, lng }, 2);
    return NextResponse.json({
      pois: pois.map((p) => ({ id: p.uid, name: p.name, address: p.address })),
    });
  }

  // Source is Baidu (BD-09) → convert to GCJ-02 → search Amap
  const gcj = bd09ToGcj02(lat, lng);
  const pois = await searchAmap(name, { lat: gcj.lat, lng: gcj.lng });
  return NextResponse.json({
    pois: pois.map((p) => ({ id: p.id, name: p.name, address: p.address })),
  });
}
