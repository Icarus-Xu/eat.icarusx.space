// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import type { RestaurantCard } from '@/app/api/recommend/route';
import { useT } from '@/app/ui/lang-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { StarRating } from '@/app/ui/stars';
import VisitBadge from '@/app/ui/visit-badge';
import InteractiveCard from '@/app/ui/restaurant/interactive-card';

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

export default function RestaurantCard({ r, onChanged }: { r: RestaurantCard; onChanged?: () => void }) {
  const t = useT();
  const { provider } = useMapProvider();
  const effectiveProvider = provider ?? 'amap';
  const hasCurrentPoi = (effectiveProvider === 'baidu' ? r.baiduPoiId : r.amapPoiId) != null;
  const notePreview = r.notes ? r.notes.slice(0, 20) + (r.notes.length > 20 ? '...' : '') : null;

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
    'flex flex-col gap-2.5 rounded-2xl border border-line bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-appetite hover:shadow-md dark:border-line-d dark:bg-card-d dark:hover:border-appetite-d' +
    (hasCurrentPoi ? '' : ' opacity-60');

  return (
    <InteractiveCard
      restaurantId={r.id}
      amapPoiId={r.amapPoiId}
      baiduPoiId={r.baiduPoiId}
      distanceM={r.distanceM}
      onChanged={onChanged}
      className={base}
    >
      {content}
    </InteractiveCard>
  );
}
