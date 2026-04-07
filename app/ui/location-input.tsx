// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/app/ui/location-context';
import { useT } from '@/app/ui/lang-context';

interface Props {
  onCoords: (coords: { lat: number; lng: number }) => void;
  defaultCoords?: { lat: number; lng: number };
  defaultAddress?: string;
}

export default function LocationInput({ onCoords, defaultCoords, defaultAddress }: Props) {
  const { locate } = useLocation();
  const t = useT();
  const [address, setAddress] = useState(defaultAddress ?? '');
  const [error, setError] = useState('');
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

  const handleConfirm = () => {
    if (!address.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(address.trim())}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? t.locationNotFound); return; }
        onCoords(data);
      } catch {
        setError(t.locationNetworkError);
      }
    });
  };

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
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder={t.locationPlaceholder}
          className="form-input flex-1"
        />
        <button
          onClick={handleConfirm}
          disabled={isPending || !address.trim()}
          className="btn-primary flex items-center gap-1.5"
        >
          {isPending ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : t.locationGo}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
