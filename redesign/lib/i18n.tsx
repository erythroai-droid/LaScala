'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICTS } from './dict';

export type Lang = 'ru' | 'en';
export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
];
const DEFAULT: Lang = 'ru';

type Dict = Record<string, string>;
const D = DICTS as unknown as Record<Lang, Dict>;

type Ctx = { lang: Lang; dir: 'ltr' | 'rtl'; t: (k: string) => string; setLang: (l: Lang) => void };
const I18n = createContext<Ctx>({ lang: DEFAULT, dir: 'ltr', t: (k) => D[DEFAULT][k] ?? k, setLang: () => {} });
export const useI18n = () => useContext(I18n);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ru') setLangState(saved);   // Russian by default; only an explicit choice changes it
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch { /* ignore */ }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, dir: 'ltr', setLang, t: (k) => D[lang][k] ?? D[DEFAULT][k] ?? k }), [lang, setLang]);
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}
