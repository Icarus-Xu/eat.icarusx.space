// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface Props {
  onCoords: (coords: { lat: number; lng: number }) => void;
  defaultCoords?: { lat: number; lng: number };
  defaultAddress?: string;
}

export default function LocationInput({ onCoords, defaultCoords, defaultAddress }: Props) {
  const [address, setAddress] = useState(defaultAddress ?? '');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

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
        if (!res.ok) { setError(data.error ?? 'Address not found.'); return; }
        onCoords(data);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="Enter your location..."
            className="form-input w-full pl-9 pr-3"
          />
        </div>
        <button
          onClick={handleConfirm}
          disabled={isPending || !address.trim()}
          className="btn-primary flex items-center gap-1.5"
        >
          {isPending ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : 'Go'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
