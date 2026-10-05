import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { days, euro, parking } from '../data/event';
import { ActionBar, Icon, ShopBar, StepBar, Stepper } from '../components/ui';
import { useShop } from '../state';

export default function Parking() {
  const shop = useShop();
  const nav = useNavigate();
  const [showAll, setShowAll] = useState(false);

  if (!shop.ticketCount) return <Navigate to="/" replace />;

  // Dagen uit het mandje (passe-partout = alle dagen)
  const inCart = new Set(shop.lines.filter((l) => l.kind === 'ticket').flatMap((l) => (l.item.day === 'pp' ? ['vr', 'za', 'zo'] : [l.item.day])));
  const shown = days.filter((d) => showAll || inCart.has(d.key));
  const hidden = days.filter((d) => !inCart.has(d.key)).length;
  const parkCount = shop.lines.filter((l) => l.kind === 'parking').reduce((s, l) => s + l.qty, 0);

  return (
    <main className="screen has-ab">
      <ShopBar back={-1} whyKey="parking" />
      <StepBar at={2} />

      <header className="day-head">
        <h1 className="display">Kom je met de auto?</h1>
        <p className="muted">Rond Thialf is het op wedstrijddagen druk. Met een parkeerticket weet je zeker dat je een plek hebt.</p>
      </header>

      {shown.map((d) => {
        const lots = parking.filter((p) => p.day === d.key);
        const free = lots.filter((p) => !p.soldOut);
        return (
          <section key={d.key} className="park-day">
            <h2 className="group-h"><span className="display">{d.name} {d.date}</span><small>{free.length} van {lots.length} terreinen beschikbaar</small></h2>
            <ul className="park-list">
              {free.map((p) => (
                <li key={p.id} className={p.soldOut ? 'sold' : ''}>
                  <span className="lot">{p.lot}</span>
                  <span className="pr-info">
                    <span className="pr-aud">Parkeerterrein {p.lot}</span>
                    <span className="pr-fee">{euro(p.price)} per auto</span>
                  </span>
                  {p.soldOut ? <span className="sold-lbl">Uitverkocht</span> : <Stepper value={shop.qty[p.id] ?? 0} max={4} onChange={(n) => shop.setQty(p.id, n)} label={`parkeren ${p.lot} ${d.name}`} />}
                </li>
              ))}
            </ul>
            {lots.length > free.length && <p className="park-full"><b>Vol:</b> {lots.filter((p) => p.soldOut).map((p) => p.lot).join(', ')}</p>}
          </section>
        );
      })}

      {hidden > 0 && (
        <button type="button" className="link-btn center" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Alleen mijn dagen tonen' : `Ook parkeren voor andere dagen (${hidden})`}
        </button>
      )}

      <p className="note"><Icon name="info" size={15} /> [Kaartje parkeerterreinen + loopafstand tot de ingang aanleveren] Met het OV? [Route vanaf station Heerenveen aanleveren]</p>

      <ActionBar note={<><b>{shop.ticketCount} tickets{parkCount ? ` + ${parkCount} parkeren` : ''}</b> · {euro(shop.total)}</>}>
        <button type="button" className={`btn ${parkCount ? 'btn-primary' : 'btn-secondary'}`} onClick={() => nav('/winkelmand')}>
          {parkCount ? 'Naar je mandje' : 'Verder zonder parkeren'} <Icon name="chev" />
        </button>
      </ActionBar>
    </main>
  );
}
