// Copyright (C) 2026 Icarus. All rights reserved.
import type { RestaurantCard } from '@/app/api/recommend/route';

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const full = Math.round(rating);
  return (
    <span className="text-yellow-400 text-sm" aria-label={`${rating} stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function RestaurantCard({ r }: { r: RestaurantCard }) {
  const notePreview = r.notes ? r.notes.slice(0, 20) + (r.notes.length > 20 ? '...' : '') : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{r.name}</h2>
        <span className="shrink-0 text-sm text-gray-400">{formatDistance(r.distanceM)}</span>
      </div>

      {r.visited && (
        <div className="flex items-center gap-2">
          <StarRating rating={r.rating} />
          {r.lastVisitedAt && (
            <span className="text-xs text-gray-400">
              Last visited {formatDate(r.lastVisitedAt)}
            </span>
          )}
        </div>
      )}

      {!r.visited && (
        <span className="text-xs text-blue-500 font-medium">Not visited yet</span>
      )}

      {notePreview && (
        <p className="text-sm text-gray-500">{notePreview}</p>
      )}

      <p className="text-xs text-gray-400 truncate">{r.address}</p>
    </div>
  );
}
