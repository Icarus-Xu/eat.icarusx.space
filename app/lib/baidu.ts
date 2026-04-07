// Copyright (C) 2026 Icarus. All rights reserved.

const BAIDU_AK = process.env.BAIDU_MAP_AK!;

export interface BaiduPoi {
  uid: string;
  name: string;
  address: string;
  lat: number; // BD-09
  lng: number; // BD-09
}

// coord_type: 1=WGS84, 2=GCJ-02, 3=BD-09
export async function searchPoiByName(
  keywords: string,
  location?: { lat: number; lng: number },
  coordType: 1 | 2 | 3 = 1,
): Promise<BaiduPoi[]> {
  const params = new URLSearchParams({
    query: keywords,
    output: 'json',
    ak: BAIDU_AK,
    region: '全国',
    city_limit: 'false',
  });
  if (location) {
    params.set('location', `${location.lat},${location.lng}`);
    params.set('coordtype', String(coordType));
  }

  const res = await fetch(`https://api.map.baidu.com/place/v2/suggestion?${params}`);
  const data = await res.json();
  if (data.status !== 0 || !data.result?.length) return [];

  return (data.result as Record<string, unknown>[])
    .filter((r) => r.uid && (r.location as Record<string, number> | undefined)?.lat)
    .map((r) => {
      const loc = r.location as { lat: number; lng: number };
      return {
        uid: r.uid as string,
        name: r.name as string,
        address: (r.address as string) || '',
        lat: loc.lat,
        lng: loc.lng,
      };
    });
}

export async function fetchPoiByUid(uid: string): Promise<BaiduPoi | null> {
  const params = new URLSearchParams({ uid, output: 'json', scope: '1', ak: BAIDU_AK });
  const res = await fetch(`https://api.map.baidu.com/place/v2/detail?${params}`);
  const data = await res.json();
  if (data.status !== 0 || !data.result) return null;

  const r = data.result as Record<string, unknown>;
  const loc = r.location as { lat: number; lng: number };
  return {
    uid: r.uid as string,
    name: r.name as string,
    address: (r.address as string) || '',
    lat: loc.lat,
    lng: loc.lng,
  };
}

export async function parseBaiduShortLink(url: string): Promise<BaiduPoi | null> {
  // Follow redirect and extract uid from Location header
  let current = url;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(current, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      // Try to extract uid from the resolved URL
      // Location: https://map.baidu.com/?...&s=inf%26uid%3D{uid}&...
      const decoded = decodeURIComponent(location);
      const uidMatch = decoded.match(/uid=([0-9a-f]{24,})/i);
      if (uidMatch) return fetchPoiByUid(uidMatch[1]);
      current = location.startsWith('http') ? location : new URL(location, current).href;
    } else {
      break;
    }
  }
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // Input coords are WGS-84 from browser GPS
  const params = new URLSearchParams({
    ak: BAIDU_AK,
    output: 'json',
    coordtype: 'wgs84ll',
    location: `${lat},${lng}`,
  });
  const res = await fetch(`https://api.map.baidu.com/reverse_geocoding/v3/?${params}`);
  const data = await res.json();
  if (data.status !== 0) return null;
  return (data.result?.formatted_address as string) ?? null;
}
