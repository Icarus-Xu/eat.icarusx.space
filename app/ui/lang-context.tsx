// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations } from '@/app/lib/i18n';
import type { Lang } from '@/app/lib/i18n';

export type { Lang };

const LANG_KEY = 'lang';
const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.startsWith('zh') ? 'zh' : 'en';
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: detectLang(),
  setLang: () => {},
});

function persistLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.cookie = `${LANG_KEY}=${lang}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; SameSite=Lax`;
  document.documentElement.lang = lang;
}

export function LangProvider({ children, defaultLang }: { children: ReactNode; defaultLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(defaultLang ?? 'en');

  // Keep the first client render identical to SSR, then hydrate saved preferences.
  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') {
      persistLang(saved);
      setLangState(saved);
      return;
    }
    persistLang(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    persistLang(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return translations[lang];
}
