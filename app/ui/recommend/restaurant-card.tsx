// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import type { RestaurantCard } from '@/app/api/recommend/route';
import { useT } from '@/app/ui/lang-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { StarRating } from '@/app/ui/stars';
import VisitBadge from '@/app/ui/visit-badge';
import InteractiveCard from '@/app/ui/restaurant/interactive-card';
import { formatDistance, formatDate } from '@/app/lib/format';

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
    'card card-hover flex flex-col gap-2.5 p-5' +
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
