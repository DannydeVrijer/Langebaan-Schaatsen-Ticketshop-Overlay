import type { ApiLogEntry, Bill, Order, OrderRequest, PaylogicEvent, ShopProduct, Storefront } from './types';
import { events, paymentMethods, productMeta, storefronts } from './mockData';

/**
 * De shop praat NOOIT rechtstreeks met Paylogic: de API-sleutel mag niet in de browser.
 * Alle aanroepen gaan via een eigen backend-for-frontend (BFF, zie server/bff.mjs).
 *
 *   browser  ──►  BFF (jouw server, houdt de sleutel)  ──►  shopping-api.paylogic.com
 *
 * Zonder VITE_API_BASE draait de shop op voorbeelddata (mock) en logt hij
 * welke Paylogic-aanroep er in het echt zou gebeuren.
 */

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
export const isMock = !API_BASE;

/* ---------- log van API-aanroepen (voor het paneel "Onder de motorkap") ---------- */
type Listener = (log: ApiLogEntry[]) => void;
let log: ApiLogEntry[] = [];
let seq = 0;
const listeners = new Set<Listener>();
export const subscribeLog = (fn: Listener) => { listeners.add(fn); fn(log); return () => { listeners.delete(fn); }; };
export function logCall(method: ApiLogEntry['method'], path: string, note: string, ms: number) {
  log = [{ id: ++seq, method, path, note, ms, at: new Date() }, ...log].slice(0, 40);
  listeners.forEach((l) => l(log));
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const latency = () => 180 + Math.round(Math.random() * 220);

async function viaBff<T>(method: 'GET' | 'POST', path: string, note: string, body?: unknown): Promise<T> {
  const t0 = performance.now();
  const res = await fetch(API_BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  logCall(method, path, note, Math.round(performance.now() - t0));
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

async function mock<T>(method: 'GET' | 'POST', path: string, note: string, value: () => T): Promise<T> {
  const ms = latency();
  await wait(ms);
  logCall(method, path, note, ms);
  return value();
}

const withMeta = (sf: Storefront): ShopProduct[] =>
  sf.products.filter((p) => productMeta[p.uid]).map((p) => ({ ...p, ...productMeta[p.uid] }));

let eventsCache: Promise<PaylogicEvent[]> | null = null;
const round = (n: number) => Math.round(n * 100) / 100;

export const api = {
  /** Events veranderen zelden: één keer ophalen per sessie (in productie ook cachen in de BFF). */
  listEvents(): Promise<PaylogicEvent[]> {
    const note = 'Alle events waar dit verkoopkanaal toegang toe heeft';
    eventsCache ??= (isMock ? mock('GET', '/events', note, () => events) : viaBff<PaylogicEvent[]>('GET', '/events', note))
      .catch((e) => { eventsCache = null; throw e; });
    return eventsCache;
  },

  async getStorefront(eventUid: string): Promise<{ products: ShopProduct[]; payment_methods: Storefront['payment_methods'] }> {
    const path = `/storefront?event=…/events/${eventUid.slice(0, 8)}…`;
    const note = 'Producten, prijzen en beschikbaarheid in één keer';
    const sf: Storefront = !isMock
      ? await viaBff('GET', `/storefront?event=${eventUid}`, note)
      : await mock('GET', path, note, () => ({ event: eventUid, products: storefronts[eventUid] ?? [], payment_methods: paymentMethods }));
    return { products: withMeta(sf), payment_methods: sf.payment_methods };
  },

  /** Paylogic rekent het definitieve bedrag (incl. kosten) uit vóór de order. */
  async getBill(lines: { product: ShopProduct; quantity: number }[]): Promise<Bill> {
    const note = `Prijscheck voor ${lines.reduce((s, l) => s + l.quantity, 0)} producten`;
    const calc = (): Bill => {
      const bl = lines.map((l) => ({ product: l.product.uid, quantity: l.quantity, total: { amount: round(l.product.price.amount * l.quantity), currency: 'EUR' as const } }));
      return {
        lines: bl,
        service_cost: { amount: round(lines.reduce((s, l) => s + l.product.service_cost.amount * l.quantity, 0)), currency: 'EUR' },
        total: { amount: round(bl.reduce((s, l) => s + l.total.amount, 0)), currency: 'EUR' },
      };
    };
    if (!isMock) return viaBff('POST', '/bill', note, { products: lines.map((l) => ({ product: l.product.uid, quantity: l.quantity })) });
    return mock('GET', '/bill?products=…', note, calc);
  },

  async createOrder(req: OrderRequest, total: number): Promise<Order> {
    const note = 'Order aanmaken; Paylogic reserveert de tickets en geeft een betaallink terug';
    if (!isMock) return viaBff('POST', '/orders', note, req);
    return mock('POST', '/orders', note, () => {
      const id = Math.random().toString(16).slice(2, 10) + 'b5e0';
      return {
        uid: id,
        status: 'pending',
        total: { amount: total, currency: 'EUR' },
        _links: { payment: { href: `#/betalen/${id}` } },
      };
    });
  },
};
