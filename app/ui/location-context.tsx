// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

const LOCATION_KEY = 'lastLocation';

interface LocationContextValue {
  location: Location | null;
  setLocation: (loc: Location) => void;
  locate: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue>({
  location: null,
  setLocation: () => {},
  locate: async () => {},
});

async function gpsReverseGeocode(lat: number, lng: number): Promise<Location> {
  try {
    const provider = localStorage.getItem('mapProvider') ?? 'amap';
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}&provider=${provider}`);
    const data = await res.json();
    return { lat, lng, address: data.address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  } catch {
    return { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);

  const setLocation = (loc: Location) => {
    setLocationState(loc);
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  };

  const locate = async (): Promise<void> => {
    if (!navigator.geolocation) return;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = await gpsReverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocation(loc);
        resolve();
      }, () => resolve());
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try { setLocationState(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      locate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, locate }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
