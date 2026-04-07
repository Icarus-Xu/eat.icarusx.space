// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import {
  HomeIcon,
  SparklesIcon,
  PlusCircleIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useLocation } from '@/app/ui/location-context';

const links = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Recommend', href: '/recommend', icon: SparklesIcon },
  { name: 'Add', href: '/add', icon: PlusCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function NavLinks({ variant = 'sidebar' }: { variant?: 'sidebar' | 'bottom' }) {
  const pathname = usePathname();
  const { location } = useLocation();

  if (variant === 'bottom') {
    const allLinks = [
      ...links,
      { name: location?.address.split(/[省市区县]/)[0] ?? 'Map', href: '/map', icon: MapPinIcon },
    ];
    return (
      <>
        {allLinks.map((link) => {
          const LinkIcon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
                active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
              )}
            >
              <LinkIcon className="h-6 w-6" />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx('nav-link', { 'bg-sky-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400': pathname === link.href })}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      <Link
        href="/map"
        className={clsx('nav-link', { 'bg-sky-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400': pathname === '/map' })}
      >
        <MapPinIcon className="w-6 shrink-0" />
        <p className="hidden truncate md:block">
          {location ? location.address : 'Getting location...'}
        </p>
      </Link>
    </>
  );
}
