// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { CheckCircleIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import { useT } from '@/app/ui/lang-context';

// Unified visited / not-yet status pill with an icon, shared across cards.
export default function VisitBadge({ visited, className = '' }: { visited: boolean; className?: string }) {
  const t = useT();
  if (visited) {
    return (
      <span className={`badge-visited inline-flex items-center gap-1 ${className}`}>
        <CheckCircleIcon className="h-3.5 w-3.5" />
        {t.badgeVisited}
      </span>
    );
  }
  return (
    <span className={`badge-unvisited inline-flex items-center gap-1 ${className}`}>
      <BookmarkIcon className="h-3 w-3" />
      {t.badgeNotYet}
    </span>
  );
}
