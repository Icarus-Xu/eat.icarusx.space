// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import type { RestaurantCard } from '@/app/api/recommend/route';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import { StarRating } from '@/app/ui/stars';
import VisitBadge from '@/app/ui/visit-badge';

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
        <h2 className="text-base font-semibold leading-snug text-ink dark:text-ink-d">{r.name}</h2>
        <span className="shrink-0 text-sm tabular-nums text-muted dark:text-muted-d">{formatDistance(r.distanceM)}</span>
      </div>

      {r.visited && (
        <div className="flex items-center gap-2">
          <StarRating rating={r.rating} />
          {r.lastVisitedAt && (
            <span className="text-xs tabular-nums text-muted dark:text-muted-d">
              {t.cardLastVisited} {formatDate(r.lastVisitedAt, t.dateLocale)}
            </span>
          )}
        </div>
      )}

      {!r.visited && <VisitBadge visited={false} className="self-start" />}

      {notePreview && (
        <p className="text-sm text-sub dark:text-sub-d">{notePreview}</p>
      )}

      <p className="truncate text-xs text-muted dark:text-muted-d">{r.address}</p>
    </>
  );

  const base =
    'flex flex-col gap-2.5 rounded-2xl border border-line bg-card p-5 shadow-sm dark:border-line-d dark:bg-card-d';

  if (clickable) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} transition-all hover:-translate-y-0.5 hover:border-appetite hover:shadow-md dark:hover:border-appetite-d`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={`${base} opacity-60`}>
      {content}
    </div>
  );
}
