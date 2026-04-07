// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useMapProvider } from './map-provider-context';
import type { MapProvider } from './map-provider-context';

const OPTIONS: { value: MapProvider; label: string; desc: string }[] = [
  { value: 'amap', label: 'Amap (高德地图)', desc: 'Better coverage in smaller cities' },
  { value: 'baidu', label: 'Baidu Maps (百度地图)', desc: 'Widely used across China' },
];

export default function MapProviderModal() {
  const { provider, ready, setProvider } = useMapProvider();

  if (!ready || provider !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Choose your map provider
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Controls search, navigation links, and location services. You can change it later in Settings.
        </p>
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProvider(opt.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-950"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
