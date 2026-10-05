/**
 * FICTIEF VOORBEELD – geen echte verkoop.
 * Producten, prijzen, programma en indeling zijn overgenomen uit de huidige Paylogic-shop
 * (tickets.schaatsen.nl, gecontroleerd 5 okt 2026). Zondag aangenomen gelijk aan zaterdag.
 * Beschikbaarheid parkeren en mindervaliden volgt het patroon van zaterdag.
 */

export type DayKey = 'vr' | 'za' | 'zo' | 'pp';
export type Zone = 'noord' | 'zuid' | 'west' | 'oost' | 'vip' | 'mv';
export type Group = 'staan' | 'zitten' | 'beleven' | 'toegankelijk';

export const event = {
  name: 'World Cup Kwalificatietoernooi',
  short: 'WCKT',
  dates: '30 okt – 1 nov 2026',
  venue: 'Thialf, Heerenveen',
  doorsNote: 'Thialf is 1,5 uur voor de eerste start open.',
  stakes: 'Wie pakt de startbewijzen voor de World Cups?',
  calStart: '20261030', calEnd: '20261102',
};

export type Day = {
  key: Exclude<DayKey, 'pp'>;
  name: string;      // Vrijdag
  date: string;      // 30 okt
  long: string;      // Vrijdag 30 oktober
  time: string;
  races: string[];
  teaser: string;    // voorpret (OI: anticiperend enthousiasme)
};

export const days: Day[] = [
  { key: 'vr', name: 'Vrijdag', date: '30 okt', long: 'Vrijdag 30 oktober', time: '18:00 – 22:18',
    races: ['5000 m mannen', '1e 500 m mannen', '1500 m vrouwen', '2e 500 m mannen'],
    teaser: 'Avondsessie: de lange 5000 m en twee keer de sprint bij de mannen.' },
  { key: 'za', name: 'Zaterdag', date: '31 okt', long: 'Zaterdag 31 oktober', time: '14:00 – 17:38',
    races: ['3000 m vrouwen', '1e 500 m vrouwen', '1500 m mannen', '2e 500 m vrouwen'],
    teaser: 'Middag vol vrouwensprint en de 1500 m bij de mannen.' },
  { key: 'zo', name: 'Zondag', date: '1 nov', long: 'Zondag 1 november', time: '12:00 – 16:01',
    races: ['10.000 m mannen', '5000 m vrouwen', '1000 m vrouwen', '1000 m mannen', 'Massastart vrouwen', 'Massastart mannen', 'Ploegenachtervolging vrouwen', 'Ploegenachtervolging mannen'],
    teaser: 'Slotdag met 8 onderdelen, van de 10 km tot de massastart.' },
];

export const zoneInfo: Record<Zone, { title: string; place: string; group: Group; pitch: string; vakken?: string; tip?: string; short: string }> = {
  noord: { title: 'Ireen Wüst bocht', short: 'Staan in de bocht, waar het feest is', place: 'Staanplaats Noord', group: 'staan', pitch: 'Staan in de bocht, dicht op de schaatsers. Hier is het feest het luidst.', tip: 'Onze tip voor sfeer' },
  zuid: { title: 'Sven Kramer bocht', short: 'Staan in de bocht, op topsnelheid', place: 'Staanplaats Zuid', group: 'staan', pitch: 'Staan in de bocht waar de schaatsers met topsnelheid langs komen.' },
  west: { title: 'Tribune West', short: 'Zitplaats met overzicht over de baan', place: 'Zitplaats West', group: 'zitten', pitch: 'Vaste zitplaats aan het rechte eind, met overzicht over de hele baan.', vakken: 'Vak K – N' },
  oost: { title: 'Tribune Oost', short: 'Zitplaats aan de finishzijde', place: 'Zitplaats Oost', group: 'zitten', pitch: 'Zitplaats aan de finishzijde. Je ziet elke eindsprint recht voor je.', vakken: 'Vak A – E', tip: 'Onze tip: finish recht voor je' },
  vip: { title: 'VIP-arrangement', short: 'Lounge, catering en zitplaats Oost', place: '2e etage · Zitplaats Oost', group: 'beleven', pitch: 'Ontvangst, lounge met zicht op de baan, catering en een zitplaats aan de finish.' },
  mv: { title: 'Mindervaliden tribune', short: 'Toegankelijke plek met goed zicht', place: 'Bij de Sven Kramer bocht', group: 'toegankelijk', pitch: 'Een toegankelijke plek met goed zicht op de baan.' },
};

export const groups: { key: Group; label: string; hint: string }[] = [
  { key: 'staan', label: 'Staan', hint: 'Sfeer in de bocht' },
  { key: 'zitten', label: 'Zitten', hint: 'Eigen plek, overzicht' },
  { key: 'beleven', label: 'Beleven', hint: 'Alles geregeld' },
  { key: 'toegankelijk', label: 'Toegankelijk', hint: 'Mindervaliden' },
];

export type Audience = 'volw' | 'kids' | 'mv-los' | 'mv-beg';
export const audienceLabel: Record<Audience, string> = {
  volw: 'Volwassene (13+)', kids: 'Kind (6 t/m 12 jaar)', 'mv-los': 'Mindervalide', 'mv-beg': 'Mindervalide + begeleider',
};

export type Product = {
  id: string; day: DayKey; zone: Zone; audience: Audience;
  price: number; fee: number; max: number;
  soldOut?: boolean; limited?: boolean;
};

type Row = [Zone, Audience, number, number, number?];
const dayRows: Row[] = [
  ['noord', 'volw', 25, 2.5], ['noord', 'kids', 12.5, 1],
  ['zuid', 'volw', 25, 2.5], ['zuid', 'kids', 12.5, 1],
  ['west', 'volw', 35, 2.5], ['oost', 'volw', 52, 2.5],
  ['vip', 'volw', 232.87, 2.5, 10],
  ['mv', 'mv-los', 25, 2.5, 2], ['mv', 'mv-beg', 50, 5, 2],
];
const ppRows: Row[] = [
  ['noord', 'volw', 55, 2.5], ['noord', 'kids', 25.5, 1],
  ['zuid', 'volw', 55, 2.5], ['zuid', 'kids', 25.5, 1],
  ['west', 'volw', 85, 2.5],
  ['mv', 'mv-los', 55, 2.5, 2], ['mv', 'mv-beg', 110, 5, 2],
];

/** Zaterdag: mindervaliden uitverkocht (zoals in de echte shop). */
const soldOut = new Set(['za-mv-mv-los', 'za-mv-mv-beg']);

export const products: Product[] = [
  ...(['vr', 'za', 'zo'] as const).flatMap((d) => dayRows.map(([zone, audience, price, fee, max]) => ({
    id: `${d}-${zone}-${audience}`, day: d, zone, audience, price, fee, max: max ?? 10,
    soldOut: soldOut.has(`${d}-${zone}-${audience}`), limited: zone === 'vip',
  }))),
  ...ppRows.map(([zone, audience, price, fee, max]) => ({ id: `pp-${zone}-${audience}`, day: 'pp' as const, zone, audience, price, fee, max: max ?? 10 })),
];

export const kidsRules = ['0 t/m 5 jaar: gratis toegang', '6 t/m 12 jaar: kindticket', '13 jaar en ouder: regulier ticket', 'Er kan om een legitimatiebewijs worden gevraagd.'];

export const vipStack = [
  { t: 'Ontvangst bij de VIP-hospitality balie', s: 'Geen rij, je wordt opgevangen.' },
  { t: 'Exclusieve lounge met zicht op de baan', s: 'Warm binnen, en toch alles zien.' },
  { t: 'Gereserveerde zitplaats Oost', s: 'Aan de start/finishzijde.' },
  { t: 'Volledig verzorgde catering en entertainment', s: 'Eten en drinken zitten erbij.' },
  { t: 'Voor- en nabeschouwing door een oud-topschaatser', s: 'Achter de schermen meekijken.' },
  { t: 'Parkeerticket', s: '1 per 2 VIP-arrangementen.' },
];

/* ---------- parkeren ---------- */
export type ParkingProduct = { id: string; day: Exclude<DayKey, 'pp'>; lot: string; price: number; soldOut: boolean };
const lots = ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const lotSoldOut = new Set(['P2', 'P3', 'P4', 'P7']); // patroon zaterdag
export const parking: ParkingProduct[] = (['vr', 'za', 'zo'] as const).flatMap((d) =>
  lots.map((lot) => ({ id: `park-${d}-${lot}`, day: d, lot, price: 10, soldOut: lotSoldOut.has(lot) })),
);

/* ---------- echte quotes (magievanschaatsen.nl, seizoen '24/25) ---------- */
export const quotes: Record<string, { q: string; who: string }> = {
  noord: { q: 'We staan altijd met vrienden uit Dirkshorn in de Ireen Wüst-bocht, zodat iedereen ons op tv weet te vinden.', who: 'Bianca & Mariëlle, fans' },
  zuid: { q: 'Ik kom voor de sfeer en de ambiance. En het is mooi om persoonlijke records van dichtbij te zien.', who: 'Robert, fan' },
  zitten: { q: 'De gezelligheid en de sfeer, dat maakt Thialf zo magisch.', who: 'Linda en Fily, fans' },
  thialf: { q: 'Als schaatser is het zo bijzonder om voor een vol Thialf te mogen rijden. Echt een tunnel van kabaal waar je doorheen gaat!', who: 'Kjeld Nuis' },
};

export const paymentMethods = [
  { id: 'ideal', name: 'iDEAL' }, { id: 'mc', name: 'Mastercard' }, { id: 'visa', name: 'VISA' }, { id: 'paypal', name: 'PayPal' },
];

export const RESERVATION_MIN = 20;

export const euro = (n: number) => n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
export const dayOf = (k: DayKey) => days.find((d) => d.key === k);
export const productTitle = (p: Product) => zoneInfo[p.zone].title;
export const dayLabel = (k: DayKey) => (k === 'pp' ? 'Passe-partout · alle 3 dagen' : dayOf(k)!.long);

/* ---------- winkel-USP's (bol.com: belofte herhalen door de hele flow) ---------- */
export const usps = ['E-ticket direct in je mail', 'Veilig betalen met iDEAL', 'Kinderen t/m 5 jaar gratis'];

/* ---------- veelgestelde vragen op het moment van twijfel ---------- */
export const faq = [
  { q: 'Wanneer krijg ik mijn tickets?', a: 'Direct na betalen als e-ticket in je mail. Toon ze op je telefoon bij de ingang.' },
  { q: 'Kan ik mijn ticket doorverkopen of overdragen?', a: '[beleid doorverkoop/overdracht aanleveren]' },
  { q: 'Moet mijn kind een ticket hebben?', a: 'Kinderen t/m 5 jaar hebben gratis toegang. Van 6 t/m 12 jaar koop je een kindticket, vanaf 13 jaar een regulier ticket.' },
  { q: 'Hoe laat moet ik er zijn?', a: 'Thialf is 1,5 uur voor de eerste start open. Kom op tijd, zeker op zaterdag en zondag.' },
  { q: 'Wat als ik niet kan komen?', a: 'Met annuleringsbescherming (+€ 2,00 bij afrekenen) krijg je tot 100% terug bij o.a. ziekte of OV-vertraging. Voorwaarden van XCover.' },
];

/** Wat de losse dagen samen kosten t.o.v. de passe-partout (echte rekensom). */
export const ppCompare = (zone: Zone, audience: Audience) => {
  const pp = products.find((p) => p.day === 'pp' && p.zone === zone && p.audience === audience);
  const los = products.filter((p) => p.day !== 'pp' && p.zone === zone && p.audience === audience).reduce((s, p) => s + p.price, 0);
  return pp && los > pp.price ? { pp: pp.price, los, save: Math.round((los - pp.price) * 100) / 100 } : null;
};
