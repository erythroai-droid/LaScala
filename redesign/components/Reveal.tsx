'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger, useScrollReady } from '@/lib/scroll';

type From = 'up' | 'left' | 'right' | 'scale' | 'clip';

/**
 * Fade/slide-in when the block (or its section) enters the viewport.
 * For pinned full-screen blocks, trigger off the parent section so the whole choreography starts together.
 */
export default function Reveal({
  children, delay = 0, className = '', from = 'up', scrub = false,
}: {
  children: ReactNode; delay?: number; className?: string; from?: From; scrub?: boolean;
}) {
  const ready = useScrollReady();
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const node = el.current!;
    if (prefersReducedMotion()) { gsap.set(node, { clearProps: 'all' }); node.classList.add('in'); return; }

    const fromVars: gsap.TweenVars =
      from === 'left' ? { autoAlpha: 0, x: -36 } :
      from === 'right' ? { autoAlpha: 0, x: 36 } :
      from === 'scale' ? { autoAlpha: 0, scale: 1.06 } :
      from === 'clip' ? { autoAlpha: 0, clipPath: 'inset(12% 8% 12% 8%)', scale: 1.04 } :
      { autoAlpha: 0, y: 28 };
    const toVars: gsap.TweenVars =
      from === 'left' || from === 'right' ? { autoAlpha: 1, x: 0 } :
      from === 'scale' ? { autoAlpha: 1, scale: 1 } :
      from === 'clip' ? { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 } :
      { autoAlpha: 1, y: 0 };

    // a block that waits under the previous one ([data-under], the footer) is uncovered as that block's bottom leaves
    const under = node.closest<HTMLElement>('[data-under]');
    const cover = under?.previousElementSibling as HTMLElement | null | undefined;
    const trigger = cover ?? node.closest('section, footer, [data-slide]') ?? node;
    const at = cover ? 'bottom 72%' : 'top 88%';
    const delaySec = (delay / 1000) * 0.55;

    if (scrub) {
      const tw = gsap.fromTo(node, fromVars, {
        ...toVars, ease: 'none',
        scrollTrigger: { trigger, start: 'top 80%', end: 'top 35%', scrub: true },
      });
      return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(node, { clearProps: 'all' }); };
    }

    // force3D off: otherwise all the reveals of a block become GPU layers at the same moment (first scroll into it),
    // the browser rebuilds and redraws the layers and for a frame shows nothing; these small fades repaint cheaply
    const tween = gsap.fromTo(node, fromVars, {
      ...toVars, duration: 0.95, delay: delaySec, ease: 'power3.out', paused: true, force3D: false,
      // drop the layer hint only when done: removing it mid-animation re-rasterises the block and makes it flicker
      onComplete: () => node.classList.add('in'),
    });
    const st = ScrollTrigger.create({
      trigger, start: at, once: true,
      onEnter: () => tween.play(),
    });
    // if already in view (e.g. restored scroll), play immediately
    const r = trigger.getBoundingClientRect();
    if (st.isActive || (cover ? r.bottom < window.innerHeight * 0.72 : r.top < window.innerHeight * 0.92)) tween.play();

    return () => { st.kill(); tween.kill(); gsap.set(node, { clearProps: 'all' }); };
  }, [ready, delay, from, scrub]);

  return <div ref={el} className={`rv ${className}`}>{children}</div>;
}
