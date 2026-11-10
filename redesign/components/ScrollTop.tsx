'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { goToSection } from '@/lib/scroll';

// Floating "back to top" button: appears after the first screen, glides to the top with the smoother.
export default function ScrollTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <button className={`totop ${show ? 'on' : ''}`} aria-label={t('to_top')} tabIndex={show ? 0 : -1} onClick={() => goToSection('#top')}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 14V2M2.5 7.5L8 2l5.5 5.5" stroke="currentColor" strokeWidth="1.3" /></svg>
    </button>
  );
}
