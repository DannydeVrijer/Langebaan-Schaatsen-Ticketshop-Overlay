import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { audienceLabel, days, dayOf, euro, event, zoneInfo } from '../data/event';
import { Chevrons, Icon, ProtoFooter, ShopBar, TrackRing } from '../components/ui';
import { Price } from '../components/Price';
import { useShop } from '../state';

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
  const { order: o, setQty } = useShop();
  const [offer, setOffer] = useState<'open' | 'nee' | 'ja'>('open');
  const [copied, setCopied] = useState(false);
  if (!o) return <Navigate to="/" replace />;

  const tickets = o.lines.filter((l) => l.kind === 'ticket');
  const hasPark = o.lines.some((l) => l.kind === 'parking');
  const visitDays = new Set(tickets.flatMap((l) => (l.item.day === 'pp' ? ['vr', 'za', 'zo'] : [l.item.day])));
  const firstDay = days.find((d) => visitDays.has(d.key));

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
        <p className="note"><Icon name="info" size={15} /> {event.doorsNote}</p>
      </section>

      <ProtoFooter text="Fictief voorbeeld. Er is niets besteld of betaald." />
      <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Terug naar het begin</Link>
    </main>
  );
}
