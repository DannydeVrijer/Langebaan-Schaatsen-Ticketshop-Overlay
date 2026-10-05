import { Link, useNavigate } from 'react-router-dom';
import { audienceLabel, dayLabel, dayOf, euro, faq, ppCompare, usps, zoneInfo, type DayKey } from '../data/event';
import { ActionBar, Icon, ShopBar, StepBar, Stepper } from '../components/ui';
import { mmss, useShop, type Line } from '../state';

const order: DayKey[] = ['vr', 'za', 'zo', 'pp'];

export default function Cart() {
  const shop = useShop();
  const nav = useNavigate();

  if (shop.expired) {
    return (
      <main className="screen">
        <ShopBar back="/" />
        <section className="empty">
          <Icon name="clock" size={40} />
          <h1 className="display">Je reservering is verlopen</h1>
          <p className="muted">We hielden je plekken 20 minuten vast. Je keuzes staan nog klaar; we checken of ze er nog zijn.</p>
          <button type="button" className="btn btn-primary" onClick={shop.restore}>Zet mijn keuzes terug</button>
          <button type="button" className="link-btn center" onClick={() => { shop.dismissExpired(); nav('/'); }}>Opnieuw beginnen</button>
        </section>
      </main>
    );
  }

  if (!shop.count) {
    return (
      <main className="screen">
        <ShopBar back="/" />
        <section className="empty">
          <Icon name="ticket" size={40} />
          <h1 className="display">Je mandje is nog leeg</h1>
          <p className="muted">Kies eerst een dag en je plek in Thialf.</p>
          <Link to="/" className="btn btn-primary">Kies je dag <Icon name="chev" /></Link>
        </section>
      </main>
    );
  }

  const byDay = (k: DayKey) => shop.lines.filter((l) => (l.kind === 'ticket' ? l.item.day === k : l.item.day === k));
  const low = (shop.remaining ?? 0) < 5 * 60_000;
  const saved = shop.lines.reduce((s, l) => s + (l.kind === 'ticket' && l.item.day === 'pp' ? (ppCompare(l.item.zone, l.item.audience)?.save ?? 0) * l.qty : 0), 0);

  const title = (l: Line) => (l.kind === 'ticket' ? zoneInfo[l.item.zone].title : `Parkeren ${l.item.lot}`);
  const sub = (l: Line) => (l.kind === 'ticket' ? audienceLabel[l.item.audience] : 'Per auto');

  return (
    <main className="screen has-ab">
      <ShopBar back={-1} whyKey="cart" />
      <StepBar at={3} />

      <header className="day-head">
        <h1 className="display">Je mandje</h1>
      </header>

      {shop.remaining !== null && (
        <p className={`hold ${low ? 'low' : ''}`} role="timer" aria-live="off">
          <Icon name="clock" size={18} />
          <span>We houden je plekken nog <b>{mmss(shop.remaining)}</b> voor je vast, zodat niemand anders ze intussen pakt.</span>
        </p>
      )}

      {order.filter((k) => byDay(k).length).map((k) => (
        <section key={k} className="cart-day">
          <h2 className="group-h"><span className="display">{k === 'pp' ? 'Passe-partout' : `${dayOf(k)!.name} ${dayOf(k)!.date}`}</span><small>{k === 'pp' ? dayLabel(k) : dayOf(k)!.time}</small></h2>
          <ul className="cart-lines">
            {byDay(k).map((l) => (
              <li key={l.item.id}>
                <div className="pr-info">
                  <span className="pr-aud">{title(l)}</span>
                  <span className="pr-fee">{sub(l)} · {euro(l.item.price)}</span>
                </div>
                <div className="cl-right">
                  <span className="cl-sum">{euro(l.item.price * l.qty)}</span>
                  <Stepper value={l.qty} max={l.kind === 'ticket' ? l.item.max : 4} onChange={(n) => shop.setQty(l.item.id, n)} label={title(l)} />
                </div>
              </li>
            ))}
          </ul>
          {k !== 'pp' && <Link to={`/tickets/${k}`} className="link-btn">+ Meer voor {dayOf(k)!.name.toLowerCase()}</Link>}
        </section>
      ))}

      <section className="totals-card">
        <div><span>{shop.lines.some((l) => l.kind === 'parking') ? 'Tickets en parkeren' : 'Tickets'}</span><span>{euro(shop.total)}</span></div>
        <div className="sub"><span>Waarvan servicekosten</span><span>{euro(shop.fees)}</span></div>
        <div className="grand"><span>Totaal</span><span>{euro(shop.total)}</span></div>
        {saved > 0 && <div className="saved"><span>Je bespaart met je passe-partout</span><span>{euro(saved)}</span></div>}
        <p className="no-extra">Geen extra kosten bij het betalen.</p>
      </section>

      <ul className="usp-bar col" aria-label="Zekerheden">
        {[...usps.slice(0, 2), 'Geen account nodig'].map((u) => <li key={u}><Icon name="check" size={14} /> {u}</li>)}
      </ul>

      <section className="section">
        <h2 className="display h-sm">Vragen?</h2>
        {faq.slice(0, 3).map((f) => <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </section>

      <ActionBar note={<><b>Totaal {euro(shop.total)}</b> · {shop.count} items</>}>
        <button type="button" className="btn btn-primary" onClick={() => nav('/gegevens')}>Verder naar bestellen <Icon name="chev" /></button>
      </ActionBar>
    </main>
  );
}
