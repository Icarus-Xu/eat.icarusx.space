// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useState, useTransition } from 'react';
import type { AmapPoi } from '@/app/lib/amap';
import StarInput from './star-input';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

type Step = 'input' | 'preview' | 'done';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function CollectForm({ onSaved }: { onSaved?: () => void }) {
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [poi, setPoi] = useState<AmapPoi | null>(null);
  const [parseError, setParseError] = useState('');

  const [visited, setVisited] = useState<boolean | null>(null);
  const [visitDate, setVisitDate] = useState(todayString());
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const [saveError, setSaveError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [isParsing, startParsing] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function reset() {
    setStep('input');
    setUrl('');
    setPoi(null);
    setParseError('');
    setVisited(null);
    setVisitDate(todayString());
    setRating(null);
    setNotes('');
    setSaveError('');
    setIsDuplicate(false);
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
            poiId: poi.id,
            name: poi.name,
            address: poi.address,
            lat: poi.lat,
            lng: poi.lng,
            sourceUrl: url.trim(),
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
        <button
          onClick={reset}
          className="btn-primary"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1: URL input */}
      <div>
        <label className="form-label">
          Paste an Amap share link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (step === 'preview') {
                setPoi(null);
                setStep('input');
                setVisited(null);
              }
            }}
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

      {/* Step 2: Preview + form */}
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
                <label className="form-label">
                  Date visited
                </label>
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
