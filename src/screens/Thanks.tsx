import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { audienceLabel, days, dayOf, euro, event, zoneInfo } from '../data/event';
import { Chevrons, Icon, ProtoFooter, ShopBar, TrackRing } from '../components/ui';
import { Price } from '../components/Price';
import { useShop } from '../state';
import { useCatalog } from '../catalog';
import { forgetOrder, friendly, getOrder, recallOrder, retryPayment, type ApiOrder } from '../api/paylogic';

const APP_URL = 'https://dannydevrijer.github.io/Langebaan-Schaats-App/';

function Confetti() {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 3200); return () => clearTimeout(t); }, []);
  if (!on || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const colors = ['#FFFFFF', '#A8CFFD', '#2B4F85', '#FF8A3D'];
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 40 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % 4], animationDelay: `${(i % 10) * 0.08}s`, animationDuration: `${1.8 + (i % 5) * 0.3}s` }} />
      ))}
    </div>
  );
}

export default function Thanks() {
  const { live } = useCatalog();
  if (live) return <LiveThanks />;
  return <MockThanks />;
}

/**
 * Live: de koper komt terug van de betaalpagina van Paylogic. De pagina is dan opnieuw geladen,
 * dus het mandje is weg; we halen de order op met de uid die we vóór het vertrek bewaarden.
 */
function LiveThanks() {
  const { clear } = useShop();
  const [uid] = useState(() => recallOrder());
  const [o, setO] = useState<ApiOrder | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    getOrder(uid).then((x) => { if (alive) { setO(x); if (x.status === 'completed') { clear(); forgetOrder(); } } }).catch((e) => alive && setErr(friendly(e)));
    return () => { alive = false; };
  }, [uid, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = async () => {
    if (!o?._links['shop:repayment']) return;
    setBusy(true);
    try { const r = await retryPayment(o._links['shop:repayment'].href); window.location.assign(r.checkout_url); }
    catch (e) { setErr(friendly(e)); setBusy(false); }
  };

  if (!uid) return <Navigate to="/" replace />;
  if (err) return <main className="screen"><ShopBar /><section className="empty"><Icon name="info" size={40} /><h1 className="display">Even geen verbinding</h1><p className="muted">{err}</p><button type="button" className="btn btn-primary" onClick={() => { setErr(null); setTick((t) => t + 1); }}>Opnieuw proberen</button></section></main>;
  if (!o) return <main className="screen"><ShopBar /><section className="empty"><div className="skeleton" style={{ width: '100%', height: 120 }} /><p className="muted">Je betaling controleren…</p></section></main>;

  if (o.status !== 'completed') {
    const canRetry = Boolean(o._links['shop:repayment']);
    return (
      <main className="screen">
        <ShopBar />
        <section className="empty">
          <Icon name="clock" size={40} />
          <h1 className="display">{o.status === 'canceled' ? 'Betaling niet gelukt' : 'Betaling nog niet bevestigd'}</h1>
          <p className="muted">{o.status === 'canceled' ? 'Je bestelling is geannuleerd. Er is niets afgeschreven.' : 'Soms duurt de bevestiging van de bank even. Vernieuw zo meteen, of probeer opnieuw te betalen.'}</p>
          {canRetry && <button type="button" className="btn btn-primary" disabled={busy} onClick={retry}>{busy ? 'Even geduld…' : 'Opnieuw betalen'}</button>}
          {o.status === 'pending' && <button type="button" className="link-btn center" onClick={() => setTick((t) => t + 1)}>Status vernieuwen</button>}
          <Link to="/" className="link-btn center" onClick={forgetOrder}>Opnieuw beginnen</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="screen">
      <Confetti />
      <ShopBar whyKey="thanks" />
      <section className="done-hero">
        <TrackRing className="ring" />
        <Chevrons className="chev" />
        <span className="eyebrow">Bestelling {o.reference ?? o.uid}</span>
        <h1 className="display">Je bent erbij!</h1>
        <p>Je e-tickets staan in je mail. Toon ze op je telefoon bij de ingang.</p>
      </section>
      <section className="totals-card">
        <div className="grand"><span>Betaald</span><span><Price v={Number(o.grand_total.amount)} /></span></div>
      </section>
      <section className="section">
        <h2 className="display h-sm">Wat nu?</h2>
        <div className="next-list">
          {o._links['shop:etickets'] && <a href={o._links['shop:etickets'].href} target="_blank" rel="noreferrer" className="next"><Icon name="ticket" /><span><b>Download je e-tickets</b><small>Ook per mail verstuurd.</small></span></a>}
          <a href={APP_URL} target="_blank" rel="noreferrer" className="next"><Icon name="pin" /><span><b>Open de schaatsapp</b><small>Programma, favoriete schaatsers en route op de dag zelf.</small></span></a>
        </div>
        <p className="note"><Icon name="info" size={15} /> {event.doorsNote}</p>
      </section>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Terug naar het begin</Link>
    </main>
  );
}

function MockThanks() {
  const { order: o, setQty } = useShop();
  const [offer, setOffer] = useState<'open' | 'nee' | 'ja'>('open');
  const [copied, setCopied] = useState(false);
  if (!o) return <Navigate to="/" replace />;

  const tickets = o.lines.filter((l) => l.kind === 'ticket');
  const hasPark = o.lines.some((l) => l.kind === 'parking');
  const visitDays = new Set(tickets.flatMap((l) => (l.item.day === 'pp' ? ['vr', 'za', 'zo'] : [l.item.day])));
  const firstDay = days.find((d) => visitDays.has(d.key));
  // Bewegwijzering in Thialf gebruikt dezelfde namen als de shop (Ireen Wüst bocht, Tribune West, …)
  const wayfind = [...new Set(tickets.map((l) => zoneInfo[l.item.zone].title))].join('" en "');

  // Eén vervolgaanbod: parkeren als dat ontbreekt
  const upsell = !hasPark && firstDay ? { t: `Toch met de auto naar Thialf op ${firstDay.name.toLowerCase()}?`, s: 'Een parkeerticket kost 10,-. Je kunt hem nu nog toevoegen.' } : null;

  const share = async () => {
    const text = `Ik ga naar het ${event.name} in Thialf (${event.dates})! Ga je mee?`;
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  };

  const ics = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART;VALUE=DATE:${event.calStart}`, `DTEND;VALUE=DATE:${event.calEnd}`, `SUMMARY:${event.name}`, 'LOCATION:Thialf, Heerenveen', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'));

  return (
    <main className="screen">
      <Confetti />
      <ShopBar whyKey="thanks" />
      <section className="done-hero">
        <TrackRing className="ring" />
        <Chevrons className="chev" />
        <span className="eyebrow">Bestelling {o.id}</span>
        <h1 className="display">Je bent erbij, {o.firstName}!</h1>
        <p>Je tickets staan in je mail op <b>{o.email}</b>. Toon ze op je telefoon bij de ingang.</p>
      </section>

      <section className="totals-card">
        {o.lines.map((l) => (
          <div key={l.item.id}>
            <span>{l.qty}× {l.kind === 'ticket' ? `${zoneInfo[l.item.zone].title} · ${l.item.day === 'pp' ? 'alle dagen' : dayOf(l.item.day)!.name.toLowerCase()}` : `Parkeren ${l.item.lot} · ${dayOf(l.item.day)!.name.toLowerCase()}`}{l.kind === 'ticket' && l.item.audience !== 'volw' ? ` (${audienceLabel[l.item.audience].split(' (')[0].toLowerCase()})` : ''}</span>
            <span><Price v={l.item.price * l.qty} /></span>
          </div>
        ))}
        {o.protection && <div><span>Annuleringsbescherming</span><span>{euro(2)}</span></div>}
        <div className="grand"><span>Betaald met {o.method}</span><span><Price v={o.total} /></span></div>
      </section>

      {upsell && offer === 'open' && (
        <aside className="offer">
          <strong>{upsell.t}</strong>
          <p>{upsell.s}</p>
          <div className="offer-btns">
            <button type="button" className="btn btn-primary sm" onClick={() => { const p = `park-${firstDay!.key}-P5`; setQty(p, 1); setOffer('ja'); }}>Ja, voeg toe</button>
            <button type="button" className="btn btn-ghost sm" onClick={() => setOffer('nee')}>Nee, bedankt</button>
          </div>
        </aside>
      )}
      {offer === 'ja' && <p className="note ok"><Icon name="check" size={15} /> Parkeerticket P5 staat in een nieuw mandje. <Link to="/winkelmand"><u>Afrekenen</u></Link></p>}

      <section className="section">
        <h2 className="display h-sm">Wat nu?</h2>
        <div className="next-list">
          <a href={ics} download="wckt-2026.ics" className="next"><Icon name="cal" /><span><b>Zet in je agenda</b><small>{firstDay ? `${firstDay.long} · ${firstDay.time}` : event.dates}</small></span></a>
          <button type="button" className="next" onClick={share}><Icon name="share" /><span><b>{copied ? 'Bericht gekopieerd' : 'Ga je met vrienden?'}</b><small>{copied ? 'Plak het in je groepsapp.' : 'Kopieer een berichtje voor je groepsapp.'}</small></span></button>
          <a href={APP_URL} target="_blank" rel="noreferrer" className="next"><Icon name="pin" /><span><b>Open de schaatsapp</b><small>Programma, favoriete schaatsers en route op de dag zelf.</small></span></a>
        </div>
        <p className="note"><Icon name="info" size={15} /> {event.doorsNote}{wayfind ? ` In Thialf volg je de borden "${wayfind}".` : ''}</p>
      </section>

      <section className="again">
        <TrackRing className="ring" />
        <span className="display again-t">Tot ziens!</span>
        <p><b>Zien we jou bij het volgende toernooi?</b> Alle schaatstoernooien in Thialf en de ticketverkoop staan op schaatsen.nl/tickets.</p>
        <a href="https://schaatsen.nl/tickets" target="_blank" rel="noreferrer" className="btn btn-secondary sm">Bekijk de schaatskalender</a>
      </section>

      <ProtoFooter text="Fictief voorbeeld. Er is niets besteld of betaald." />
      <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Terug naar het begin</Link>
    </main>
  );
}
