// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useLocation } from '@/app/ui/location-context';
import LocationInput from '@/app/ui/location-input';
import MapView from '@/app/ui/map-view';

export default function MapPageClient() {
  const { location, setLocation } = useLocation();

  const handleCoords = async ({ lat, lng }: { lat: number; lng: number }) => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setLocation({ lat, lng, address: data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    } catch {
      setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <LocationInput
        onCoords={handleCoords}
        defaultCoords={location ? { lat: location.lat, lng: location.lng } : undefined}
        defaultAddress={location?.address}
      />
      <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200">
        {location ? (
          <MapView lat={location.lat} lng={location.lng} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Waiting for location...
          </div>
        )}
      </div>
    </div>
  );
}
