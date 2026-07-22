// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RestaurantRow } from '@/app/lib/restaurant-data';
import { haversineDistance } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import { StarRating } from '@/app/ui/stars';
import VisitBadge from '@/app/ui/visit-badge';
import InteractiveCard from '@/app/ui/restaurant/interactive-card';
import { formatDistance, formatDate } from '@/app/lib/format';

type RestaurantWithDistance = RestaurantRow & { distanceM: number | null };

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
  const effectiveProvider = provider ?? 'amap';
  const t = useT();
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  // Always holds the latest location without being a stale closure in the fetch callback
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const loadRestaurants = useCallback(() => {
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
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [refreshKey, loadRestaurants]);

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

  return (
    <div className="flex flex-col gap-4">
      {restaurants.length === 0 ? (
        <p className="text-sm text-muted text-center py-6 dark:text-muted-d">{t.listEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {restaurants.map((r) => {
            const hasCurrentPoi = (effectiveProvider === 'baidu' ? r.baiduPoiId : r.amapPoiId) != null;
            return (
              <InteractiveCard
                key={r.id}
                restaurantId={r.id}
                amapPoiId={r.amapPoiId}
                baiduPoiId={r.baiduPoiId}
                distanceM={r.distanceM}
                onChanged={loadRestaurants}
                className={`card flex flex-col gap-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-appetite hover:shadow-md dark:hover:border-appetite-d${hasCurrentPoi ? '' : ' opacity-60'}`}
              >
                <CardContent r={r} t={t} />
              </InteractiveCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
