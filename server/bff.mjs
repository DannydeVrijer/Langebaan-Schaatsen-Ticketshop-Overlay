/**
 * Backend-for-frontend (BFF) – VOORBEELD, niet getest tegen de echte Paylogic-API.
 *
 * Waarom: de Paylogic-inloggegevens mogen nooit in de browser staan. De shop praat
 * met deze server; deze server praat met shopping-api.paylogic.com.
 *
 * Starten:
 *   PAYLOGIC_USER=… PAYLOGIC_PASS=… SHOP_ORIGIN=https://tickets.jouwdomein.nl node server/bff.mjs
 * Daarna de shop bouwen met:  VITE_API_BASE=http://localhost:8787 npm run build
 *
 * Controleer vóór gebruik in de Paylogic-docs: authenticatievorm (basic / bearer),
 * exacte request-velden voor /orders en /bill, en de rate limits van jullie account.
 * Zonder dependencies (Node 20+), zodat het overal draait (VM, container, serverless).
 */
import http from 'node:http';

const API = process.env.PAYLOGIC_API ?? 'https://shopping-api.paylogic.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.PAYLOGIC_USER ?? ''}:${process.env.PAYLOGIC_PASS ?? ''}`).toString('base64');
const ORIGIN = process.env.SHOP_ORIGIN ?? 'http://localhost:5173';
const PORT = Number(process.env.PORT ?? 8787);

/* Korte cache: bij een verkoopstart vragen duizenden mensen tegelijk dezelfde storefront op.
   Eén aanroep per 10 s naar Paylogic in plaats van duizenden. Beschikbaarheid wordt bij
   /bill en /orders altijd live gecontroleerd, dus een paar seconden vertraging is acceptabel. */
const cache = new Map();
const TTL = { events: 60_000, storefront: 10_000 };

async function paylogic(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: AUTH, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function cached(key, ttl, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = await fn();
  if (value.status === 200) cache.set(key, { at: Date.now(), value });
  return value;
}

const readJson = (req) => new Promise((resolve, reject) => {
  let s = '';
  req.on('data', (c) => { s += c; if (s.length > 20_000) reject(new Error('te groot')); });
  req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
});

const uidOk = (v) => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v);

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  const url = new URL(req.url ?? '/', 'http://x');
  const send = ({ status, body }) => res.writeHead(status, { 'Content-Type': 'application/json' }).end(body);

  try {
    if (req.method === 'GET' && url.pathname === '/events') {
      return send(await cached('events', TTL.events, () => paylogic('GET', '/events')));
    }
    if (req.method === 'GET' && url.pathname === '/storefront') {
      const ev = url.searchParams.get('event');
      if (!uidOk(ev)) return send({ status: 400, body: '{"error":"event"}' });
      return send(await cached(`sf:${ev}`, TTL.storefront, () => paylogic('GET', `/storefront?event=${API}/events/${ev}`)));
    }
    if (req.method === 'POST' && url.pathname === '/bill') {
      const { products = [] } = await readJson(req);
      const q = products.filter((p) => uidOk(p.product) && Number.isInteger(p.quantity) && p.quantity > 0 && p.quantity <= 10)
        .map((p) => `products=${encodeURIComponent(`${API}/products/${p.product},${p.quantity}`)}`).join('&');
      return send(await paylogic('GET', `/bill?${q}`));
    }
    if (req.method === 'POST' && url.pathname === '/orders') {
      const b = await readJson(req);
      // Alleen bekende velden doorgeven; de prijs bepaalt Paylogic, nooit de browser.
      const order = {
        products: (b.products ?? []).filter((p) => uidOk(p.product)).map((p) => ({ product: `${API}/products/${p.product}`, quantity: Math.min(10, Number(p.quantity) || 0) })),
        consumer: { ...b.consumer, ip: req.socket.remoteAddress },
        payment_method: b.payment_method,
        redirect_url: b.redirect_url?.startsWith(ORIGIN) ? b.redirect_url : ORIGIN,
      };
      return send(await paylogic('POST', '/orders', order));
    }
    send({ status: 404, body: '{"error":"not found"}' });
  } catch (e) {
    console.error(e);
    send({ status: 502, body: '{"error":"upstream"}' });
  }
}).listen(PORT, () => console.log(`BFF op http://localhost:${PORT} → ${API}`));
