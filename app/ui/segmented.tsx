// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

// iOS-style segmented control: a recessed track with the active option raised.
export default function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex w-full gap-1 rounded-xl bg-paper p-1 dark:bg-paper-d" role="group">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active
                ? 'bg-card text-appetite shadow-sm dark:bg-card-d dark:text-appetite-d'
                : 'text-sub hover:text-ink dark:text-sub-d dark:hover:text-ink-d'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
