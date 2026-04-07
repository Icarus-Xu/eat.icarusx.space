// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState, useTransition } from 'react';
import type { AmapPoi } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import StarInput from './star-input';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type Mode = 'search' | 'link';
type Step = 'input' | 'preview' | 'done';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function CollectForm({ onSaved }: { onSaved?: () => void }) {
  const { location } = useLocation();

  const [mode, setMode] = useState<Mode>('search');
  const [step, setStep] = useState<Step>('input');
  const [poi, setPoi] = useState<AmapPoi | null>(null);

  // Search mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AmapPoi[]>([]);
  const [searchError, setSearchError] = useState('');
  const [isSearching, startSearching] = useTransition();

  // Link mode state
  const [url, setUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [isParsing, startParsing] = useTransition();

  // Preview form state
  const [visited, setVisited] = useState<boolean | null>(null);
  const [visitDate, setVisitDate] = useState(todayString());
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const [saveError, setSaveError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function reset() {
    setStep('input');
    setPoi(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setUrl('');
    setParseError('');
    setVisited(null);
    setVisitDate(todayString());
    setRating(null);
    setNotes('');
    setSaveError('');
    setIsDuplicate(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    if (step === 'preview') {
      setStep('input');
      setPoi(null);
      setVisited(null);
    }
    setSearchError('');
    setParseError('');
  }

  function selectPoi(selected: AmapPoi) {
    setPoi(selected);
    setStep('preview');
    setSearchResults([]);
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchError('');
    setSearchResults([]);
    startSearching(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery.trim() });
        if (location) {
          params.set('lat', String(location.lat));
          params.set('lng', String(location.lng));
        }
        const res = await fetch(`/api/search-restaurant?${params}`);
        const data = await res.json();
        if (!res.ok) {
          setSearchError(data.error ?? 'Search failed.');
          return;
        }
        if (!data.pois.length) {
          setSearchError('No restaurants found. Try a different name.');
          return;
        }
        setSearchResults(data.pois);
      } catch {
        setSearchError('Network error. Please try again.');
      }
    });
  }

  function handleParse() {
    if (!url.trim()) return;
    setParseError('');
    startParsing(async () => {
      try {
        const res = await fetch(`/api/parse-restaurant?url=${encodeURIComponent(url.trim())}`);
        const data = await res.json();
        if (!res.ok) {
          setParseError(data.error ?? 'Failed to parse link.');
          return;
        }
        setPoi(data.poi);
        setStep('preview');
      } catch {
        setParseError('Network error. Please try again.');
      }
    });
  }

  function handleSave() {
    if (!poi || visited === null) return;
    setSaveError('');
    setIsDuplicate(false);
    startSaving(async () => {
      try {
        const res = await fetch('/api/save-restaurant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amapPoiId: poi.id,
            name: poi.name,
            address: poi.address,
            lat: poi.lat,
            lng: poi.lng,
            visited,
            rating: visited ? rating : undefined,
            notes: visited && notes.trim() ? notes.trim() : undefined,
            visitedAt: visited ? visitDate : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.duplicate) {
            setIsDuplicate(true);
          } else {
            setSaveError(data.error ?? 'Failed to save.');
          }
          return;
        }
        onSaved?.();
        setStep('done');
      } catch {
        setSaveError('Network error. Please try again.');
      }
    });
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500" />
        <p className="text-gray-700 font-medium dark:text-gray-200">Saved successfully!</p>
        <button onClick={reset} className="btn-primary">
          Add another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mode tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
        {(['search', 'link'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {m === 'search' ? 'Search by name' : 'Paste link'}
          </button>
        ))}
      </div>

      {/* Search mode */}
      {mode === 'search' && step === 'input' && (
        <div>
          <label className="form-label">Restaurant name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Haidilao, McDonald's..."
              className="form-input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="btn-primary flex items-center gap-1.5"
            >
              {isSearching
                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                : <MagnifyingGlassIcon className="h-4 w-4" />}
              Search
            </button>
          </div>
          {searchError && (
            <p className="error-inline mt-1.5">
              <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
              {searchError}
            </p>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {searchResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => selectPoi(r)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-950"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{r.address}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Link mode */}
      {mode === 'link' && step === 'input' && (
        <div>
          <label className="form-label">Paste an Amap share link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amap share link or full share text..."
              className="form-input flex-1"
            />
            <button
              onClick={handleParse}
              disabled={isParsing || !url.trim()}
              className="btn-primary flex items-center gap-1.5"
            >
              {isParsing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              Parse
            </button>
          </div>
          {parseError && (
            <p className="error-inline mt-1.5">
              <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
              {parseError}
            </p>
          )}
        </div>
      )}

      {/* Preview + form (shared by both modes) */}
      {step === 'preview' && poi && (
        <>
          {/* Restaurant preview */}
          <div className="card bg-gray-50 dark:bg-gray-700">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{poi.name}</p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{poi.address}</p>
          </div>

          {/* Visited selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Have you been there?</p>
            <div className="flex gap-3">
              {([true, false] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setVisited(v)}
                  className={`btn-toggle ${
                    visited === v
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {v ? 'Visited' : 'Not yet'}
                </button>
              ))}
            </div>
          </div>

          {/* Visited details */}
          {visited === true && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Date visited</label>
                <input
                  type="date"
                  value={visitDate}
                  max={todayString()}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Rating <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
                </label>
                <StarInput value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="form-label">
                  Notes <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Recommended dishes, impressions..."
                  className="form-input w-full resize-none"
                />
              </div>
            </div>
          )}

          {/* Duplicate warning */}
          {isDuplicate && (
            <p className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-300">
              <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
              This restaurant is already in your collection.
            </p>
          )}

          {/* Save error */}
          {saveError && (
            <p className="error-inline">
              <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
              {saveError}
            </p>
          )}

          {/* Save button */}
          {visited !== null && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center justify-center gap-1.5 py-2.5"
            >
              {isSaving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              Save
            </button>
          )}
        </>
      )}
    </div>
  );
}
