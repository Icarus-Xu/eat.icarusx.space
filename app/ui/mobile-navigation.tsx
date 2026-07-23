// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  HomeIcon,
  MapPinIcon,
  PlusCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AppBrand from '@/app/ui/app-brand';
import NavLinks from '@/app/ui/dashboard/nav-links';
import UserMenu from '@/app/ui/user-menu';
import { useLocation } from '@/app/ui/location-context';
import { useT } from '@/app/ui/lang-context';
import { useTheme } from '@/app/ui/theme-context';

const KEYS_TO_CLEAR = ['user_id', 'mapProvider', 'lang', 'theme', 'lastLocation'];

function useStandaloneMode() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(display-mode: standalone)');
    const update = () => {
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setStandalone(query.matches || iosStandalone);
    };

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return standalone;
}

function MobileBrowserMenu({
  userName,
  signOutAction,
}: {
  userName: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { location } = useLocation();
  const t = useT();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const links = [
    { name: t.navHome, href: '/home', icon: HomeIcon },
    { name: t.navRecommend, href: '/recommend', icon: SparklesIcon },
    { name: t.navAdd, href: '/add', icon: PlusCircleIcon },
    {
      name: location ? location.address : t.navMap,
      href: '/map',
      icon: MapPinIcon,
    },
    { name: t.navSettings, href: '/settings', icon: Cog6ToothIcon },
  ];

  const itemClass =
    'flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-sub transition-colors hover:bg-appetite-soft hover:text-appetite dark:text-sub-d dark:hover:bg-appetite-soft-d dark:hover:text-appetite-d';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="打开菜单"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
      >
        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-[73px] z-40 bg-black/20" />
          <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-line bg-card shadow-xl dark:border-line-d dark:bg-card-d">
            <div className="flex items-center gap-3 border-b border-line px-4 py-4 dark:border-line-d">
              <span className="h-10 w-10 shrink-0 rounded-full border border-appetite bg-appetite-soft dark:border-appetite-d dark:bg-appetite-soft-d" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink dark:text-ink-d">
                  {userName || t.appName}
                </p>
                <p className="text-xs text-muted dark:text-muted-d">{t.signedIn}</p>
              </div>
            </div>

            <div className="py-2">
              {links.map((link) => {
                const LinkIcon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      itemClass,
                      active &&
                        'bg-appetite-soft text-appetite dark:bg-appetite-soft-d dark:text-appetite-d',
                    )}
                  >
                    <LinkIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
              <form action={signOutAction}>
                <button
                  type="submit"
                  onClick={() => {
                    KEYS_TO_CLEAR.forEach((k) => localStorage.removeItem(k));
                    document.cookie = 'lang=; path=/; max-age=0; SameSite=Lax';
                    setTheme('auto');
                  }}
                  className={itemClass}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                  {t.signOut}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MobileNavigation({
  userName,
  signOutAction,
}: {
  userName: string;
  signOutAction: () => Promise<void>;
}) {
  const standalone = useStandaloneMode();

  return (
    <>
      <header className="flex flex-none items-center justify-between border-b border-line bg-paper px-6 py-5 dark:border-line-d dark:bg-paper-d lg:hidden">
        <AppBrand />
        {standalone ? (
          <UserMenu userName={userName} signOutAction={signOutAction} />
        ) : (
          <MobileBrowserMenu userName={userName} signOutAction={signOutAction} />
        )}
      </header>

      {standalone && (
        <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] dark:border-line-d dark:bg-paper-d lg:hidden">
          <NavLinks variant="bottom" />
        </nav>
      )}
    </>
  );
}
