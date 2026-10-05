import { useEffect, useState } from 'react';
import { isMock, subscribeLog } from '../api/client';
import type { ApiLogEntry } from '../api/types';
import { Icon } from './ui';

/** "Onder de motorkap": laat zien welke Paylogic-aanroep elke klik veroorzaakt. */
export function ApiToggle() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<ApiLogEntry[]>([]);
  const [fresh, setFresh] = useState(0);

  useEffect(() => subscribeLog((l) => { setLog(l); setFresh((f) => f + 1); }), []);
  useEffect(() => { if (open) setFresh(0); }, [open, log]);

  return (
    <>
      <button type="button" className="api-btn" onClick={() => setOpen(true)} aria-label="Toon API-aanroepen">
        <Icon name="code" /> API{fresh > 0 && !open ? <span className="dot" /> : null}
      </button>
      {open && (
        <div className="sheet-wrap" onClick={() => setOpen(false)}>
          <section className="sheet" role="dialog" aria-label="Onder de motorkap" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <div>
                <span className="eyebrow">Onder de motorkap</span>
                <h2 className="display">Paylogic API</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Sluiten"><Icon name="close" /></button>
            </div>
            <p className="small muted">
              {isMock
                ? 'Voorbeeldmodus: deze aanroepen worden nagebootst. In productie gaan ze via jullie eigen server (BFF) naar shopping-api.paylogic.com.'
                : 'Live: aanroepen gaan via de BFF naar Paylogic.'}
            </p>
            <div className="flow">
              <span>Browser</span><i>→</i><span>Eigen server<small>houdt API-sleutel</small></span><i>→</i><span>Paylogic</span>
            </div>
            {log.length === 0 ? (
              <p className="faint small">Nog geen aanroepen.</p>
            ) : (
              <ol className="api-log">
                {log.map((e) => (
                  <li key={e.id}>
                    <span className={`m m-${e.method.toLowerCase()}`}>{e.method}</span>
                    <code>{e.path}</code>
                    <span className="ms">{e.ms} ms</span>
                    <span className="note">{e.note}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </>
  );
}
