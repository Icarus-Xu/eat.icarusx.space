// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { PowerIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'user_id';

export default function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button
        className="icon-btn"
        onClick={() => localStorage.removeItem(STORAGE_KEY)}
      >
        <PowerIcon className="w-5" />
      </button>
    </form>
  );
}
