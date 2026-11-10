# La Scala — redesign

Современный редизайн главной страницы ресторана La Scala. Развёрнут из шаблона
[`erythroai-droid/templates` → `product-scroll-landing`](https://github.com/erythroai-droid/templates):
Next.js 15 + React 19 + GSAP (ScrollTrigger / ScrollSmoother), i18n RU/EN.

```bash
npm install
npm run dev     # http://localhost:3200
npm run build && npm start
```

## Что взято из шаблона

- `lib/scroll.tsx` — плавный скролл, «статичный» режим для телефонов и `prefers-reduced-motion`
- `lib/i18n.tsx`, `scripts/build-i18n.mjs`, `i18n/*.txt` → `lib/dict.ts` (`npm run i18n`)
- `components/Reveal`, `CountUp`, `Modal`, `Cursor`, `Preloader`, `ScrollTop`, `Header`, `Flag`
- шрифты через `@fontsource` (не `next/font/google`), `robots.txt`, `llms.txt`, `sitemap.ts`, Speed Insights

## Что заменено под ресторан

| Что | Где |
|---|---|
| Контент: контакты, часы, меню, галерея, события | [`lib/site.ts`](lib/site.ts) |
| Тексты RU/EN | `i18n/ru.txt`, `i18n/en.txt` → `npm run i18n` |
| Секции: hero-слайдшоу, о ресторане, часы, меню, галерея, события, контакты | [`components/Sections.tsx`](components/Sections.tsx) |
| Палитра и типографика (Cormorant Garamond + Inter) | [`app/globals.css`](app/globals.css) |
| Фотографии (webp, из исходного макета) | `public/img/` |

Продуктовая «сборка по кадрам» из шаблона (Assembly, кадры, AI-чат, иврит/арабский) удалена — для ресторана она не нужна.

## Перед запуском в прод

- Форма бронирования демонстрационная: `submit` в [`components/Header.tsx`](components/Header.tsx) никуда не отправляет данные.
- Домен в `public/robots.txt`, `public/llms.txt`, `app/sitemap.ts` — заглушка `https://lascala.erythro.ai` (или задайте `NEXT_PUBLIC_SITE_URL`).
- Ссылки на соцсети в `lib/site.ts` — заглушки `#`.
- Английские тексты переведены вручную, а не воркером Translater, как принято в шаблоне.
