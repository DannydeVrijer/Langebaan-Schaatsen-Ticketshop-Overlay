import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audienceLabel, dayOf, days, euro, event, faq, groups, kidsRules, parking, ppCompare, products, quotes, usps, vipStack, zoneInfo, type DayKey, type Product, type Zone } from '../data/event';
import { ThialfMap } from '../components/ThialfMap';
import { ActionBar, Icon, ProtoFooter, Sheet, ShopBar, Stepper } from '../components/ui';
import { useShop } from '../state';
import { asset } from '../asset';

const minAdult = (k: DayKey) => Math.min(...products.filter((p) => p.day === k && !p.soldOut && p.audience === 'volw').map((p) => p.price));
const minOf = (ps: Product[]) => { const a = ps.filter((p) => !p.soldOut); const v = a.filter((p) => p.audience !== 'kids'); return Math.min(...(v.length ? v : a).map((p) => p.price)); };

const segs: { key: DayKey; top: string; sub: string }[] = [
  ...days.map((d) => ({ key: d.key, top: d.name.slice(0, 2), sub: d.date })),
  { key: 'pp', top: 'Alle', sub: '3 dagen' },
];

export default function Day() {
  const { day } = useParams();
  const nav = useNavigate();
  const shop = useShop();
  const [open, setOpen] = useState<Zone | null>(null);
  const [info, setInfo] = useState<Zone | null>(null);
  const [sheet, setSheet] = useState<'prog' | 'map' | 'faq' | null>(null);
  const [added, setAdded] = useState<Product | null>(null);
  const refs = useRef<Partial<Record<Zone, HTMLElement | null>>>({});

  const ofDay = useMemo(() => products.filter((p) => p.day === day), [day]);
  const zones = [...new Set(ofDay.map((p) => p.zone))];
  const available = Object.fromEntries(zones.map((z) => [z, ofDay.some((p) => p.zone === z && !p.soldOut)])) as Partial<Record<Zone, boolean>>;

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

  if (!day) return <DayPicker />;
  if (!segs.some((t) => t.key === day)) return <Navigate to="/" replace />;
  const d = day === 'pp' ? null : dayOf(day as DayKey)!;

  const jump = (z: Zone) => {
    setSheet(null);
    setOpen(z);
    setTimeout(() => refs.current[z]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const change = (p: Product, n: number) => {
    const before = shop.qty[p.id] ?? 0;
    shop.setQty(p.id, n);
    if (before === 0 && n === 1) setAdded(p);
  };

  const suggestions = (p: Product) => {
    const out: { id: string; t: string; s: string; price: number; max: number }[] = [];
    if (p.audience === 'volw') {
      const kid = products.find((x) => x.day === p.day && x.zone === p.zone && x.audience === 'kids' && !x.soldOut);
      if (kid) out.push({ id: kid.id, t: 'Kindticket, zelfde plek', s: '6 t/m 12 jaar', price: kid.price, max: kid.max });
    }
    if (p.day !== 'pp') {
      const park = parking.find((x) => x.day === p.day && !x.soldOut);
      if (park) out.push({ id: park.id, t: `Parkeren ${park.lot}`, s: dayOf(p.day)!.name, price: park.price, max: 4 });
    }
    return out;
  };
  const ppUpgrade = added && added.day !== 'pp' ? ppCompare(added.zone, added.audience) : null;
  const ppSave = ppCompare('noord', 'volw');

  return (
    <main className="screen has-ab">
      <ShopBar back="/" whyKey="day" />

      <header className="ev-head">
        <h1 className="display">{event.name}</h1>
        <p className="ev-meta">
          {event.dates} · Thialf ·{' '}
          <button type="button" className="inline-link" onClick={() => setSheet('prog')}>Programma</button> ·{' '}
          <button type="button" className="inline-link" onClick={() => setSheet('map')}>Plattegrond</button>
        </p>
      </header>

      <div className="seg-days" role="tablist" aria-label="Kies je dag">
        {segs.map((t) => {
          const n = shop.lines.filter((l) => l.kind === 'ticket' && l.item.day === t.key).reduce((s, l) => s + l.qty, 0);
          return (
            <Link key={t.key} to={`/tickets/${t.key}`} replace role="tab" aria-selected={t.key === day} className={t.key === day ? 'on' : ''} onClick={() => setOpen(null)}>
              <b>{t.top}</b><span>{t.sub}</span><small>{euro(minAdult(t.key)).replace(',00', '')}</small>
              {n > 0 && <i className="dot-n" aria-label={`${n} gekozen`}>{n}</i>}
            </Link>
          );
        })}
      </div>

      <p className="day-line">
        {d ? <>{d.long} · {d.time} · <button type="button" className="inline-link" onClick={() => setSheet('prog')}>{d.races.length} afstanden</button></>
          : <>Vrijdag, zaterdag én zondag{ppSave ? <> · <b className="save">bespaar tot {euro(ppSave.save)}</b></> : null}</>}
      </p>

      <p className="price-note">Prijzen per persoon, inclusief servicekosten. Kinderen t/m 5 jaar gratis.</p>

      <div className="day-grid">
      <div className="day-col">
      <div className="zone-list">
        {groups.filter((g) => zones.some((z) => zoneInfo[z].group === g.key)).map((g) => (
          <section key={g.key} aria-label={g.label}>
            <h2 className="list-h">{g.label}</h2>
            {zones.filter((z) => zoneInfo[z].group === g.key).map((z) => {
              const ps = ofDay.filter((p) => p.zone === z);
              const allOut = ps.every((p) => p.soldOut);
              const zi = zoneInfo[z];
              const isOpen = open === z;
              const inCart = ps.reduce((s, p) => s + (shop.qty[p.id] ?? 0), 0);
              return (
                <article key={z} ref={(el) => { refs.current[z] = el; }} className={`zrow ${isOpen ? 'open' : ''} ${allOut ? 'out' : ''}`}>
                  <button type="button" className="zrow-head" aria-expanded={isOpen} disabled={allOut} onClick={() => setOpen(isOpen ? null : z)}>
                    <span className="zrow-map"><ThialfMap compact selected={z} label={`Ligging ${zi.title}`} /></span>
                    <span className="zrow-txt">
                      <b>{zi.title}</b>
                      <small>{allOut ? 'Uitverkocht op deze dag' : zi.short}</small>
                    </span>
                    <span className="zrow-price">
                      {allOut ? '' : <><small>vanaf</small>{euro(minOf(ps))}</>}
                    </span>
                    {inCart > 0 && <i className="dot-n" aria-label={`${inCart} in je mandje`}>{inCart}</i>}
                    {!allOut && <span className="chev" aria-hidden><Icon name="chev" size={18} /></span>}
                  </button>
                  {isOpen && (
                    <div className="zrow-body">
                      {ps.map((p) => {
                        const cmp = p.day === 'pp' ? ppCompare(p.zone, p.audience) : null;
                        return (
                          <div key={p.id} className={`aud ${p.soldOut ? 'sold' : ''}`}>
                            <span className="aud-l">
                              <span>{audienceLabel[p.audience]}</span>
                              <b>{cmp && <s className="was">{euro(cmp.los)}</s>} {euro(p.price)}</b>
                            </span>
                            {p.soldOut ? <span className="sold-lbl">Uitverkocht</span>
                              : <Stepper value={shop.qty[p.id] ?? 0} max={p.max} onChange={(n) => change(p, n)} label={`${zi.title}, ${audienceLabel[p.audience]}`} />}
                          </div>
                        );
                      })}
                      <div className="zrow-foot">
                        <span>{zi.place}{zi.vakken ? ` · ${zi.vakken}` : ''}{ps.some((p) => p.limited) ? ' · beperkt beschikbaar' : ''}</span>
                        {(z === 'vip' || ps.some((p) => p.audience === 'kids')) && (
                          <button type="button" className="inline-link" onClick={() => setInfo(z)}>{z === 'vip' ? 'Wat zit erin?' : 'Leeftijden'}</button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </div>

      {ppTip && (
        <aside className="tip">
          <p><b>{ppTip.ppCost < ppTip.los ? `Bespaar ${euro(ppTip.los - ppTip.ppCost)}` : `Voor ${euro(ppTip.ppCost - ppTip.los)} meer alle 3 de dagen`}</b> met een passe-partout voor {zoneInfo[ppTip.pp.zone].title}.</p>
          <button type="button" className="inline-link" onClick={() => {
            ppTip.same.forEach((x) => shop.setQty(x.id, (shop.qty[x.id] ?? 0) - ppTip.n));
            shop.setQty(ppTip.pp.id, (shop.qty[ppTip.pp.id] ?? 0) + ppTip.n);
          }}>Omzetten</button>
        </aside>
      )}
      </div>
      <aside className="day-aside" aria-label="Plattegrond en je mandje">
        <div className="map-card"><ThialfMap available={available} selected={open} onSelect={jump} label="Tik op een vak om het te kiezen" /></div>
        <p className="map-hint">Klik op een vak om het te kiezen. Oost is de finishzijde.</p>
        <div className="aside-cart">
          <h2 className="list-h">Je mandje</h2>
          {shop.lines.length === 0 ? <p className="small muted">Nog leeg. Kies een vak en klik op +.</p> : (
            <ul>
              {shop.lines.map((l) => (
                <li key={l.item.id}><span>{l.qty}× {l.kind === 'ticket' ? `${zoneInfo[l.item.zone].title} · ${l.item.day === 'pp' ? 'alle dagen' : dayOf(l.item.day)!.name.toLowerCase()}` : `Parkeren ${l.item.lot}`}</span><b>{euro(l.item.price * l.qty)}</b></li>
              ))}
            </ul>
          )}
          <div className="aside-total"><span>Totaal</span><b>{euro(shop.total)}</b></div>
          <button type="button" className="btn btn-primary" disabled={!shop.ticketCount} onClick={() => nav('/parkeren')}>{shop.ticketCount ? <>Verder <Icon name="chev" /></> : 'Kies je plek'}</button>
        </div>
      </aside>
      </div>

      <ul className="usp-quiet" aria-label="Zekerheden">
        {usps.slice(0, 2).map((u) => <li key={u}><Icon name="check" size={14} /> {u}</li>)}
        <li><Icon name="info" size={14} /> <button type="button" className="inline-link" onClick={() => setSheet('faq')}>Veelgestelde vragen</button></li>
      </ul>

      <figure className="quote-quiet">
        <blockquote>{quotes.thialf.q}</blockquote>
        <figcaption>{quotes.thialf.who}</figcaption>
      </figure>

      <ProtoFooter />

      <ActionBar note={shop.ticketCount ? <><b>{shop.ticketCount} {shop.ticketCount === 1 ? 'ticket' : 'tickets'}</b> · {euro(shop.total)}</> : undefined}>
        <button type="button" className="btn btn-primary" disabled={!shop.ticketCount} onClick={() => nav('/parkeren')}>
          {shop.ticketCount ? <>Verder <Icon name="chev" /></> : 'Kies je plek'}
        </button>
      </ActionBar>

      {added && (
        <Sheet title="In je mandje" onClose={() => setAdded(null)}>
          <div className="added-item">
            <span className="ok-dot"><Icon name="check" size={18} /></span>
            <span><b>{zoneInfo[added.zone].title}</b><small>{added.day === 'pp' ? 'Alle 3 dagen' : dayOf(added.day)!.long} · {audienceLabel[added.audience]}</small></span>
            <b className="num">{euro(added.price)}</b>
          </div>
          {ppUpgrade && (
            <p className="upgrade">Kom je vaker? Alle 3 dagen voor <b>{euro(ppUpgrade.pp)}</b> <s>{euro(ppUpgrade.los)}</s>. <Link to="/tickets/pp" replace className="inline-link" onClick={() => { setAdded(null); setOpen(null); }}>Bekijk</Link></p>
          )}
          {suggestions(added).length > 0 && (
            <>
              <h3 className="list-h">Handig erbij</h3>
              {suggestions(added).map((s) => (
                <div key={s.id} className="aud">
                  <span className="aud-l"><span>{s.t} · {s.s}</span><b>{euro(s.price)}</b></span>
                  <Stepper value={shop.qty[s.id] ?? 0} max={s.max} onChange={(n) => shop.setQty(s.id, n)} label={s.t} />
                </div>
              ))}
            </>
          )}
          <div className="sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdded(null)}>Verder kiezen</button>
            <button type="button" className="btn btn-primary" onClick={() => { setAdded(null); nav('/winkelmand'); }}>Naar mandje</button>
          </div>
        </Sheet>
      )}

      {sheet === 'prog' && (
        <Sheet title="Programma" eyebrow="Onder voorbehoud" onClose={() => setSheet(null)}>
          {days.map((x) => (
            <section key={x.key} className="prog-day">
              <h3><span>{x.long}</span><small>{x.time}</small></h3>
              <ol className="race-list">{x.races.map((r) => <li key={r}>{r}</li>)}</ol>
            </section>
          ))}
          <p className="small muted">{event.doorsNote}</p>
        </Sheet>
      )}

      {sheet === 'map' && (
        <Sheet title="Plattegrond Thialf" eyebrow={d ? d.long : 'Alle 3 dagen'} onClose={() => setSheet(null)}>
          <div className="map-card"><ThialfMap available={available} selected={null} onSelect={jump} label="Tik op een vak om het te kiezen" /></div>
          <p className="map-hint">Tik op een vak om het te kiezen. Oost is de finishzijde.</p>
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
              <p className="small muted">Btw op food &amp; beverage is mogelijk niet aftrekbaar (art. 15 lid 5 Wet OB 1968).</p>
            </>
          ) : (
            <ul className="stack">{kidsRules.map((r) => <li key={r}><Icon name="users" size={16} /><span>{r}</span></li>)}</ul>
          )}
        </Sheet>
      )}
    </main>
  );
}

/** Stap 1: eerst de dag kiezen (zoals in de huidige shop), pas daarna de plekken. */
function DayPicker() {
  const shop = useShop();
  const nav = useNavigate();
  const [prog, setProg] = useState(false);
  const ppSave = ppCompare('noord', 'volw');
  const count = (k: DayKey) => shop.lines.filter((l) => l.kind === 'ticket' && l.item.day === k).reduce((s, l) => s + l.qty, 0);
  return (
    <main className={`screen ${shop.ticketCount ? 'has-ab' : ''}`}>
      <ShopBar whyKey="day" />
      <section className="pick-hero">
        <picture>
          <source media="(min-width: 900px)" srcSet={asset('img/hero-wide.jpg')} />
          <img src={asset('img/hero.jpg')} alt="Langebaanschaatser in actie" />
        </picture>
        <div className="ph-body">
          <span className="eyebrow">{event.dates} · Thialf, Heerenveen</span>
          <h1 className="display">{event.name}</h1>
          <p>{event.stakes}</p>
        </div>
      </section>

      <h2 className="pick-h">Welke dag kom je?</h2>
      <div className="pick-list">
        {days.map((x) => (
          <Link key={x.key} to={`/tickets/${x.key}`} className="pick">
            <span className="pick-date"><b>{x.date.split(' ')[0]}</b><i>{x.date.split(' ')[1]}</i></span>
            <span className="pick-txt"><b>{x.name}</b><small>{x.time} · {x.races.length} afstanden</small></span>
            <span className="zrow-price"><small>vanaf</small>{euro(minAdult(x.key))}</span>
            {count(x.key) > 0 && <i className="dot-n">{count(x.key)}</i>}
            <span className="chev" aria-hidden><Icon name="chev" size={18} /></span>
          </Link>
        ))}
        <Link to="/tickets/pp" className="pick pp">
          <span className="pick-date pp"><b>3</b><i>dagen</i></span>
          <span className="pick-txt"><b>Alle 3 dagen</b><small>Passe-partout{ppSave ? ` · bespaar tot ${euro(ppSave.save)}` : ''}</small></span>
          <span className="zrow-price"><small>vanaf</small>{euro(minAdult('pp'))}</span>
          {count('pp') > 0 && <i className="dot-n">{count('pp')}</i>}
          <span className="chev" aria-hidden><Icon name="chev" size={18} /></span>
        </Link>
      </div>

      <p className="price-note">Prijzen per persoon, inclusief servicekosten. Kinderen t/m 5 jaar gratis. <button type="button" className="inline-link" onClick={() => setProg(true)}>Bekijk het programma</button></p>

      <ul className="usp-quiet" aria-label="Zekerheden">
        {usps.slice(0, 2).map((u) => <li key={u}><Icon name="check" size={14} /> {u}</li>)}
      </ul>

      <ProtoFooter />

      {shop.ticketCount > 0 && (
        <ActionBar note={<><b>{shop.ticketCount} {shop.ticketCount === 1 ? 'ticket' : 'tickets'}</b> · {euro(shop.total)}</>}>
          <button type="button" className="btn btn-primary" onClick={() => nav('/parkeren')}>Verder <Icon name="chev" /></button>
        </ActionBar>
      )}

      {prog && (
        <Sheet title="Programma" eyebrow="Onder voorbehoud" onClose={() => setProg(false)}>
          {days.map((x) => (
            <section key={x.key} className="prog-day">
              <h3><span>{x.long}</span><small>{x.time}</small></h3>
              <ol className="race-list">{x.races.map((r) => <li key={r}>{r}</li>)}</ol>
              <Link to={`/tickets/${x.key}`} className="inline-link">Kies {x.name.toLowerCase()}</Link>
            </section>
          ))}
          <p className="small muted">{event.doorsNote}</p>
        </Sheet>
      )}
    </main>
  );
}
