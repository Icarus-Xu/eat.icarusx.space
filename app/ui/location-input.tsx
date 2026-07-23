// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowPathIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/app/ui/location-context';
import { useT } from '@/app/ui/lang-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import SearchRow from '@/app/ui/search-row';

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
  const [justConfirmed, setJustConfirmed] = useState(false);
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
      setJustConfirmed(false);
    }
  }, [mapPending]);

  const handleUserInput = (value: string) => {
    setAddress(value);
    setCandidates(null);
    setError('');
    setJustConfirmed(false);
    if (mapPending) onMapPendingDismiss?.();
  };

  const handleConfirmMap = () => {
    if (!mapPending) return;
    onCoords(mapPending.coords);
    onMapPendingDismiss?.();
    setJustConfirmed(true);
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

  const isConfirmMode = !!mapPending || justConfirmed;

  return (
    <div className="flex flex-col gap-2">
      <SearchRow
        value={address}
        onChange={handleUserInput}
        onSubmit={isConfirmMode ? handleConfirmMap : handleSearch}
        placeholder={t.locationPlaceholder}
        submitLabel={isConfirmMode ? t.locationConfirm : t.locationSearch}
        pending={!isConfirmMode && isPending}
        disabled={isConfirmMode ? !mapPending?.address : (isPending || !address.trim())}
        icon={isConfirmMode ? <CheckIcon className="h-5 w-5" /> : undefined}
        prefix={
          <button
            onClick={handleLocate}
            disabled={locating}
            title={t.locationUseCurrentTitle}
            className="rounded-2xl border border-line bg-card px-3 py-2 text-muted shadow-sm hover:border-appetite active:scale-95 transition-all disabled:opacity-50 dark:border-line-d dark:bg-card-d dark:text-muted-d dark:hover:border-appetite-d"
          >
            {locating
              ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
              : <MapPinIcon className="h-4 w-4" />}
          </button>
        }
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {candidates && (
        <div className="flex flex-col rounded-2xl border border-line bg-card shadow-sm overflow-hidden dark:border-line-d dark:bg-card-d">
          <p className="px-3 py-2 text-xs text-muted dark:text-muted-d border-b border-line dark:border-line-d">
            {t.locationSelectResult}
          </p>
          {candidates.map((c, i) => (
            <button
              key={i}
              onClick={() => { setCandidates(null); onCoords(c); }}
              className="flex flex-col px-3 py-2 text-left hover:bg-appetite-soft dark:hover:bg-appetite-soft-d border-b last:border-b-0 border-line dark:border-line-d transition-colors"
            >
              <span className="text-sm font-medium text-ink dark:text-ink-d">{c.name}</span>
              {c.address && <span className="text-xs text-muted dark:text-muted-d">{c.address}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
