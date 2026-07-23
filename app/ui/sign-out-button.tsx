// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { PowerIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ui/theme-context';

const KEYS_TO_CLEAR = ['user_id', 'mapProvider', 'lang', 'theme', 'lastLocation'];

export default function SignOutButton({ action }: { action: () => Promise<void> }) {
  const { setTheme } = useTheme();

  return (
    <form action={action}>
      <button
        className="icon-btn"
        onClick={() => {
          KEYS_TO_CLEAR.forEach((k) => localStorage.removeItem(k));
          document.cookie = 'lang=; path=/; max-age=0; SameSite=Lax';
          setTheme('auto');
        }}
      >
        <PowerIcon className="w-5" />
      </button>
    </form>
  );
}
