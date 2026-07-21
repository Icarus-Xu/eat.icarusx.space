// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import Link from 'next/link';
import { useT } from '@/app/ui/lang-context';

export default function AppBrand() {
  const t = useT();
  return (
    <Link
      href="/home"
      className="text-lg font-bold tracking-tight text-ink dark:text-ink-d"
    >
      {t.appName}
    </Link>
  );
}
