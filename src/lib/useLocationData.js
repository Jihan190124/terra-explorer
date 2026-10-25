import { useEffect, useState } from 'react';
import { fetchAir, fetchWeather, reversePlace } from './api.js';

const IDLE = { status: 'idle', place: null, weather: null, air: null };

// Each request is independent: if air quality fails, weather still shows.
export function useLocationData(sel) {
  const [state, setState] = useState(IDLE);

  useEffect(() => {
    if (!sel) return setState(IDLE);
    const ctl = new AbortController();
    const { signal } = ctl;
    const named = sel.name ? { name: sel.name, region: sel.region } : null;
    setState({ status: 'loading', place: named, weather: null, air: null });

    const val = (p) => (p.status === 'fulfilled' ? p.value : null);
    Promise.allSettled([
      fetchWeather(sel.lat, sel.lng, signal),
      fetchAir(sel.lat, sel.lng, signal),
      named ? Promise.resolve(null) : reversePlace(sel.lat, sel.lng, signal),
    ]).then(([w, a, r]) => {
      if (signal.aborted) return;
      setState((s) => ({ status: 'ready', place: s.place || val(r), weather: val(w), air: val(a) }));
    });
    return () => ctl.abort();
  }, [sel]);

  return state;
}
