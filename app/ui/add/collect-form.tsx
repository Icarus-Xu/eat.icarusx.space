// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState, useTransition } from 'react';
import type { AmapPoi } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import StarInput from './star-input';
import CrossSearchModal, { type CrossPoi } from '@/app/ui/cross-search-modal';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

type Mode = 'search' | 'link';
type Step = 'input' | 'preview' | 'done';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function CollectForm({ onSaved }: { onSaved?: () => void }) {
  const { location } = useLocation();
  const { provider } = useMapProvider();
  const t = useT();
  const effectiveProvider = provider ?? 'amap';

  const providerName: Record<string, string> = {
    amap: t.mapProviderAmapLabel,
    baidu: t.mapProviderBaiduLabel,
  };

  const [mode, setMode] = useState<Mode>('search');
  const [step, setStep] = useState<Step>('input');

  // Primary POI shown in preview (shape is same for Amap and Baidu)
  const [poi, setPoi] = useState<AmapPoi | null>(null);
  // Which provider supplied the primary POI
  const [poiSource, setPoiSource] = useState<'amap' | 'baidu'>('amap');
  // POI IDs for both providers
  const [amapPoiId, setAmapPoiId] = useState<string | null>(null);
  const [baiduPoiId, setBaiduPoiId] = useState<string | null>(null);

  // Search mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AmapPoi[]>([]);
  const [searchError, setSearchError] = useState('');
  const [isSearching, startSearching] = useTransition();

  // Link mode state
  const [url, setUrl] = useState('');
  const [parseError, setParseError] = useState('');
  const [isParsing, startParsing] = useTransition();

  // Cross-search state
  const [isCrossSearching, setIsCrossSearching] = useState(false);
  const [showCrossModal, setShowCrossModal] = useState(false);
  const [crossResults, setCrossResults] = useState<CrossPoi[]>([]);

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
    setPoiSource('amap');
    setAmapPoiId(null);
    setBaiduPoiId(null);
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
    setShowCrossModal(false);
    setCrossResults([]);
  }

  function switchMode(next: Mode) {
    setMode(next);
    if (step === 'preview') {
      setStep('input');
      setPoi(null);
      setAmapPoiId(null);
      setBaiduPoiId(null);
      setVisited(null);
    }
    setSearchError('');
    setParseError('');
  }

  async function triggerCrossSearch(selected: AmapPoi, source: 'amap' | 'baidu') {
    setIsCrossSearching(true);
    try {
      const res = await fetch('/api/cross-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected.name, lat: selected.lat, lng: selected.lng, sourceProvider: source }),
      });
      const data = await res.json();
      const pois: CrossPoi[] = data.pois ?? [];

      if (pois.length === 1) {
        if (source === 'amap') setBaiduPoiId(pois[0].id);
        else setAmapPoiId(pois[0].id);
        setStep('preview');
      } else {
        setCrossResults(pois);
        setShowCrossModal(true);
      }
    } catch {
      // Cross-search failed silently — proceed without the other provider's ID
      setStep('preview');
    } finally {
      setIsCrossSearching(false);
    }
  }

  function handleCrossSelect(crossPoi: CrossPoi | null) {
    if (crossPoi) {
      if (poiSource === 'amap') setBaiduPoiId(crossPoi.id);
      else setAmapPoiId(crossPoi.id);
    }
    setShowCrossModal(false);
    setStep('preview');
  }

  async function selectPoi(selected: AmapPoi, source: 'amap' | 'baidu') {
    setPoi(selected);
    setPoiSource(source);
    setSearchResults([]);
    if (source === 'amap') {
      setAmapPoiId(selected.id);
      setBaiduPoiId(null);
    } else {
      setBaiduPoiId(selected.id);
      setAmapPoiId(null);
    }
    await triggerCrossSearch(selected, source);
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchError('');
    setSearchResults([]);
    startSearching(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery.trim(), provider: effectiveProvider });
        if (location) {
          params.set('lat', String(location.lat));
          params.set('lng', String(location.lng));
        }
        const res = await fetch(`/api/search-restaurant?${params}`);
        const data = await res.json();
        if (!res.ok) { setSearchError(data.error ?? t.formSearchFailed); return; }
        if (!data.pois.length) { setSearchError(t.formNoResults); return; }
        setSearchResults(data.pois);
      } catch {
        setSearchError(t.formNetworkError);
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
        if (!res.ok) { setParseError(data.error ?? t.formParseFailed); return; }
        const parsedProvider: 'amap' | 'baidu' = data.provider ?? 'amap';
        await selectPoi(data.poi, parsedProvider);
      } catch {
        setParseError(t.formNetworkError);
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
            amapPoiId,
            baiduPoiId,
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
          if (data.duplicate) setIsDuplicate(true);
          else setSaveError(data.error ?? t.formSaveFailed);
          return;
        }
        onSaved?.();
        setStep('done');
      } catch {
        setSaveError(t.formNetworkError);
      }
    });
  }

  const crossTargetProvider: 'amap' | 'baidu' = poiSource === 'amap' ? 'baidu' : 'amap';

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500" />
        <p className="font-medium text-gray-700 dark:text-gray-200">{t.formSavedSuccess}</p>
        <button onClick={reset} className="btn-primary">{t.formAddAnother}</button>
      </div>
    );
  }

  return (
    <>
      <CrossSearchModal
        isOpen={showCrossModal}
        targetProvider={crossTargetProvider}
        results={crossResults}
        onSelect={handleCrossSelect}
      />

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
              {m === 'search' ? t.formSearchTab : t.formLinkTab}
            </button>
          ))}
        </div>

        {/* Search mode */}
        {mode === 'search' && step === 'input' && (
          <div>
            <label className="form-label">{t.formRestaurantName}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.formSearchPlaceholder}
                className="form-input flex-1"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || isCrossSearching || !searchQuery.trim()}
                className="btn-primary flex items-center gap-1.5"
              >
                {isSearching
                  ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  : <MagnifyingGlassIcon className="h-4 w-4" />}
                {t.formSearch}
              </button>
            </div>
            {searchError && (
              <p className="error-inline mt-1.5">
                <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                {searchError}
              </p>
            )}

            {isCrossSearching && (
              <p className="status-pending">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                {t.formLookingUp(providerName[crossTargetProvider])}
              </p>
            )}

            {searchResults.length > 0 && !isCrossSearching && (
              <ul className="mt-3 flex flex-col gap-2">
                {searchResults.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => selectPoi(r, effectiveProvider)}
                      className="poi-item"
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
            <label className="form-label">{t.formPasteLink}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.formLinkPlaceholder}
                className="form-input flex-1"
              />
              <button
                onClick={handleParse}
                disabled={isParsing || isCrossSearching || !url.trim()}
                className="btn-primary flex items-center gap-1.5"
              >
                {isParsing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                {t.formParse}
              </button>
            </div>
            {parseError && (
              <p className="error-inline mt-1.5">
                <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                {parseError}
              </p>
            )}
            {isCrossSearching && (
              <p className="status-pending">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                {t.formLookingUp(providerName[crossTargetProvider])}
              </p>
            )}
          </div>
        )}

        {/* Preview + form */}
        {step === 'preview' && poi && (
          <>
            <div className="card bg-gray-50 dark:bg-gray-700">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{poi.name}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{poi.address}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {amapPoiId ? 'Amap ✓' : 'Amap —'} &nbsp; {baiduPoiId ? 'Baidu ✓' : 'Baidu —'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">{t.formHaveYouBeen}</p>
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
                    {v ? t.formVisited : t.formNotYet}
                  </button>
                ))}
              </div>
            </div>

            {visited === true && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="form-label">{t.formDateVisited}</label>
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
                    {t.formRating} <span className="font-normal text-gray-400 dark:text-gray-500">({t.formOptional})</span>
                  </label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="form-label">
                    {t.formNotes} <span className="font-normal text-gray-400 dark:text-gray-500">({t.formOptional})</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={t.formNotesPlaceholder}
                    className="form-input w-full resize-none"
                  />
                </div>
              </div>
            )}

            {isDuplicate && (
              <p className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-300">
                <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                {t.formDuplicate}
              </p>
            )}

            {saveError && (
              <p className="error-inline">
                <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
                {saveError}
              </p>
            )}

            {visited !== null && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center justify-center gap-1.5 py-2.5"
              >
                {isSaving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                {t.formSave}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
