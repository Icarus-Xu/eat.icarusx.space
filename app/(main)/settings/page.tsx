// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useMapProvider } from '@/app/ui/map-provider-context';
import type { MapProvider } from '@/app/ui/map-provider-context';

const MAP_OPTIONS: { value: MapProvider; label: string }[] = [
  { value: 'amap', label: 'Amap (高德)' },
  { value: 'baidu', label: 'Baidu (百度)' },
];

export default function SettingsPage() {
  const { provider, setProvider } = useMapProvider();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="page-heading">Settings</h1>

      <div className="max-w-md">
        <div className="card flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Map Provider</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Affects restaurant search, navigation links, and reverse geocoding.
            </p>
          </div>
          <div className="flex gap-2">
            {MAP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-colors ${
                  provider === opt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
