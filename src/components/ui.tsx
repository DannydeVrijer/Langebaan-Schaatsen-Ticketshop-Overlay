import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { why } from '../data/why';
import { mmss, useShop } from '../state';

const I = {
  chevL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  chev: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>,
  ticket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z"/><path d="M13 6v12" strokeDasharray="2 3"/></svg>,
  car: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 11l2-5h10l2 5M4 11h16v6H4zM7 17v2M17 17v2"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>,
  cal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-5-6.3"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>,
  bulb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2" strokeLinecap="round"/></svg>,
  desktop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>,
};
export type IconName = keyof typeof I;
export const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span aria-hidden className="ico-wrap" style={{ width: size, height: size }}>{I[name]}</span>
);

export const BrandMark = ({ size = 32 }: { size?: number }) => (
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
        <stop offset="0" stopColor="#FFFFFF" /><stop offset=".55" stopColor="#A8CFFD" /><stop offset="1" stopColor="#A8CFFD" stopOpacity=".15" />
      </linearGradient>
    </defs>
    <rect x="18" y="14" width="194" height="232" rx="97" stroke="url(#mvs-ring)" strokeWidth="16" />
    <rect x="52" y="48" width="126" height="164" rx="63" stroke="url(#mvs-ring)" strokeWidth="8" opacity=".8" />
  </svg>
);

export const Chevrons = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 60" fill="none" aria-hidden>
    <defs>
      <linearGradient id="mvs-arrow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#A8CFFD" stopOpacity=".35" /></linearGradient>
    </defs>
    <path d="M8 22L30 6l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M8 38L30 22l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" opacity=".7" />
    <path d="M8 54L30 38l22 16" stroke="url(#mvs-arrow)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" opacity=".4" />
  </svg>
);

/** Kop van elke shoppagina: terug, eventnaam, winkelmand met teller en reserveringstijd. */
export function ShopBar({ back, title = 'WCKT 2026', whyKey }: { back?: string | number; title?: string; whyKey?: string }) {
  const { count, remaining } = useShop();
  const nav = useNavigate();
  const low = remaining !== null && remaining < 5 * 60_000;
  return (
    <header className="shopbar">
      {back ? (
        <button type="button" className="icon-btn" onClick={() => (typeof back === 'number' ? nav(back) : nav(back))} aria-label="Terug"><Icon name="chevL" size={22} /></button>
      ) : (
        <Link to="/" className="icon-btn plain" aria-label="Naar start"><BrandMark size={34} /></Link>
      )}
      <span className="shopbar-title">{title}</span>
      {whyKey && <WhyButton k={whyKey} />}
      <ViewToggle />
      <Link to="/winkelmand" className={`cart-btn ${count ? 'has' : ''} ${low ? 'low' : ''}`} aria-label={`Winkelmand, ${count} items${remaining !== null ? `, nog ${mmss(remaining)} gereserveerd` : ''}`}>
        <Icon name="cart" size={22} />
        {count > 0 && <span className="count">{count}</span>}
        {remaining !== null && <span className="time">{mmss(remaining)}</span>}
      </Link>
    </header>
  );
}

const STEPS = ['Tickets', 'Parkeren', 'Mandje', 'Gegevens', 'Betalen'];
export function StepBar({ at }: { at: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <nav className="stepbar" aria-label={`Stap ${at} van 5: ${STEPS[at - 1]}`}>
      <div className="track">{STEPS.map((s, i) => <i key={s} className={i < at ? 'on' : ''} />)}</div>
      <span><b>Stap {at} van 5</b> · {STEPS[at - 1]}</span>
      {at < 5 && <span className="sb-next">Hierna: {STEPS[at]}</span>}
    </nav>
  );
}

export function Stepper({ value, max, onChange, label, disabled }: { value: number; max: number; onChange: (n: number) => void; label: string; disabled?: boolean }) {
  return (
    <div className={`stepper ${value > 0 ? 'active' : ''}`} role="group" aria-label={`Aantal ${label}`}>
      <button type="button" aria-label={`Eén minder: ${label}`} disabled={disabled || value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`Eén meer: ${label}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

/** Onderblad (bottom sheet) voor extra info – vervangt de kleine i-popups van de huidige shop. */
export function Sheet({ title, eyebrow, onClose, children }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return createPortal(
    <div className="sheet-wrap" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="grab" aria-hidden />
        <div className="sheet-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 className="display">{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Sluiten"><Icon name="close" /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}

/** Vaste actiebalk onderaan: altijd één primaire knop (DotCom Secrets: één doel per pagina). */
export function ActionBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="actionbar">
      {note && <div className="ab-note">{note}</div>}
      <div className="ab-row">{children}</div>
    </div>
  );
}

/** "Waarom zo?" – toelichting per scherm voor collega's en stakeholders. */
export function WhyButton({ k }: { k: string }) {
  const [open, setOpen] = useState(false);
  const { demo } = useShop();
  const w = why[k];
  if (!w || !demo) return null;
  return (
    <>
      <button type="button" className="why-btn" onClick={() => setOpen(true)} aria-label="Waarom is dit scherm zo ontworpen?">
        <Icon name="bulb" size={18} /> <span>Waarom?</span>
      </button>
      {open && (
        <Sheet title={w.title} eyebrow="Waarom zo? · ontwerpkeuzes" onClose={() => setOpen(false)}>
          <ol className="why-list">
            {w.items.map((i) => (
              <li key={i.t}>
                <strong>{i.t}</strong>
                <p>{i.s}</p>
                <span className="bron">{i.bron}</span>
              </li>
            ))}
          </ol>
        </Sheet>
      )}
    </>
  );
}

/** Voettekst met schakelaar voor de demomodus (ontwerpkeuzes tonen). */
export function ProtoFooter({ text = 'Fictief voorbeeld. Er wordt niets verkocht of betaald.' }: { text?: string }) {
  const { demo, setDemo } = useShop();
  return (
    <footer className="proto">
      <span>{text}</span>
      <label className="demo-toggle">
        <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
        <span>Ontwerpkeuzes tonen (demo)</span>
      </label>
    </footer>
  );
}

/** Wissel tussen telefoon- en desktopweergave (prototype-hulpmiddel). */
export function ViewToggle() {
  const { view, setView } = useShop();
  const wide = useWide();
  return (
    <div className="view-toggle" role="group" aria-label="Weergave">
      <button type="button" aria-pressed={!wide} aria-label="Telefoonweergave" onClick={() => setView('phone')}><Icon name="phone" size={18} /></button>
      <button type="button" aria-pressed={wide} aria-label="Desktopweergave" onClick={() => setView(view === 'desktop' ? 'auto' : 'desktop')}><Icon name="desktop" size={18} /></button>
    </div>
  );
}

export const DESKTOP_W = 1280;
/** true als de desktopweergave actief is (gekozen, of automatisch op een breed scherm). */
export function useWide() {
  const { view } = useShop();
  const [vw, setVw] = useState(() => window.innerWidth);
  useEffect(() => { const r = () => setVw(window.innerWidth); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  return view === 'desktop' || (view === 'auto' && vw >= 1024);
}
