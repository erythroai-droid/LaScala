'use client';
import { useI18n } from '@/lib/i18n';

const R = 345, C = 2 * Math.PI * R;

// Thin circle that fills as the assembly frames load (as on the reference), then fades out.
export default function Preloader({ pct }: { pct: number }) {
  const { t } = useI18n();
  return (
    <div className={`pre ${pct >= 100 ? 'done' : ''}`} aria-hidden={pct >= 100} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 700 700" fill="none" aria-hidden>
        <circle cx="350" cy="350" r={R} className="pre-track" />
        <circle cx="350" cy="350" r={R} className="pre-arc" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
      </svg>
      <div className="pre-txt">
        <span>{t('loading')}</span>
        <b dir="ltr">{pct}%</b>
      </div>
    </div>
  );
}
