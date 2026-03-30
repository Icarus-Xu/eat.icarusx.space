// Copyright (C) 2026 Viture Inc. All rights reserved.

const AMAP_KEY = process.env.AMAP_WEB_SERVICE_KEY!;

export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Extract POI id from various amap URL formats
function extractPoiId(url: string): string | null {
  // https://www.amap.com/detail/POIID
  const detailMatch = url.match(/amap\.com\/detail\/([A-Z0-9]+)/i);
  if (detailMatch) return detailMatch[1];

  // https://uri.amap.com/poi?id=POIID
  const uriMatch = url.match(/[?&]id=([A-Z0-9]+)/i);
  if (uriMatch) return uriMatch[1];

  return null;
}

// Follow short URL redirect and return final URL
async function resolveUrl(url: string): Promise<string> {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return res.url;
}

export async function parseAmapUrl(rawUrl: string): Promise<AmapPoi | null> {
  let url = rawUrl.trim();

  // Resolve short links (surl.amap.com)
  if (url.includes('surl.amap.com') || url.includes('dingyue.amap.com')) {
    try {
      url = await resolveUrl(url);
    } catch {
      return null;
    }
  }

  const poiId = extractPoiId(url);
  if (!poiId) return null;

  return fetchPoiById(poiId);
}

export async function fetchPoiById(poiId: string): Promise<AmapPoi | null> {
  const res = await fetch(
    `https://restapi.amap.com/v3/place/detail?id=${poiId}&key=${AMAP_KEY}`,
  );
  const data = await res.json();

  if (data.status !== '1' || !data.pois?.length) return null;

  const poi = data.pois[0];
  const [lngStr, latStr] = (poi.location as string).split(',');

  return {
    id: poi.id,
    name: poi.name,
    address: poi.address || '',
    lat: parseFloat(latStr),
    lng: parseFloat(lngStr),
  };
}

// Haversine distance in meters
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
