import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ShopProvider } from './state';
import Day from './screens/Day';
import Parking from './screens/Parking';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import Pay from './screens/Pay';
import Thanks from './screens/Thanks';

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
            <Route path="/" element={<Day />} />
            <Route path="/tickets/:day" element={<Day />} />
            <Route path="/parkeren" element={<Parking />} />
            <Route path="/winkelmand" element={<Cart />} />
            <Route path="/gegevens" element={<Checkout />} />
            <Route path="/betalen" element={<Pay />} />
            <Route path="/bedankt" element={<Thanks />} />
            <Route path="*" element={<Day />} />
          </Routes>
        </div>
      </ShopProvider>
    </HashRouter>
  );
}
