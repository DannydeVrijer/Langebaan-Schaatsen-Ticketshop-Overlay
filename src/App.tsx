import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ShopProvider } from './state';
import { ApiToggle } from './components/ApiPanel';
import Events from './screens/Events';
import Shop from './screens/Shop';
import Checkout from './screens/Checkout';
import Payment from './screens/Payment';
import Done from './screens/Done';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ShopProvider>
        <ScrollTop />
        <div className="app">
          <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/event/:uid" element={<Shop />} />
            <Route path="/gegevens" element={<Checkout />} />
            <Route path="/betalen/:order" element={<Payment />} />
            <Route path="/bevestiging" element={<Done />} />
            <Route path="*" element={<Events />} />
          </Routes>
          <ApiToggle />
        </div>
      </ShopProvider>
    </HashRouter>
  );
}
