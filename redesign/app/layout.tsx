import type { Metadata, Viewport } from 'next';
// Self-host via fontsource — next/font/google flaky on Vercel (extensionless /l/font?kit= URLs)
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/cyrillic-300.css';
import '@fontsource/inter/cyrillic-400.css';
import '@fontsource/inter/cyrillic-500.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/cyrillic-500.css';
import '@fontsource/cormorant-garamond/cyrillic-400-italic.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'La Scala — ресторан итальянской кухни в Москве',
  description: 'Итальянский ресторан La Scala в центре Москвы: открытая кухня с грилем на дровах, собственные сыры и команда итальянских шеф-поваров. Резерв: +7 495 607 52 53.',
};
export const viewport: Viewport = { themeColor: '#15120f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" dir="ltr" suppressHydrationWarning>
      <head>
        {/* decide the static (no-animation) layout before first paint, so phones never flash the animated one */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.toggle('static',matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches)" }} />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
