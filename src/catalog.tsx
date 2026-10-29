import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { parking as mockParking, products as mockProducts, type Audience, type DayKey, type ParkingProduct, type Product, type Zone } from './data/event';
import { friendly, getStorefront, isLive, toCatalog, type ApiStorefront } from './api/paylogic';

/**
 * Catalogus: waar de producten vandaan komen.
 * - geen VITE_PAYLOGIC_TOKEN → voorbeelddata uit data/event.ts (status 'mock')
 * - wél een token → live uit de Paylogic Shopping API (status 'loading' → 'live' of 'error')
 */
export type CatalogStatus = 'mock' | 'loading' | 'live' | 'error';

type Ctx = {
  status: CatalogStatus;
  live: boolean;
  error: string | null;
  products: Product[];
  parking: ParkingProduct[];
  unmatched: string[];
  minPerOrder: number;
  maxPerOrder: number;
  captchaKey: string | null;
  reload: () => void;
  /* afgeleide helpers die vroeger op de vaste data werkten */
  minAdult: (day: DayKey) => number | null;
  ppCompare: (zone: Zone, audience: Audience) => { pp: number; los: number; save: number } | null;
};

const C = createContext<Ctx | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CatalogStatus>(isLive ? 'loading' : 'mock');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ products: Product[]; parking: ParkingProduct[]; unmatched: string[] }>({ products: mockProducts, parking: mockParking, unmatched: [] });
  const [limits, setLimits] = useState({ min: 1, max: 10, captcha: null as string | null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLive) return;
    let alive = true;
    setStatus('loading'); setError(null);
    getStorefront()
      .then((sf: ApiStorefront) => {
        if (!alive) return;
        const cat = toCatalog(sf);
        if (cat.unmatched.length) console.warn('Producten zonder indeling (zie productMeta in src/api/paylogic.ts):', cat.unmatched);
        setData(cat);
        setLimits({ min: sf.min_per_order ?? 1, max: sf.max_per_order ?? 10, captcha: sf.captcha?.public_key ?? null });
        setStatus('live');
      })
      .catch((e) => { if (alive) { setError(friendly(e)); setStatus('error'); } });
    return () => { alive = false; };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo<Ctx>(() => {
    const { products, parking, unmatched } = data;
    const minAdult = (day: DayKey) => {
      const a = products.filter((p) => p.day === day && !p.soldOut && p.audience === 'volw').map((p) => p.price);
      return a.length ? Math.min(...a) : null;
    };
    const ppCompare = (zone: Zone, audience: Audience) => {
      const pp = products.find((p) => p.day === 'pp' && p.zone === zone && p.audience === audience);
      const los = products.filter((p) => p.day !== 'pp' && p.zone === zone && p.audience === audience).reduce((s, p) => s + p.price, 0);
      return pp && los > pp.price ? { pp: pp.price, los, save: Math.round((los - pp.price) * 100) / 100 } : null;
    };
    return { status, live: isLive, error, products, parking, unmatched, minPerOrder: limits.min, maxPerOrder: limits.max, captchaKey: limits.captcha, reload, minAdult, ppCompare };
  }, [status, error, data, limits, reload]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useCatalog = () => {
  const c = useContext(C);
  if (!c) throw new Error('useCatalog buiten CatalogProvider');
  return c;
};
