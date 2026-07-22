// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useT } from '@/app/ui/lang-context';

export default function LogHeading() {
  const t = useT();
  return <h1 className="page-heading">{t.logTitle}</h1>;
}
