// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RestaurantCard } from '@/app/api/recommend/route';
import RestaurantCardComponent from './restaurant-card';
import DistanceSelector from './distance-selector';
import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/app/ui/location-context';
import { useT } from '@/app/ui/lang-context';

type Status = 'idle' | 'loading' | 'done' | 'error';

const DEFAULT_RADIUS_KM = 3;

export default function RecommendClient() {
  const { location, locate } = useLocation();
  const t = useT();
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [cards, setCards] = useState<RestaurantCard[]>([]);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  const fetchRecommendations = useCallback(async (lat: number, lng: number, km: number) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/recommend?lat=${lat}&lng=${lng}&radius=${km * 1000}`);
      if (!res.ok) throw new Error('Request failed');
      setCards(await res.json());
      setStatus('done');
    } catch {
      setErrorMsg(t.recommendFailed);
      setStatus('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    if (!location) return;
    fetchRecommendations(location.lat, location.lng, radiusKm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleRefresh = () => {
    if (location) fetchRecommendations(location.lat, location.lng, radiusKm);
  };

  const handleRadiusChange = (km: number) => {
    setRadiusKm(km);
    if (location) fetchRecommendations(location.lat, location.lng, km);
  };

  const handleLocate = async () => {
    setLocating(true);
    await locate();
    setLocating(false);
  };

  const subtitle = location && cards.length > 0 ? t.recommendSubtitle(radiusKm, cards.length) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {!location ? (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-d">{t.recommendTitle}</h1>
          </div>
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm text-muted dark:text-muted-d">{t.recommendSetLocation}</span>
            <button
              onClick={handleLocate}
              disabled={locating}
              className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm text-sub shadow-sm hover:border-appetite active:scale-95 transition-all disabled:opacity-50 dark:border-line-d dark:bg-card-d dark:text-sub-d dark:hover:border-appetite-d"
            >
              {locating
                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                : <MapPinIcon className="h-4 w-4" />}
              {t.recommendLocateButton}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight text-ink dark:text-ink-d">{t.recommendTitle}</h1>
              {subtitle && <p className="mt-0.5 text-xs text-muted dark:text-muted-d">{subtitle}</p>}
            </div>
            <button
              onClick={handleRefresh}
              disabled={status === 'loading'}
              aria-label={t.recommendRefresh}
              className="btn-icon"
            >
              <ArrowPathIcon className={`h-5 w-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
            <DistanceSelector
              value={radiusKm}
              onChange={handleRadiusChange}
              disabled={status === 'loading'}
            />
          </div>

          {status === 'idle' || status === 'loading' ? (
            <StatusMessage>{t.recommendFinding}</StatusMessage>
          ) : status === 'error' ? (
            <StatusMessage isError>{errorMsg}</StatusMessage>
          ) : cards.length === 0 ? (
            <StatusMessage>{t.recommendNoResults(radiusKm)}</StatusMessage>
          ) : (
            <div className="flex flex-col gap-4">
              {cards.map((r) => (
                <RestaurantCardComponent key={r.id} r={r} onChanged={handleRefresh} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusMessage({ children, isError }: { children: React.ReactNode; isError?: boolean }) {
  return (
    <div className={`text-sm ${isError ? 'text-red-500' : 'text-muted dark:text-muted-d'}`}>{children}</div>
  );
}
