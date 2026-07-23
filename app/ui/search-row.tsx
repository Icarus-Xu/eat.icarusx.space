// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  pending?: boolean;
  disabled?: boolean;
  /** Replaces the default magnifying-glass icon when idle. */
  icon?: React.ReactNode;
  /** Rendered before the input (e.g. a locate button). */
  prefix?: React.ReactNode;
}

export default function SearchRow({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  pending,
  disabled,
  icon,
  prefix,
}: Props) {
  return (
    <div className="flex gap-2">
      {prefix}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder}
        className="form-input min-w-0 flex-1"
      />
      <button
        onClick={onSubmit}
        disabled={disabled ?? (pending || !value.trim())}
        aria-label={submitLabel}
        className="btn-icon"
      >
        {pending
          ? <ArrowPathIcon className="h-5 w-5 animate-spin" />
          : icon ?? <MagnifyingGlassIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}