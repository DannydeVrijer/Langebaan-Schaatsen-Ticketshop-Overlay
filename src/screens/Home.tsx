import { useState } from 'react';
import { Link } from 'react-router-dom';
import { days, event, euro, products, quotes } from '../data/event';
import { ThialfMap } from '../components/ThialfMap';
import { ActionBar, Chevrons, Icon, Sheet, ShopBar, TrackRing } from '../components/ui';
import { asset } from '../asset';
import { useShop } from '../state';

const from = (d: string) => Math.min(...products.filter((p) => p.day === d && !p.soldOut && p.audience === 'volw').map((p) => p.price));
const losseDagen = 3 * from('vr');

export default function Home() {
  const [prog, setProg] = useState<string | null>(null);
  const { ticketCount } = useShop();
  const d = days.find((x) => x.key === prog);

  return (
    <main className="screen has-ab">
      <ShopBar whyKey="home" />

      <section className="hero">
        <img src={asset('img/hero.jpg')} alt="" className="hero-bg" />
        <TrackRing className="hero-ring" />
        <div className="hero-body">
          <span className="eyebrow">{event.dates} · Thialf</span>
          <h1 className="display">World Cup<br />Kwalificatie&shy;toernooi</h1>
          <p>{event.stakes} Drie dagen strijd om de plekken in de Nederlandse World Cup-ploeg.</p>
        </div>
      </section>

      <section className="section">
        <div className="sec-head">
          <h2 className="display">Welke dag ben je erbij?</h2>
        </div>
        <div className="day-list">
          {days.map((x) => (
            <article key={x.key} className="day-card">
              <Link to={`/tickets/${x.key}`} className="day-main">
                <span className="dc-date"><b>{x.date.split(' ')[0]}</b><i>{x.date.split(' ')[1]}</i></span>
                <span className="dc-body">
                  <span className="dc-name">{x.name}</span>
                  <span className="dc-time"><Icon name="clock" size={14} /> {x.time}</span>
                  <span className="dc-teaser">{x.teaser}</span>
                </span>
                <span className="dc-price"><small>vanaf</small>{euro(from(x.key))}</span>
              </Link>
              <button type="button" className="dc-prog" onClick={() => setProg(x.key)}>Programma bekijken ({x.races.length} afstanden)</button>
            </article>
          ))}

          <Link to="/tickets/pp" className="day-card pp">
            <span className="pp-tag">Voordeligst voor fans</span>
            <span className="day-main">
              <span className="dc-date pp-ico"><Chevrons className="pp-chev" /></span>
              <span className="dc-body">
                <span className="dc-name">Passe-partout</span>
                <span className="dc-time">Alle 3 dagen · staan of zitten West</span>
                <span className="dc-teaser">Staan in de bocht alle dagen voor {euro(from('pp'))}. Losse dagen samen: {euro(losseDagen)}.</span>
              </span>
              <span className="dc-price"><small>vanaf</small>{euro(from('pp'))}</span>
            </span>
          </Link>
        </div>
        <p className="note"><Icon name="info" size={15} /> {event.doorsNote} Kinderen t/m 5 jaar gratis.</p>
      </section>

      <section className="section">
        <div className="sec-head"><h2 className="display">Zo ligt Thialf</h2></div>
        <div className="map-card">
          <ThialfMap label="Plattegrond Thialf met tribunes en bochten" />
          <ul className="legend">
            <li><b>Bochten</b> staanplaatsen, dicht op de schaatsers</li>
            <li><b>West &amp; Oost</b> zitplaatsen, Oost is de finishzijde</li>
            <li><b>♿</b> mindervaliden tribune bij de Sven Kramer bocht</li>
          </ul>
        </div>
      </section>

      <figure className="quote-big">
        <blockquote>{quotes.thialf.q}</blockquote>
        <figcaption>{quotes.thialf.who}</figcaption>
      </figure>

      <p className="proto">Fictief voorbeeld van een eigen ticketshop. Er wordt niets verkocht of betaald.</p>

      <ActionBar note={ticketCount ? undefined : 'Kies hierboven je dag, of start direct met zaterdag'}>
        {ticketCount ? (
          <Link to="/winkelmand" className="btn btn-primary">Naar je mandje <Icon name="chev" /></Link>
        ) : (
          <Link to="/tickets/za" className="btn btn-primary">Tickets zaterdag 31 okt <Icon name="chev" /></Link>
        )}
      </ActionBar>

      {d && (
        <Sheet title={`${d.name} ${d.date}`} eyebrow={`Programma · ${d.time}`} onClose={() => setProg(null)}>
          <ol className="race-list">{d.races.map((r) => <li key={r}>{r}</li>)}</ol>
          <p className="small muted">Onder voorbehoud van wijzigingen. {event.doorsNote}</p>
          <Link to={`/tickets/${d.key}`} className="btn btn-primary" style={{ marginTop: 14 }}>Tickets voor {d.name.toLowerCase()} <Icon name="chev" /></Link>
        </Sheet>
      )}
    </main>
  );
}
