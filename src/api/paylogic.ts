/**
 * Koppeling met de Paylogic Shopping Service API – skelet, NIET getest tegen de echte API.
 * Docs: https://shopping-api-docs.paylogic.com/
 *
 * Werkt met het "Bearer token" dat Paylogic voor frontends uitgeeft (rol spa-sales):
 * events/producten lezen, bill opvragen, order aanmaken. Dat token mag in de browser staan;
 * de Basic-credentials (app:secret) NOOIT. Zie KOPPELING.md.
 *
 * Instellen:  VITE_PAYLOGIC_TOKEN=<jwt>  VITE_PAYLOGIC_EVENT=<event-uid>  (en optioneel VITE_PAYLOGIC_API voor sandbox)
 */
import type { Audience, DayKey, ParkingProduct, Product, Zone } from '../data/event';

const API = import.meta.env.VITE_PAYLOGIC_API ?? 'https://shopping-api.paylogic.com';
const TOKEN = import.meta.env.VITE_PAYLOGIC_TOKEN as string | undefined;
export const EVENT_UID = import.meta.env.VITE_PAYLOGIC_EVENT as string | undefined;
export const isLive = Boolean(TOKEN && EVENT_UID);

type I18n = Record<string, string>;
type Amount = { amount: string | number; currency: string };

/* ---------- ruwe API-vormen (vereenvoudigd, HAL+JSON) ---------- */
export type ApiStorefront = {
  should_display_service_costs: boolean;
  min_per_order: number;
  max_per_order: number;
  captcha?: { provider: string; public_key: string } | null;
  categories: {
    name: I18n | null;
    items: {
      product: string; // product-URI
      is_sold_out: boolean;
      min_quantity: number;
      max_quantity: number;
      unit_price: Amount;
      price_breakdown: {
        unit_price_including_service_costs: Amount;
        unit_price_excluding_service_costs: Amount;
        unit_price_service_costs: Amount;
      };
    }[];
  }[];
  _embedded: { 'shop:product': { uid: string; name: I18n; description?: I18n; _links: { self: { href: string } } }[] };
};

export type ApiBill = {
  grand_total?: Amount;
  total: Amount;
  service_costs: { total: Amount };
  available_payment_methods: { uid: string; name: I18n; image?: string; costs: Amount; required_consumer_fields: string[] }[];
  available_shipping_methods: { uid: string; name: I18n; costs: Amount; required_consumer_fields: string[] }[];
};

export type ApiOrder = {
  uid: string;
  reference?: string;
  status: 'pending' | 'completed' | 'canceled';
  grand_total: Amount;
  _links: { payment?: { href: string }; 'shop:etickets'?: { href: string }; 'shop:repayment'?: { href: string } };
};

export class PaylogicError extends Error {
  status: number; type: string; logref?: string;
  constructor(status: number, type: string, message: string, logref?: string) { super(message); this.status = status; this.type = type; this.logref = logref; }
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  if (!TOKEN) throw new PaylogicError(0, 'NO_TOKEN', 'Geen VITE_PAYLOGIC_TOKEN ingesteld');
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/hal+json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new PaylogicError(res.status, json.type ?? 'ERROR', json.message ?? res.statusText, json.logref);
  return json as T;
}

const num = (a: Amount) => Number(a.amount);
const productUri = (uid: string) => `${API}/products/${uid}`;
const eventUri = (uid: string) => `${API}/events/${uid}`;

/* ---------- 1. storefront ophalen ---------- */
export const getStorefront = (eventUid = EVENT_UID!, country = 'NL') =>
  call<ApiStorefront>('GET', `/storefront?event=${encodeURIComponent(eventUri(eventUid))}&country=${country}`);

/**
 * Paylogic kent geen "dag", "vak" of "doelgroep". Die indeling leg je zelf vast:
 * product-uid uit de backoffice → dag/vak/doelgroep in de shop. Vul deze tabel per toernooi
 * (uid's staan in de backoffice bij elk product, of in de storefront-respons).
 */
export type ProductMeta =
  | { kind?: 'ticket'; day: DayKey; zone: Zone; audience: Audience; limited?: boolean }
  | { kind: 'parking'; day: Exclude<DayKey, 'pp'>; lot: string };
export const productMeta: Record<string, ProductMeta> = {
  // '0c2019503cd666fb35c5a3dbd7bafe86': { day: 'za', zone: 'noord', audience: 'volw' },
  // 'a1b2…': { kind: 'parking', day: 'za', lot: 'P5' },
};

/**
 * Valt terug op de productnaam uit de backoffice als er geen vaste koppeling is.
 * Werkt voor de huidige WCKT-namen ("Ireen Wüst bocht - Noord - kids - 31 okt", "Parkeerticket P5 - 31 okt",
 * "Passe-Partout - Zitplaats West"). Controleer dit per toernooi.
 */
export function guessMeta(name: string): ProductMeta | null {
  const n = name.toLowerCase();
  const day: DayKey | null = /passe-?partout/.test(n) ? 'pp' : /30 okt/.test(n) ? 'vr' : /31 okt/.test(n) ? 'za' : /1 nov/.test(n) ? 'zo' : null;
  if (!day) return null;
  const park = n.match(/parkeer\w*\s*(p\d+)/);
  if (park && day !== 'pp') return { kind: 'parking', day, lot: park[1].toUpperCase() };
  const zone: Zone | null = /wüst|wust|noord/.test(n) ? 'noord' : /kramer|zuid/.test(n) ? 'zuid' : /vip/.test(n) ? 'vip' : /west/.test(n) ? 'west' : /oost/.test(n) ? 'oost' : /mindervalide/.test(n) ? 'mv' : null;
  if (!zone) return null;
  const audience: Audience = zone === 'mv' ? (/begeleider/.test(n) ? 'mv-beg' : 'mv-los') : /kids|kind/.test(n) ? 'kids' : 'volw';
  return { day, zone, audience, limited: zone === 'vip' };
}

export type Catalog = { products: Product[]; parking: ParkingProduct[]; unmatched: string[] };

/** Storefront → de vormen die de schermen al gebruiken. Producten zonder indeling komen in `unmatched`. */
export function toCatalog(sf: ApiStorefront): Catalog {
  const names = new Map(sf._embedded['shop:product'].map((p) => [p._links.self.href, p.name?.nl ?? p.name?.en ?? '']));
  const out: Catalog = { products: [], parking: [], unmatched: [] };
  for (const cat of sf.categories) {
    for (const it of cat.items) {
      const uid = it.product.split('/').pop()!;
      const name = names.get(it.product) ?? uid;
      const meta = productMeta[uid] ?? guessMeta(name);
      if (!meta) { out.unmatched.push(name); continue; }
      const pb = it.price_breakdown;
      const price = num(pb.unit_price_including_service_costs);
      if (meta.kind === 'parking') {
        out.parking.push({ id: uid, day: meta.day, lot: meta.lot, price, soldOut: it.is_sold_out });
      } else {
        out.products.push({ id: uid, day: meta.day, zone: meta.zone, audience: meta.audience, limited: meta.limited, price, fee: num(pb.unit_price_service_costs), max: it.max_quantity, soldOut: it.is_sold_out });
      }
    }
  }
  return out;
}

/* ---------- 2. bill: definitieve prijs + betaalmethodes ---------- */
export const getBill = (lines: { id: string; qty: number }[], country = 'NL', paymentMethod?: string) =>
  call<ApiBill>('POST', '/bill', {
    products: lines.map((l) => ({ product: productUri(l.id), quantity: l.qty })),
    consumer: { country },
    ...(paymentMethod ? { payment_method: paymentMethod } : {}),
  });

/* ---------- 3. order aanmaken → betaallink ---------- */
export type OrderInput = {
  lines: { id: string; qty: number }[];
  consumer: { first_name: string; last_name: string; email: string; country: string; date_of_birth?: string; gender?: 0 | 1 | 2 | 9; address?: string; postal_code?: string; city?: string };
  paymentMethod: string;
  shippingMethod?: string;
  optIn?: boolean;
  redirectUrl: string;
  captcha?: string;
};
export const createOrder = (o: OrderInput) =>
  call<ApiOrder>('POST', '/orders', {
    products: o.lines.map((l) => ({ product: productUri(l.id), quantity: l.qty })),
    consumer: o.consumer,
    payment_method: o.paymentMethod,
    ...(o.shippingMethod ? { shipping_method: o.shippingMethod } : {}),
    opt_in: o.optIn ?? false,
    redirect_url: o.redirectUrl,
    ...(o.captcha ? { captcha: o.captcha } : {}),
  });

/* ---------- 4. na terugkomst: status controleren ---------- */
export const getOrder = (uid: string) => call<ApiOrder>('GET', `/orders/${uid}`);

/** Mislukte betaling opnieuw proberen: geeft een checkout_url van Paylogic terug. */
export const retryPayment = (repaymentHref: string) =>
  call<{ checkout_url: string }>('POST', repaymentHref.replace(API, ''));

/* ---------- order-uid onthouden tussen vertrek naar en terugkomst van de betaalpagina ---------- */
const KEY = 'paylogic_order';
export const rememberOrder = (uid: string) => { try { sessionStorage.setItem(KEY, uid); } catch { /* privé-modus */ } };
export const recallOrder = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
export const forgetOrder = () => { try { sessionStorage.removeItem(KEY); } catch { /* */ } };

/** Nederlandse foutmelding voor de koper. */
export function friendly(e: unknown): string {
  if (!(e instanceof PaylogicError)) return 'De verbinding met de ticketverkoop is even weg. Controleer je internet en probeer het opnieuw.';
  switch (e.type) {
    case 'INSUFFICIENT_CONSECUTIVE_SEATS': return 'Er zijn niet genoeg plekken naast elkaar. Kies een ander aantal of een ander vak.';
    case 'CAPTCHA_RATE_LIMIT_REACHED': case 'CAPTCHA_INVALID': return 'Het is druk in de shop. Wacht even en probeer het opnieuw.';
    case 'CONSUMER_MISSING': return 'Er ontbreken gegevens. Controleer je naam, e-mailadres en adres.';
    case 'PAYMENT_METHOD_MISSING': return 'Kies hoe je wilt betalen.';
    case 'VOUCHER_INVALID': return 'Deze code is niet (meer) geldig.';
    case 'EMPTY_BASKET': return 'Je mandje is leeg.';
    case 'NO_TOKEN': return 'De shop is nog niet gekoppeld aan de ticketverkoop.';
    default: return e.status >= 500 ? 'De ticketverkoop is tijdelijk niet bereikbaar. Probeer het zo opnieuw.' : `Er ging iets mis (${e.type}). Probeer het opnieuw.`;
  }
}
