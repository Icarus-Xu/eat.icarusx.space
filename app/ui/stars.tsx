// Copyright (C) 2026 Icarus. All rights reserved.

// Shared five-point star used for both read-only ratings and the rating input.
export const STAR_PATH =
  'M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L2.6 7.7l5.8-.8z';

export function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      strokeWidth={1.4}
      className={`${className ?? 'h-3.5 w-3.5'} ${
        filled
          ? 'fill-star dark:fill-star-d'
          : 'fill-none stroke-muted opacity-60 dark:stroke-muted-d'
      }`}
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export function StarRating({ rating, className }: { rating: number | null; className?: string }) {
  if (rating === null) return null;
  const full = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < full} className={className} />
      ))}
    </span>
  );
}
