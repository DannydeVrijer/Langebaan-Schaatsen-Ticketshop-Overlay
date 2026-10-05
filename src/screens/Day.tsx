import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audienceLabel, dayOf, days, euro, event, faq, groups, kidsRules, parking, ppCompare, products, quotes, usps, vipStack, zoneInfo, type DayKey, type Group, type Product, type Zone } from '../data/event';
import { ThialfMap } from '../components/ThialfMap';
import { ActionBar, Icon, Sheet, ShopBar, StepBar, Stepper } from '../components/ui';
import { useShop } from '../state';

const minAdult = (k: DayKey) => Math.min(...products.filter((p) => p.day === k && !p.soldOut && p.audience === 'volw').map((p) => p.price));

const tabs: { key: DayKey; label: string }[] = [
  ...days.map((d) => ({ key: d.key, label: `${d.name.slice(0, 2)} ${d.date}` })),
  { key: 'pp', label: 'Alle 3 dagen' },
];

type Added = { p: Product };

export default function Day() {
  const { day = 'vr' } = useParams();
  const nav = useNavigate();
  const shop = useShop();
  const [filter, setFilter] = useState<Group | 'alle'>('alle');
  const [info, setInfo] = useState<Zone | null>(null);
  const [sheet, setSheet] = useState<'prog' | 'map' | 'faq' | null>(null);
  const [hl, setHl] = useState<Zone | null>(null);
  const [added, setAdded] = useState<Added | null>(null);
  const refs = useRef<Partial<Record<Zone, HTMLElement | null>>>({});

  const ofDay = useMemo(() => products.filter((p) => p.day === day), [day]);
  const zones = [...new Set(ofDay.map((p) => p.zone))];
  const available = Object.fromEntries(zones.map((z) => [z, ofDay.some((p) => p.zone === z && !p.soldOut)])) as Partial<Record<Zone, boolean>>;
  const groupsHere = groups.filter((g) => zones.some((z) => zoneInfo[z].group === g.key));

  const jump = (z: Zone) => {
    setSheet(null);
    setFilter('alle');
    setHl(z);
    setTimeout(() => refs.current[z]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    setTimeout(() => setHl(null), 1600);
  };

  /* passe-partout-tip: hetzelfde vak + doelgroep op 2+ dagen */
  const ppTip = useMemo(() => {
    if (day === 'pp') return null;
    const picked = shop.lines.filter((l) => l.kind === 'ticket' && l.item.day !== 'pp').map((l) => l.item as Product);
    for (const p of picked) {
      const same = picked.filter((x) => x.zone === p.zone && x.audience === p.audience);
      const pp = products.find((x) => x.day === 'pp' && x.zone === p.zone && x.audience === p.audience);
      if (same.length >= 2 && pp) {
        const n = Math.min(...same.map((x) => shop.qty[x.id]));
        return { pp, same, n, los: same.reduce((s, x) => s + x.price, 0) * n, ppCost: pp.price * n };
      }
    }
    return null;
  }, [shop.lines, shop.qty, day]);

  if (!tabs.some((t) => t.key === day)) return <Navigate to="/" replace />;
  const d = day === 'pp' ? null : dayOf(day as DayKey)!;

  /** + ingedrukt: bij het eerste exemplaar tonen we de toegevoegd-melding met 'handig erbij' (bol.com-patroon). */
  const change = (p: Product, n: number) => {
    const before = shop.qty[p.id] ?? 0;
    shop.setQty(p.id, n);
    if (before === 0 && n === 1) setAdded({ p });
  };

  /* suggesties bij toevoegen: max. 3, alleen echt relevant */
  const suggestions = (p: Product) => {
    const out: { id: string; t: string; s: string; price: number; max: number }[] = [];
    if (p.audience === 'volw') {
      const kid = products.find((x) => x.day === p.day && x.zone === p.zone && x.audience === 'kids' && !x.soldOut);
      if (kid) out.push({ id: kid.id, t: 'Kindticket, zelfde plek', s: '6 t/m 12 jaar · t/m 5 jaar gratis', price: kid.price, max: kid.max });
    }
    if (p.day !== 'pp') {
      const park = parking.find((x) => x.day === p.day && !x.soldOut);
      if (park) out.push({ id: park.id, t: `Parkeren ${park.lot}, ${dayOf(p.day)!.name.toLowerCase()}`, s: 'Zeker van je plek bij Thialf', price: park.price, max: 4 });
    }
    return out.slice(0, 3);
  };

  const ppUpgrade = added && added.p.day !== 'pp' ? ppCompare(added.p.zone, added.p.audience) : null;

  return (
    <main className="screen has-ab">
      <ShopBar whyKey="day" />

      <header className="ev-head">
        <span className="eyebrow">{event.venue} · {event.dates}</span>
        <h1 className="display">{event.name}</h1>
        <div className="ev-links">
          <button type="button" className="pill-btn" onClick={() => setSheet('prog')}><Icon name="cal" size={16} /> Programma</button>
          <button type="button" className="pill-btn" onClick={() => setSheet('map')}><Icon name="pin" size={16} /> Plattegrond</button>
          <button type="button" className="pill-btn" onClick={() => setSheet('faq')}><Icon name="info" size={16} /> Vragen</button>
        </div>
      </header>

      <ul className="usp-bar" aria-label="Zekerheden">
        {usps.map((u) => <li key={u}><Icon name="check" size={14} /> {u}</li>)}
      </ul>

      <StepBar at={1} />

      <div className="day-tabs" role="tablist" aria-label="Kies je dag">
        {tabs.map((t) => {
          const n = shop.lines.filter((l) => l.kind === 'ticket' && l.item.day === t.key).reduce((s, l) => s + l.qty, 0);
          return (
            <Link key={t.key} to={`/tickets/${t.key}`} replace role="tab" aria-selected={t.key === day} className={`day-tab ${t.key === day ? 'on' : ''} ${t.key === 'pp' ? 'pp' : ''}`}>
              <b>{t.label}</b>
              <small>vanaf {euro(minAdult(t.key))}</small>
              {n > 0 && <span className="dt-n" aria-label={`${n} gekozen`}>{n}</span>}
            </Link>
          );
        })}
      </div>

      <p className="day-line">
        {d ? <><b>{d.long}</b> · {d.time} · <button type="button" className="inline-link" onClick={() => setSheet('prog')}>{d.races.length} afstanden</button></>
          : <><b>Passe-partout</b> · vrijdag, zaterdag én zondag met één ticket</>}
      </p>

      {day === 'pp' && (() => { const c = ppCompare('noord', 'volw')!; return (
        <div className="save-banner"><span className="was">{euro(c.los)}</span> <b>{euro(c.pp)}</b> <span>Bespaar {euro(c.save)} t.o.v. 3 losse dagen in de bocht</span></div>
      ); })()}

      <div className="filter" role="radiogroup" aria-label="Soort plaats">
        {[{ key: 'alle' as const, label: 'Alles' }, ...groupsHere].map((g) => (
          <button key={g.key} type="button" role="radio" aria-checked={filter === g.key} className={`chip ${filter === g.key ? 'on' : ''}`} onClick={() => setFilter(g.key)}>{g.label}</button>
        ))}
      </div>

      {groupsHere.filter((g) => filter === 'alle' || filter === g.key).map((g) => (
        <section key={g.key} className="group">
          <h2 className="group-h"><span className="display">{g.label}</span><small>{g.hint}</small></h2>
          {zones.filter((z) => zoneInfo[z].group === g.key).map((z) => {
            const ps = ofDay.filter((p) => p.zone === z);
            const allOut = ps.every((p) => p.soldOut);
            const zi = zoneInfo[z];
            return (
              <article key={z} ref={(el) => { refs.current[z] = el; }} className={`zone-card ${hl === z ? 'flash' : ''} ${allOut ? 'out' : ''}`}>
                {zi.tip && !allOut && <span className="badge-tip">{zi.tip}</span>}
                <div className="zc-top">
                  <button type="button" className="zc-map" onClick={() => setSheet('map')} aria-label={`Bekijk ${zi.title} op de plattegrond`}><ThialfMap compact selected={z} label={`Ligging ${zi.title}`} /></button>
                  <div className="zc-title">
                    <h3>{zi.title}</h3>
                    <span className="zc-place">{zi.place}{zi.vakken ? ` · ${zi.vakken}` : ''}</span>
                    {ps.some((p) => p.limited && !p.soldOut) && <span className="tag warn">Beperkt beschikbaar</span>}
                    {allOut && <span className="tag out">Uitverkocht op deze dag</span>}
                  </div>
                </div>
                <p className="zc-pitch">{zi.pitch}</p>
                {(z === 'vip' || ps.some((p) => p.audience === 'kids')) && (
                  <button type="button" className="link-btn" onClick={() => setInfo(z)}>
                    <Icon name="info" size={16} /> {z === 'vip' ? 'Wat zit er in het VIP-arrangement?' : 'Welke leeftijd telt als kind?'}
                  </button>
                )}
                <ul className="prod-rows">
                  {ps.map((p) => {
                    const cmp = p.day === 'pp' ? ppCompare(p.zone, p.audience) : null;
                    return (
                      <li key={p.id} className={p.soldOut ? 'sold' : ''}>
                        <div className="pr-info">
                          <span className="pr-aud">{audienceLabel[p.audience]}</span>
                          <span className="pr-price">{cmp && <s className="was">{euro(cmp.los)}</s>} {euro(p.price)}</span>
                          <span className="pr-fee">incl. {euro(p.fee)} servicekosten{cmp ? ` · bespaar ${euro(cmp.save)}` : ''}</span>
                        </div>
                        {p.soldOut
                          ? <span className="sold-lbl">Uitverkocht</span>
                          : <Stepper value={shop.qty[p.id] ?? 0} max={p.max} onChange={(n) => change(p, n)} label={`${zi.title}, ${audienceLabel[p.audience]}`} />}
                      </li>
                    );
                  })}
                </ul>
                {quotes[z] && <figure className="mini-quote"><blockquote>{quotes[z].q}</blockquote><figcaption>{quotes[z].who}</figcaption></figure>}
                {allOut && day !== 'pp' && <p className="note">Op een andere dag zijn er nog plekken. Kies hierboven een andere dag.</p>}
              </article>
            );
          })}
        </section>
      ))}

      {ppTip ? (
        <aside className="tip">
          <strong>{ppTip.ppCost < ppTip.los ? `Bespaar ${euro(ppTip.los - ppTip.ppCost)} met een passe-partout` : `Voor ${euro(ppTip.ppCost - ppTip.los)} extra ben je alle 3 de dagen erbij`}</strong>
          <p>Je hebt {zoneInfo[ppTip.pp.zone].title} op {ppTip.same.length} dagen. Een passe-partout kost {euro(ppTip.pp.price)} p.p. voor alle 3 de dagen.</p>
          <button type="button" className="btn btn-secondary sm" onClick={() => {
            ppTip.same.forEach((x) => shop.setQty(x.id, (shop.qty[x.id] ?? 0) - ppTip.n));
            shop.setQty(ppTip.pp.id, (shop.qty[ppTip.pp.id] ?? 0) + ppTip.n);
          }}>Zet om naar {ppTip.n === 1 ? 'passe-partout' : `${ppTip.n} passe-partouts`}</button>
        </aside>
      ) : null}

      <p className="proto">Fictief voorbeeld van een eigen ticketshop. Er wordt niets verkocht of betaald.</p>

      <ActionBar note={shop.ticketCount ? <><b>{shop.ticketCount} {shop.ticketCount === 1 ? 'ticket' : 'tickets'}</b> · {euro(shop.total)} incl. servicekosten</> : 'Kies een dag en tik op + bij je plek'}>
        <button type="button" className="btn btn-primary" disabled={!shop.ticketCount} onClick={() => nav('/parkeren')}>
          {shop.ticketCount ? <>Verder <Icon name="chev" /></> : 'Nog geen tickets gekozen'}
        </button>
      </ActionBar>

      {/* toegevoegd-melding met 'handig erbij' */}
      {added && (
        <Sheet title="Toegevoegd aan je mandje" eyebrow="Gelukt" onClose={() => setAdded(null)}>
          <div className="added-item">
            <span className="ok-dot"><Icon name="check" size={18} /></span>
            <span><b>{zoneInfo[added.p.zone].title}</b><small>{added.p.day === 'pp' ? 'Passe-partout' : dayOf(added.p.day)!.long} · {audienceLabel[added.p.audience]}</small></span>
            <b className="num">{euro(added.p.price)}</b>
          </div>
          {ppUpgrade && (
            <div className="upgrade">
              <span>Kom je vaker? <b>Alle 3 dagen voor {euro(ppUpgrade.pp)}</b> <s>{euro(ppUpgrade.los)}</s></span>
              <Link to="/tickets/pp" className="link-btn" onClick={() => setAdded(null)}>Bekijk passe-partout</Link>
            </div>
          )}
          {suggestions(added.p).length > 0 && (
            <>
              <h3 className="sub-h">Handig erbij</h3>
              <ul className="sugg">
                {suggestions(added.p).map((s) => (
                  <li key={s.id}>
                    <span className="pr-info"><span className="pr-aud">{s.t}</span><span className="pr-fee">{s.s} · {euro(s.price)}</span></span>
                    <Stepper value={shop.qty[s.id] ?? 0} max={s.max} onChange={(n) => shop.setQty(s.id, n)} label={s.t} />
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdded(null)}>Verder kiezen</button>
            <button type="button" className="btn btn-primary" onClick={() => { setAdded(null); nav('/winkelmand'); }}>Naar mandje</button>
          </div>
        </Sheet>
      )}

      {sheet === 'prog' && (
        <Sheet title="Programma" eyebrow={`${event.name} · onder voorbehoud`} onClose={() => setSheet(null)}>
          {days.map((x) => (
            <section key={x.key} className="prog-day">
              <h3><span>{x.long}</span><small>{x.time}</small></h3>
              <ol className="race-list">{x.races.map((r) => <li key={r}>{r}</li>)}</ol>
              <Link to={`/tickets/${x.key}`} replace className="link-btn" onClick={() => setSheet(null)}>Tickets {x.name.toLowerCase()} vanaf {euro(minAdult(x.key))}</Link>
            </section>
          ))}
          <p className="small muted">{event.doorsNote}</p>
        </Sheet>
      )}

      {sheet === 'map' && (
        <Sheet title="Plattegrond Thialf" eyebrow={d ? d.long : 'Passe-partout'} onClose={() => setSheet(null)}>
          <div className="map-card"><ThialfMap available={available} selected={null} onSelect={jump} label="Tik op een vak om naar dat ticket te gaan" /></div>
          <p className="map-hint">Tik op een vak om naar dat ticket te gaan. Gestreept = uitverkocht of niet te koop op deze dag. Oost is de finishzijde.</p>
        </Sheet>
      )}

      {sheet === 'faq' && (
        <Sheet title="Veelgestelde vragen" onClose={() => setSheet(null)}>
          {faq.map((f) => <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}
        </Sheet>
      )}

      {info && (
        <Sheet title={info === 'vip' ? 'VIP-arrangement' : 'Kind of volwassene?'} eyebrow={zoneInfo[info].title} onClose={() => setInfo(null)}>
          {info === 'vip' ? (
            <>
              <ul className="stack">{vipStack.map((v) => <li key={v.t}><Icon name="check" size={16} /><span><b>{v.t}</b><small>{v.s}</small></span></li>)}</ul>
              <p className="small muted">Prijs {euro(232.87)} p.p. inclusief catering. Btw op food &amp; beverage is mogelijk niet aftrekbaar (art. 15 lid 5 Wet OB 1968).</p>
            </>
          ) : (
            <ul className="stack">{kidsRules.map((r) => <li key={r}><Icon name="users" size={16} /><span>{r}</span></li>)}</ul>
          )}
        </Sheet>
      )}
    </main>
  );
}
