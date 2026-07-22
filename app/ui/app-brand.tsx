// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import Link from 'next/link';
import { useT } from '@/app/ui/lang-context';

export default function AppBrand() {
  const t = useT();
  return (
    <Link href="/home" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-appetite text-lg leading-none dark:bg-appetite-d">
        🍜
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink dark:text-ink-d">{t.appName}</span>
    </Link>
  );
}
