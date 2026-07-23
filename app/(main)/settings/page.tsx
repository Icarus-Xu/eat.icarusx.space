// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useMapProvider } from '@/app/ui/map-provider-context';
import type { MapProvider } from '@/app/ui/map-provider-context';
import { useLang, useT } from '@/app/ui/lang-context';
import type { Lang } from '@/app/ui/lang-context';
import { useTheme } from '@/app/ui/theme-context';
import type { ThemeSetting } from '@/app/ui/theme-context';
import Dropdown from '@/app/ui/dropdown';
import { MapIcon, LanguageIcon, SunIcon } from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
];

export default function SettingsPage() {
  const { provider, setProvider } = useMapProvider();
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const t = useT();

  const mapOptions: { value: MapProvider; label: string }[] = [
    { value: 'amap', label: t.mapProviderAmapLabel },
    { value: 'baidu', label: t.mapProviderBaiduLabel },
  ];

  const themeOptions: { value: ThemeSetting; label: string }[] = [
    { value: 'auto', label: t.themeAuto },
    { value: 'light', label: t.themeLight },
    { value: 'dark', label: t.themeDark },
  ];

  const sections: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    desc: string;
    control: React.ReactNode;
  }[] = [
    {
      icon: MapIcon,
      title: t.settingsMapProvider,
      desc: t.settingsMapProviderDesc,
      control: <Dropdown options={mapOptions} value={provider} onChange={setProvider} label={t.settingsMapProvider} />,
    },
    {
      icon: LanguageIcon,
      title: t.settingsLanguage,
      desc: t.settingsLanguageDesc,
      control: <Dropdown options={LANG_OPTIONS} value={lang} onChange={setLang} label={t.settingsLanguage} />,
    },
    {
      icon: SunIcon,
      title: t.settingsTheme,
      desc: t.settingsThemeDesc,
      control: <Dropdown options={themeOptions} value={theme} onChange={setTheme} label={t.settingsTheme} />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="page-heading">{t.settingsTitle}</h1>

      <div className="card w-full divide-y divide-line rounded-md p-0 dark:divide-line-d xl:max-w-2xl">
        {sections.map(({ icon: Icon, title, desc, control }) => (
          <section key={title} className="flex items-center gap-3 p-5">
            <div className="flex shrink-0 items-center self-stretch">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-appetite-soft text-appetite dark:bg-appetite-soft-d dark:text-appetite-d">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink dark:text-ink-d">{title}</p>
                <p className="mt-1 max-w-[28rem] text-sm leading-relaxed text-muted dark:text-muted-d">{desc}</p>
              </div>
              <div className="w-full lg:w-36 lg:shrink-0">{control}</div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
