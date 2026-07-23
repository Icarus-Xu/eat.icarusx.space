// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useT } from '@/app/ui/lang-context';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  disabled?: boolean;
  confirmDisabled?: boolean;
}

export default function FormActions({ onCancel, onConfirm, confirmLabel, disabled, confirmDisabled }: Props) {
  const t = useT();
  return (
    <div className="flex gap-2.5">
      <button
        onClick={onCancel}
        disabled={disabled}
        className="h-11 flex-1 rounded-xl border border-line text-sm font-medium text-sub transition hover:bg-paper disabled:opacity-50 dark:border-line-d dark:text-sub-d dark:hover:bg-paper-d"
      >
        {t.commonCancel}
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled || confirmDisabled}
        className="h-11 flex-1 rounded-xl bg-appetite text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50 dark:bg-appetite-d dark:text-paper-d"
      >
        {confirmLabel}
      </button>
    </div>
  );
}