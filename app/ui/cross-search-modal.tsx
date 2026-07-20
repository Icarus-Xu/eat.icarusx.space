// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useT } from '@/app/ui/lang-context';

export interface CrossPoi {
  id: string;
  name: string;
  address: string;
}

interface Props {
  isOpen: boolean;
  targetProvider: 'amap' | 'baidu';
  results: CrossPoi[];
  onSelect: (poi: CrossPoi | null) => void; // null = skip / no match
}

export default function CrossSearchModal({ isOpen, targetProvider, results, onSelect }: Props) {
  const t = useT();
  if (!isOpen) return null;

  const PROVIDER_LABEL: Record<string, string> = {
    amap: t.mapProviderAmapLabel,
    baidu: t.mapProviderBaiduLabel,
  };
  const label = PROVIDER_LABEL[targetProvider];

  // Zero results: warn and ask to confirm
  if (results.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-panel">
          <div className="mb-4 flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-star" />
            <div>
              <p className="font-medium text-ink dark:text-ink-d">
                {t.crossNoMatch(label)}
              </p>
              <p className="mt-1 text-sm text-muted dark:text-muted-d">
                {t.crossNoMatchDesc(label)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="btn-primary w-full justify-center"
          >
            {t.crossContinueAnyway}
          </button>
        </div>
      </div>
    );
  }

  // Multiple results: let user pick
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <p className="mb-1 font-medium text-ink dark:text-ink-d">
          {t.crossSelectOn(label)}
        </p>
        <p className="mb-4 text-sm text-muted dark:text-muted-d">
          {t.crossMultipleMatches}
        </p>
        <ul className="mb-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="poi-item"
              >
                <p className="font-medium text-ink dark:text-ink-d">{r.name}</p>
                <p className="mt-0.5 text-sm text-muted dark:text-muted-d">{r.address}</p>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => onSelect(null)}
          className="w-full rounded-lg border border-line py-2 text-sm text-muted hover:bg-paper dark:border-line-d dark:text-muted-d dark:hover:bg-card-d"
        >
          {t.crossSkip(label)}
        </button>
      </div>
    </div>
  );
}
