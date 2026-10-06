import { Navigate, useNavigate } from 'react-router-dom';
import { ShopBar, StepBar } from '../components/ui';
import { Price } from '../components/Price';
import { useShop } from '../state';

/** Simulatie van de overstap naar de betaalpagina (in het echt: iDEAL/PSP via Paylogic). */
export default function Pay() {
  const shop = useShop();
  const nav = useNavigate();
  const o = shop.order;
  if (!o) return <Navigate to="/" replace />;

  return (
    <main className="screen">
      <ShopBar />
      <StepBar at={5} />
      <section className="handoff">
        <span className="eyebrow">Betalen · {o.method}</span>
        <h1 className="display">Je gaat nu naar {o.method}</h1>
        <p className="muted">Na het betalen kom je automatisch terug en staan je tickets in je mail.</p>
        <div className="sim-box">
          <span className="sim-label">Simulatie · er wordt niets betaald</span>
          <div className="sim-amount"><Price v={o.total} /></div>
          <div className="btn-col">
            <button type="button" className="btn btn-primary" onClick={() => { shop.clear(); nav('/bedankt', { replace: true }); }}>Simuleer: betaling gelukt</button>
            <button type="button" className="btn btn-ghost" onClick={() => nav('/gegevens', { replace: true })}>Simuleer: betaling afgebroken</button>
          </div>
        </div>
      </section>
    </main>
  );
}
