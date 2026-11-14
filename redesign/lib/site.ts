// Restaurant content config in one place. Texts live in i18n/*.txt (keys referenced here).

export const BRAND = 'La Scala';
export const MODEL = 'Ristorante';

export const PHONE = { label: '+7 495 607 52 53', href: 'tel:+74956075253' };
export const MOBILE = { label: '+7 (977) 564 64 36', href: 'tel:+79775646436' };
export const EMAIL = 'info@lascalaristorante.ru';

/** Hero: the promo video cut into frames (public/video/hero/{1440,960}/f000.webp …, 12 fps), played by scrolling.
 *  Phones get the same video as a muted loop (hero-960.mp4). Source: public/video/LaScala_Promo_1920x1080.mp4. */
export const HERO_FRAMES = { count: 149, dir: '/video/hero', widths: [960, 1440], video: '/video/hero/hero-960.mp4' } as const;
export const heroFrame = (w: number, k: number) => `${HERO_FRAMES.dir}/${w}/f${String(k).padStart(3, '0')}.webp`;

/** Opening hours: weekdays 08:00–24:00, weekends from 10:00 until the last guest. */
export const HOURS = { weekdays: ['08:00', '24:00'], weekends: ['10:00'] } as const;

/** Menu: tab -> categories -> dishes. t = i18n key, p = price in roubles. */
export const MENU = [
  { t: 't1', cats: [
    { t: 'ca1', items: [{ t: 'd1', p: 250 }, { t: 'd1', p: 190 }] },
    { t: 'ca2', items: [{ t: 'd2', p: 450 }] },
    { t: 'ca3', items: [{ t: 'd3', p: 110 }, { t: 'd4', p: 280 }] },
    { t: 'ca4', items: [{ t: 'd5', p: 320 }] },
    { t: 'ca5', items: [{ t: 'd6', p: 270 }, { t: 'd7', p: 140 }] },
  ] },
  { t: 't2', cats: [
    { t: 'cb1', items: [{ t: 'd8', p: 650 }, { t: 'd9', p: 1100 }] },
    { t: 'cb2', items: [{ t: 'd10', p: 780 }] },
    { t: 'cb3', items: [{ t: 'd11', p: 550 }] },
    { t: 'cb4', items: [{ t: 'd12', p: 320 }] },
    { t: 'cb5', items: [{ t: 'd13', p: 850 }, { t: 'd7', p: 140 }] },
  ] },
  { t: 't3', cats: [
    { t: 'cc1', items: [{ t: 'd14', p: 490 }] },
    { t: 'cc2', items: [{ t: 'd15', p: 550 }, { t: 'd16', p: 500 }] },
    { t: 'cc3', items: [{ t: 'd17', p: 220 }] },
    { t: 'cc4', items: [{ t: 'd18', p: 320 }, { t: 'd19', p: 410 }] },
    { t: 'cc5', items: [{ t: 'd20', p: 750 }, { t: 'd21', p: 750 }] },
  ] },
] as const;

/** Gallery strip. r = aspect ratio (w / h) of the card. */
export const GALLERY = [
  { src: '/img/hero-1.webp', t: 'g1', r: 1.5 },
  { src: '/img/hall.webp', t: 'g2', r: 0.8 },
  { src: '/img/hero-2.webp', t: 'g3', r: 1.25 },
  { src: '/img/room.webp', t: 'g4', r: 0.8 },
  { src: '/img/hero-3.webp', t: 'g5', r: 1.5 },
  { src: '/img/entrance.webp', t: 'g6', r: 1 },
] as const;

export const EVENTS = [
  { t: 'e1', date: '2016-06-01', img: '/img/event-1.webp' },
  { t: 'e2', date: '2016-05-28', img: '/img/event-2.webp' },
  { t: 'e3', date: '2016-05-25', img: '/img/event-3.webp' },
  { t: 'e4', date: '2016-05-19', img: '/img/event-4.webp' },
] as const;

export const SOCIAL = [
  { label: 'VK', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
] as const;

export const pad = (n: number) => String(n).padStart(2, '0');
