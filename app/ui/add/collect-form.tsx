// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState, useTransition } from 'react';
import type { AmapPoi } from '@/app/lib/amap';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import StarInput from './star-input';
import CrossSearchModal, { type CrossPoi } from '@/app/ui/cross-search-modal';
import PoiResultList from '@/app/ui/poi-result-list';
import SearchRow from '@/app/ui/search-row';
import { todayInputValue } from '@/app/lib/format';
import {
  ArrowPathIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

type Mode = 'search' | 'link';
type Step = 'input' | 'preview' | 'done';

// A cross-provider match this close to the source POI is taken as the same place.
const AUTO_MATCH_RADIUS_M = 300;

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
  const [visitDate, setVisitDate] = useState(todayInputValue());
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
    setVisitDate(todayInputValue());
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

      // Results are distance-sorted; a hit right on top of the source POI is
      // the same place, so link it without asking.
      if (pois.length === 1 || (pois.length > 1 && pois[0].distanceM < AUTO_MATCH_RADIUS_M)) {
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
            coordProvider: poiSource,
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
        <p className="font-medium text-ink dark:text-ink-d">{t.formSavedSuccess}</p>
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
        <div className="flex gap-1 rounded-2xl border border-line bg-paper p-1 dark:border-line-d dark:bg-paper-d">
          {(['search', 'link'] as const).map((m) => {
            const Icon = m === 'search' ? MagnifyingGlassIcon : LinkIcon;
            return (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={mode === m}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-appetite text-white shadow-sm dark:bg-appetite-d dark:text-paper-d'
                    : 'text-sub hover:bg-appetite-soft hover:text-appetite dark:text-sub-d dark:hover:bg-appetite-soft-d dark:hover:text-appetite-d'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {m === 'search' ? t.formSearchTab : t.formLinkTab}
              </button>
            );
          })}
        </div>

        {/* Search mode */}
        {mode === 'search' && step === 'input' && (
          <div>
            <label className="form-label">{t.formRestaurantName}</label>
            <SearchRow
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder={t.formSearchPlaceholder}
              submitLabel={t.formSearch}
              pending={isSearching}
              disabled={isSearching || isCrossSearching || !searchQuery.trim()}
            />
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
              <PoiResultList
                results={searchResults}
                onSelect={(r) => selectPoi(r, effectiveProvider)}
                className="mt-3"
              />
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
                className="form-input min-w-0 flex-1"
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
            <div className="card bg-paper dark:bg-card-d">
              <p className="font-semibold text-ink dark:text-ink-d">{poi.name}</p>
              <p className="mt-0.5 text-sm text-muted dark:text-muted-d">{poi.address}</p>
              <p className="mt-1 text-xs text-muted dark:text-muted-d">
                {amapPoiId ? 'Amap ✓' : 'Amap —'} &nbsp; {baiduPoiId ? 'Baidu ✓' : 'Baidu —'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink dark:text-ink-d">{t.formHaveYouBeen}</p>
              <div className="flex gap-3">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setVisited(v)}
                    className={`btn-toggle inline-flex items-center justify-center gap-1.5 ${
                      visited === v
                        ? 'border-appetite bg-appetite-soft text-appetite dark:border-appetite-d dark:bg-appetite-soft-d dark:text-appetite-d'
                        : 'border-line bg-card text-sub hover:border-appetite dark:border-line-d dark:bg-card-d dark:text-sub-d dark:hover:border-appetite-d'
                    }`}
                  >
                    {v ? <CheckCircleIcon className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
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
                    max={todayInputValue()}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    {t.formRating} <span className="font-normal text-muted dark:text-muted-d">({t.formOptional})</span>
                  </label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="form-label">
                    {t.formNotes} <span className="font-normal text-muted dark:text-muted-d">({t.formOptional})</span>
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
              <p className="warn-callout">
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
