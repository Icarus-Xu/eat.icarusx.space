// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useState } from 'react';
import type { RestaurantRow } from '@/app/lib/restaurant-data';
import { haversineDistance } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';

type RestaurantWithDistance = RestaurantRow & { distanceM: number | null };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const full = Math.round(rating);
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

function CardContent({ r }: { r: RestaurantWithDistance }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-gray-900 text-sm leading-snug dark:text-gray-100">{r.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {r.distanceM !== null && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDistance(r.distanceM)}</span>
          )}
          {r.visited ? (
            <span className="badge-visited">Visited</span>
          ) : (
            <span className="badge-unvisited">Not yet</span>
          )}
        </div>
      </div>

      {r.visited && (
        <div className="flex items-center gap-2">
          <StarRating rating={r.maxRating} />
          {r.lastVisitedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(r.lastVisitedAt)}</span>
          )}
        </div>
      )}

      {r.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {r.notes.slice(0, 20)}{r.notes.length > 20 ? '...' : ''}
        </p>
      )}

      <p className="text-xs text-gray-400 truncate dark:text-gray-500">{r.address}</p>
    </>
  );
}

export default function RestaurantList({ refreshKey }: { refreshKey: number }) {
  const { location } = useLocation();
  const { provider } = useMapProvider();
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data: RestaurantRow[]) =>
        setRestaurants(data.map((r) => ({ ...r, distanceM: null }))),
      )
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!location || restaurants.length === 0) return;
    setRestaurants((prev) =>
      prev.map((r) => ({
        ...r,
        distanceM: haversineDistance(location.lat, location.lng, r.lat, r.lng),
      })),
    );
  }, [location, restaurants.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>;

  const effectiveProvider = provider ?? 'amap';

  return (
    <div className="flex flex-col gap-4">
      {restaurants.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 dark:text-gray-500">No restaurants added yet.</p>
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
                  className="card flex flex-col gap-1.5 hover:border-blue-400 dark:hover:border-blue-500"
                >
                  <CardContent r={r} />
                </a>
              );
            }
            return (
              <div key={r.id} className="card flex flex-col gap-1.5 opacity-60">
                <CardContent r={r} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
