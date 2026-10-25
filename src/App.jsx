import { useEffect, useState } from 'react';
import Globe from './components/Globe.jsx';
import Dashboard from './components/Dashboard.jsx';
import Search from './components/Search.jsx';
import { useLocationData } from './lib/useLocationData.js';

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setReduced(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduced;
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [focus, setFocus] = useState(null);
  const [units, setUnits] = useState('c');
  const reducedMotion = useReducedMotion();
  const data = useLocationData(selected);

  // fly = true moves the camera to the place (search, quick picks); clicks on the globe don't.
  const pick = (place, fly = false) => {
    setSelected(place);
    if (fly) setFocus({ lat: place.lat, lng: place.lng });
  };

  return (
    <div className="app">
      <main className="stage">
        <header className="top">
          <h1>Terra Explorer</h1>
          <Search onPick={(p) => pick(p, true)} />
        </header>
        <Globe selected={selected} focus={focus} reducedMotion={reducedMotion} onPick={(p) => pick(p)} />
        <p className="hint">Drag to rotate. Scroll or pinch to zoom. Click a place to inspect it.</p>
      </main>
      <aside className="panel" aria-label="Location details">
        <Dashboard selected={selected} data={data} units={units} onUnits={setUnits} onPick={pick} />
      </aside>
    </div>
  );
}
