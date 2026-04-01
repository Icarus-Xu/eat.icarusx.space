// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

interface StarInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          className="text-2xl leading-none transition-transform active:scale-90"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= (value ?? 0) ? 'text-yellow-400 dark:text-yellow-300' : 'text-gray-300 dark:text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
