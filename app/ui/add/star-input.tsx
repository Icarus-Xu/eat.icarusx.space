// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState } from 'react';
import { STAR_PATH } from '@/app/ui/stars';

interface StarInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function StarInput({ value, onChange }: StarInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value ?? 0;

  return (
    <div
      className="flex gap-1.5"
      role="group"
      aria-label="Star rating"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          onMouseEnter={() => setHover(star)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-90"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            viewBox="0 0 20 20"
            strokeWidth={1.4}
            className={`h-7 w-7 ${
              star <= active
                ? 'fill-star dark:fill-star-d'
                : 'fill-none stroke-muted opacity-60 dark:stroke-muted-d'
            }`}
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
