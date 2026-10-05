import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { PaylogicEvent } from '../api/types';
import { Chevrons, TopBar, TrackRing, nlDate } from '../components/ui';
import { asset } from '../asset';

export default function Events() {
  const [events, setEvents] = useState<PaylogicEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => { api.listEvents().then(setEvents).catch(() => setError(true)); }, []);

  return (
    <main className="screen">
      <TopBar />
      <section className="intro">
        <span className="eyebrow">Tickets seizoen 2026-2027</span>
        <h1 className="display">Kies je<br />toernooi</h1>
        <p className="muted">Moedig de Nederlandse toppers aan in Thialf. Kies een toernooi, je dag en je plek op de tribune.</p>
        <Chevrons className="intro-chev" />
      </section>

      {error && <p className="alert">De ticketverkoop is even niet bereikbaar. Probeer het zo opnieuw.</p>}

      <div className="list" aria-busy={!events}>
        {!events && [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 150 }} />)}
        {events?.map((e, i) => (
          <Link key={e.uid} to={`/event/${e.uid}`} className="event-card">
            <img className="bg" src={asset(i % 2 ? 'img/hero-2.jpg' : 'img/hero.jpg')} alt="" />
            <TrackRing className="ring" />
            <span className="date-chip">
              <span className="d">{new Date(e.start_date + 'T12:00').getDate()}</span>
              <span className="m">{nlDate(e.start_date, { month: 'short' }).replace('.', '')}</span>
            </span>
            {i === 0 && <span className="badge-top">Seizoensopener</span>}
            <span className="eyebrow">{e.location.name} · {e.location.city}</span>
            <h2 className="display">{e.title.nl}</h2>
            <span className="small muted">
              {nlDate(e.start_date, { weekday: 'short', day: 'numeric', month: 'short' })} – {nlDate(e.end_date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>

      <p className="proto-note">
        Prototype: alleen het World Cup Kwalificatietoernooi is gevuld met de producten en prijzen uit de huidige Paylogic-shop.
      </p>
    </main>
  );
}
