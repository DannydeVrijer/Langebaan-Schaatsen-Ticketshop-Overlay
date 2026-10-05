import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/* Overgenomen uit Langebaan-Schaats-App (zelfde huisstijl). */

const I = {
  chevL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  chev: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  ticket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z"/><path d="M13 6v12" strokeDasharray="2 3"/></svg>,
  car: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 11l2-5h10l2 5M4 11h16v6H4zM7 17v2M17 17v2"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10"/></svg>,
  code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  cal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
};
export type IconName = keyof typeof I;
export const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span aria-hidden style={{ display: 'inline-flex', width: size, height: size, flex: 'none' }}>{I[name]}</span>
);

export const BrandMark = ({ size = 34 }: { size?: number }) => (
  <svg className="brand-mark" width={size} height={size} viewBox="0 0 512 512" aria-hidden>
    <defs><radialGradient id="bm" cx="50%" cy="60%" r="70%"><stop offset="0" stopColor="#2B4F85"/><stop offset="1" stopColor="#0B1526"/></radialGradient></defs>
    <rect width="512" height="512" rx="112" fill="url(#bm)"/>
    <g fill="none" stroke="#fff"><rect x="116" y="76" width="280" height="360" rx="140" strokeWidth="30"/><rect x="166" y="126" width="180" height="260" rx="90" strokeWidth="12" opacity=".45"/></g>
    <path d="M232 214l44 42-44 42" fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TrackRing = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 230 260" fill="none" aria-hidden>
    <defs>
      <linearGradient id="mvs-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset=".55" stopColor="#A8CFFD" />
        <stop offset="1" stopColor="#A8CFFD" stopOpacity=".15" />
      </linearGradient>
    </defs>
    <rect x="18" y="14" width="194" height="232" rx="97" stroke="url(#mvs-ring)" strokeWidth="16" />
    <rect x="52" y="48" width="126" height="164" rx="63" stroke="url(#mvs-ring)" strokeWidth="8" opacity=".8" />
  </svg>
);

export const Chevrons = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 60" fill="none" aria-hidden>
    <defs>
      <linearGradient id="mvs-arrow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#A8CFFD" stopOpacity=".35" />
      </linearGradient>
    </defs>
    <path d="M8 22L30 6l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M8 38L30 22l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" opacity=".7" />
    <path d="M8 54L30 38l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" opacity=".4" />
  </svg>
);

export function TopBar({ back, right }: { back?: { to: string; label: string }; right?: ReactNode }) {
  return (
    <header className="topbar">
      {back ? (
        <Link to={back.to} className="back"><Icon name="chevL" /> {back.label}</Link>
      ) : (
        <Link to="/" className="brand">
          <BrandMark />
          <span className="brand-text">
            <span className="eyebrow">Beleef de magie van</span>
            <span className="display">Schaatsen</span>
          </span>
        </Link>
      )}
      {right}
    </header>
  );
}

export function Stepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Minder ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`Meer ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function Steps({ at }: { at: 1 | 2 | 3 }) {
  const s = ['Tickets', 'Gegevens', 'Betalen'];
  return (
    <ol className="steps" aria-label="Stappen">
      {s.map((t, i) => (
        <li key={t} className={i + 1 < at ? 'done' : i + 1 === at ? 'on' : ''} aria-current={i + 1 === at ? 'step' : undefined}>
          <span className="n">{i + 1 < at ? '✓' : i + 1}</span>{t}
        </li>
      ))}
    </ol>
  );
}

export const nlDate = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', o);
