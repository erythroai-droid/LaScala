'use client';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Flag from './Flag';
import { LANGS, useI18n } from '@/lib/i18n';
import { goToSection, refreshScroll } from '@/lib/scroll';
import { BRAND, MODEL, PHONE } from '@/lib/site';

const NAV = [
  ['—', 'nav_overview', '#top'],
  ['01', 'nav_about', '#about'],
  ['02', 'nav_menu', '#menu'],
  ['03', 'nav_gallery', '#gallery'],
  ['04', 'nav_events', '#events'],
  ['05', 'nav_contact', '#contact'],
] as const;

/** Any button on the page can open the reservation form: window.dispatchEvent(new Event(OPEN_CONTACT)). */
export const OPEN_CONTACT = 'open-contact';

type Which = null | 'menu' | 'contact';

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState<Which>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const langBox = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const on = () => { setSent(false); setOpen('contact'); };
    window.addEventListener(OPEN_CONTACT, on);
    return () => window.removeEventListener(OPEN_CONTACT, on);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const off = (e: MouseEvent) => { if (!langBox.current?.contains(e.target as Node)) setLangOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLangOpen(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [langOpen]);

  useEffect(() => { const id = setTimeout(refreshScroll, 150); return () => clearTimeout(id); }, [lang]);   // text height changes with the language

  // light chrome while a dark block ([data-tone=dark]) sits under the header. Blocks overlap while one rides over another
  // (or uncovers the footer), so ask the browser which block is actually painted at the header's line.
  useEffect(() => {
    const hdr = document.querySelector('.hdr');
    if (!hdr) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const y = 36;
      let dark = false;
      for (const n of document.elementsFromPoint(window.innerWidth / 2, y)) {
        if (n.closest('.hdr')) continue;
        const s = n.closest<HTMLElement>('[data-tone]');
        if (s) { dark = s.dataset.tone === 'dark'; break; }
      }
      hdr.classList.toggle('on-dark', dark);
      hdr.classList.toggle('solid', window.scrollY > 60);          // backdrop once the page has moved, so the chrome never mixes with the copy under it
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(sync); };
    sync();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    const id = setInterval(req, 400);                     // the smoother keeps moving content after the last scroll event
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); clearInterval(id); cancelAnimationFrame(raf); };
  }, []);

  const go = (hash: string) => { close(); setTimeout(() => goToSection(hash), 120); };
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); };
  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <>
      <header className="hdr on-dark">
        <div className="hdr-l">
          <a href="#top" className="logo" onClick={(e) => { e.preventDefault(); goToSection('#top'); }}>{BRAND}<sup>{MODEL}</sup></a>
          <button className="icon" aria-label={t('menu_open')} onClick={() => setOpen('menu')}>
            <svg width="18" height="10" viewBox="0 0 18 10"><path d="M0 1h18M0 9h18" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>
        <div className="hdr-r">
          <a className="hdr-tel" href={PHONE.href}>{PHONE.label}</a>
          <div className="lang-wrap" ref={langBox}>
            <button
              className="lang"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={`${current.label} — ${t('lang')}`}
              onClick={() => setLangOpen((v) => !v)}
            >
              <Flag code={current.code} size={18} /> <span>{current.label}</span>
            </button>
            {langOpen && (
              <ul className="lang-menu" role="listbox">
                {LANGS.map((l) => (
                  <li key={l.code} role="option" aria-selected={l.code === lang}>
                    <button className={l.code === lang ? 'on' : ''} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                      <Flag code={l.code} size={18} /><span lang={l.code}>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="btn" onClick={() => { setSent(false); setOpen('contact'); }}>{t('reserve')}</button>
        </div>
      </header>

      <Modal open={open === 'menu'} onClose={close} label={t('menu_open')} variant="full">
        <nav className="menu">
          {NAV.map(([n, k, h]) => (
            <a key={h} href={h} onClick={(e) => { e.preventDefault(); go(h); }}><i>{n}</i><span>{t(k)}</span></a>
          ))}
          <p className="menu-foot">{t('menu_foot')}</p>
        </nav>
      </Modal>

      <Modal open={open === 'contact'} onClose={close} label={t('c_title')}>
        {sent ? (
          <div className="form-done">
            <small>{t('c_thanks')}</small>
            <h2>{t('c_done')}</h2>
            <p>{t('c_done_p')}</p>
            <a className="btn solid" href={PHONE.href}>{PHONE.label}</a>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <small>{t('c_k')}</small>
            <h2>{t('c_title')}</h2>
            <label>{t('c_name')}<input required name="name" autoComplete="name" /></label>
            <label>{t('c_phone')}<input required type="tel" name="phone" autoComplete="tel" placeholder="+7" /></label>
            <div className="form-row">
              <label>{t('c_date')}<input required type="datetime-local" name="date" /></label>
              <label>{t('c_guests')}<input required type="number" name="guests" min={1} max={30} defaultValue={2} /></label>
            </div>
            <label>{t('c_msg')}<textarea name="msg" rows={3} /></label>
            <button className="btn solid" type="submit">{t('c_send')} <span className="arr">→</span></button>
          </form>
        )}
      </Modal>
    </>
  );
}
