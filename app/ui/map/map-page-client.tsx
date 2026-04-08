// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState } from 'react';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import LocationInput from '@/app/ui/location-input';
import MapView from '@/app/ui/map-view';
import BaiduMapView from '@/app/ui/baidu-map-view';

const DEFAULT = { lat: 39.9042, lng: 116.4074 };

export default function MapPageClient() {
  const { location, setLocation } = useLocation();
  const { provider } = useMapProvider();
  const effectiveProvider = provider ?? 'amap';
  const [mapPending, setMapPending] = useState<{ coords: { lat: number; lng: number }; address: string } | null>(null);

  const handleCoords = async ({ lat, lng }: { lat: number; lng: number }) => {
    setMapPending(null);
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}&provider=${effectiveProvider}`);
      const data = await res.json();
      setLocation({ lat, lng, address: data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    } catch {
      setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  };

  const handleMapClick = async ({ lat, lng }: { lat: number; lng: number }) => {
    setMapPending({ coords: { lat, lng }, address: '' });
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}&provider=${effectiveProvider}`);
      const data = await res.json();
      setMapPending({ coords: { lat, lng }, address: data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    } catch {
      setMapPending({ coords: { lat, lng }, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  };

  const displayCoords = mapPending?.coords ?? location ?? DEFAULT;

  return (
    <div className="flex h-full flex-col gap-4">
      <LocationInput
        onCoords={handleCoords}
        defaultCoords={location ? { lat: location.lat, lng: location.lng } : undefined}
        defaultAddress={location?.address}
        mapPending={mapPending}
        onMapPendingDismiss={() => setMapPending(null)}
      />
      <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200">
        {effectiveProvider === 'baidu' ? (
          <BaiduMapView key="baidu" lat={displayCoords.lat} lng={displayCoords.lng} onMapClick={handleMapClick} />
        ) : (
          <MapView key="amap" lat={displayCoords.lat} lng={displayCoords.lng} onMapClick={handleMapClick} />
        )}
      </div>
    </div>
  );
}
