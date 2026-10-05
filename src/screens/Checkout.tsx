import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { audienceLabel, euro, paymentMethods, zoneInfo, dayOf } from '../data/event';
import { ActionBar, Icon, ShopBar, StepBar } from '../components/ui';
import { useShop } from '../state';

type F = {
  first: string; last: string; email: string; phone: string;
  dd: string; mm: string; yyyy: string; gender: string;
  country: string; zip: string; street: string; city: string;
  pay: string; protect: '' | 'ja' | 'nee';
  optHos: boolean; optWa: boolean; optKnsb: boolean;
};
const init: F = { first: '', last: '', email: '', phone: '', dd: '', mm: '', yyyy: '', gender: '', country: 'NL', zip: '', street: '', city: '', pay: '', protect: '', optHos: false, optWa: false, optKnsb: false };
const PROTECT = 2;

export default function Checkout() {
  const shop = useShop();
  const nav = useNavigate();
  const [f, setF] = useState<F>(init);
  const [tried, setTried] = useState(false);
  const [openSum, setOpenSum] = useState(false);

  if (!shop.count) return <Navigate to="/winkelmand" replace />;

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }));
  const total = shop.total + (f.protect === 'ja' ? PROTECT : 0);

  const birthOk = (() => {
    const d = +f.dd, m = +f.mm, y = +f.yyyy;
    if (!d || !m || !y || f.yyyy.length !== 4) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getDate() === d && dt.getMonth() === m - 1 && y > 1900 && dt < new Date();
  })();

  const err: Partial<Record<keyof F, string>> = {
    first: f.first.trim() ? '' : 'Vul je voornaam in.',
    last: f.last.trim() ? '' : 'Vul je achternaam in.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? '' : 'Vul een geldig e-mailadres in, bijv. naam@voorbeeld.nl.',
    dd: birthOk ? '' : 'Vul een geldige geboortedatum in (dag, maand, jaar).',
    gender: f.gender ? '' : 'Kies een optie.',
    zip: f.zip.trim() ? '' : 'Vul je postcode in.',
    street: f.street.trim() ? '' : 'Vul je straat en huisnummer in.',
    city: f.city.trim() ? '' : 'Vul je woonplaats in.',
    pay: f.pay ? '' : 'Kies hoe je wilt betalen.',
    protect: f.protect ? '' : 'Kies of je annuleringsbescherming wilt.',
  };
  const errors = Object.entries(err).filter(([, v]) => v);
  const show = (k: keyof F) => (tried && err[k] ? <span className="field-err" id={`e-${k}`}>{err[k]}</span> : null);
  const inv = (k: keyof F) => ({ 'aria-invalid': tried && !!err[k], 'aria-describedby': tried && err[k] ? `e-${k}` : undefined });

  function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (errors.length) {
      const first = errors[0][0];
      setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
      return;
    }
    shop.setOrder({
      id: 'WCKT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      lines: shop.lines, total, fees: shop.fees, email: f.email, firstName: f.first.trim(),
      protection: f.protect === 'ja', method: paymentMethods.find((p) => p.id === f.pay)!.name,
    });
    nav('/betalen');
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
          <span>Je bestelling ({shop.count})</span><b>{euro(total)}</b><Icon name="chev" size={16} />
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

        <fieldset>
          <legend><span className="n">2</span> Een paar vragen van de organisatie</legend>
          <p className="why block">De KNSB en House of Sports gebruiken dit om bezoekers beter te leren kennen. [doel bevestigen + privacyverklaring linken]</p>
          <div className="lbl">Geboortedatum</div>
          <div className="dob" role="group" aria-label="Geboortedatum">
            <input id="f-dd" inputMode="numeric" maxLength={2} placeholder="DD" aria-label="Dag" value={f.dd} onChange={(e) => set('dd', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
            <input inputMode="numeric" maxLength={2} placeholder="MM" aria-label="Maand" value={f.mm} onChange={(e) => set('mm', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
            <input inputMode="numeric" maxLength={4} placeholder="JJJJ" aria-label="Jaar" autoComplete="bday-year" value={f.yyyy} onChange={(e) => set('yyyy', e.target.value.replace(/\D/g, ''))} {...inv('dd')} />
          </div>
          {show('dd')}
          <div className="lbl" id="g-lbl">Geslacht</div>
          <div className="seg" role="radiogroup" aria-labelledby="g-lbl" id="f-gender" tabIndex={-1}>
            {['Man', 'Vrouw', 'Anders', 'Zeg ik liever niet'].map((g) => (
              <button key={g} type="button" role="radio" aria-checked={f.gender === g} className={f.gender === g ? 'on' : ''} onClick={() => set('gender', g)}>{g}</button>
            ))}
          </div>
          {show('gender')}
          <label>Land
            <select autoComplete="country" value={f.country} onChange={(e) => set('country', e.target.value)}>
              <optgroup label="Meest gekozen"><option value="NL">Nederland</option><option value="BE">België</option><option value="DE">Duitsland</option><option value="NO">Noorwegen</option></optgroup>
              <optgroup label="Overige landen"><option value="AT">Oostenrijk</option><option value="CA">Canada</option><option value="CN">China</option><option value="JP">Japan</option><option value="PL">Polen</option><option value="US">Verenigde Staten</option><option value="XX">Ander land</option></optgroup>
            </select>
          </label>
          <div className="grid-2 zip">
            <label>Postcode<input id="f-zip" autoComplete="postal-code" value={f.zip} onChange={(e) => set('zip', e.target.value.toUpperCase())} {...inv('zip')} />{show('zip')}</label>
            <label>Woonplaats<input id="f-city" autoComplete="address-level2" value={f.city} onChange={(e) => set('city', e.target.value)} {...inv('city')} />{show('city')}</label>
          </div>
          <label>Straat en huisnummer<input id="f-street" autoComplete="street-address" value={f.street} onChange={(e) => set('street', e.target.value)} {...inv('street')} />{show('street')}</label>
        </fieldset>

        <fieldset>
          <legend><span className="n">3</span> Hoe wil je betalen?</legend>
          <div className="pay-grid" role="radiogroup" aria-label="Betaalmethode" id="f-pay" tabIndex={-1}>
            {paymentMethods.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={f.pay === p.id} className={`pay ${f.pay === p.id ? 'on' : ''}`} onClick={() => set('pay', p.id)}>
                <span className="radio" aria-hidden />{p.name}
              </button>
            ))}
          </div>
          {show('pay')}
          <p className="why block"><Icon name="ticket" size={14} /> Verzending: e-tickets per mail, direct na betalen.</p>
        </fieldset>

        <fieldset>
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
        </fieldset>

        <fieldset>
          <legend><span className="n">5</span> Op de hoogte blijven? <i className="opt">optioneel</i></legend>
          <label className="check"><input type="checkbox" checked={f.optKnsb} onChange={(e) => set('optKnsb', e.target.checked)} /><span><b>Als eerste horen wanneer de kaartverkoop start</b>, plus schaatsnieuws en acties van schaatsen.nl.</span></label>
          <label className="check"><input type="checkbox" checked={f.optHos} onChange={(e) => set('optHos', e.target.checked)} /><span><b>Updates over evenementen en promoties</b> van House of Sports, eventpartner van de KNSB.</span></label>
          <label className="check"><input type="checkbox" checked={f.optWa} onChange={(e) => set('optWa', e.target.checked)} /><span><b>Via WhatsApp</b> berichten ontvangen van House of Sports.</span></label>
          <p className="why block">Afmelden kan altijd met één klik. Je aankoop hangt hier niet van af.</p>
        </fieldset>

        <p className="terms">Door op "Betaal" te tikken ga je akkoord met de algemene voorwaarden van de ticketpartner en House of Sports Events en bevestig je dat je 18 jaar of ouder bent. [links naar voorwaarden en privacybeleid]</p>

        <ActionBar note={<><Icon name="lock" size={14} /> Veilig betalen{f.pay ? ` met ${paymentMethods.find((p) => p.id === f.pay)!.name}` : ''}</>}>
          <button type="submit" className="btn btn-primary">Betaal <span className="num">{euro(total)}</span></button>
        </ActionBar>
      </form>
    </main>
  );
}
