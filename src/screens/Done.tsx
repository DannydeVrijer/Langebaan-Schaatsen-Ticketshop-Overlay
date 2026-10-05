import { Link, Navigate } from 'react-router-dom';
import { Chevrons, Icon, TopBar, TrackRing } from '../components/ui';
import { euro, useShop } from '../state';
import { lineTitle } from './Checkout';

const APP_URL = 'https://dannydevrijer.github.io/Langebaan-Schaats-App/';

function icsHref() {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//schaatsen//ticketshop//NL', 'BEGIN:VEVENT',
    'UID:wckt-2026@schaatsen', 'DTSTART;VALUE=DATE:20261030', 'DTEND;VALUE=DATE:20261102',
    'SUMMARY:World Cup Kwalificatietoernooi – Thialf', 'LOCATION:Thialf, Heerenveen', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}

export default function Done() {
  const { lastOrder: o } = useShop();
  if (!o) return <Navigate to="/" replace />;
  const needsName = o.lines.some((l) => l.product.zone !== 'parking');

  return (
    <main className="screen">
      <TopBar />
      <section className="done-hero">
        <TrackRing className="ring" />
        <Chevrons className="chev" />
        <span className="eyebrow">Bestelling {o.uid}</span>
        <h1 className="display">Je bent<br />erbij, {o.consumer.first_name}!</h1>
        <p className="muted">We sturen je tickets naar <strong>{o.consumer.email}</strong>.</p>
      </section>

      <section className="card">
        {o.lines.map((l) => (
          <div key={l.product.uid} className="done-line">
            <span>{l.quantity}× {lineTitle(l.product)}</span>
            <span>{euro(l.product.price.amount * l.quantity)}</span>
          </div>
        ))}
        <div className="divider" />
        <div className="done-line"><strong>Betaald</strong><strong>{euro(o.total)}</strong></div>
      </section>

      <section className="section">
        <h2 className="display">Wat nu?</h2>
        <div className="list" style={{ marginTop: 12 }}>
          {needsName && (
            <div className="row">
              <span className="ico"><Icon name="ticket" /></span>
              <span className="body"><span className="title">Zet je tickets op naam</span><span className="sub">Stuur vrienden een link, dan vullen ze zelf hun naam in. [Paylogic personalisatie]</span></span>
            </div>
          )}
          <a className="row" href={icsHref()} download="wckt-2026.ics">
            <span className="ico"><Icon name="cal" /></span>
            <span className="body"><span className="title">Zet in je agenda</span><span className="sub">30 okt – 1 nov 2026 · Thialf</span></span>
          </a>
          <a className="row" href={APP_URL} target="_blank" rel="noreferrer">
            <span className="ico"><Icon name="spark" /></span>
            <span className="body"><span className="title">Open de schaatsapp</span><span className="sub">Programma, je favoriete schaatsers en praktische info op de dag zelf.</span></span>
          </a>
        </div>
      </section>

      <Link to="/" className="btn btn-secondary" style={{ marginTop: 24 }}>Nog een toernooi bekijken</Link>
    </main>
  );
}
