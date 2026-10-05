import type { Zone } from '../data/event';

/**
 * Plattegrond Thialf zoals in de huidige shop: West boven (vak K–N), Oost onder (vak A–E, finishzijde),
 * Sven Kramer bocht (Zuid) links, Ireen Wüst bocht (Noord) rechts, mindervaliden bij de Sven Kramer bocht.
 * Indicatief; VIP (2e etage Oost) schematisch.
 */

const P = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)].map((v) => v.toFixed(1)).join(' ');
const band = (cx: number, cy: number, ri: number, ro: number, a0: number, a1: number) =>
  `M ${P(cx, cy, ro, a0)} A ${ro} ${ro} 0 0 1 ${P(cx, cy, ro, a1)} L ${P(cx, cy, ri, a1)} A ${ri} ${ri} 0 0 0 ${P(cx, cy, ri, a0)} Z`;

const cells = (x0: number, y: number, w: number, h: number, labels: string[]) =>
  labels.map((l, i) => ({ x: x0 + i * w, y, w, h, l }));

const WEST = cells(116, 8, 32, 24, ['K', 'L', 'M', 'N']);
const OOST = cells(100, 174, 32, 24, ['E', 'D', 'C', 'B', 'A']);

type Props = {
  selected?: Zone | null;
  available?: Partial<Record<Zone, boolean>>; // false = uitverkocht/niet op deze dag
  onSelect?: (z: Zone) => void;
  compact?: boolean;
  label?: string;
};

export function ThialfMap({ selected = null, available, onSelect, compact, label = 'Plattegrond Thialf' }: Props) {
  const cls = (z: Zone) => {
    const off = available && available[z] === false;
    const none = available && available[z] === undefined;
    return `zone ${selected === z ? 'on' : ''} ${off ? 'off' : ''} ${none ? 'none' : ''} ${onSelect ? 'tap' : ''}`;
  };
  const act = (z: Zone) => (onSelect && available?.[z] !== false && available?.[z] !== undefined ? () => onSelect(z) : undefined);
  const a11y = (z: Zone, name: string) => onSelect ? {
    role: 'button', tabIndex: available?.[z] ? 0 : -1, 'aria-label': name, 'aria-pressed': selected === z,
    onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && act(z)) { e.preventDefault(); act(z)!(); } },
  } : {};

  return (
    <svg className={`thialf ${compact ? 'compact' : ''}`} viewBox="40 2 280 218" role={onSelect ? 'group' : 'img'} aria-label={label}>
      {/* ijs + baan */}
      <rect x="86" y="60" width="188" height="86" rx="43" className="ice" />
      <rect x="92" y="66" width="176" height="74" rx="37" className="lane" />
      <rect x="108" y="80" width="144" height="46" rx="23" className="lane inner" />
      {!compact && <text x="180" y="138" textAnchor="middle" className="t-finish">FINISHZIJDE</text>}

      {/* bochten */}
      <g className={cls('zuid')} onClick={act('zuid')} {...a11y('zuid', 'Sven Kramer bocht, staanplaats Zuid')}>
        <path d={band(129, 103, 48, 66, 116, 270)} />
        {!compact && <text x="72" y="96" textAnchor="middle" dominantBaseline="middle" transform="rotate(-90 72 96)">SVEN KRAMER</text>}
      </g>
      <g className={cls('mv')} onClick={act('mv')} {...a11y('mv', 'Mindervaliden tribune')}>
        <path d={band(129, 103, 48, 66, 92, 112)} />
        <text x="113" y="163" textAnchor="middle" dominantBaseline="middle" className="t-ico">♿</text>
      </g>
      <g className={cls('noord')} onClick={act('noord')} {...a11y('noord', 'Ireen Wüst bocht, staanplaats Noord')}>
        <path d={band(231, 103, 48, 66, -90, 90)} />
        {!compact && <text x="288" y="103" textAnchor="middle" dominantBaseline="middle" transform="rotate(90 288 103)">IREEN WÜST</text>}
      </g>

      {/* West */}
      <g className={cls('west')} onClick={act('west')} {...a11y('west', 'Tribune West, vak K tot N')}>
        {WEST.map((c) => <rect key={c.l} x={c.x} y={c.y} width={c.w - 3} height={c.h} rx="4" />)}
        {!compact && WEST.map((c) => <text key={c.l} x={c.x + (c.w - 3) / 2} y={c.y + 16} textAnchor="middle">{c.l}</text>)}
      </g>
      {/* Oost */}
      <g className={cls('oost')} onClick={act('oost')} {...a11y('oost', 'Tribune Oost, vak A tot E, finishzijde')}>
        {OOST.map((c) => <rect key={c.l} x={c.x} y={c.y} width={c.w - 3} height={c.h} rx="4" />)}
        {!compact && OOST.map((c) => <text key={c.l} x={c.x + (c.w - 3) / 2} y={c.y + 16} textAnchor="middle">{c.l}</text>)}
      </g>
      {/* VIP 2e etage */}
      <g className={cls('vip')} onClick={act('vip')} {...a11y('vip', 'VIP-arrangement, 2e etage Oost')}>
        <rect x="124" y="202" width="112" height="14" rx="4" />
        {!compact && <text x="180" y="212" textAnchor="middle" className="t-small">VIP · 2E ETAGE</text>}
      </g>

    </svg>
  );
}
