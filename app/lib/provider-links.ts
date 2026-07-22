// Copyright (C) 2026 Icarus. All rights reserved.

// Canonical map-provider place URLs, used for stored source links and for
// opening a POI in the provider's map (navigation).
export function amapPlaceUrl(poiId: string): string {
  return `https://ditu.amap.com/place/${poiId}`;
}

export function baiduPlaceUrl(uid: string): string {
  return `https://map.baidu.com/?uid=${uid}`;
}

export function placeUrl(provider: 'amap' | 'baidu', poiId: string): string {
  return provider === 'amap' ? amapPlaceUrl(poiId) : baiduPlaceUrl(poiId);
}
