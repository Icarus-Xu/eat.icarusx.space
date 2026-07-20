// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useRef, useState } from 'react';
import type { RestaurantRow } from '@/app/lib/restaurant-data';
import { haversineDistance } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import { StarRating } from '@/app/ui/stars';
import VisitBadge from '@/app/ui/visit-badge';

type RestaurantWithDistance = RestaurantRow & { distanceM: number | null };

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function CardContent({ r, t }: { r: RestaurantWithDistance; t: ReturnType<typeof useT> }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 break-words font-medium text-ink text-sm leading-snug dark:text-ink-d">{r.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {r.distanceM !== null && (
            <span className="text-xs text-muted dark:text-muted-d">{formatDistance(r.distanceM)}</span>
          )}
          <VisitBadge visited={r.visited} />
        </div>
      </div>

      {r.visited && (
        <div className="flex items-center gap-2">
          <StarRating rating={r.maxRating} />
          {r.lastVisitedAt && (
            <span className="text-xs text-muted dark:text-muted-d">{formatDate(r.lastVisitedAt, t.dateLocale)}</span>
          )}
        </div>
      )}

      {r.notes && (
        <p className="text-xs text-muted dark:text-muted-d">
          {r.notes.slice(0, 20)}{r.notes.length > 20 ? '...' : ''}
        </p>
      )}

      <p className="text-xs text-muted truncate dark:text-muted-d">{r.address}</p>
    </>
  );
}

export default function RestaurantList({ refreshKey }: { refreshKey: number }) {
  const { location } = useLocation();
  const { provider } = useMapProvider();
  const t = useT();
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  // Always holds the latest location without being a stale closure in the fetch callback
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    setLoading(true);
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data: RestaurantRow[]) => {
        const loc = locationRef.current;
        setRestaurants(
          data.map((r) => ({
            ...r,
            distanceM: loc ? haversineDistance(loc.lat, loc.lng, r.lat, r.lng) : null,
          })),
        );
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate distances when location changes after restaurants are loaded
  useEffect(() => {
    if (!location) return;
    setRestaurants((prev) =>
      prev.map((r) => ({
        ...r,
        distanceM: haversineDistance(location.lat, location.lng, r.lat, r.lng),
      })),
    );
  }, [location]);

  if (loading) return <p className="text-sm text-muted dark:text-muted-d">{t.listLoading}</p>;

  const effectiveProvider = provider ?? 'amap';

  return (
    <div className="flex flex-col gap-4">
      {restaurants.length === 0 ? (
        <p className="text-sm text-muted text-center py-6 dark:text-muted-d">{t.listEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {restaurants.map((r) => {
            const poiId = effectiveProvider === 'baidu' ? r.baiduPoiId : r.amapPoiId;
            const href = effectiveProvider === 'baidu'
              ? `https://map.baidu.com/?uid=${r.baiduPoiId}`
              : `https://ditu.amap.com/place/${r.amapPoiId}`;

            if (poiId) {
              return (
                <a
                  key={r.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex flex-col gap-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-appetite hover:shadow-md dark:hover:border-appetite-d"
                >
                  <CardContent r={r} t={t} />
                </a>
              );
            }
            return (
              <div key={r.id} className="card flex flex-col gap-1.5 opacity-60">
                <CardContent r={r} t={t} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
