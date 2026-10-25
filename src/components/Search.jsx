import { useEffect, useState } from 'react';
import { searchPlaces } from '../lib/api.js';

export default function Search({ onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setNote('');
      return;
    }
    const ctl = new AbortController();
    const id = setTimeout(() => {
      searchPlaces(query.trim(), ctl.signal)
        .then((r) => {
          setResults(r);
          setNote(r.length ? '' : 'No matching places.');
        })
        .catch((e) => e.name !== 'AbortError' && setNote('Search is unavailable right now.'));
    }, 300);
    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [query]);

  const choose = (place) => {
    onPick(place);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="search">
      <label className="sr" htmlFor="place-search">Search for a city</label>
      <input
        id="place-search"
        type="search"
        autoComplete="off"
        placeholder="Search for a city"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && results[0] && choose(results[0])}
      />
      {(results.length > 0 || note) && (
        <ul className="results">
          {results.map((r) => (
            <li key={r.id}>
              <button onClick={() => choose(r)}>
                {r.name}
                <span>{r.region}</span>
              </button>
            </li>
          ))}
          {note && <li className="note">{note}</li>}
        </ul>
      )}
    </div>
  );
}
