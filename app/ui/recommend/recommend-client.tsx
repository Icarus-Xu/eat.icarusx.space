// Copyright (C) 2026 Viture Inc. All rights reserved.
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RestaurantCard } from '@/app/api/recommend/route';
import RestaurantCardComponent from './restaurant-card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type Status = 'locating' | 'loading' | 'done' | 'error';

export default function RecommendClient() {
  const [status, setStatus] = useState<Status>('locating');
  const [errorMsg, setErrorMsg] = useState('');
  const [cards, setCards] = useState<RestaurantCard[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const fetchRecommendations = useCallback(async (lat: number, lng: number) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/recommend?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Request failed');
      const data: RestaurantCard[] = await res.json();
      setCards(data);
      setStatus('done');
    } catch {
      setErrorMsg('Failed to load recommendations.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        fetchRecommendations(lat, lng);
      },
      () => {
        setErrorMsg('Location permission denied. Please allow location access and refresh.');
        setStatus('error');
      },
    );
  }, [fetchRecommendations]);

  const handleRefresh = () => {
    if (coords) fetchRecommendations(coords.lat, coords.lng);
  };

  if (status === 'locating') {
    return <StatusMessage>Getting your location...</StatusMessage>;
  }

  if (status === 'loading') {
    return <StatusMessage>Finding nearby restaurants...</StatusMessage>;
  }

  if (status === 'error') {
    return <StatusMessage isError>{errorMsg}</StatusMessage>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {cards.length === 0
            ? 'No restaurants found within 3 km.'
            : `${cards.length} restaurants nearby`}
        </p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {cards.length === 0 ? null : (
        <div className="flex flex-col gap-3">
          {cards.map((r) => (
            <RestaurantCardComponent key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusMessage({
  children,
  isError,
}: {
  children: React.ReactNode;
  isError?: boolean;
}) {
  return (
    <div className={`text-sm ${isError ? 'text-red-500' : 'text-gray-500'}`}>
      {children}
    </div>
  );
}
