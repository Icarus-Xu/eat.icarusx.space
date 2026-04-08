// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowPathIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/app/ui/location-context';
import { useT } from '@/app/ui/lang-context';
import { useMapProvider } from '@/app/ui/map-provider-context';

interface LocationCandidate {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  onCoords: (coords: { lat: number; lng: number }) => void;
  defaultCoords?: { lat: number; lng: number };
  defaultAddress?: string;
  mapPending?: { coords: { lat: number; lng: number }; address: string } | null;
  onMapPendingDismiss?: () => void;
}

export default function LocationInput({ onCoords, defaultCoords, defaultAddress, mapPending, onMapPendingDismiss }: Props) {
  const { locate } = useLocation();
  const t = useT();
  const { provider } = useMapProvider();
  const [address, setAddress] = useState(defaultAddress ?? '');
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<LocationCandidate[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  const handleLocate = async () => {
    setLocating(true);
    await locate();
    setLocating(false);
  };

  // Apply default coords immediately without waiting for user input
  useEffect(() => {
    if (defaultCoords) onCoords(defaultCoords);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update input when default address resolves (async reverse geocode)
  useEffect(() => {
    if (defaultAddress) setAddress(defaultAddress);
  }, [defaultAddress]);

  // Sync input with map pending selection
  useEffect(() => {
    if (mapPending) {
      setAddress(mapPending.address || '…');
      setCandidates(null);
      setError('');
    }
  }, [mapPending]);

  const handleUserInput = (value: string) => {
    setAddress(value);
    setCandidates(null);
    setError('');
    if (mapPending) onMapPendingDismiss?.();
  };

  const handleConfirmMap = () => {
    if (!mapPending) return;
    onCoords(mapPending.coords);
    onMapPendingDismiss?.();
  };

  const handleSearch = () => {
    if (!address.trim()) return;
    setError('');
    setCandidates(null);
    startTransition(async () => {
      try {
        const p = provider ?? 'amap';
        const res = await fetch(`/api/geocode-search?q=${encodeURIComponent(address.trim())}&provider=${p}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? t.locationNotFound); return; }
        const results: LocationCandidate[] = data.results;
        if (results.length === 0) { setError(t.locationNotFound); return; }
        if (results.length === 1) { onCoords(results[0]); return; }
        setCandidates(results);
      } catch {
        setError(t.locationNetworkError);
      }
    });
  };

  const isConfirmMode = !!mapPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleLocate}
          disabled={locating}
          title={t.locationUseCurrentTitle}
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 text-gray-500 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {locating
            ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
            : <MapPinIcon className="h-4 w-4" />}
        </button>
        <input
          type="text"
          value={address}
          onChange={(e) => handleUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') isConfirmMode ? handleConfirmMap() : handleSearch(); }}
          placeholder={t.locationPlaceholder}
          className="form-input flex-1"
        />
        {isConfirmMode ? (
          <button
            onClick={handleConfirmMap}
            disabled={!mapPending?.address}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
          >
            {t.locationConfirm}
          </button>
        ) : (
          <button
            onClick={handleSearch}
            disabled={isPending || !address.trim()}
            className="btn-primary flex items-center gap-1.5"
          >
            {isPending
              ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
              : <><MagnifyingGlassIcon className="h-4 w-4" />{t.locationGo}</>}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {candidates && (
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-800">
          <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {t.locationSelectResult}
          </p>
          {candidates.map((c, i) => (
            <button
              key={i}
              onClick={() => { setCandidates(null); onCoords(c); }}
              className="flex flex-col px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-100 dark:border-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.name}</span>
              {c.address && <span className="text-xs text-gray-500 dark:text-gray-400">{c.address}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
