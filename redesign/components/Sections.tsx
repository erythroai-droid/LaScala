'use client';
import { CSSProperties, RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Reveal from './Reveal';
import Modal from './Modal';
import { OPEN_CONTACT } from './Header';
import { useI18n } from '@/lib/i18n';
import { gsap, prefersReducedMotion, ScrollTrigger, useScrollReady, useStaticMode } from '@/lib/scroll';
import { BRAND, EMAIL, EVENTS, GALLERY, HERO_INTERVAL, HERO_SLIDES, HOURS, MENU, MOBILE, MODEL, pad, PHONE, SOCIAL } from '@/lib/site';

const openReserve = () => window.dispatchEvent(new Event(OPEN_CONTACT));

/**
 * A dark screen-high block stays where it is while the next block rides up over it:
 * pinned (no extra spacing) from "fills the screen" until the next block's top reaches the top of the screen.
 * A block taller than the screen scrolls to its bottom first, then stays.
 */
function useStack(ref: RefObject<HTMLElement | null>) {
  const ready = useScrollReady();
  useEffect(() => {
    if (!ready) return;
    const node = ref.current!;
    let next = node.nextElementSibling as HTMLElement | null;
    while (next && next.hasAttribute('data-spacer')) next = next.nextElementSibling as HTMLElement | null;
    if (!next) return;
    const st = ScrollTrigger.create({
      trigger: node,
      start: () => (node.offsetHeight > window.innerHeight + 2 ? 'bottom bottom' : 'top top'),
      endTrigger: next, end: 'top top',
      pin: true, pinSpacing: false, invalidateOnRefresh: true,
    });
    return () => st.kill();
  }, [ready, ref]);
}

/** Darkened full-bleed photo behind a dark block (same treatment as the opening hours). */
function DarkBg({ src }: { src: string }) {
  return <div className="dk-bg" aria-hidden><img src={src} alt="" width={1600} height={1067} loading="lazy" /></div>;
}

/** Section label + two-part heading (second part is the italic accent). */
function Head({ k, h1, h2, n }: { k: string; h1: string; h2: string; n?: string }) {
  return (
    <div className="sec-head">
      <Reveal from="left"><small>{n ? <i>{n}</i> : null}{k}</small></Reveal>
      <Reveal delay={80}><h2>{h1} <em>{h2}</em></h2></Reveal>
    </div>
  );
}

/** Hero: photo slideshow, pinned while the rest of the page rides up over it (the photo slowly scales and dims). */
export function Hero({ onLoadProgress }: { onLoadProgress: (v: number) => void }) {
  const { t } = useI18n();
  const ready = useScrollReady();
  const el = useRef<HTMLElement>(null);
  const first = useRef<HTMLImageElement>(null);
  const [i, setI] = useState(0);
  const n = HERO_SLIDES.length;
  useStack(el);

  // the preloader leaves as soon as the first photo is there
  useEffect(() => {
    const img = first.current;
    if (!img) return;
    onLoadProgress(40);
    const done = () => onLoadProgress(100);
    if (img.complete) { done(); return; }
    img.addEventListener('load', done); img.addEventListener('error', done);
    return () => { img.removeEventListener('load', done); img.removeEventListener('error', done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay; a manual change restarts the timer
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setTimeout(() => setI((v) => (v + 1) % n), HERO_INTERVAL);
    return () => clearTimeout(id);
  }, [i, n]);

  useEffect(() => {
    if (!ready) return;
    const node = el.current!;
    const media = node.querySelector('.hero-media'), inner = node.querySelector('.hero-in'), veil = node.querySelector('.hero-veil');
    const tl = gsap.timeline({ scrollTrigger: { trigger: node, start: 'top top', end: 'bottom top', scrub: true } })
      .to(media, { scale: 1.12, ease: 'none' }, 0)
      .to(veil, { opacity: 1, ease: 'none' }, 0)
      .to(inner, { yPercent: -8, autoAlpha: 0, ease: 'none' }, 0);
    // once block 01 covers the hero completely, stop painting it (slideshow, Ken Burns) — it only cost frames under the moving page
    const off = ScrollTrigger.create({ trigger: node, start: 'bottom top', end: 'max', onToggle: (s) => node.classList.toggle('off', s.isActive) });
    return () => { off.kill(); node.classList.remove('off'); tl.scrollTrigger?.kill(); tl.kill(); gsap.set([media, inner, veil], { clearProps: 'all' }); };
  }, [ready]);

  return (
    <section ref={el} id="top" className="hero" data-tone="dark">
      <div className="hero-media" aria-hidden>
        {HERO_SLIDES.map((s, k) => (
          <picture key={s.src} className={k === i ? 'on' : ''}>
            {'m' in s ? <source media="(max-width: 700px)" srcSet={s.m} /> : null}
            <img ref={k === 0 ? first : undefined} src={s.src} alt="" width={1920} height={1280} loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'} />
          </picture>
        ))}
      </div>
      <div className="hero-veil" aria-hidden />
      <div className="hero-in">
        <small className="hero-k">{t('hero_k')}</small>
        <h1><span><b>{t('hero_h1')}</b></span><span><b><em>{t('hero_h2')}</em></b></span></h1>
        <div className="hero-foot">
          <p>{t('hero_p')}</p>
          <button className="btn solid" onClick={openReserve}>{t('reserve')} <span className="arr">→</span></button>
        </div>
      </div>
      <div className="hero-bar">
        <div className="hero-dots" role="tablist" aria-label={t('slide')}>
          {HERO_SLIDES.map((s, k) => (
            <button key={s.src} role="tab" aria-selected={k === i} aria-label={`${t('slide')} ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)}>
              <i>{pad(k + 1)}</i><span style={{ '--d': `${HERO_INTERVAL}ms` } as CSSProperties} />
            </button>
          ))}
        </div>
        <span className="hero-scroll">{t('scroll')}<i /></span>
        <div className="hero-info">
          <span>{t('hero_addr')}</span>
          <a href={PHONE.href}>{PHONE.label}</a>
        </div>
      </div>
    </section>
  );
}

/** 01 — about: photo with a slow parallax, the welcome text and three things the kitchen is proud of. */
export function About() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const photo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const img = photo.current?.querySelector('img');
    if (!img) return;
    const tw = gsap.fromTo(img, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: photo.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(img, { clearProps: 'transform' }); };
  }, [ready]);

  return (
    <section id="about" className="sec about" data-tone="light">
      <Head n="01" k={t('about_k')} h1={t('about_h1')} h2={t('about_h2')} />
      <div className="about-grid">
        <Reveal from="up" className="about-photo">
          <div ref={photo} className="about-photo-in">
            <img src="/img/entrance.webp" alt={t('about_alt')} width={994} height={670} loading="lazy" />
          </div>
        </Reveal>
        <div className="about-copy">
          <Reveal><p className="lead">{t('about_lead')}</p></Reveal>
          <Reveal delay={90}>
            <p>{t('about_p1')}</p>
            <p>{t('about_p2')}</p>
            <p>{t('about_p3')}</p>
          </Reveal>
          <Reveal delay={160}><button className="btn solid" onClick={openReserve}>{t('reserve')} <span className="arr">→</span></button></Reveal>
        </div>
      </div>
      <div className="feats">
        {[1, 2, 3].map((k) => (
          <Reveal key={k} delay={80 * k} from="up">
            <i>{pad(k)}</i>
            <h3>{t(`f${k}h`)}</h3>
            <p>{t(`f${k}p`)}</p>
          </Reveal>
        ))}
      </div>
      <Marquee />
    </section>
  );
}

/** Giant brand words sliding sideways with the scroll. */
export function Marquee() {
  const ready = useScrollReady();
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return;
    const node = row.current!;
    // force3D off: as a GPU layer the row was a texture thousands of px wide (×DPR²) and pushed the page out of tile memory —
    // the whole block 01 blinked black. Repainting one strip of text per frame is far cheaper.
    const tw = gsap.fromTo(node, { xPercent: 0 }, {
      xPercent: -50, ease: 'none', force3D: false,
      scrollTrigger: { trigger: node.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(node, { clearProps: 'transform' }); };
  }, [ready]);
  return (
    <div className="marq" aria-hidden>
      <div ref={row} className="marq-row">
        {Array.from({ length: 4 }, (_, i) => <span key={i} className={i % 2 ? 'o' : ''}>{i % 2 ? `${MODEL} Italiano` : BRAND}</span>)}
      </div>
    </div>
  );
}

/** Opening hours over the dining-hall photo. */
export function Hours() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const el = useRef<HTMLElement>(null);
  useStack(el);

  useEffect(() => {
    if (!ready) return;
    const img = el.current?.querySelector('.dk-bg img');
    if (!img) return;
    const tw = gsap.fromTo(img, { yPercent: -10 }, {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: el.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(img, { clearProps: 'transform' }); };
  }, [ready]);

  return (
    <section ref={el} id="hours" className="sec hours" data-tone="dark">
      <DarkBg src="/img/hall.webp" />
      <Head k={t('hours_k')} h1={t('hours_h1')} h2={t('hours_h2')} />
      <div className="hours-grid">
        <Reveal from="up" delay={80}>
          <small>{t('hours_wk')}</small>
          <p className="hours-time"><b>{HOURS.weekdays[0]}</b><i>—</i><b>{HOURS.weekdays[1]}</b></p>
        </Reveal>
        <Reveal from="up" delay={160}>
          <small>{t('hours_we')}</small>
          <p className="hours-time"><b>{HOURS.weekends[0]}</b><i>—</i><em>{t('hours_last')}</em></p>
        </Reveal>
      </div>
      <Reveal delay={220}>
        <div className="hours-call">
          <span>{t('hours_call')}</span>
          <a href={PHONE.href}>{PHONE.label}</a>
          <button className="btn" onClick={openReserve}>{t('reserve')} <span className="arr">→</span></button>
        </div>
      </Reveal>
    </section>
  );
}

/** 02 — menu: three cards switched by tabs, dishes with dotted leaders. */
export function Menu() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }   // the first card comes in with the section's own reveal
    if (prefersReducedMotion() || !panel.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.menu-cat', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out' });
    }, panel);
    return () => ctx.revert();
  }, [i]);

  const tab = MENU[i];
  return (
    <section id="menu" className="sec menu-sec" data-tone="light">
      <img className="menu-deco l" src="/img/menu-left.webp" alt="" width={373} height={860} loading="lazy" aria-hidden />
      <img className="menu-deco r" src="/img/menu-right.webp" alt="" width={367} height={860} loading="lazy" aria-hidden />
      <div className="menu-in">
        <Head n="02" k={t('menu_k')} h1={t('menu_h1')} h2={t('menu_h2')} />
        <Reveal delay={120}>
          <div className="menu-tabs" role="tablist" aria-label={t('menu_k')}>
            {MENU.map((m, k) => (
              <button key={m.t} role="tab" id={`menu-tab-${k}`} aria-selected={k === i} aria-controls="menu-panel" className={k === i ? 'on' : ''} onClick={() => setI(k)}>
                <i>{pad(k + 1)}</i>{t(m.t)}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal delay={200} from="up">
          <div ref={panel} id="menu-panel" className="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${i}`}>
            {tab.cats.map((c) => (
              <div key={c.t} className="menu-cat">
                <h3>{t(c.t)}</h3>
                <ul>
                  {c.items.map((d, k) => (
                    <li key={`${d.t}-${k}`}><span>{t(d.t)}</span><i aria-hidden /><b>{d.p}&nbsp;₽</b></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={240}><p className="menu-note">{t('menu_note')}</p></Reveal>
      </div>
    </section>
  );
}

/** 03 — gallery: a pinned screen whose photo strip moves sideways with the scroll (a swipeable strip on the static page). */
export function Gallery() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const staticMode = useStaticMode();
  const el = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useStack(el);

  // the screen stays put (useStack) while an empty run of `dist` pixels scrolls past it and drives the strip sideways;
  // then the events block rides up over it
  useEffect(() => {
    if (!ready) return;
    const node = el.current!, row = track.current!, spacer = run.current!;
    const dist = () => Math.max(0, row.scrollWidth - node.clientWidth);
    const size = () => { spacer.style.height = `${dist()}px`; };
    size();
    ScrollTrigger.addEventListener('refreshInit', size);
    const tw = gsap.to(row, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: node, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
    });
    ScrollTrigger.refresh();
    return () => { ScrollTrigger.removeEventListener('refreshInit', size); spacer.style.height = ''; tw.scrollTrigger?.kill(); tw.kill(); gsap.set(row, { clearProps: 'transform' }); };
  }, [ready]);

  const shown = open === null ? null : GALLERY[open];
  return (
    <>
    <section ref={el} id="gallery" className="gal" data-tone="dark">
      <DarkBg src="/img/room.webp" />
      <div className="gal-head">
        <Head n="03" k={t('gal_k')} h1={t('gal_h1')} h2={t('gal_h2')} />
        {!staticMode && <Reveal delay={140}><p className="gal-hint">{t('gal_hint')} <span className="arr">→</span></p></Reveal>}
      </div>
      <div ref={track} className="gal-track">
        {GALLERY.map((g, k) => (
          <button key={g.src} className="gal-card" style={{ '--r': g.r } as CSSProperties} onClick={() => setOpen(k)} aria-label={`${t('gal_open')}: ${t(g.t)}`}>
            <img src={g.src} alt={t(g.t)} loading="lazy" draggable={false} />
            <span><i>{pad(k + 1)}</i>{t(g.t)}</span>
          </button>
        ))}
      </div>
      {/* fixed overlays must live outside the smoothed (transformed) content */}
      {mounted && createPortal(
        <Modal open={shown !== null} onClose={() => setOpen(null)} label={shown ? t(shown.t) : t('gal_k')} variant="full">
          {shown && (
            <figure className="lightbox">
              <img src={shown.src} alt={t(shown.t)} />
              <figcaption><i>{pad((open ?? 0) + 1)} / {pad(GALLERY.length)}</i>{t(shown.t)}</figcaption>
            </figure>
          )}
        </Modal>,
        document.body,
      )}
    </section>
    <div ref={run} className="gal-run" data-spacer aria-hidden />
    </>
  );
}

/** 04 — events: an editorial list, the date set large. */
export function Events() {
  const { t, lang } = useI18n();
  const parts = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    const p = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d);
    const get = (type: string) => p.find((x) => x.type === type)?.value ?? '';
    return { day: pad(Number(get('day'))), rest: `${get('month')} ${get('year')}` };
  };
  return (
    <section id="events" className="sec events" data-tone="light">
      <Head n="04" k={t('ev_k')} h1={t('ev_h1')} h2={t('ev_h2')} />
      <ol className="ev-list">
        {EVENTS.map((e, k) => {
          const d = parts(e.date);
          return (
            <li key={e.t}>
              <Reveal delay={70 * k} from="up">
                <article className="ev">
                  <time dateTime={e.date}><b>{d.day}</b><span>{d.rest}</span></time>
                  <h3>{t(e.t)}</h3>
                  <div className="ev-img"><img src={e.img} alt="" width={400} height={240} loading="lazy" /></div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** 05 — contacts and footer. */
export function Footer() {
  const { t } = useI18n();
  const ready = useScrollReady();
  const title = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLElement>(null);

  // the footer waits underneath (pulled up one screen under the events block, see .ftr in globals.css) and stays put
  // while the events block slides away over it; a footer taller than the screen then scrolls on as usual
  useEffect(() => {
    if (!ready) return;
    const st = ScrollTrigger.create({ trigger: el.current, start: 'top top', end: () => `+=${window.innerHeight}`, pin: true, invalidateOnRefresh: true });
    return () => st.kill();
  }, [ready]);

  // size the brand so one line exactly fills the viewport width
  useEffect(() => {
    const node = title.current;
    if (!node) return;
    const fit = () => {
      node.style.fontSize = '100px';
      node.style.width = 'max-content';
      const w = node.getBoundingClientRect().width || 1;
      node.style.width = '';
      node.style.fontSize = `${(document.documentElement.clientWidth / w) * 86}px`;   // a little under full width: the italic overhangs its box
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const node = title.current;
    if (!node) return;
    const tw = gsap.fromTo(node, { autoAlpha: 0 }, {
      autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: '#events', start: 'bottom 70%', end: 'bottom 20%', scrub: true },   // follows the block that uncovers the footer
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(node, { clearProps: 'opacity,visibility' }); };
  }, [ready]);

  return (
    <footer ref={el} id="contact" className="ftr" data-tone="dark" data-under>
      <DarkBg src="/img/hero-2.webp" />
      <div className="ftr-top">
        <Head n="05" k={t('f_contact')} h1={t('f_h1')} h2={t('f_h2')} />
        <Reveal delay={140}><button className="btn solid" onClick={openReserve}>{t('reserve')} <span className="arr">→</span></button></Reveal>
      </div>
      <div className="ftr-grid">
        <Reveal from="up">
          <h3>{t('f_contact')}</h3>
          <p>{t('f_p')}</p>
          <p><span>{t('f_phone')}</span> <a href={PHONE.href}>{PHONE.label}</a></p>
          <p><span>{t('f_mobile')}</span> <a href={MOBILE.href}>{MOBILE.label}</a></p>
          <p><span>E-mail</span> <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </Reveal>
        <Reveal delay={80} from="up">
          <h3>{t('f_metro')}</h3>
          <p>{t('f_metro1')}</p>
          <p>{t('f_metro2')}</p>
        </Reveal>
        <Reveal delay={160} from="up">
          <h3>{t('f_hours')}</h3>
          <p>{t('f_hours1')}</p>
          <p>{t('f_hours2')}</p>
        </Reveal>
        <Reveal delay={240} from="up">
          <h3>{t('f_social')}</h3>
          {SOCIAL.map((s) => <p key={s.label}><a href={s.href} onClick={(e) => { if (s.href === '#') e.preventDefault(); }}>{s.label}</a></p>)}
        </Reveal>
      </div>
      <div ref={title} className="ftr-title" aria-hidden>{BRAND}</div>
      <div className="ftr-bot"><span>{t('f_rights')}</span><span>{MODEL} Italiano · Mosca</span></div>
    </footer>
  );
}

/** Refresh the triggers once images below the fold have their size. */
export function useLateRefresh() {
  const ready = useScrollReady();
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(id);
  }, [ready]);
}
