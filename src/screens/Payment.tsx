import { Navigate, useNavigate } from 'react-router-dom';
import { logCall } from '../api/client';
import { Steps, TopBar } from '../components/ui';
import { euro, useShop } from '../state';

/**
 * SIMULATIE van de betaalstap. In het echt stuurt de shop de koper naar de
 * `payment`-link uit de order (een pagina van Paylogic). Daarna komt de koper
 * terug op onze `redirect_url`. Dit scherm laat alleen zien wáár die overgang zit.
 */
export default function Payment() {
  const shop = useShop();
  const nav = useNavigate();
  const o = shop.lastOrder;
  if (!o) return <Navigate to="/" replace />;

  const finish = (ok: boolean) => {
    logCall('REDIRECT', ok ? 'redirect_url → /bevestiging' : 'redirect_url → /gegevens', ok ? 'Paylogic stuurt de koper terug na betaling' : 'Betaling mislukt; koper terug naar gegevens', 0);
    if (ok) { shop.clear(); nav('/bevestiging', { replace: true }); } else nav('/gegevens', { replace: true });
  };

  return (
    <main className="screen">
      <TopBar />
      <Steps at={3} />
      <div className="handoff">
        <span className="eyebrow">Overgang naar betaalomgeving</span>
        <h1 className="display" style={{ fontSize: 30 }}>Hier verlaat je even onze shop</h1>
        <p className="muted">
          In de echte shop ga je nu naar de beveiligde betaalpagina van de ticketpartner. Na het betalen kom je automatisch terug.
        </p>
        <div className="sim-box">
          <span className="sim-label">Simulatie · geen echte betaling</span>
          <dl className="kv">
            <dt>Order</dt><dd><code>{o.uid}</code></dd>
            <dt>Bedrag</dt><dd>{euro(o.total)}</dd>
            <dt>Methode</dt><dd>{o.method}</dd>
          </dl>
          <div className="btn-col">
            <button type="button" className="btn btn-primary" onClick={() => finish(true)}>Simuleer: betaling gelukt</button>
            <button type="button" className="btn btn-ghost" onClick={() => finish(false)}>Simuleer: betaling mislukt</button>
          </div>
        </div>
      </div>
    </main>
  );
}
