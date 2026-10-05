import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audienceLabel, dayOf, days, euro, groups, kidsRules, products, quotes, vipStack, zoneInfo, type DayKey, type Group, type Product, type Zone } from '../data/event';
import { ThialfMap } from '../components/ThialfMap';
import { ActionBar, Icon, Sheet, ShopBar, StepBar, Stepper } from '../components/ui';
import { useShop } from '../state';

const tabs: { key: DayKey; label: string; sub: string }[] = [
  ...days.map((d) => ({ key: d.key, label: d.name.slice(0, 2) + ' ' + d.date, sub: d.time.split(' ')[0] })),
  { key: 'pp', label: 'Alle dagen', sub: 'Passe-partout' },
];

export default function Day() {
  const { day = 'za' } = useParams();
  const nav = useNavigate();
  const shop = useShop();
  const [filter, setFilter] = useState<Group | 'alle'>('alle');
  const [info, setInfo] = useState<Zone | null>(null);
  const [hl, setHl] = useState<Zone | null>(null);
  const refs = useRef<Partial<Record<Zone, HTMLElement | null>>>({});

  const ofDay = useMemo(() => products.filter((p) => p.day === day), [day]);

  const zones = [...new Set(ofDay.map((p) => p.zone))];
  const available = Object.fromEntries(zones.map((z) => [z, ofDay.some((p) => p.zone === z && !p.soldOut)])) as Partial<Record<Zone, boolean>>;
  const groupsHere = groups.filter((g) => zones.some((z) => zoneInfo[z].group === g.key));

  const jump = (z: Zone) => {
    setFilter('alle');
    setHl(z);
    setTimeout(() => refs.current[z]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
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
  const dayTotal = shop.lines.filter((l) => l.kind === 'ticket' && l.item.day === day).reduce((s, l) => s + l.qty, 0);

  return (
    <main className="screen has-ab">
      <ShopBar back="/" whyKey="day" />
      <StepBar at={1} />

      <div className="day-tabs" role="tablist" aria-label="Kies dag">
        {tabs.map((t) => {
          const n = shop.lines.filter((l) => l.kind === 'ticket' && l.item.day === t.key).reduce((s, l) => s + l.qty, 0);
          return (
            <Link key={t.key} to={`/tickets/${t.key}`} replace role="tab" aria-selected={t.key === day} className={`day-tab ${t.key === day ? 'on' : ''}`}>
              <b>{t.label}</b><small>{t.sub}</small>
              {n > 0 && <span className="dt-n" aria-label={`${n} gekozen`}>{n}</span>}
            </Link>
          );
        })}
      </div>

      <header className="day-head">
        <h1 className="display">{d ? d.long : 'Passe-partout'}</h1>
        <p className="muted">{d ? <><Icon name="clock" size={15} /> Wedstrijden {d.time} · {d.races.length} afstanden</> : 'Eén ticket voor vrijdag, zaterdag én zondag.'}</p>
      </header>

      <section className="map-card tap" aria-label="Kies een vak op de plattegrond">
        <ThialfMap available={available} selected={hl} onSelect={jump} label="Tik op een vak om naar dat ticket te gaan" />
        <p className="map-hint">Tik op een vak om naar dat ticket te gaan. Gestreept = uitverkocht of niet te koop op deze dag.</p>
      </section>

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
                <div className="zc-top">
                  <div className="zc-map"><ThialfMap compact selected={z} label={`Ligging ${zi.title}`} /></div>
                  <div className="zc-title">
                    <h3>{zi.title}</h3>
                    <span className="zc-place">{zi.place}{zi.vakken ? ` · ${zi.vakken}` : ''}</span>
                    {ps.some((p) => p.limited && !p.soldOut) && <span className="tag warn">Beperkt beschikbaar</span>}
                    {allOut && <span className="tag out">Uitverkocht</span>}
                  </div>
                </div>
                <p className="zc-pitch">{zi.pitch}</p>
                {(z === 'vip' || ps.some((p) => p.audience === 'kids')) && (
                  <button type="button" className="link-btn" onClick={() => setInfo(z)}>
                    <Icon name="info" size={16} /> {z === 'vip' ? 'Wat zit er in het VIP-arrangement?' : 'Welke leeftijd telt als kind?'}
                  </button>
                )}
                <ul className="prod-rows">
                  {ps.map((p) => (
                    <li key={p.id} className={p.soldOut ? 'sold' : ''}>
                      <div className="pr-info">
                        <span className="pr-aud">{audienceLabel[p.audience]}</span>
                        <span className="pr-price">{euro(p.price)}</span>
                        <span className="pr-fee">incl. {euro(p.fee)} servicekosten</span>
                      </div>
                      {p.soldOut
                        ? <span className="sold-lbl">Uitverkocht</span>
                        : <Stepper value={shop.qty[p.id] ?? 0} max={p.max} onChange={(n) => shop.setQty(p.id, n)} label={`${zi.title}, ${audienceLabel[p.audience]}`} />}
                    </li>
                  ))}
                </ul>
                {quotes[z] && (
                  <figure className="mini-quote"><blockquote>{quotes[z].q}</blockquote><figcaption>{quotes[z].who}</figcaption></figure>
                )}
              </article>
            );
          })}
          {g.key === 'zitten' && <figure className="mini-quote solo"><blockquote>{quotes.zitten.q}</blockquote><figcaption>{quotes.zitten.who}</figcaption></figure>}
        </section>
      ))}

      {day === 'za' && <p className="note"><Icon name="info" size={15} /> Mindervaliden is zaterdag uitverkocht. Op vrijdag en zondag zijn er nog plekken.</p>}

      {ppTip ? (
        <aside className="tip">
          <strong>{ppTip.ppCost < ppTip.los ? `Bespaar ${euro(ppTip.los - ppTip.ppCost)} met een passe-partout` : `Voor ${euro(ppTip.ppCost - ppTip.los)} extra ben je alle 3 de dagen erbij`}</strong>
          <p>Je hebt {zoneInfo[ppTip.pp.zone].title} op {ppTip.same.length} dagen. Een passe-partout kost {euro(ppTip.pp.price)} p.p. voor alle 3 de dagen.</p>
          <button type="button" className="btn btn-secondary sm" onClick={() => {
            ppTip.same.forEach((x) => shop.setQty(x.id, (shop.qty[x.id] ?? 0) - ppTip.n));
            shop.setQty(ppTip.pp.id, (shop.qty[ppTip.pp.id] ?? 0) + ppTip.n);
          }}>Zet om naar {ppTip.n === 1 ? 'passe-partout' : `${ppTip.n} passe-partouts`}</button>
        </aside>
      ) : day !== 'pp' && dayTotal > 0 ? (
        <p className="note">Kom je vaker? <Link to="/tickets/pp"><u>Met een passe-partout ben je alle 3 de dagen erbij</u></Link>.</p>
      ) : null}

      <ActionBar note={shop.ticketCount ? <><b>{shop.ticketCount} {shop.ticketCount === 1 ? 'ticket' : 'tickets'}</b> · {euro(shop.total)} incl. servicekosten</> : 'Kies met + hoeveel tickets je wilt'}>
        <button type="button" className="btn btn-primary" disabled={!shop.ticketCount} onClick={() => nav('/parkeren')}>
          {shop.ticketCount ? <>Verder naar parkeren <Icon name="chev" /></> : 'Nog geen tickets gekozen'}
        </button>
      </ActionBar>

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
