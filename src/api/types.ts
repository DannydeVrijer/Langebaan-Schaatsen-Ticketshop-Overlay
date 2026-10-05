/**
 * Types die de Paylogic Shopping Service API volgen (vereenvoudigd).
 * Bron: https://shopping-api-docs.paylogic.com/
 *
 * - Event       → GET  /events, GET /events/{uid}
 * - Storefront  → GET  /storefront?event=…   (alle producten, prijzen, beschikbaarheid)
 * - Bill        → GET  /bill?products=…      (totaalbedrag incl. kosten vóór de order)
 * - Order       → POST /orders               (geeft een `payment`-link terug)
 *
 * Paylogic kent geen "tribunevak" of "dag" als veld. Die indeling leggen wij
 * zelf vast in `ProductMeta` (eigen configuratie, gekoppeld op product-uid).
 */

export type I18n = { nl: string; en?: string };
export type Amount = { amount: number; currency: 'EUR' };

export type PaylogicEvent = {
  uid: string;
  title: I18n;
  subtitle?: I18n;
  start_date: string; // ISO
  end_date: string;
  location: { name: string; city: string };
  /** Link naar de standaard Paylogic-shop – onze fallback als de eigen shop uitvalt. */
  ticketshop_url: string;
  status: 'on_sale' | 'not_on_sale_yet' | 'sold_out' | 'ended';
};

export type StorefrontProduct = {
  uid: string;
  name: I18n;
  subtitle: I18n;
  price: Amount;          // incl. servicekosten, zoals Paylogic toont
  service_cost: Amount;
  availability: 'available' | 'sold_out' | 'limited';
  max_per_order: number;
};

export type PaymentMethod = { uid: string; name: string; icon: string };

export type Storefront = {
  event: string; // uid
  products: StorefrontProduct[];
  payment_methods: PaymentMethod[];
};

/* ---------- eigen configuratie (niet uit Paylogic) ---------- */

export type DayKey = 'vr' | 'za' | 'zo' | 'pp';
export type ZoneKey = 'noord' | 'zuid' | 'west' | 'oost' | 'vip' | 'mv' | 'parking';
export type Audience = 'volwassene' | 'kids' | 'begeleider' | 'los' | 'auto';

export type ProductMeta = { day: DayKey; zone: ZoneKey; audience: Audience };

export type ShopProduct = StorefrontProduct & ProductMeta;

/* ---------- order ---------- */

export type BillLine = { product: string; quantity: number; total: Amount };
export type Bill = { lines: BillLine[]; service_cost: Amount; total: Amount };

export type OrderRequest = {
  products: { product: string; quantity: number }[];
  consumer: { first_name: string; last_name: string; email: string; country: string };
  payment_method: string;
  redirect_url: string;
};

export type Order = {
  uid: string;
  status: 'pending' | 'completed' | 'failed';
  total: Amount;
  _links: { payment: { href: string } };
};

export type ApiLogEntry = {
  id: number;
  method: 'GET' | 'POST' | 'REDIRECT';
  path: string;
  note: string;
  ms: number;
  at: Date;
};
