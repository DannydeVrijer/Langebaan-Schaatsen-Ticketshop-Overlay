import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { DayKey, PaylogicEvent, ShopProduct, ZoneKey } from '../api/types';
import { ThialfMap, type ZoneInfo } from '../components/ThialfMap';
import { Icon, Stepper, Steps, TopBar, nlDate } from '../components/ui';
import { audienceLabel, days, zones } from '../data/zones';
import { euro, useShop } from '../state';

type Z = Exclude<ZoneKey, 'parking'>;
const zoneOrder: Z[] = ['noord', 'zuid', 'west', 'oost', 'vip', 'mv'];

export default function Shop() {
  const { uid = '' } = useParams();
  const nav = useNavigate();
  const shop = useShop();
  const [event, setEvent] = useState<PaylogicEvent | null>(null);
  const [loading, setLoading] = useState(shop.eventUid !== uid);
  const [error, setError] = useState(false);
  const [day, setDay] = useState<DayKey>('za');
  const [zone, setZone] = useState<Z | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.listEvents().then((ev) => alive && setEvent(ev.find((e) => e.uid === uid) ?? null)).catch(() => {});
    if (shop.eventUid !== uid) {
      setLoading(true);
      api.getStorefront(uid)
        .then((sf) => { if (alive) { shop.setCatalog(uid, sf.products, sf.payment_methods); setLoading(false); } })
        .catch(() => { if (alive) { setError(true); setLoading(false); } });
    }
    return () => { alive = false; };
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t); } }, [toast]);

  const products = shop.products;
  const tickets = products.filter((p) => p.zone !== 'parking');
  const ofDay = (d: DayKey) => tickets.filter((p) => p.day === d);

  const zoneInfo = useMemo(() => {
    const out = {} as Record<Z, ZoneInfo | undefined>;
    for (const z of zoneOrder) {
      const ps = ofDay(day).filter((p) => p.zone === z);
      if (!ps.length) continue;
      const avail = ps.filter((p) => p.availability !== 'sold_out');
      const adult = avail.filter((p) => p.audience !== 'kids');
      out[z] = { from: avail.length ? Math.min(...(adult.length ? adult : avail).map((p) => p.price.amount)) : null, soldOut: !avail.length };
    }
    return out;
  }, [products, day]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zone resetten als die op de gekozen dag niet bestaat.
  useEffect(() => { if (zone && !zoneInfo[zone]) setZone(null); }, [zone, zoneInfo]);

  const dayFrom = (d: DayKey) => {
    const a = ofDay(d).filter((p) => p.availability !== 'sold_out' && p.audience !== 'kids').map((p) => p.price.amount);
    return a.length ? Math.min(...a) : null;
  };

  /* ---------- passe-partout-tip: zelfde vak op 2+ dagen ---------- */
  const ppTip = useMemo(() => {
    const groups = new Map<string, ShopProduct[]>();
    for (const p of tickets) {
      if (p.day === 'pp' || !shop.qty[p.uid]) continue;
      const k = `${p.zone}|${p.audience}`;
      groups.set(k, [...(groups.get(k) ?? []), p]);
    }
    for (const [k, ps] of groups) {
      if (ps.length < 2) continue;
      const [z, a] = k.split('|');
      const pp = tickets.find((p) => p.day === 'pp' && p.zone === z && p.audience === a && p.availability !== 'sold_out');
      if (!pp) continue;
      const n = Math.min(...ps.map((p) => shop.qty[p.uid]));
      const dayCost = ps.reduce((s, p) => s + p.price.amount * n, 0);
      const ppCost = pp.price.amount * n;
      return { pp, ps, n, dayCost, ppCost, nDays: ps.length };
    }
    return null;
  }, [tickets, shop.qty]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPp = () => {
    if (!ppTip) return;
    const { pp, ps, n } = ppTip;
    ps.forEach((p) => shop.setQty(p.uid, shop.qty[p.uid] - n));
    shop.setQty(pp.uid, (shop.qty[pp.uid] ?? 0) + n);
    setToast(`Omgezet naar ${n}× passe-partout`);
  };

  /* ---------- parkeren: voor de dagen in je mandje ---------- */
  const cartDays = new Set(shop.lines.filter((l) => l.product.zone !== 'parking').flatMap((l) => (l.product.day === 'pp' ? ['vr', 'za', 'zo'] : [l.product.day])));
  const parking = products.filter((p) => p.zone === 'parking' && cartDays.has(p.day));

  if (!loading && !error && products.length === 0) {
    return (
      <main className="screen">
        <TopBar back={{ to: '/', label: 'Alle toernooien' }} />
        <h1 className="display" style={{ fontSize: 32 }}>{event?.title.nl ?? 'Toernooi'}</h1>
        <div className="card" style={{ marginTop: 18 }}>
          <p>In dit prototype zijn voor dit toernooi nog geen producten ingeladen.</p>
          {event && <a className="btn btn-secondary" href={event.ticketshop_url} target="_blank" rel="noreferrer">Naar de huidige ticketshop <Icon name="chev" /></a>}
        </div>
      </main>
    );
  }

  const zoneProducts = zone ? ofDay(day).filter((p) => p.zone === zone) : [];

  return (
    <main className="screen has-cart">
      <TopBar back={{ to: '/', label: 'Alle toernooien' }} />

      <header className="shop-head">
        <span className="eyebrow">{event ? `${event.location.name} · ${event.location.city}` : ' '}</span>
        <h1 className="display">{event?.title.nl ?? '…'}</h1>
        {event && (
          <p className="small muted meta-row">
            <span><Icon name="cal" size={15} /> {nlDate(event.start_date, { day: 'numeric', month: 'short' })} – {nlDate(event.end_date, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><Icon name="pin" size={15} /> Thialf</span>
          </p>
        )}
      </header>

      <Steps at={1} />

      {error && (
        <div className="alert">
          De ticketverkoop is even niet bereikbaar.{' '}
          {event && <a href={event.ticketshop_url} target="_blank" rel="noreferrer"><u>Koop via de standaard ticketshop</u></a>}
        </div>
      )}

      {/* 1. dag */}
      <section className="section">
        <div className="section-head"><h2 className="display">1. Kies je dag</h2></div>
        <div className="day-grid" role="radiogroup" aria-label="Dag">
          {days.map((d) => {
            const f = dayFrom(d.key);
            return (
              <button key={d.key} type="button" role="radio" aria-checked={day === d.key} className={`day-btn ${day === d.key ? 'on' : ''} ${d.key === 'pp' ? 'pp' : ''}`} onClick={() => setDay(d.key)} disabled={loading}>
                <span className="t">{d.label}</span>
                <span className="s">{d.sub}</span>
                <span className="p">{loading ? '…' : f != null ? `vanaf ${euro(f)}` : 'uitverkocht'}</span>
                {d.key === 'pp' && <span className="tag">Voordeligst</span>}
              </button>
            );
          })}
        </div>
        <p className="small faint" style={{ marginTop: 8 }}>{days.find((d) => d.key === day)?.program}</p>
      </section>

      {/* 2. vak */}
      <section className="section">
        <div className="section-head"><h2 className="display">2. Kies je plek</h2><span className="small faint">Tik op een vak</span></div>
        <div className="map-card">
          {loading ? <div className="skeleton" style={{ height: 320 }} /> : <ThialfMap info={zoneInfo} selected={zone} onSelect={(z) => setZone(z)} />}
        </div>
        <div className="zone-chips" role="radiogroup" aria-label="Vak">
          {zoneOrder.filter((z) => zoneInfo[z]).map((z) => (
            <button key={z} type="button" role="radio" aria-checked={zone === z} className={`chip ${zone === z ? 'on' : ''}`} disabled={zoneInfo[z]?.soldOut} onClick={() => setZone(z)}>
              {zones[z].short} · {zoneInfo[z]?.soldOut ? 'uitverkocht' : euro(zoneInfo[z]!.from!)}
            </button>
          ))}
        </div>
      </section>

      {/* 3. aantallen */}
      {zone && (
        <section className="section zone-detail" aria-live="polite">
          <div className="card highlight">
            <div className="card-title-row">
              <div>
                <span className="eyebrow">{zones[zone].kind} · {days.find((d) => d.key === day)?.label}</span>
                <h3 className="display" style={{ fontSize: 24, marginTop: 4 }}>{zones[zone].title}</h3>
              </div>
            </div>
            <p className="muted small">{zones[zone].pitch}</p>
            <div className="chips" style={{ margin: '10px 0 6px' }}>
              {zones[zone].usps.map((u) => <span key={u} className="chip sm"><Icon name="check" size={12} /> {u}</span>)}
            </div>
            <div className="divider" />
            <div className="prod-list">
              {zoneProducts.map((p) => (
                <div key={p.uid} className={`prod ${p.availability === 'sold_out' ? 'sold' : ''}`}>
                  <div className="info">
                    <span className="n">{audienceLabel[p.audience]}</span>
                    <span className="s">
                      {euro(p.price.amount)} <span className="faint">incl. {euro(p.service_cost.amount)} servicekosten</span>
                    </span>
                    {p.availability === 'limited' && <span className="scarcity">Beperkt beschikbaar</span>}
                  </div>
                  {p.availability === 'sold_out' ? (
                    <button type="button" className="wait-btn" onClick={() => setToast('Je staat op de wachtlijst [koppeling Paylogic wachtlijst]')}>Wachtlijst</button>
                  ) : (
                    <Stepper value={shop.qty[p.uid] ?? 0} max={p.max_per_order} onChange={(n) => shop.setQty(p.uid, n)} label={audienceLabel[p.audience]} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* slimme tip */}
      {ppTip && (
        <section className="section">
          <div className="tip">
            <Icon name="spark" size={22} />
            <div>
              <strong>{ppTip.ppCost < ppTip.dayCost ? `Bespaar ${euro(ppTip.dayCost - ppTip.ppCost)} met een passe-partout` : `Voor ${euro(ppTip.ppCost - ppTip.dayCost)} extra kom je alle 3 de dagen`}</strong>
              <p className="small">Je hebt {zones[ppTip.pp.zone as Z].short} op {ppTip.nDays} dagen. Een passe-partout kost {euro(ppTip.pp.price.amount)} p.p. voor het hele weekend.</p>
              <button type="button" className="btn btn-primary sm" onClick={applyPp}>Zet om naar passe-partout</button>
            </div>
          </div>
        </section>
      )}

      {/* upsell parkeren */}
      {parking.length > 0 && (
        <section className="section">
          <div className="section-head"><h2 className="display">Met de auto?</h2></div>
          <div className="card">
            {parking.map((p) => (
              <div key={p.uid} className="prod">
                <div className="info">
                  <span className="n"><Icon name="car" size={16} /> {p.subtitle.nl.split(' - ')[0]}</span>
                  <span className="s">vanaf {euro(p.price.amount)} · parkeer direct bij Thialf</span>
                </div>
                <Stepper value={shop.qty[p.uid] ?? 0} max={p.max_per_order} onChange={(n) => shop.setQty(p.uid, n)} label="parkeertickets" />
              </div>
            ))}
          </div>
        </section>
      )}

      {event && (
        <p className="proto-note">
          Liever de vertrouwde shop? <a href={event.ticketshop_url} target="_blank" rel="noreferrer"><u>Ga naar de standaard ticketshop</u></a>
        </p>
      )}

      {/* sticky winkelmand */}
      <div className={`cart-bar ${shop.count ? 'show' : ''}`} aria-hidden={!shop.count}>
        <div className="sum">
          <span className="c">{shop.count} {shop.count === 1 ? 'item' : 'items'}</span>
          <span className="t">{euro(shop.total)}</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => nav('/gegevens')} tabIndex={shop.count ? 0 : -1}>Verder <Icon name="chev" /></button>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
