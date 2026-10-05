import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { parking, products, RESERVATION_MIN, type ParkingProduct, type Product } from './data/event';

export type Line =
  | { kind: 'ticket'; item: Product; qty: number }
  | { kind: 'parking'; item: ParkingProduct; qty: number };

export type Order = { id: string; lines: Line[]; total: number; fees: number; email: string; firstName: string; protection: boolean; method: string };

type Ctx = {
  qty: Record<string, number>;
  setQty: (id: string, n: number) => void;
  lines: Line[];
  ticketCount: number;
  count: number;
  total: number;
  fees: number;
  /** ms over in de reservering; null als er niets gereserveerd is */
  remaining: number | null;
  expired: Record<string, number> | null;
  restore: () => void;
  dismissExpired: () => void;
  clear: () => void;
  order: Order | null;
  setOrder: (o: Order) => void;
};

const C = createContext<Ctx | null>(null);
const round = (n: number) => Math.round(n * 100) / 100;
const byId = new Map<string, Product | ParkingProduct>([...products, ...parking].map((p) => [p.id, p]));

export function ShopProvider({ children }: { children: ReactNode }) {
  const [qty, setQtyMap] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [expired, setExpired] = useState<Record<string, number> | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const empty = Object.keys(qty).length === 0;

  // Echte reservering: start bij het eerste item, stopt als het mandje leeg is. Reset nooit vanzelf.
  useEffect(() => {
    if (empty) { setStartedAt(null); return; }
    const t = Date.now();
    setStartedAt((s) => s ?? t);
    setNow(t);
  }, [empty]);

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const remaining = startedAt ? Math.max(0, startedAt + RESERVATION_MIN * 60_000 - now) : null;

  useEffect(() => {
    if (remaining === 0) { setExpired(qty); setQtyMap({}); }
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const setQty = useCallback((id: string, n: number) => {
    setQtyMap((q) => { const next = { ...q }; if (n <= 0) delete next[id]; else next[id] = n; return next; });
  }, []);

  const value = useMemo<Ctx>(() => {
    const lines: Line[] = Object.entries(qty).flatMap(([id, n]): Line[] => {
      const item = byId.get(id);
      if (!item) return [];
      return 'lot' in item ? [{ kind: 'parking', item, qty: n }] : [{ kind: 'ticket', item, qty: n }];
    });
    const total = round(lines.reduce((s, l) => s + l.item.price * l.qty, 0));
    const fees = round(lines.reduce((s, l) => s + (l.kind === 'ticket' ? l.item.fee : 0) * l.qty, 0));
    return {
      qty, setQty, lines, total, fees,
      ticketCount: lines.filter((l) => l.kind === 'ticket').reduce((s, l) => s + l.qty, 0),
      count: lines.reduce((s, l) => s + l.qty, 0),
      remaining,
      expired,
      restore: () => { if (expired) { setNow(Date.now()); setStartedAt(null); setQtyMap(expired); setExpired(null); } },
      dismissExpired: () => setExpired(null),
      clear: () => setQtyMap({}),
      order, setOrder,
    };
  }, [qty, setQty, remaining, expired, order]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useShop = () => {
  const c = useContext(C);
  if (!c) throw new Error('useShop buiten ShopProvider');
  return c;
};

export const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
