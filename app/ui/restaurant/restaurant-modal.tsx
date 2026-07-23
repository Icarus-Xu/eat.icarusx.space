// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { RestaurantDetail } from '@/app/api/restaurant/[id]/route';
import { useLocation } from '@/app/ui/location-context';
import { useMapProvider } from '@/app/ui/map-provider-context';
import { useT } from '@/app/ui/lang-context';
import { StarRating } from '@/app/ui/stars';
import StarInput from '@/app/ui/add/star-input';
import PoiResultList from '@/app/ui/poi-result-list';
import FormActions from '@/app/ui/form-actions';
import SearchRow from '@/app/ui/search-row';
import { formatDistance, formatDate, todayInputValue } from '@/app/lib/format';
import { amapPlaceUrl, baiduPlaceUrl } from '@/app/lib/provider-links';

export type ModalMode = 'detail' | 'addVisit' | 'edit';

interface Props {
  restaurantId: string;
  distanceM: number | null;
  initialMode?: ModalMode;
  onClose: () => void;
  onChanged?: () => void;
}

export default function RestaurantModal({ restaurantId, distanceM, initialMode = 'detail', onClose, onChanged }: Props) {
  const t = useT();
  const { provider } = useMapProvider();
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mode, setMode] = useState<ModalMode>(initialMode);

  const loadDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantId}`);
      if (!res.ok) throw new Error('failed');
      setDetail(await res.json());
    } catch {
      setLoadError(true);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const effectiveProvider = provider ?? 'amap';
  const providerLabel = (p: 'amap' | 'baidu') => (p === 'baidu' ? t.mapProviderBaiduLabel : t.mapProviderAmapLabel);
  const currentPoi = detail ? (effectiveProvider === 'baidu' ? detail.baiduPoiId : detail.amapPoiId) : null;
  const otherProvider: 'amap' | 'baidu' = effectiveProvider === 'baidu' ? 'amap' : 'baidu';
  const otherPoi = detail ? (effectiveProvider === 'baidu' ? detail.amapPoiId : detail.baiduPoiId) : null;
  // Navigate with the current provider when it has this POI, otherwise fall back to the other provider.
  const navProvider: 'amap' | 'baidu' | null = currentPoi ? effectiveProvider : otherPoi ? otherProvider : null;
  const navHref =
    !detail || !navProvider
      ? null
      : navProvider === 'amap'
        ? amapPlaceUrl(detail.amapPoiId!)
        : baiduPlaceUrl(detail.baiduPoiId!);
  const navUsesOther = navProvider !== null && navProvider !== effectiveProvider;
  const thumbProvider = navProvider ?? effectiveProvider;

  const ratings = detail ? detail.visits.map((v) => v.rating).filter((r): r is number => r !== null) : [];
  const maxRating = ratings.length ? Math.max(...ratings) : null;
  const visited = (detail?.visits.length ?? 0) > 0;
  const lastVisitedAt = detail?.visits[0]?.visitedAt ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-xl dark:bg-card-d"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Map thumbnail header (static map proxied via /api/static-map) */}
        <div className="relative h-32 flex-none bg-appetite-soft dark:bg-appetite-soft-d">
          {detail && !mapError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/static-map?lat=${detail.lat}&lng=${detail.lng}&provider=${thumbProvider}`}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setMapError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-appetite dark:text-appetite-d">
              <MapPinIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{t.detailMapPlaceholder}</span>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label={t.detailClose}
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/55"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loadError ? (
            <p className="py-8 text-center text-sm text-muted dark:text-muted-d">{t.detailLoadFailed}</p>
          ) : !detail ? (
            <p className="py-8 text-center text-sm text-muted dark:text-muted-d">{t.listLoading}</p>
          ) : mode === 'addVisit' ? (
            <AddVisitForm
              detail={detail}
              onCancel={() => setMode('detail')}
              onSaved={async () => {
                onChanged?.();
                await loadDetail();
                setMode('detail');
              }}
            />
          ) : mode === 'edit' ? (
            <EditForm
              detail={detail}
              onClose={onClose}
              onSaved={async () => {
                onChanged?.();
                await loadDetail();
                setMode('detail');
              }}
              onDeleted={() => {
                onChanged?.();
                onClose();
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold leading-snug text-ink dark:text-ink-d">{detail.name}</h2>
                {distanceM !== null && (
                  <span className="shrink-0 pt-1 text-sm tabular-nums text-muted dark:text-muted-d">
                    {formatDistance(distanceM)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {maxRating !== null && <StarRating rating={maxRating} className="h-4 w-4" />}
                <span className={visited ? 'badge-visited' : 'badge-unvisited'}>
                  {visited ? t.badgeVisited : t.badgeNotYet}
                </span>
                {lastVisitedAt && (
                  <span className="text-xs tabular-nums text-muted dark:text-muted-d">
                    {t.cardLastVisited} {formatDate(lastVisitedAt, t.dateLocale)}
                  </span>
                )}
              </div>

              {!currentPoi && (
                <div className="warn-callout">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{t.detailNoCurrentPoi(providerLabel(effectiveProvider))}</span>
                </div>
              )}

              <AddressRow address={detail.address} copyLabel={t.detailCopyAddress} copiedLabel={t.detailCopied} />

              {/* Visit history */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold tracking-wide text-muted dark:text-muted-d">{t.detailVisitHistory}</span>
                <span className="h-px flex-1 bg-line dark:bg-line-d" />
              </div>
              {detail.visits.length === 0 ? (
                <p className="text-sm text-muted dark:text-muted-d">{t.detailNoVisits}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {detail.visits.map((v) => (
                    <li key={v.id} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-appetite-soft text-xs font-bold text-appetite dark:bg-appetite-soft-d dark:text-appetite-d">
                        {v.userName.slice(0, 1)}
                      </span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {v.rating !== null && <StarRating rating={v.rating} className="h-3.5 w-3.5" />}
                          <span className="text-xs tabular-nums text-muted dark:text-muted-d">{formatDate(v.visitedAt, t.dateLocale)}</span>
                        </div>
                        {v.notes && <p className="text-sm text-sub dark:text-sub-d">{v.notes}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted dark:text-muted-d">
                {detail.addedByName
                  ? t.detailAddedBy(detail.addedByName, formatDate(detail.createdAt, t.dateLocale))
                  : t.detailAddedOn(formatDate(detail.createdAt, t.dateLocale))}
              </p>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                {navHref && (
                  <a
                    href={navHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-appetite text-sm font-semibold text-white transition hover:brightness-105 dark:bg-appetite-d dark:text-paper-d"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {navUsesOther ? t.detailNavigateVia(providerLabel(navProvider!)) : t.detailNavigate}
                  </a>
                )}
                <button
                  onClick={() => setMode('addVisit')}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-appetite transition hover:bg-appetite-soft dark:border-line-d dark:text-appetite-d dark:hover:bg-appetite-soft-d"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t.detailAddVisit}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddressRow({ address, copyLabel, copiedLabel }: { address: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex items-start gap-2">
      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-appetite dark:text-appetite-d" />
      <span className="flex-1 text-sm text-sub dark:text-sub-d">{address}</span>
      <button
        onClick={copy}
        aria-label={copyLabel}
        className="shrink-0 text-muted transition hover:text-appetite dark:text-muted-d dark:hover:text-appetite-d"
      >
        {copied ? <CheckIcon className="h-4 w-4 text-appetite dark:text-appetite-d" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AddVisitForm({
  detail,
  onCancel,
  onSaved,
}: {
  detail: RestaurantDetail;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [rating, setRating] = useState<number | null>(null);
  const [date, setDate] = useState(todayInputValue());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/save-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amapPoiId: detail.amapPoiId,
          baiduPoiId: detail.baiduPoiId,
          name: detail.name,
          address: detail.address,
          lat: detail.lat,
          lng: detail.lng,
          visited: true,
          rating,
          notes: notes.trim() || null,
          visitedAt: date,
        }),
      });
      if (!res.ok) throw new Error('failed');
      onSaved();
    } catch {
      setError(t.formSaveFailed);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink dark:text-ink-d">{t.addVisitTitle}</h2>

      <div>
        <label className="form-label">{t.formRating} <span className="text-muted dark:text-muted-d">({t.formOptional})</span></label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="form-label" htmlFor="visitDate">{t.formDateVisited}</label>
        <input
          id="visitDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="visitNotes">{t.formNotes} <span className="text-muted dark:text-muted-d">({t.formOptional})</span></label>
        <textarea
          id="visitNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.formNotesPlaceholder}
          rows={3}
          className="form-input w-full resize-none"
        />
      </div>

      {error && <p className="error-inline">{error}</p>}

      <FormActions onCancel={onCancel} onConfirm={save} confirmLabel={t.formSave} disabled={saving} />
    </div>
  );
}

interface SearchPoi {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

function EditForm({
  detail,
  onClose,
  onSaved,
  onDeleted,
}: {
  detail: RestaurantDetail;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const t = useT();
  const { location } = useLocation();
  const { provider } = useMapProvider();
  const effectiveProvider = provider ?? 'amap';
  const providerLabel = effectiveProvider === 'baidu' ? t.mapProviderBaiduLabel : t.mapProviderAmapLabel;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPoi[]>([]);
  const [selected, setSelected] = useState<SearchPoi | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults([]);
    try {
      const params = new URLSearchParams({ q: query.trim(), provider: effectiveProvider });
      if (location) {
        params.set('lat', String(location.lat));
        params.set('lng', String(location.lng));
      }
      const res = await fetch(`/api/search-restaurant?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t.formSearchFailed); return; }
      if (!data.pois?.length) { setError(t.formNoResults); return; }
      setResults(data.pois);
    } catch {
      setError(t.formNetworkError);
    } finally {
      setSearching(false);
    }
  };

  // Picking a result only stages it; the user confirms with Save.
  const pick = (poi: SearchPoi) => {
    setSelected(poi);
    setResults([]);
    setError('');
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurant/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: effectiveProvider,
          poiId: selected.id,
          name: selected.name,
          address: selected.address,
          lat: selected.lat,
          lng: selected.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.duplicate ? t.formDuplicate : (data.error ?? t.formSaveFailed));
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError(t.formNetworkError);
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurant/${detail.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
      onDeleted();
    } catch {
      setError(t.editDeleteFailed);
      setSaving(false);
    }
  };

  const preview = selected ?? detail;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink dark:text-ink-d">{t.editTitle}</h2>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label={t.editDelete}
          className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {confirmDelete && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/40">
          <p className="text-sm text-red-600 dark:text-red-400">{t.editDeleteConfirm}</p>
          <div className="flex gap-2.5">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={saving}
              className="h-10 flex-1 rounded-xl border border-line bg-card text-sm font-medium text-sub transition hover:bg-paper disabled:opacity-50 dark:border-line-d dark:bg-card-d dark:text-sub-d dark:hover:bg-paper-d"
            >
              {t.commonCancel}
            </button>
            <button
              onClick={remove}
              disabled={saving}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              {t.editDelete}
            </button>
          </div>
        </div>
      )}

      {/* Preview: staged selection (highlighted) or current entry */}
      <div className={`card ${selected ? 'border-appetite dark:border-appetite-d' : 'bg-paper dark:bg-card-d'}`}>
        <p className="font-medium text-ink dark:text-ink-d">{preview.name}</p>
        <p className="mt-0.5 text-sm text-muted dark:text-muted-d">{preview.address}</p>
        {selected && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-appetite dark:text-appetite-d">
            <CheckIcon className="h-3.5 w-3.5" />
            {t.editSelectedNew}
          </p>
        )}
      </div>

      <p className="text-sm text-sub dark:text-sub-d">{t.editRelinkHint(providerLabel)}</p>

      <SearchRow
        value={query}
        onChange={setQuery}
        onSubmit={search}
        placeholder={t.formSearchPlaceholder}
        submitLabel={t.formSearch}
        pending={searching}
        disabled={searching || saving || !query.trim()}
      />

      {error && <p className="error-inline">{error}</p>}

      {results.length > 0 && <PoiResultList results={results} onSelect={pick} />}

      <FormActions
        onCancel={onClose}
        onConfirm={save}
        confirmLabel={t.formSave}
        disabled={saving}
        confirmDisabled={!selected}
      />
    </div>
  );
}
