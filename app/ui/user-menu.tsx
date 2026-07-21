// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ui/theme-context';
import { useT } from '@/app/ui/lang-context';

const KEYS_TO_CLEAR = ['user_id', 'mapProvider', 'lang', 'theme', 'lastLocation'];

export default function UserMenu({
  userName,
  signOutAction,
}: {
  userName: string;
  signOutAction: () => Promise<void>;
}) {
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

  const itemClass =
    'flex w-full items-center gap-2 px-4 py-2.5 text-sm text-sub transition-colors hover:bg-paper dark:text-sub-d dark:hover:bg-paper-d';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-bold text-ink dark:text-ink-d"
      >
        <span className="h-6 w-6 shrink-0 rounded-full border border-appetite bg-appetite-soft dark:border-appetite-d dark:bg-appetite-soft-d" />
        {userName}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-card shadow-lg dark:border-line-d dark:bg-card-d">
          <Link href="/settings" onClick={() => setOpen(false)} className={itemClass}>
            <Cog6ToothIcon className="h-4 w-4" />
            {t.navSettings}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              onClick={() => {
                KEYS_TO_CLEAR.forEach((k) => localStorage.removeItem(k));
                setTheme('auto');
              }}
              className={itemClass}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              {t.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
