// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { PowerIcon } from '@heroicons/react/24/outline';

const KEYS_TO_CLEAR = ['user_id', 'mapProvider', 'lang'];

export default function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button
        className="icon-btn"
        onClick={() => KEYS_TO_CLEAR.forEach((k) => localStorage.removeItem(k))}
      >
        <PowerIcon className="w-5" />
      </button>
    </form>
  );
}
