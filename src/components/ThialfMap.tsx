import type { ZoneKey } from '../api/types';
import { euro } from '../state';

type Z = Exclude<ZoneKey, 'parking'>;
export type ZoneInfo = { from: number | null; soldOut: boolean };

/**
 * Schematische plattegrond van Thialf (noord boven). Elk vak is aanklikbaar.
 * Let op: indeling is indicatief; exacte ligging van VIP en mindervaliden bevestigen.
 */
const shapes: Record<Z, { d: string; label: string; lx: number; ly: number; rotate?: number }> = {
  noord: { d: 'M 66 150 A 104 104 0 0 1 274 150 L 238 150 A 68 68 0 0 0 102 150 Z', label: 'NOORD', lx: 170, ly: 64 },
  zuid: { d: 'M 66 270 A 104 104 0 0 0 274 270 L 238 270 A 68 68 0 0 1 102 270 Z', label: 'ZUID', lx: 170, ly: 357 },
  west: { d: 'M 66 156 H 100 V 226 H 66 Z', label: 'WEST', lx: 83, ly: 191, rotate: -90 },
  mv: { d: 'M 66 232 H 100 V 264 H 66 Z', label: '♿', lx: 83, ly: 252 },
  oost: { d: 'M 240 156 H 274 V 264 H 240 Z', label: 'OOST', lx: 257, ly: 210, rotate: 90 },
  vip: { d: 'M 280 170 H 300 V 250 H 280 Z', label: 'VIP', lx: 290, ly: 210, rotate: 90 },
};

export function ThialfMap({ info, selected, onSelect }: { info: Record<Z, ZoneInfo | undefined>; selected: Z | null; onSelect: (z: Z) => void }) {
  return (
    <svg className="thialf" viewBox="40 20 280 380" role="group" aria-label="Plattegrond Thialf: kies je vak">
      <defs>
        <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F2FF" stopOpacity=".22" />
          <stop offset="1" stopColor="#A8CFFD" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id="lane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".6" stopColor="#A8CFFD" />
          <stop offset="1" stopColor="#A8CFFD" stopOpacity=".2" />
        </linearGradient>
      </defs>

      {/* ijsbaan */}
      <rect x="106" y="86" width="128" height="248" rx="64" fill="url(#ice)" />
      <rect x="110" y="90" width="120" height="240" rx="60" fill="none" stroke="url(#lane)" strokeWidth="5" />
      <rect x="128" y="108" width="84" height="204" rx="42" fill="none" stroke="url(#lane)" strokeWidth="2.5" opacity=".7" />
      <text x="170" y="214" textAnchor="middle" className="map-ice">400 M</text>
      <line x1="230" y1="232" x2="212" y2="232" stroke="#fff" strokeWidth="2" opacity=".8" />
      <text x="221" y="246" textAnchor="middle" className="map-finish">FINISH</text>

      {(Object.keys(shapes) as Z[]).map((z) => {
        const s = shapes[z];
        const i = info[z];
        const disabled = !i || i.soldOut;
        const on = selected === z;
        return (
          <g
            key={z}
            className={`zone ${on ? 'on' : ''} ${disabled ? 'off' : ''}`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-pressed={on}
            aria-disabled={disabled}
            aria-label={`${z}${i?.from != null ? `, vanaf ${euro(i.from)}` : ''}${i?.soldOut ? ', uitverkocht' : ''}${!i ? ', niet beschikbaar op deze dag' : ''}`}
            onClick={() => !disabled && onSelect(z)}
            onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(z); } }}
          >
            <path d={s.d} />
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" transform={s.rotate ? `rotate(${s.rotate} ${s.lx} ${s.ly})` : undefined}>{s.label}</text>
          </g>
        );
      })}

      {/* prijslabels bochten */}
      {info.noord?.from != null && <text x="170" y="40" textAnchor="middle" className="map-price">vanaf {euro(info.noord.from)}</text>}
      {info.zuid?.from != null && <text x="170" y="392" textAnchor="middle" className="map-price">vanaf {euro(info.zuid.from)}</text>}
    </svg>
  );
}
