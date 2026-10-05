import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PaymentMethod, ShopProduct } from './api/types';

export type CartLine = { product: ShopProduct; quantity: number };
export type Consumer = { first_name: string; last_name: string; email: string; country: string; optin: boolean };
export type LastOrder = { uid: string; total: number; lines: CartLine[]; consumer: Consumer; method: string };

type Ctx = {
  eventUid: string | null;
  products: ShopProduct[];
  paymentMethods: PaymentMethod[];
  setCatalog: (eventUid: string, products: ShopProduct[], pm: PaymentMethod[]) => void;
  qty: Record<string, number>;
  setQty: (uid: string, n: number) => void;
  swap: (remove: string[], add: Record<string, number>) => void;
  clear: () => void;
  lines: CartLine[];
  count: number;
  total: number;
  fees: number;
  lastOrder: LastOrder | null;
  setLastOrder: (o: LastOrder | null) => void;
};

const C = createContext<Ctx | null>(null);
const round = (n: number) => Math.round(n * 100) / 100;

export function ShopProvider({ children }: { children: ReactNode }) {
  const [eventUid, setEventUid] = useState<string | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [paymentMethods, setPm] = useState<PaymentMethod[]>([]);
  const [qty, setQtyMap] = useState<Record<string, number>>({});
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  const setCatalog = useCallback((uid: string, p: ShopProduct[], pm: PaymentMethod[]) => {
    setEventUid((prev) => { if (prev !== uid) setQtyMap({}); return uid; });
    setProducts(p);
    setPm(pm);
  }, []);

  const setQty = useCallback((uid: string, n: number) => {
    setQtyMap((q) => {
      const next = { ...q };
      if (n <= 0) delete next[uid]; else next[uid] = n;
      return next;
    });
  }, []);

  const swap = useCallback((remove: string[], add: Record<string, number>) => {
    setQtyMap((q) => {
      const next = { ...q };
      remove.forEach((u) => delete next[u]);
      Object.entries(add).forEach(([u, n]) => { next[u] = (next[u] ?? 0) + n; });
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const lines = products.filter((p) => qty[p.uid]).map((p) => ({ product: p, quantity: qty[p.uid] }));
    return {
      eventUid, products, paymentMethods, setCatalog, qty, setQty, swap,
      clear: () => setQtyMap({}),
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      total: round(lines.reduce((s, l) => s + l.product.price.amount * l.quantity, 0)),
      fees: round(lines.reduce((s, l) => s + l.product.service_cost.amount * l.quantity, 0)),
      lastOrder, setLastOrder,
    };
  }, [eventUid, products, paymentMethods, setCatalog, qty, setQty, swap, lastOrder]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useShop = () => {
  const c = useContext(C);
  if (!c) throw new Error('useShop buiten ShopProvider');
  return c;
};

export const euro = (n: number) => n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
