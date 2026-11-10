'use client';
import { createContext, ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Smoothing without ScrollSmoother: the smoother moves the whole page as one transformed layer (~10 000 px tall, ×2 on retina),
// which is over the GPU texture limit of Safari/Firefox/many integrated GPUs — they skipped drawing it and block 01 blinked out.
// Lenis instead eases the real window scroll position frame by frame (nothing is transformed), so pins stay position: fixed
// and the page still glides. It runs on GSAP's ticker, so ScrollTrigger updates in the same frame as the scroll — no pin lag.
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;

/** Pause (in screens, 100 = one screen) at the end of a block before the next one starts to slide over it. Keep in sync with --hold in globals.css. */
export const HOLD = 100;

/** Phones/tablets and people who asked for reduced motion get a static page: no smooth scroll, pins or scrubbing, only still images. Keep in sync with the inline script in layout.tsx. */
// Touch screens of any size too: there the browser scrolls natively on its own thread and a JS-smoothed page lags behind it and shakes.
export const STATIC_QUERY = '(max-width: 900px), (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)';
const subscribeStatic = (cb: () => void) => { const mq = window.matchMedia(STATIC_QUERY); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); };
export const useStaticMode = () => useSyncExternalStore(subscribeStatic, () => window.matchMedia(STATIC_QUERY).matches, () => false);

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Children create their ScrollTriggers only after the smoother exists (GSAP requires that order).
const Ready = createContext(false);
export const useScrollReady = () => useContext(Ready);

/** Wrap the page content (not fixed UI like the header or modals). */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const staticMode = useStaticMode();

  useEffect(() => {
    const isStatic = window.matchMedia(STATIC_QUERY).matches;
    document.documentElement.classList.toggle('static', isStatic);
    if (isStatic) { setReady(false); return; }            // static page: nothing below is created
    // one source of truth for "a screen": the same number the ScrollTriggers use (innerHeight). Updated on width change or a big height change,
    // not on the small changes of the phone's address bar, which would make everything jump.
    // --vh only ever grows while the width stays the same, so a screen-high block can never be shorter than the visible area
    // (that left a strip of the block underneath showing) when the phone's address bar hides and the visible height grows.
    let w = window.innerWidth, vhPx = 0;
    const setVh = () => {
      if (window.innerWidth !== w) { w = window.innerWidth; vhPx = 0; }
      vhPx = Math.max(vhPx, window.innerHeight);
      document.documentElement.style.setProperty('--vh', `${vhPx}px`);
    };
    setVh();
    const onResize = () => setVh();
    window.addEventListener('resize', onResize);
    ScrollTrigger.addEventListener('refreshInit', setVh);   // re-measure on every refresh, resize events are not reliable on phones
    ScrollTrigger.config({ ignoreMobileResize: true });
    const ln = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: false });   // lerp: share of the remaining distance covered per frame
    lenis = ln;
    ln.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => ln.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setReady(true);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh); window.removeEventListener('resize', onResize); ScrollTrigger.removeEventListener('refreshInit', setVh);
      gsap.ticker.remove(tick); ln.destroy(); lenis = null;
    };
  }, [staticMode]);

  return (
    <Ready.Provider value={ready}>
      <div id="smooth-wrapper"><div id="smooth-content">{children}</div></div>
    </Ready.Provider>
  );
}

/** Pause/resume scrolling (modals). */
export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
  document.body.style.overflow = lock ? 'hidden' : '';
}

/** Re-measure all triggers (after the language, and with it the text height, changes). */
export function refreshScroll() { ScrollTrigger.refresh(); }

/** Glide to the section that contains `hash` (menu and search links). */
export function goToSection(hash: string) {
  if (document.documentElement.classList.contains('static')) {   // static page: native smooth scroll
    if (hash === '#top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (hash === '#top') { glideTo(0); return; }
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const pageY = (n: Element, edge: 'top' | 'bottom') => n.getBoundingClientRect()[edge] + window.scrollY;
  // a pinned block is measured through its pin spacer (its own box is fixed to the screen while pinned)
  const ref = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  // the footer waits under the events block: go to where it is fully uncovered (or the end of the page)
  const cover = el.hasAttribute('data-under') ? ref.previousElementSibling : null;
  if (cover) { glideTo(Math.min(ScrollTrigger.maxScroll(window), pageY(cover, 'bottom'))); return; }
  glideTo(pageY(ref, 'top'));
}

// Glide the native scroll (window.scrollTo with behavior: smooth is too quick over many screens). Any user input hands control back.
let glide: gsap.core.Tween | null = null;
function glideTo(y: number) {
  glide?.kill();
  const from = window.scrollY, dist = Math.abs(y - from);
  if (dist < 2) return;
  const duration = prefersReducedMotion() ? 0.01 : Math.min(2.6, 0.9 + (dist / window.innerHeight) * 0.08);   // longer for longer trips, capped
  if (lenis) { lenis.scrollTo(y, { duration, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) }); return; }   // user input interrupts it
  const pos = { y: from };
  const stop = () => glide?.kill();
  const input = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
  const done = () => input.forEach((e) => window.removeEventListener(e, stop));
  input.forEach((e) => window.addEventListener(e, stop, { passive: true }));
  glide = gsap.to(pos, {
    y,
    duration,
    ease: 'power3.inOut',
    onUpdate: () => window.scrollTo(0, pos.y),
    onComplete: done,
    onInterrupt: done,
  });
}

export { gsap, ScrollTrigger };


// ---------- "magnet": after scrolling stops between two blocks, pull the page to the block in the direction of travel ----------
// Every block registers its free-scroll zone [a, b] in scroll pixels (a scrubbed sequence, a pinned text block with its pause, a tall section).
// Inside a zone the page scrolls freely; outside any zone (while one block covers the other) the scroll snaps to the nearest zone edge ahead.
type Zone = { a: () => number; b: () => number };
const zones = new Set<Zone>();
const EPS = 3;

export function registerZone(z: Zone) { zones.add(z); return () => { zones.delete(z); }; }

function snapTarget(value: number, self?: ScrollTrigger) {
  const max = ScrollTrigger.maxScroll(window);
  if (max <= 0) return value;
  const y = value * max;
  const zs = [...zones].map((z) => [z.a(), Math.max(z.a(), z.b())] as [number, number]).sort((p, q) => p[0] - q[0]);
  if (zs.some(([a, b]) => y >= a - EPS && y <= b + EPS)) return value;     // inside a block's own zone: free scroll
  const pts = [...new Set(zs.flatMap(([a, b]) => [a, b]).map((v) => Math.min(max, Math.round(v))))].sort((p, q) => p - q);
  if (!pts.length) return value;
  const dir = self?.direction ?? 0;
  let t: number;
  if (dir > 0) t = pts.find((p) => p > y + EPS) ?? pts[pts.length - 1];
  else if (dir < 0) t = [...pts].reverse().find((p) => p < y - EPS) ?? pts[0];
  else t = pts.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), pts[0]);
  return t / max;
}

export function initMagnet() {
  if (prefersReducedMotion()) return () => {};
  const st = ScrollTrigger.create({
    snap: {
      snapTo: (value: number, self?: ScrollTrigger) => snapTarget(value, self),
      delay: 0.12,                                  // seconds of stillness before the pull starts
      duration: { min: 0.3, max: 0.9 },
      ease: 'power2.inOut',
      inertia: false,
    },
  });
  return () => st.kill();
}
