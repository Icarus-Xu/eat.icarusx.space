// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PoiLike {
  id: string;
  name: string;
  address: string;
}

// Shared selectable list of POI search results (add form + relink editor).
export default function PoiResultList<T extends PoiLike>({
  results,
  onSelect,
  className,
}: {
  results: T[];
  onSelect: (poi: T) => void;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-2${className ? ` ${className}` : ''}`}>
      {results.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onSelect(r)}
            className="card group flex w-full items-center gap-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-appetite hover:shadow-md dark:hover:border-appetite-d"
          >
            <MapPinIcon className="h-5 w-5 shrink-0 text-appetite dark:text-appetite-d" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink dark:text-ink-d">{r.name}</span>
              <span className="block truncate text-sm text-muted dark:text-muted-d">{r.address}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 dark:text-muted-d" />
          </button>
        </li>
      ))}
    </ul>
  );
}
