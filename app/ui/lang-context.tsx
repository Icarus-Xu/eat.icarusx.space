// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations } from '@/app/lib/i18n';
import type { Lang } from '@/app/lib/i18n';

export type { Lang };

const LANG_KEY = 'lang';

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

export function LangProvider({ children, defaultLang }: { children: ReactNode; defaultLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return defaultLang ?? 'en';
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
    return defaultLang ?? detectLang();
  });

  // Persist the initial detected language once (no-op if already saved).
  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
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
