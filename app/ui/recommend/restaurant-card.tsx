// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import type { RestaurantCard } from '@/app/api/recommend/route';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const full = Math.round(rating);
  return (
    <span className="text-yellow-400 text-sm" aria-label={`${rating} stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function RestaurantCard({ r }: { r: RestaurantCard }) {
  const { provider } = useMapProvider();
  const t = useT();
  const notePreview = r.notes ? r.notes.slice(0, 20) + (r.notes.length > 20 ? '...' : '') : null;

  const effectiveProvider = provider ?? 'amap';
  const poiId = effectiveProvider === 'baidu' ? r.baiduPoiId : r.amapPoiId;
  const href = effectiveProvider === 'baidu'
    ? `https://map.baidu.com/?uid=${r.baiduPoiId}`
    : `https://ditu.amap.com/place/${r.amapPoiId}`;
  const clickable = poiId !== null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">{r.name}</h2>
        <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500">{formatDistance(r.distanceM)}</span>
      </div>

      {r.visited && (
        <div className="flex items-center gap-2">
          <StarRating rating={r.rating} />
          {r.lastVisitedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {t.cardLastVisited} {formatDate(r.lastVisitedAt, t.dateLocale)}
            </span>
          )}
        </div>
      )}

      {!r.visited && (
        <span className="text-xs font-medium text-blue-500 dark:text-blue-400">{t.cardNotVisitedYet}</span>
      )}

      {notePreview && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{notePreview}</p>
      )}

      <p className="truncate text-xs text-gray-400 dark:text-gray-500">{r.address}</p>
    </>
  );

  if (clickable) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="card flex flex-col gap-2 p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-500"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="card flex flex-col gap-2 p-5 shadow-sm opacity-60">
      {content}
    </div>
  );
}
