// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MapProvider = 'amap' | 'baidu';

const STORAGE_KEY = 'mapProvider';

interface MapProviderContextValue {
  provider: MapProvider | null;
  ready: boolean;
  setProvider: (p: MapProvider) => void;
  clearProvider: () => void;
}

const MapProviderContext = createContext<MapProviderContextValue>({
  provider: null,
  ready: false,
  setProvider: () => {},
  clearProvider: () => {},
});

export function MapProviderContextProvider({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<MapProvider | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'amap' || stored === 'baidu') {
      setProviderState(stored);
    }
    setReady(true);
  }, []);

  function setProvider(p: MapProvider) {
    localStorage.setItem(STORAGE_KEY, p);
    setProviderState(p);
  }

  function clearProvider() {
    localStorage.removeItem(STORAGE_KEY);
    setProviderState(null);
  }

  return (
    <MapProviderContext.Provider value={{ provider, ready, setProvider, clearProvider }}>
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapProvider() {
  return useContext(MapProviderContext);
}
