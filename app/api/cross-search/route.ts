// Copyright (C) 2026 Icarus. All rights reserved.
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchPoiByName as searchAmap, haversineDistance } from '@/app/lib/amap';
import { searchPoiByName as searchBaidu, nearbySearchBaidu } from '@/app/lib/baidu';
import { bd09ToGcj02 } from '@/app/lib/coords';
import { logApiRequest } from '@/app/lib/log';

interface CrossSearchBody {
  name: string;
  lat: number;
  lng: number;
  sourceProvider: 'amap' | 'baidu';
}

// Providers name the same branch differently ("阿含泰(清河店)" vs
// "阿含泰·泰国菜(清河店)"), and the branch suffix drags the search towards
// other brands' branches in the same area, so search the stem only.
function stemName(name: string): string {
  return name.replace(/[(（].*$/, '').trim() || name;
}

export async function POST(req: NextRequest) {
  return logApiRequest('/api/cross-search', req, async () => {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, lat, lng, sourceProvider }: CrossSearchBody = await req.json();

    const query = stemName(name);

    if (sourceProvider === 'amap') {
      // Source is Amap (GCJ-02): the suggestion API has the better recall, but
      // no distance constraint, so rank its results by distance ourselves.
      // Place search (radius-bound) only fills in when suggestion finds nothing.
      let pois = await searchBaidu(query, { lat, lng }, 2);
      if (pois.length === 0) pois = await nearbySearchBaidu(query, { lat, lng }, 2);
      const ranked = pois
        .map((p) => {
          const g = bd09ToGcj02(p.lat, p.lng);
          return {
            id: p.uid,
            name: p.name,
            address: p.address,
            distanceM: haversineDistance(lat, lng, g.lat, g.lng),
          };
        })
        .sort((a, b) => a.distanceM - b.distanceM);
      return NextResponse.json({ pois: ranked });
    }

    // Source is Baidu (BD-09) → convert to GCJ-02 → search Amap
    const gcj = bd09ToGcj02(lat, lng);
    const pois = await searchAmap(query, { lat: gcj.lat, lng: gcj.lng });
    const ranked = pois
      .map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        distanceM: haversineDistance(gcj.lat, gcj.lng, p.lat, p.lng),
      }))
      .sort((a, b) => a.distanceM - b.distanceM);
    return NextResponse.json({ pois: ranked });
  });
}
