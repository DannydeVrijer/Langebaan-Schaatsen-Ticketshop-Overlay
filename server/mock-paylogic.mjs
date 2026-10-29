/**
 * Nep-Paylogic voor lokaal testen van de live-route (geen echte API nodig).
 * Bootst /storefront, /bill, /orders, /orders/{uid}, repayment en een betaalpagina na,
 * met de WCKT-producten en -prijzen uit de huidige shop.
 *
 *   node server/mock-paylogic.mjs            → http://localhost:8788
 *   VITE_PAYLOGIC_API=http://localhost:8788 VITE_PAYLOGIC_TOKEN=test VITE_PAYLOGIC_EVENT=test npm run dev
 */
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 8788);
const API = `http://localhost:${PORT}`;

const dayNames = { vr: '30 okt', za: '31 okt', zo: '1 nov' };
const rows = [
  ['Ireen Wüst bocht - Noord', 25, 2.5], ['Ireen Wüst bocht - Noord - kids', 12.5, 1],
  ['Sven Kramer bocht - Zuid', 25, 2.5], ['Sven Kramer bocht - Zuid - kids', 12.5, 1],
  ['Zitplaats West', 35, 2.5], ['Zitplaats Oost', 52, 2.5], ['VIP-arrangement - 2e etage', 232.87, 2.5],
  ['Mindervalide Los', 25, 2.5], ['Mindervalide + Begeleider', 50, 5],
];
const pp = [['Passe-Partout - Ireen Wüst bocht - Noord', 55, 2.5], ['Passe-Partout - Ireen Wüst bocht - Noord - Kids', 25.5, 1], ['Passe-Partout - Sven Kramer bocht - Zuid', 55, 2.5], ['Passe-Partout - Sven Kramer bocht - Zuid - Kids', 25.5, 1], ['Passe-Partout - Zitplaats West', 85, 2.5], ['Passe-Partout - Mindervalide', 55, 2.5], ['Passe-Partout - Mindervalide + Begeleider', 110, 5]];

let n = 0;
const uid = () => (++n).toString(16).padStart(4, '0') + 'd9f3e2a1b4c5d6e7f8a9b0c1d2e3f4a5'.slice(4);
const products = [];
const add = (name, price, fee, soldOut = false, max = 10) => products.push({ uid: uid(), name, price, fee, soldOut, max });
for (const d of ['vr', 'za', 'zo']) for (const [name, price, fee] of rows) add(`${name} - ${dayNames[d]}`, price, fee, d === 'za' && /Mindervalide/.test(name), /VIP|Minder/.test(name) ? 2 : 10);
for (const [name, price, fee] of pp) add(name, price, fee);
for (const d of ['vr', 'za', 'zo']) for (const lot of ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']) add(`Parkeerticket ${lot} - ${dayNames[d]}`, 10, 0, ['P2', 'P3', 'P4', 'P7'].includes(lot), 4);
const byUid = new Map(products.map((p) => [p.uid, p]));

const amt = (v) => ({ amount: v.toFixed(2), currency: 'EUR' });
const pm = (country) => country ? [
  { uid: 'pm-ideal', name: { nl: 'iDEAL', en: 'iDEAL' }, costs: amt(0), required_consumer_fields: ['first_name', 'last_name', 'email', 'country'] },
  { uid: 'pm-card', name: { nl: 'Creditcard', en: 'Credit card' }, costs: amt(0.5), required_consumer_fields: ['first_name', 'last_name', 'email', 'country'] },
  { uid: 'pm-paypal', name: { nl: 'PayPal', en: 'PayPal' }, costs: amt(0), required_consumer_fields: ['first_name', 'last_name', 'email', 'country', 'date_of_birth', 'address', 'postal_code', 'city'] },
] : [];

const orders = new Map();
const err = (res, status, type, message) => json(res, status, { logref: 'x', type, message, _links: { help: { href: 'https://shopping-api-docs.paylogic.com/' } } });
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/hal+json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }); res.end(JSON.stringify(body)); };
const readJson = (req) => new Promise((r) => { let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => { try { r(JSON.parse(s || '{}')); } catch { r({}); } }); });

const billFor = (items, country, paymentMethod) => {
  const lines = items.map((it) => { const p = byUid.get(String(it.product).split('/').pop()); return p ? { p, q: it.quantity } : null; }).filter(Boolean);
  const total = lines.reduce((s, l) => s + l.p.price * l.q, 0);
  const fees = lines.reduce((s, l) => s + l.p.fee * l.q, 0);
  const m = pm(country).find((x) => x.uid === paymentMethod);
  const cost = m ? Number(m.costs.amount) : 0;
  return { lines, total, fees, cost, bill: { total: amt(total), ...(m ? { grand_total: amt(total + cost) } : {}), service_costs: { total: amt(fees) }, available_payment_methods: pm(country), available_shipping_methods: [{ uid: 'sm-eticket', name: { nl: 'E-ticket' }, costs: amt(0), required_consumer_fields: ['email'] }] } };
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, API);
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!/^Bearer /.test(req.headers.authorization ?? '') && !url.pathname.startsWith('/pay/')) return err(res, 403, 'FORBIDDEN', 'Geen geldig token');

  if (req.method === 'GET' && url.pathname === '/storefront') {
    return json(res, 200, {
      should_display_service_costs: true, min_per_order: 1, max_per_order: 10, captcha: null,
      categories: [{ name: null, items: products.map((p) => ({ product: `${API}/products/${p.uid}`, is_sold_out: p.soldOut, min_quantity: 1, max_quantity: p.max, unit_price: amt(p.price), price_breakdown: { unit_price_including_service_costs: amt(p.price), unit_price_excluding_service_costs: amt(p.price - p.fee), unit_price_service_costs: amt(p.fee) } })) }],
      _embedded: { 'shop:product': products.map((p) => ({ uid: p.uid, name: { nl: p.name }, _links: { self: { href: `${API}/products/${p.uid}` } } })) },
    });
  }
  if (req.method === 'POST' && url.pathname === '/bill') {
    const b = await readJson(req);
    return json(res, 200, billFor(b.products ?? [], b.consumer?.country, b.payment_method).bill);
  }
  if (req.method === 'POST' && url.pathname === '/orders') {
    const b = await readJson(req);
    if (!b.products?.length) return err(res, 400, 'EMPTY_BASKET', 'No products');
    if (!b.payment_method) return err(res, 400, 'PAYMENT_METHOD_MISSING', 'Payment method required');
    if (!b.consumer?.email || !b.consumer?.first_name) return err(res, 400, 'CONSUMER_MISSING', 'Consumer data missing');
    if (b.consumer.first_name === 'Druk') return err(res, 400, 'CAPTCHA_RATE_LIMIT_REACHED', 'Rate limit');
    const { total, cost } = billFor(b.products, b.consumer.country, b.payment_method);
    const id = uid();
    const o = { uid: id, reference: 'WCKT-' + id.slice(0, 6).toUpperCase(), status: 'pending', grand_total: amt(total + cost), redirect: b.redirect_url, _links: { self: { href: `${API}/orders/${id}` }, payment: { href: `${API}/pay/${id}` } } };
    orders.set(id, o);
    return json(res, 201, o);
  }
  const m = url.pathname.match(/^\/orders\/([^/]+)(\/repayment)?$/);
  if (m && orders.has(m[1])) {
    const o = orders.get(m[1]);
    if (m[2] && req.method === 'POST') { o.status = 'pending'; return json(res, 200, { checkout_url: `${API}/pay/${o.uid}` }); }
    const links = { self: o._links.self, ...(o.status === 'completed' ? { 'shop:etickets': { href: `${API}/etickets/${o.uid}` } } : { payment: o._links.payment, 'shop:repayment': { href: `${API}/orders/${o.uid}/repayment` } }) };
    return json(res, 200, { uid: o.uid, reference: o.reference, status: o.status, grand_total: o.grand_total, _links: links });
  }
  // nep-betaalpagina (geen token nodig; de koper ziet deze)
  const pay = url.pathname.match(/^\/pay\/([^/]+)$/);
  if (pay && orders.has(pay[1])) {
    const o = orders.get(pay[1]);
    const r = url.searchParams.get('result');
    if (r) { o.status = r === 'ok' ? 'completed' : 'canceled'; res.writeHead(302, { Location: o.redirect }); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<!doctype html><meta name=viewport content="width=device-width"><body style="font:16px system-ui;background:#f4f4f4;padding:40px;max-width:420px;margin:auto"><h2>Nep-betaalpagina (Paylogic)</h2><p>Order ${o.reference} · ${o.grand_total.amount} EUR</p><p><a id=ok href="?result=ok" style="display:block;padding:14px;background:#cc0066;color:#fff;text-align:center;text-decoration:none;border-radius:8px">Betaal met iDEAL (gelukt)</a></p><p><a id=fail href="?result=fail" style="display:block;padding:14px;border:1px solid #999;text-align:center;text-decoration:none;border-radius:8px;color:#333">Annuleren</a></p></body>`);
  }
  err(res, 404, 'NOT_FOUND', 'Not found');
}).listen(PORT, () => console.log(`Nep-Paylogic op ${API}`));
