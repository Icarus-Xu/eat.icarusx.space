// Copyright (C) 2026 Viture Inc. All rights reserved.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { label: 'Recommend', href: '/recommend' },
  { label: 'Collect', href: '/collect' },
];

export default function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 border-b border-gray-200 bg-white px-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            'px-4 py-3 text-sm font-medium transition-colors',
            pathname === link.href
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-900',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
