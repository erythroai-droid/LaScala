'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { lockScroll } from '@/lib/scroll';

type Props = { open: boolean; onClose: () => void; label: string; variant?: 'center' | 'full'; children: ReactNode };

// Accessible overlay: Esc and backdrop click close it, body scroll is locked, focus moves inside and returns on close.
export default function Modal({ open, onClose, label, variant = 'center', children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && box.current) {                       // keep focus inside
        const f = box.current.querySelectorAll<HTMLElement>('a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    lockScroll(true);
    setTimeout(() => (box.current?.querySelector<HTMLElement>('input,textarea') ?? box.current?.querySelector<HTMLElement>('a,button'))?.focus(), 60);
    return () => { document.removeEventListener('keydown', onKey); lockScroll(false); prev?.focus?.(); };
  }, [open, onClose]);

  return (
    <div className={`modal ${variant} ${open ? 'open' : ''}`} aria-hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="modal-box" role="dialog" aria-modal="true" aria-label={label}>
        <button className="modal-x" onClick={onClose} aria-label={t('close')}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" /></svg>
        </button>
        {open && children}
      </div>
    </div>
  );
}
