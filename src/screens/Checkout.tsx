import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { audienceLabel, euro, paymentMethods, zoneInfo, dayOf } from '../data/event';
import { ActionBar, Icon, ShopBar, StepBar } from '../components/ui';
import { Price } from '../components/Price';
import { useShop } from '../state';
import { useCatalog } from '../catalog';
import { createOrder, friendly, getBill, rememberOrder, type ApiBill } from '../api/paylogic';

type PM = { id: string; name: string; required: string[]; costs: number };
const mockPM: PM[] = paymentMethods.map((p) => ({ id: p.id, name: p.name, required: [], costs: 0 }));

type F = {
  first: string; last: string; email: string; phone: string;
  dd: string; mm: string; yyyy: string; gender: string;
  country: string; zip: string; nr: string; street: string; city: string;
  pay: string; protect: '' | 'ja' | 'nee';
  optHos: boolean; optWa: boolean; optKnsb: boolean;
};
const init: F = { first: '', last: '', email: '', phone: '', dd: '', mm: '', yyyy: '', gender: '', country: 'NL', zip: '', nr: '', street: '', city: '', pay: '', protect: '', optHos: false, optWa: false, optKnsb: false };
const PROTECT = 2;

export default function Checkout() {
  const shop = useShop();
  const nav = useNavigate();
  const [f, setF] = useState<F>(init);
  const [tried, setTried] = useState(false);
  const [openSum, setOpenSum] = useState(false);
  const [manual, setManual] = useState(false);
  const { live } = useCatalog();
  const [pms, setPms] = useState<PM[]>(live ? [] : mockPM);
  const [bill, setBill] = useState<ApiBill | null>(null);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Live: betaalmethodes + verplichte velden komen uit de bill van Paylogic (per land).
  const key = shop.lines.map((l) => `${l.item.id}:${l.qty}`).join(',') + '|' + f.country + '|' + f.pay;
  useEffect(() => {
    if (!live || !shop.lines.length) return;
    let alive = true;
    getBill(shop.lines.map((l) => ({ id: l.item.id, qty: l.qty })), f.country, f.pay || undefined)
      .then((b) => {
        if (!alive) return;
        setBill(b);
        setPms(b.available_payment_methods.map((m) => ({ id: m.uid, name: m.name.nl ?? m.name.en ?? m.uid, required: m.required_consumer_fields ?? [], costs: Number(m.costs?.amount ?? 0) })));
        setApiErr(null);
      })
      .catch((e) => alive && setApiErr(friendly(e)));
    return () => { alive = false; };
  }, [key, live]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shop.count) return <Navigate to="/winkelmand" replace />;

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }));
  const chosen = pms.find((p) => p.id === f.pay);
  // Welke velden zijn verplicht? Live: wat de betaalmethode vraagt (+ naam/e-mail altijd). Voorbeeld: alles, zoals de huidige shop.
  const need = (field: string) => !live || !chosen || chosen.required.includes(field);
  const needDob = need('date_of_birth'), needGender = need('gender'), needAddr = need('address') || need('postal_code') || need('city');
  const liveTotal = bill ? Number((bill.grand_total ?? bill.total).amount) : null;
  const total = (liveTotal ?? shop.total) + (!live && f.protect === 'ja' ? PROTECT : 0);

  const birthOk = (() => {
    const d = +f.dd, m = +f.mm, y = +f.yyyy;
    if (!d || !m || !y || f.yyyy.length !== 4) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getDate() === d && dt.getMonth() === m - 1 && y > 1900 && dt < new Date();
  })();

  // bol.com-patroon: in NL alleen postcode + huisnummer, adres wordt opgezocht (hier gesimuleerd)
  const zipOk = /^\d{4}\s?[A-Z]{2}$/.test(f.zip.trim());
  const nlAuto = f.country === 'NL' && !manual && !live; // live: geen gesimuleerde postcode-check, dus zelf invullen
  const found = nlAuto && zipOk && f.nr.trim();

  const err: Partial<Record<keyof F, string>> = {
    first: f.first.trim() ? '' : 'Vul je voornaam in.',
    last: f.last.trim() ? '' : 'Vul je achternaam in.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? '' : 'Vul een geldig e-mailadres in, bijv. naam@voorbeeld.nl.',
    dd: !needDob || birthOk ? '' : 'Vul een geldige geboortedatum in (dag, maand, jaar).',
    gender: !needGender || f.gender ? '' : 'Kies een optie.',
    zip: !needAddr || (nlAuto ? zipOk : f.zip.trim()) ? '' : 'Vul je postcode in, bijv. 8443 DZ.',
    nr: !needAddr || f.nr.trim() ? '' : 'Vul je huisnummer in.',
    street: !needAddr || nlAuto || f.street.trim() ? '' : 'Vul je straatnaam in.',
    city: !needAddr || nlAuto || f.city.trim() ? '' : 'Vul je woonplaats in.',
    pay: f.pay ? '' : 'Kies hoe je wilt betalen.',
    protect: live || f.protect ? '' : 'Kies of je annuleringsbescherming wilt.',
  };
  const errors = Object.entries(err).filter(([, v]) => v);
  const show = (k: keyof F) => (tried && err[k] ? <span className="field-err" id={`e-${k}`}>{err[k]}</span> : null);
  const inv = (k: keyof F) => ({ 'aria-invalid': tried && !!err[k], 'aria-describedby': tried && err[k] ? `e-${k}` : undefined });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (errors.length) {
      const first = errors[0][0];
      setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
      return;
    }
    const method = chosen?.name ?? f.pay;
    if (!live) {
      shop.setOrder({ id: 'WCKT-' + Math.random().toString(36).slice(2, 8).toUpperCase(), lines: shop.lines, total, fees: shop.fees, email: f.email, firstName: f.first.trim(), protection: f.protect === 'ja', method });
      nav('/betalen');
      return;
    }
    // Live: order aanmaken bij Paylogic en de koper naar de betaalpagina sturen.
    setBusy(true); setApiErr(null);
    try {
      const genderMap: Record<string, 0 | 1 | 2 | 9> = { Man: 1, Vrouw: 2, Anders: 9, 'Zeg ik liever niet': 0 };
      const order = await createOrder({
        lines: shop.lines.map((l) => ({ id: l.item.id, qty: l.qty })),
        consumer: {
          first_name: f.first.trim(), last_name: f.last.trim(), email: f.email.trim(), country: f.country,
          ...(needDob && birthOk ? { date_of_birth: `${f.yyyy}-${f.mm.padStart(2, '0')}-${f.dd.padStart(2, '0')}` } : {}),
          ...(needGender && f.gender ? { gender: genderMap[f.gender] } : {}),
          ...(needAddr ? { address: nlAuto ? `[straat] ${f.nr}`.trim() : `${f.street} ${f.nr}`.trim(), postal_code: f.zip.trim(), city: nlAuto ? '[plaats]' : f.city.trim() } : {}),
        },
        paymentMethod: f.pay,
        optIn: f.optKnsb || f.optHos,
        redirectUrl: `${location.origin}${location.pathname}#/bedankt`,
      });
      rememberOrder(order.uid);
      shop.setOrder({ id: order.uid, lines: shop.lines, total: Number(order.grand_total?.amount ?? total), fees: shop.fees, email: f.email, firstName: f.first.trim(), protection: false, method, paymentUrl: order._links.payment?.href });
      if (order._links.payment?.href) window.location.assign(order._links.payment.href);
      else nav('/bedankt', { replace: true }); // gratis order: geen betaling nodig
    } catch (err) {
      setApiErr(friendly(err));
      setBusy(false);
    }
  }

  return (
    <main className="screen has-ab">
      <ShopBar back={-1} whyKey="checkout" />
      <StepBar at={4} />

      <header className="day-head">
        <h1 className="display">Bijna klaar</h1>
        <p className="muted">Nog één stap. Je tickets staan daarna direct in je mail.</p>
      </header>

      <section className={`sum-card ${openSum ? 'open' : ''}`}>
        <button type="button" className="sum-toggle" aria-expanded={openSum} onClick={() => setOpenSum((v) => !v)}>
          <span>Je bestelling ({shop.count})</span><b><Price v={total} /></b><Icon name="chev" size={16} />
        </button>
        {openSum && (
          <ul className="sum-lines">
            {shop.lines.map((l) => (
              <li key={l.item.id}>
                <span>{l.qty}× {l.kind === 'ticket' ? `${zoneInfo[l.item.zone].title} · ${l.item.day === 'pp' ? 'passe-partout' : dayOf(l.item.day)!.name.toLowerCase()} · ${audienceLabel[l.item.audience].split(' (')[0].toLowerCase()}` : `Parkeren ${l.item.lot} · ${dayOf(l.item.day)!.name.toLowerCase()}`}</span>
                <span>{euro(l.item.price * l.qty)}</span>
              </li>
            ))}
            {f.protect === 'ja' && <li><span>Annuleringsbescherming</span><span>{euro(PROTECT)}</span></li>}
            <li className="muted"><span>Waarvan servicekosten</span><span>{euro(shop.fees)}</span></li>
          </ul>
        )}
      </section>

      <form className="form" onSubmit={submit} noValidate>
        {tried && errors.length > 0 && (
          <p className="alert" role="alert">Nog {errors.length} {errors.length === 1 ? 'veld' : 'velden'} om in te vullen. Ze zijn rood gemarkeerd.</p>
        )}

        <fieldset>
          <legend><span className="n">1</span> Waar sturen we je tickets heen?</legend>
          <div className="grid-2">
            <label>Voornaam<input id="f-first" autoComplete="given-name" value={f.first} onChange={(e) => set('first', e.target.value)} {...inv('first')} />{show('first')}</label>
            <label>Achternaam<input id="f-last" autoComplete="family-name" value={f.last} onChange={(e) => set('last', e.target.value)} {...inv('last')} />{show('last')}</label>
          </div>
          <label>E-mailadres<span className="why">Hier komen je e-tickets binnen.</span>
            <input id="f-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} {...inv('email')} />{show('email')}
          </label>
          <label><span className="lbl-row">Telefoonnummer <i className="opt">optioneel</i></span><span className="why">Alleen als er op de dag zelf iets verandert.</span>
            <div className="phone"><select aria-label="Landcode" defaultValue="+31"><option>+31</option><option>+32</option><option>+49</option><option>+47</option></select>
              <input type="tel" inputMode="tel" autoComplete="tel-national" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="6 12345678" /></div>
          </label>
        </fieldset>

        {apiErr && <p className="alert" role="alert">{apiErr}</p>}

        <fieldset>
          <legend><span className="n">2</span> {live ? 'Gegevens voor je betaling' : 'Een paar vragen van de organisatie'}</legend>
          {live
            ? <p className="why block">{chosen ? `${chosen.name} vraagt om deze gegevens.` : 'Kies hieronder eerst je betaalmethode; dan zie je welke gegevens nodig zijn.'}</p>
            : <p className="why block">De KNSB en House of Sports gebruiken dit om bezoekers beter te leren kennen. [doel bevestigen + privacyverklaring linken]</p>}
          {needDob && <>
          <div className="lbl">Geboortedatum</div>
          <div className="dob" role="group" aria-label="Geboortedatum">
            <input id="f-dd" inputMode="numeric" maxLength={2} placeholder="DD" aria-label="Dag" value={f.dd} onChange={(e) => set('dd', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
            <input inputMode="numeric" maxLength={2} placeholder="MM" aria-label="Maand" value={f.mm} onChange={(e) => set('mm', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
            <input inputMode="numeric" maxLength={4} placeholder="JJJJ" aria-label="Jaar" autoComplete="bday-year" value={f.yyyy} onChange={(e) => set('yyyy', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
          </div>
          {show('dd')}
          </>}
          {needGender && <>
          <div className="lbl" id="g-lbl">Geslacht</div>
          <div className="seg" role="radiogroup" aria-labelledby="g-lbl" id="f-gender" tabIndex={-1}>
            {['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet'].map((g) => (
              <button key={g} type="button" role="radio" aria-checked={f.gender === g} className={f.gender === g ? 'on' : ''} onClick={() => set('gender', g)}>{g}</button>
            ))}
          </div>
          {show('gender')}
          </>}
          <label>Land
            <select autoComplete="country" value={f.country} onChange={(e) => set('country', e.target.value)}>
              <optgroup label="Meest gekozen"><option value="NL">Nederland</option><option value="BE">België</option><option value="DE">Duitsland</option><option value="NO">Noorwegen</option></optgroup>
              <optgroup label="Overige landen"><option value="AT">Oostenrijk</option><option value="CA">Canada</option><option value="CN">China</option><option value="JP">Japan</option><option value="PL">Polen</option><option value="US">Verenigde Staten</option><option value="XX">Ander land</option></optgroup>
            </select>
          </label>
          {needAddr && <>
          <div className="grid-2 zip">
            <label>Postcode<input id="f-zip" autoComplete="postal-code" value={f.zip} placeholder={f.country === 'NL' ? '1234 AB' : ''} onChange={(e) => set('zip', e.target.value.toUpperCase())} {...inv('zip')} />{show('zip')}</label>
            <label>Huisnummer<input id="f-nr" inputMode={nlAuto ? 'numeric' : 'text'} autoComplete="address-line2" value={f.nr} onChange={(e) => set('nr', e.target.value)} {...inv('nr')} />{show('nr')}</label>
          </div>
          {nlAuto ? (
            <p className={`addr ${found ? 'ok' : ''}`}>
              {found
                ? <><Icon name="pin" size={16} /><span><b>[Straatnaam] {f.nr}, [Plaats]</b><small>Automatisch gevonden via je postcode (in dit voorbeeld gesimuleerd).</small></span></>
                : <><Icon name="info" size={16} /><span>Vul postcode en huisnummer in, dan zoeken we je adres op.</span></>}
              <button type="button" className="inline-link" onClick={() => setManual(true)}>Zelf invullen</button>
            </p>
          ) : (
            <>
              <label>Straatnaam<input id="f-street" autoComplete="address-line1" value={f.street} onChange={(e) => set('street', e.target.value)} {...inv('street')} />{show('street')}</label>
              <label>Woonplaats<input id="f-city" autoComplete="address-level2" value={f.city} onChange={(e) => set('city', e.target.value)} {...inv('city')} />{show('city')}</label>
            </>
          )}
          </>}
        </fieldset>

        <fieldset>
          <legend><span className="n">3</span> Hoe wil je betalen?</legend>
          <div className="pay-grid" role="radiogroup" aria-label="Betaalmethode" id="f-pay" tabIndex={-1}>
            {pms.length === 0 && live && <p className="why block">Betaalmethodes ophalen…</p>}
            {pms.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={f.pay === p.id} className={`pay ${f.pay === p.id ? 'on' : ''}`} onClick={() => set('pay', p.id)}>
                <span className="radio" aria-hidden />{p.name}{/ideal/i.test(p.name) && <small className="pm-tag">Meest gebruikt in NL</small>}{p.costs > 0 && <small className="pm-tag">+ {euro(p.costs)}</small>}
              </button>
            ))}
          </div>
          {show('pay')}
          <p className="why block"><Icon name="ticket" size={14} /> Verzending: e-tickets per mail, direct na betalen.</p>
        </fieldset>

        {!live && <fieldset>
          <legend><span className="n">4</span> Annuleringsbescherming</legend>
          <p className="why block">Kun je onverwacht niet? Dan krijg je tot 100% van je ticketprijs terug, bijvoorbeeld bij ziekte, letsel of vertraging in het OV. Afgehandeld door XCover. [voorwaarden linken]</p>
          <div className="choice" role="radiogroup" aria-label="Annuleringsbescherming" id="f-protect" tabIndex={-1}>
            <button type="button" role="radio" aria-checked={f.protect === 'ja'} className={f.protect === 'ja' ? 'on' : ''} onClick={() => set('protect', 'ja')}>
              <span className="radio" aria-hidden /><span><b>Ja, beschermen</b><small>+ {euro(PROTECT)}</small></span>
            </button>
            <button type="button" role="radio" aria-checked={f.protect === 'nee'} className={f.protect === 'nee' ? 'on' : ''} onClick={() => set('protect', 'nee')}>
              <span className="radio" aria-hidden /><span><b>Nee, niet nodig</b><small>geen extra kosten</small></span>
            </button>
          </div>
          {show('protect')}
        </fieldset>}

        <fieldset>
          <legend><span className="n">{live ? 4 : 5}</span> Op de hoogte blijven? <i className="opt">optioneel</i></legend>
          <label className="check"><input type="checkbox" checked={f.optKnsb} onChange={(e) => set('optKnsb', e.target.checked)} /><span><b>Als eerste horen wanneer de kaartverkoop start</b>, plus schaatsnieuws en acties van schaatsen.nl.</span></label>
          <label className="check"><input type="checkbox" checked={f.optHos} onChange={(e) => set('optHos', e.target.checked)} /><span><b>Updates over evenementen en promoties</b> van House of Sports, eventpartner van de KNSB.</span></label>
          <label className="check"><input type="checkbox" checked={f.optWa} onChange={(e) => set('optWa', e.target.checked)} /><span><b>Via WhatsApp</b> berichten ontvangen van House of Sports.</span></label>
          <p className="why block">Afmelden kan altijd met één klik. Je aankoop hangt hier niet van af.</p>
        </fieldset>

        <p className="terms">Door op "Betaal" te tikken ga je akkoord met de algemene voorwaarden van de ticketpartner en House of Sports Events en bevestig je dat je 18 jaar of ouder bent. [links naar voorwaarden en privacybeleid]</p>

        <ActionBar note={apiErr ? <span className="ab-err" role="alert">{apiErr}</span> : <><Icon name="lock" size={14} /> Veilig betalen{chosen ? ` met ${chosen.name}` : ''}{live ? ' via Paylogic' : ''}</>}>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Even geduld…' : <>Betaal <span className="num">{euro(total)}</span></>}</button>
        </ActionBar>
      </form>
    </main>
  );
}
