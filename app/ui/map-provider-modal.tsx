// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useMapProvider } from './map-provider-context';
import type { MapProvider } from './map-provider-context';
import { useT } from '@/app/ui/lang-context';

export default function MapProviderModal() {
  const { provider, ready, setProvider } = useMapProvider();
  const t = useT();

  if (!ready || provider !== null) return null;

  const options: { value: MapProvider; label: string; desc: string }[] = [
    { value: 'amap', label: t.mapProviderAmapLabel, desc: t.mapProviderAmapDesc },
    { value: 'baidu', label: t.mapProviderBaiduLabel, desc: t.mapProviderBaiduDesc },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.mapProviderChoose}
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {t.mapProviderDesc}
        </p>
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProvider(opt.value)}
              className="provider-option"
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
