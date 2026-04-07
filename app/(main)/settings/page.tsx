// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useMapProvider } from '@/app/ui/map-provider-context';
import type { MapProvider } from '@/app/ui/map-provider-context';
import { useLang, useT } from '@/app/ui/lang-context';
import type { Lang } from '@/app/ui/lang-context';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
];

export default function SettingsPage() {
  const { provider, setProvider } = useMapProvider();
  const { lang, setLang } = useLang();
  const t = useT();

  const mapOptions: { value: MapProvider; label: string }[] = [
    { value: 'amap', label: t.mapProviderAmapLabel },
    { value: 'baidu', label: t.mapProviderBaiduLabel },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="page-heading">{t.settingsTitle}</h1>

      <div className="max-w-md flex flex-col gap-4">
        <div className="card flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.settingsMapProvider}</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {t.settingsMapProviderDesc}
            </p>
          </div>
          <div className="flex gap-2">
            {mapOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                className={`btn-option ${provider === opt.value ? 'btn-option-active' : 'btn-option-inactive'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.settingsLanguage}</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {t.settingsLanguageDesc}
            </p>
          </div>
          <div className="flex gap-2">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLang(opt.value)}
                className={`btn-option ${lang === opt.value ? 'btn-option-active' : 'btn-option-inactive'}`}
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
