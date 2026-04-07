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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t.crossNoMatch(label)}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <p className="mb-1 font-medium text-gray-900 dark:text-gray-100">
          {t.crossSelectOn(label)}
        </p>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t.crossMultipleMatches}
        </p>
        <ul className="mb-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-950"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{r.address}</p>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => onSelect(null)}
          className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {t.crossSkip(label)}
        </button>
      </div>
    </div>
  );
}
