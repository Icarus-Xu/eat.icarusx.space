// Copyright (C) 2026 Icarus. All rights reserved.

const AMAP_KEY = process.env.AMAP_WEB_SERVICE_KEY!;

export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Parse ?p=ID,lat,lng,name,address format (from resolved short links)
function parseFromPParam(resolvedUrl: string): AmapPoi | null {
  let p: string | null = null;
  try {
    p = new URL(resolvedUrl).searchParams.get('p');
  } catch {
    return null;
  }
  if (!p) return null;

  // Split on first 4 commas only, to handle commas inside address/name
  const idx: number[] = [];
  let pos = -1;
  for (let i = 0; i < 4; i++) {
    pos = p.indexOf(',', pos + 1);
    if (pos === -1) return null;
    idx.push(pos);
  }
  const id = p.slice(0, idx[0]);
  const lat = parseFloat(p.slice(idx[0] + 1, idx[1]));
  const lng = parseFloat(p.slice(idx[1] + 1, idx[2]));
  const name = p.slice(idx[2] + 1, idx[3]);
  const address = p.slice(idx[3] + 1);

  if (!id || isNaN(lat) || isNaN(lng) || !name) return null;
  return { id, name, address, lat, lng };
}

// Extract POI id from explicit detail/uri URL formats
function extractPoiId(url: string): string | null {
  const detailMatch = url.match(/amap\.com\/detail\/([A-Z0-9]+)/i);
  if (detailMatch) return detailMatch[1];

  const uriMatch = url.match(/[?&]id=([A-Z0-9]+)/i);
  if (uriMatch) return uriMatch[1];

  return null;
}

// Follow redirects manually, parsing ?p= at each hop to avoid encoding issues
async function resolveShortLink(url: string, maxHops = 5): Promise<AmapPoi | null> {
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    // Try parsing current URL before following further
    const fromP = parseFromPParam(current);
    if (fromP) return fromP;

    const poiId = extractPoiId(current);
    if (poiId) return fetchPoiById(poiId);

    const res = await fetch(current, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      current = location.startsWith('http') ? location : new URL(location, current).href;
    } else {
      break;
    }
  }
  // Last chance: try the final URL
  return parseFromPParam(current) ?? null;
}

export async function parseAmapUrl(rawUrl: string): Promise<AmapPoi | null> {
  const url = rawUrl.trim();

  const isShortLink =
    url.includes('surl.amap.com') ||
    url.includes('dingyue.amap.com') ||
    url.includes('amap.com/s/') ||
    url.includes('wb.amap.com');

  if (isShortLink) {
    try {
      return await resolveShortLink(url);
    } catch {
      return null;
    }
  }

  // Direct URL: try ?p= format, then explicit POI ID
  const fromP = parseFromPParam(url);
  if (fromP) return fromP;

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

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const res = await fetch(
    `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}`,
  );
  const data = await res.json();
  if (data.status !== '1') return null;
  return (data.regeocode?.formatted_address as string) ?? null;
}

export interface GeoCandidate {
  name: string;
  address: string;
  lat: number; // GCJ-02
  lng: number; // GCJ-02
}

export async function geocodeAddressList(query: string): Promise<GeoCandidate[]> {
  const poiRes = await fetch(
    `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(query)}&key=${AMAP_KEY}&offset=5`,
  );
  const poiData = await poiRes.json();
  if (poiData.status === '1' && poiData.pois?.length) {
    return (poiData.pois as Record<string, string>[]).slice(0, 5).map((poi) => {
      const [lngStr, latStr] = poi.location.split(',');
      return { name: poi.name, address: poi.address || '', lat: parseFloat(latStr), lng: parseFloat(lngStr) };
    });
  }

  const geoRes = await fetch(
    `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(query)}&key=${AMAP_KEY}`,
  );
  const geoData = await geoRes.json();
  if (geoData.status !== '1' || !geoData.geocodes?.length) return [];
  return (geoData.geocodes as Record<string, string>[]).slice(0, 5).map((geo) => {
    const [lngStr, latStr] = geo.location.split(',');
    return { name: geo.formatted_address, address: '', lat: parseFloat(latStr), lng: parseFloat(lngStr) };
  });
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Try POI search first (handles building names, landmarks, etc.)
  const poiRes = await fetch(
    `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(address)}&key=${AMAP_KEY}`,
  );
  const poiData = await poiRes.json();
  if (poiData.status === '1' && poiData.pois?.length) {
    const [lngStr, latStr] = (poiData.pois[0].location as string).split(',');
    return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
  }

  // Fall back to structured address geocoding
  const geoRes = await fetch(
    `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMAP_KEY}`,
  );
  const geoData = await geoRes.json();
  if (geoData.status !== '1' || !geoData.geocodes?.length) return null;
  const [lngStr, latStr] = (geoData.geocodes[0].location as string).split(',');
  return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
}

export async function searchPoiByName(
  keywords: string,
  location?: { lat: number; lng: number },
  radius = 5000,
): Promise<AmapPoi[]> {
  const params = new URLSearchParams({
    keywords,
    types: '050000',
    key: AMAP_KEY,
    output: 'json',
    offset: '10',
    page: '1',
  });
  if (location) {
    params.set('location', `${location.lng},${location.lat}`);
    params.set('radius', String(radius));
  }

  const res = await fetch(`https://restapi.amap.com/v3/place/text?${params}`);
  const data = await res.json();
  if (data.status !== '1' || !data.pois?.length) return [];

  return (data.pois as Record<string, unknown>[]).map((poi) => {
    const [lngStr, latStr] = (poi.location as string).split(',');
    return {
      id: poi.id as string,
      name: poi.name as string,
      address: (poi.address as string) || '',
      lat: parseFloat(latStr),
      lng: parseFloat(lngStr),
    };
  });
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
