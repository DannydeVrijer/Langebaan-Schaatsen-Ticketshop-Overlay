import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { DESKTOP_W, useWide } from './components/ui';
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

/** Desktopweergave op een smal scherm: render op 1280 px en schaal naar de schermbreedte. */
function Frame({ children }: { children: ReactNode }) {
  const wide = useWide();
  const ref = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(window.innerWidth);
  const [h, setH] = useState<number | undefined>();
  const scale = wide && vw < DESKTOP_W ? vw / DESKTOP_W : 1;
  useEffect(() => { const r = () => setVw(window.innerWidth); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  useEffect(() => { document.body.classList.toggle('wide', wide); document.body.classList.toggle('scaled', scale < 1); }, [wide, scale]);
  useLayoutEffect(() => {
    if (scale === 1 || !ref.current) { setH(undefined); return; }
    const el = ref.current;
    const ro = new ResizeObserver(() => setH(el.offsetHeight * scale));
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale]);
  return (
    <div style={scale < 1 ? { height: h, overflow: 'clip' } : undefined}>
      <div ref={ref} className={`app ${wide ? 'wide' : ''}`} style={scale < 1 ? { width: DESKTOP_W, maxWidth: 'none', transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ShopProvider>
        <ScrollTop />
        <Frame>
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
        </Frame>
      </ShopProvider>
    </HashRouter>
  );
}
