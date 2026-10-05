import type { DayKey, PaylogicEvent, PaymentMethod, ProductMeta, StorefrontProduct, ZoneKey, Audience } from './types';

/**
 * Voorbeelddata.
 * - Events: overgenomen van schaatsen.nl/schaatsfan/tickets/langebaanschaatstickets (okt 2026).
 * - WCKT-producten en -prijzen: overgenomen uit de huidige Paylogic-shop (tickets.schaatsen.nl, 5 okt 2026).
 *   Vrijdag, zaterdag, passe-partout en parkeren gecontroleerd; zondag aangenomen gelijk aan zaterdag.
 * - De overige toernooien hebben in dit prototype nog geen producten.
 */

export const events: PaylogicEvent[] = [
  {
    uid: '7ea4c49ff00f41d3acc549e0fdab376f',
    title: { nl: 'World Cup Kwalificatietoernooi' },
    subtitle: { nl: 'Wie pakt de World Cup-tickets?' },
    start_date: '2026-10-30', end_date: '2026-11-01',
    location: { name: 'Thialf', city: 'Heerenveen' },
    ticketshop_url: 'https://tickets.schaatsen.nl/7ea4c49ff00f41d3acc549e0fdab376f/tickets',
    status: 'on_sale',
  },
  {
    uid: 'f98606597b26473a9dd75d9747fa8ef7',
    title: { nl: 'ISU World Cup 3' },
    subtitle: { nl: 'De wereldtop in Thialf' },
    start_date: '2026-12-04', end_date: '2026-12-06',
    location: { name: 'Thialf', city: 'Heerenveen' },
    ticketshop_url: 'https://tickets.schaatsen.nl/f98606597b26473a9dd75d9747fa8ef7/tickets',
    status: 'on_sale',
  },
  {
    uid: '0a16c472d0284f24bb9a3a1f7d746efa',
    title: { nl: 'NK Allround & Sprint' },
    subtitle: { nl: 'Tussen Kerst en Oud & Nieuw' },
    start_date: '2026-12-27', end_date: '2026-12-28',
    location: { name: 'Thialf', city: 'Heerenveen' },
    ticketshop_url: 'https://tickets.schaatsen.nl/0a16c472d0284f24bb9a3a1f7d746efa/tickets',
    status: 'on_sale',
  },
  {
    uid: 'a1096461a27146138172f9dfc7402c05',
    title: { nl: 'ISU EK Allround & Sprint' },
    subtitle: { nl: 'Europese titels in Thialf' },
    start_date: '2027-01-08', end_date: '2027-01-10',
    location: { name: 'Thialf', city: 'Heerenveen' },
    ticketshop_url: 'https://tickets.schaatsen.nl/a1096461a27146138172f9dfc7402c05/tickets',
    status: 'on_sale',
  },
  {
    uid: '15b22d2a3f7249ce8a7d77c06bd410a9',
    title: { nl: 'NK Afstanden' },
    subtitle: { nl: 'De laatste tickets voor het WK' },
    start_date: '2027-01-22', end_date: '2027-01-24',
    location: { name: 'Thialf', city: 'Heerenveen' },
    ticketshop_url: 'https://tickets.schaatsen.nl/15b22d2a3f7249ce8a7d77c06bd410a9/tickets',
    status: 'on_sale',
  },
];

export const paymentMethods: PaymentMethod[] = [
  { uid: 'pm-ideal', name: 'iDEAL', icon: '🏦' },
  { uid: 'pm-card', name: 'Creditcard', icon: '💳' },
  { uid: 'pm-bancontact', name: 'Bancontact', icon: '🇧🇪' },
  { uid: 'pm-applepay', name: 'Apple Pay', icon: '' },
];

/* ---------- WCKT-producten ---------- */

const dayLabel: Record<Exclude<DayKey, 'pp'>, { long: string; short: string }> = {
  vr: { long: 'Vrijdag 30 oktober', short: '30 okt' },
  za: { long: 'Zaterdag 31 oktober', short: '31 okt' },
  zo: { long: 'Zondag 1 november', short: '1 nov' },
};

type Row = { zone: ZoneKey; audience: Audience; name: string; sub: string; price: number; fee: number; max?: number };

const dayRows: Row[] = [
  { zone: 'noord', audience: 'volwassene', name: 'Ireen Wüst bocht - Noord', sub: 'Staanplaats Noord', price: 25, fee: 2.5 },
  { zone: 'noord', audience: 'kids', name: 'Ireen Wüst bocht - Noord - kids', sub: 'Staanplaats Noord', price: 12.5, fee: 1 },
  { zone: 'zuid', audience: 'volwassene', name: 'Sven Kramer bocht - Zuid', sub: 'Staanplaats Zuid', price: 25, fee: 2.5 },
  { zone: 'zuid', audience: 'kids', name: 'Sven Kramer bocht - Zuid - kids', sub: 'Staanplaats Zuid', price: 12.5, fee: 1 },
  { zone: 'west', audience: 'volwassene', name: 'Zitplaats West', sub: 'Zitplaats West', price: 35, fee: 2.5 },
  { zone: 'oost', audience: 'volwassene', name: 'Zitplaats Oost', sub: 'Zitplaats Oost', price: 52, fee: 2.5 },
  { zone: 'vip', audience: 'volwassene', name: 'VIP-arrangement - 2e etage', sub: 'Zitplaats Oost', price: 232.87, fee: 2.5, max: 10 },
  { zone: 'mv', audience: 'los', name: 'Mindervalide Los', sub: 'Mindervalide', price: 25, fee: 2.5, max: 2 },
  { zone: 'mv', audience: 'begeleider', name: 'Mindervalide + Begeleider', sub: 'Mindervalide', price: 50, fee: 5, max: 2 },
];

const ppRows: Row[] = [
  { zone: 'noord', audience: 'volwassene', name: 'Passe-Partout - Ireen Wüst bocht - Noord', sub: 'Passe-Partout - Staanplaats Noord', price: 55, fee: 2.5 },
  { zone: 'noord', audience: 'kids', name: 'Passe-Partout - Ireen Wüst bocht - Noord - Kids', sub: 'Passe-Partout - Staanplaats Noord', price: 25.5, fee: 1 },
  { zone: 'zuid', audience: 'volwassene', name: 'Passe-Partout - Sven Kramer bocht - Zuid', sub: 'Passe-Partout - Staanplaats Zuid', price: 55, fee: 2.5 },
  { zone: 'zuid', audience: 'kids', name: 'Passe-Partout - Sven Kramer bocht - Zuid - Kids', sub: 'Passe-Partout - Staanplaats Zuid', price: 25.5, fee: 1 },
  { zone: 'west', audience: 'volwassene', name: 'Passe-Partout - Zitplaats West', sub: 'Passe-Partout - Zitplaats West', price: 85, fee: 2.5 },
  { zone: 'mv', audience: 'los', name: 'Passe-Partout - Mindervalide', sub: 'Passe-Partout - Mindervalide', price: 55, fee: 2.5, max: 2 },
  { zone: 'mv', audience: 'begeleider', name: 'Passe-Partout - Mindervalide + Begeleider', sub: 'Passe-Partout - Mindervalide', price: 110, fee: 5, max: 2 },
];

/** Uitverkocht in de huidige shop (zaterdag, gecontroleerd 5 okt 2026). */
const soldOut = new Set(['za-mv-los', 'za-mv-begeleider']);

let n = 0;
const uid = () => (++n).toString(16).padStart(8, '0') + 'a7c94e1b2d3f40aa9e1c5b6d';

/** product-uid → eigen indeling. In productie: config-bestand of CMS, beheerd door marketing. */
export const productMeta: Record<string, ProductMeta> = {};

function make(day: DayKey, r: Row, name: string, sub: string): StorefrontProduct {
  const id = uid();
  productMeta[id] = { day, zone: r.zone, audience: r.audience };
  return {
    uid: id,
    name: { nl: name },
    subtitle: { nl: sub },
    price: { amount: r.price, currency: 'EUR' },
    service_cost: { amount: r.fee, currency: 'EUR' },
    availability: soldOut.has(`${day}-${r.zone}-${r.audience}`) ? 'sold_out' : r.zone === 'vip' ? 'limited' : 'available',
    max_per_order: r.max ?? 10,
  };
}

const wcktProducts: StorefrontProduct[] = [
  ...(['vr', 'za', 'zo'] as const).flatMap((d) =>
    dayRows.map((r) => make(d, r, `${r.name} - ${dayLabel[d].short}`, `${dayLabel[d].long} - ${r.sub}`)),
  ),
  ...ppRows.map((r) => make('pp', r, r.name, r.sub)),
  ...(['vr', 'za', 'zo'] as const).map((d) =>
    make(d, { zone: 'parking', audience: 'auto', name: '', sub: '', price: 10, fee: 0, max: 4 }, `Parkeren Thialf - ${dayLabel[d].short}`, `${dayLabel[d].long} - Parkeerticket (vanaf-prijs)`),
  ),
];

export const storefronts: Record<string, StorefrontProduct[]> = {
  '7ea4c49ff00f41d3acc549e0fdab376f': wcktProducts,
};
