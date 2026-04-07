// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeSetting = 'auto' | 'light' | 'dark';

const THEME_KEY = 'theme';

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}

interface ThemeContextValue {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'auto',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting>('auto');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const setting: ThemeSetting =
      saved === 'light' || saved === 'dark' ? saved : 'auto';
    setThemeState(setting);

    if (setting === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(setting === 'dark');
    }
  }, []);

  const setTheme = (t: ThemeSetting) => {
    setThemeState(t);
    if (t === 'auto') {
      localStorage.removeItem(THEME_KEY);
      applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      localStorage.setItem(THEME_KEY, t);
      applyTheme(t === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
