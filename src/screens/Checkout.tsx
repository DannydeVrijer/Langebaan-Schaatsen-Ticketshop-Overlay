import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Icon, Stepper, Steps, TopBar } from '../components/ui';
import { audienceLabel, days, zones } from '../data/zones';
import { euro, useShop, type Consumer } from '../state';

const empty: Consumer = { first_name: '', last_name: '', email: '', country: 'NL', optin: false };

export function lineTitle(p: { zone: string; day: string; audience: keyof typeof audienceLabel; subtitle: { nl: string } }) {
  if (p.zone === 'parking') return p.subtitle.nl.split(' - ')[0] + ' · Parkeren';
  const z = zones[p.zone as keyof typeof zones];
  const d = days.find((x) => x.key === p.day);
  return `${z.title} · ${d?.key === 'pp' ? 'Passe-partout' : d?.label}`;
}

export default function Checkout() {
  const shop = useShop();
  const nav = useNavigate();
  const [c, setC] = useState<Consumer>(empty);
  const [pm, setPm] = useState('');
  const [billOk, setBillOk] = useState<'checking' | 'ok' | 'diff' | 'error'>('checking');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Paylogic rekent het bedrag na; bij een verschil tonen we het.
  useEffect(() => {
    if (!shop.lines.length) return;
    setBillOk('checking');
    api.getBill(shop.lines).then((b) => setBillOk(Math.abs(b.total.amount - shop.total) < 0.01 ? 'ok' : 'diff')).catch(() => setBillOk('error'));
  }, [shop.total]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!pm && shop.paymentMethods[0]) setPm(shop.paymentMethods[0].uid); }, [shop.paymentMethods, pm]);

  if (!shop.lines.length) return <Navigate to={shop.eventUid ? `/event/${shop.eventUid}` : '/'} replace />;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email);
  const valid = c.first_name.trim() && c.last_name.trim() && emailOk && pm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true); setErr(null);
    try {
      const order = await api.createOrder({
        products: shop.lines.map((l) => ({ product: l.product.uid, quantity: l.quantity })),
        consumer: { first_name: c.first_name, last_name: c.last_name, email: c.email, country: c.country },
        payment_method: pm,
        redirect_url: `${location.origin}${location.pathname}#/bevestiging`,
      }, shop.total);
      shop.setLastOrder({ uid: order.uid, total: shop.total, lines: shop.lines, consumer: c, method: shop.paymentMethods.find((m) => m.uid === pm)?.name ?? '' });
      nav(order._links.payment.href.replace(/^#/, ''));
    } catch {
      setErr('Er ging iets mis bij het aanmaken van je bestelling. Je bent niets kwijt; probeer het opnieuw.');
      setBusy(false);
    }
  }

  const set = (k: keyof Consumer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setC({ ...c, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });

  return (
    <main className="screen has-cart">
      <TopBar back={{ to: `/event/${shop.eventUid}`, label: 'Tickets aanpassen' }} />
      <h1 className="display" style={{ fontSize: 34 }}>Je bestelling</h1>
      <Steps at={2} />

      <section className="card">
        {shop.lines.map((l) => (
          <div key={l.product.uid} className="prod">
            <div className="info">
              <span className="n">{lineTitle(l.product)}</span>
              <span className="s">{l.product.zone === 'parking' ? 'Parkeerticket' : audienceLabel[l.product.audience]} · {euro(l.product.price.amount)}</span>
            </div>
            <Stepper value={l.quantity} max={l.product.max_per_order} onChange={(n) => shop.setQty(l.product.uid, n)} label={lineTitle(l.product)} />
          </div>
        ))}
        <div className="divider" />
        <div className="totals">
          <span>Waarvan servicekosten</span><span>{euro(shop.fees)}</span>
          <strong>Totaal</strong><strong>{euro(shop.total)}</strong>
        </div>
        <p className={`bill-check ${billOk}`}>
          {billOk === 'checking' && 'Prijs wordt gecontroleerd…'}
          {billOk === 'ok' && <><Icon name="check" size={14} /> Prijs en beschikbaarheid gecontroleerd</>}
          {billOk === 'diff' && 'Let op: de prijs is gewijzigd. Controleer je bestelling.'}
          {billOk === 'error' && 'Prijscontrole lukt nu niet; je ziet het definitieve bedrag bij het betalen.'}
        </p>
      </section>

      <form className="section form" onSubmit={submit} noValidate>
        <h2 className="display">Je gegevens</h2>
        <p className="small muted">Je tickets sturen we naar dit e-mailadres. Namen per ticket vul je later in, als personaliseren nodig is.</p>
        <div className="grid-2">
          <label>Voornaam<input autoComplete="given-name" value={c.first_name} onChange={set('first_name')} aria-invalid={touched && !c.first_name.trim()} /></label>
          <label>Achternaam<input autoComplete="family-name" value={c.last_name} onChange={set('last_name')} aria-invalid={touched && !c.last_name.trim()} /></label>
        </div>
        <label>E-mailadres<input type="email" inputMode="email" autoComplete="email" value={c.email} onChange={set('email')} aria-invalid={touched && !emailOk} /></label>
        {touched && !emailOk && <span className="field-err">Vul een geldig e-mailadres in.</span>}
        <label>Land
          <select value={c.country} onChange={set('country')} autoComplete="country">
            <option value="NL">Nederland</option><option value="BE">België</option><option value="DE">Duitsland</option><option value="NO">Noorwegen</option><option value="XX">Anders</option>
          </select>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={c.optin} onChange={set('optin')} />
          <span>Houd me op de hoogte van schaatsnieuws en ticketacties (schaatsfanmailing).</span>
        </label>

        <h2 className="display" style={{ marginTop: 22 }}>Betaalmethode</h2>
        <div className="pm-grid" role="radiogroup" aria-label="Betaalmethode">
          {shop.paymentMethods.map((m) => (
            <button key={m.uid} type="button" role="radio" aria-checked={pm === m.uid} className={`pm ${pm === m.uid ? 'on' : ''}`} onClick={() => setPm(m.uid)}>
              <span className="i" aria-hidden>{m.icon || ''}</span>{m.name}
            </button>
          ))}
        </div>

        {err && <p className="alert">{err}</p>}

        <div className="cart-bar show">
          <div className="sum"><span className="c">Totaal</span><span className="t">{euro(shop.total)}</span></div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Even geduld…' : <><Icon name="lock" /> Betalen</>}
          </button>
        </div>
      </form>
    </main>
  );
}
