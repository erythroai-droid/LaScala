'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import Cursor from '@/components/Cursor';
import ScrollTop from '@/components/ScrollTop';
import { About, Events, Footer, Gallery, Hero, Hours, Menu, useLateRefresh } from '@/components/Sections';
import { SmoothScroll } from '@/lib/scroll';

export default function Page() {
  const [pct, setPct] = useState(0);
  // never hold the page behind the preloader for long: the first hero photo usually lands well before this
  useEffect(() => {
    if (window.scrollY > 300) { setPct(100); return; }
    const id = setTimeout(() => setPct(100), 3500);
    return () => clearTimeout(id);
  }, []);
  return (
    <>
      <Preloader pct={pct} />
      <Header />
      <ScrollTop />
      <Cursor />
      <SmoothScroll><Content onLoadProgress={(v) => setPct((p) => Math.max(p, v))} /></SmoothScroll>
    </>
  );
}

function Content({ onLoadProgress }: { onLoadProgress: (v: number) => void }) {
  useLateRefresh();
  return (
    <main>
      {/* screen-high blocks; each dark one (hero, hours, gallery) stays put while the next rides up over it,
          the footer waits under the events block and is uncovered */}
      <Hero onLoadProgress={onLoadProgress} />
      <About />
      <Hours />
      <Menu />
      <Gallery />
      <Events />
      <Footer />
    </main>
  );
}
