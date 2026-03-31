// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RestaurantCard } from '@/app/api/recommend/route';
import RestaurantCardComponent from './restaurant-card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/app/ui/location-context';

type Status = 'idle' | 'loading' | 'done' | 'error';

const DISTANCE_OPTIONS = [1, 2, 3, 5, 10];
const DEFAULT_RADIUS_KM = 3;

export default function RecommendClient() {
  const { location } = useLocation();
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
      setErrorMsg('Failed to load recommendations.');
      setStatus('error');
    }
  }, []);

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

  if (!location) {
    return <StatusMessage>Set your location on the Map page first.</StatusMessage>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {DISTANCE_OPTIONS.map((km) => (
            <button
              key={km}
              onClick={() => handleRadiusChange(km)}
              disabled={status === 'loading'}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
                radiusKm === km
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={status === 'loading'}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {status === 'idle' || status === 'loading' ? (
        <StatusMessage>Finding nearby restaurants...</StatusMessage>
      ) : status === 'error' ? (
        <StatusMessage isError>{errorMsg}</StatusMessage>
      ) : cards.length === 0 ? (
        <StatusMessage>No restaurants found within {radiusKm} km.</StatusMessage>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map((r) => (
            <RestaurantCardComponent key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusMessage({ children, isError }: { children: React.ReactNode; isError?: boolean }) {
  return (
    <div className={`text-sm ${isError ? 'text-red-500' : 'text-gray-500'}`}>{children}</div>
  );
}
