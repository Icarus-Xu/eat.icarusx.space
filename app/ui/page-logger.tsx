// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLogger() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page',
        method: 'GET',
        path: pathname,
        statusCode: 200,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
