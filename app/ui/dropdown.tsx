// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
}

// Custom dropdown replacing native <select>: warm-styled button + popover list,
// with fully controlled open/hover/highlight states.
export default function Dropdown<T extends string>({ options, value, onChange, label }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors
          focus-visible:outline-2 focus-visible:outline-appetite dark:bg-card-d dark:focus-visible:outline-appetite-d ${
          open
            ? 'border-appetite dark:border-appetite-d'
            : 'border-line hover:border-appetite dark:border-line-d dark:hover:border-appetite-d'
        }`}
      >
        <span className="truncate text-ink dark:text-ink-d">{current?.label ?? ''}</span>
        <ChevronUpDownIcon
          className={`h-4 w-4 shrink-0 text-muted transition-transform dark:text-muted-d ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-20 mt-1 w-full min-w-max overflow-hidden rounded-xl border border-line bg-card p-1 shadow-md dark:border-line-d dark:bg-card-d"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                    hover:bg-appetite-soft dark:hover:bg-appetite-soft-d ${
                    active
                      ? 'font-medium text-appetite dark:text-appetite-d'
                      : 'text-ink dark:text-ink-d'
                  }`}
                >
                  <span className="whitespace-nowrap">{opt.label}</span>
                  {active && <CheckIcon className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
