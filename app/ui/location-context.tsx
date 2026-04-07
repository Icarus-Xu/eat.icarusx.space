// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationContextValue {
  location: Location | null;
  setLocation: (loc: Location) => void;
}

const LocationContext = createContext<LocationContextValue>({
  location: null,
  setLocation: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const provider = localStorage.getItem('mapProvider') ?? 'amap';
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}&provider=${provider}`);
        const data = await res.json();
        setLocation({ lat, lng, address: data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      } catch {
        setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
    });
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
