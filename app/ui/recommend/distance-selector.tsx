// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';

const DISTANCE_OPTIONS = [1, 2, 3, 5, 10];

export default function DistanceSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (km: number) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="true"
        className="rounded-2xl border-2 border-appetite bg-appetite/5 px-3 py-1.5 text-sm font-bold text-appetite transition-all hover:bg-appetite/10 active:scale-95 disabled:opacity-50 dark:border-appetite-d dark:bg-appetite-d/5 dark:text-appetite-d dark:hover:bg-appetite-d/10"
      >
        {value} km
      </button>
      <div
        className={`absolute right-0 top-full z-20 mt-2.5 flex flex-col gap-1.5 rounded-2xl border border-line bg-card p-2 shadow-lg transition-all duration-200 dark:border-line-d dark:bg-card-d ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
        }`}
      >
        {DISTANCE_OPTIONS.map((km) => (
          <button
            key={km}
            type="button"
            onClick={() => {
              onChange(km);
              setOpen(false);
            }}
            className={`rounded-2xl px-3 py-1.5 text-sm font-semibold transition-colors ${
              km === value
                ? 'bg-appetite text-white dark:bg-appetite-d dark:text-paper-d'
                : 'border border-line bg-card text-sub hover:border-appetite dark:border-line-d dark:bg-card-d dark:text-sub-d dark:hover:border-appetite-d'
            }`}
          >
            {km}
          </button>
        ))}
      </div>
    </div>
  );
}