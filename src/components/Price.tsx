/**
 * Prijs zoals bol.com: geen €-teken, centen klein en verhoogd, hele euro's als ",-".
 * Schermlezers horen "25 euro en 50 cent".
 */
export function Price({ v, className = '' }: { v: number; className?: string }) {
  const cents = Math.round(v * 100);
  const whole = Math.trunc(cents / 100);
  const cc = Math.abs(cents % 100);
  return (
    <span className={`price ${className}`} aria-label={`${whole} euro${cc ? ` en ${cc} cent` : ''}`}>
      <span aria-hidden="true">{whole.toLocaleString('nl-NL')},{cc ? <sup>{String(cc).padStart(2, '0')}</sup> : '-'}</span>
    </span>
  );
}
