'use client';
import { useEffect, useRef } from 'react';
import { gsap, useStaticMode } from '@/lib/scroll';

// Custom cursor (mouse only): a ring that follows the pointer with a little lag.
// Modes: over links/buttons it becomes a solid disc with an arrow; over text fields it hides.
export default function Cursor() {
  const staticMode = useStaticMode();
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticMode || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const node = el.current!;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const xTo = gsap.quickTo(node, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(node, 'y', { duration: 0.35, ease: 'power3' });
    let first = true;
    const mode = (tg: Element | null) =>
      !tg ? '' :
      tg.closest('input,textarea,select') ? 'text' :
      tg.closest('a,button,[role=option],label') ? 'link' :
      tg.closest('[data-cursor=link]') ? 'link' : '';
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (first) { gsap.set(node, { x: e.clientX, y: e.clientY }); first = false; }
      xTo(e.clientX); yTo(e.clientY);
      node.dataset.mode = mode(e.target as Element);
      node.classList.add('on');
    };
    const down = () => node.classList.add('down');
    const up = () => node.classList.remove('down');
    const leave = () => node.classList.remove('on');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [staticMode]);

  if (staticMode) return null;
  return (
    <div ref={el} className="cur" aria-hidden>
      <div className="cur-ring" />
      <svg className="cur-arrow" viewBox="0 0 15 12" fill="none"><path d="M9.4 11.5l-.7-.7 5.3-5.3.7.7zM14.2 5.7v1H.2v-1zM8.7 1.6l.7-.7 5.3 5.3-.7.7z" fill="currentColor" /></svg>
    </div>
  );
}
