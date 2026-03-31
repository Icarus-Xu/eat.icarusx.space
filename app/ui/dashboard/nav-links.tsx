// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import {
  HomeIcon,
  SparklesIcon,
  PlusCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useLocation } from '@/app/ui/location-context';

const links = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Recommend', href: '/recommend', icon: SparklesIcon },
  { name: 'Add', href: '/add', icon: PlusCircleIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { location } = useLocation();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx('nav-link', { 'bg-sky-100 text-blue-600': pathname === link.href })}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      <Link
        href="/map"
        className={clsx('nav-link', { 'bg-sky-100 text-blue-600': pathname === '/map' })}
      >
        <MapPinIcon className="w-6 shrink-0" />
        <p className="hidden truncate md:block">
          {location ? location.address : 'Getting location...'}
        </p>
      </Link>
    </>
  );
}
