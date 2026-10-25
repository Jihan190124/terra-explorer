import { aqiBand, compass, describeWeather, temp } from '../lib/describe.js';

const QUICK = [
  { name: 'Reykjavik', region: 'Iceland', lat: 64.1466, lng: -21.9426 },
  { name: 'Nairobi', region: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Delhi', region: 'India', lat: 28.6139, lng: 77.209 },
  { name: 'Lima', region: 'Peru', lat: -12.0464, lng: -77.0428 },
  { name: 'Sydney', region: 'Australia', lat: -33.8688, lng: 151.2093 },
];

const coords = ({ lat, lng }) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;

// Half-circle gauge on the 0-300 AQI scale (values above 300 pin to the end).
function AqiGauge({ aqi, color }) {
  const len = Math.PI * 50;
  const fill = (Math.min(aqi, 300) / 300) * len;
  return (
    <svg className="gauge" viewBox="0 0 120 70" role="img" aria-label={`Air quality index ${aqi}`}>
      <path d="M10 60 A50 50 0 0 1 110 60" className="gauge-track" />
      <path d="M10 60 A50 50 0 0 1 110 60" className="gauge-fill" stroke={color} strokeDasharray={`${fill} ${len}`} />
      <text x="60" y="56" textAnchor="middle" className="gauge-num">{aqi}</text>
    </svg>
  );
}

export default function Dashboard({ selected, data, units, onUnits, onPick }) {
  if (!selected) {
    return (
      <div className="empty">
        <h2>Pick a place</h2>
        <p>Click anywhere on the globe, or start with one of these.</p>
        <ul className="picks">
          {QUICK.map((q) => (
            <li key={q.name}>
              <button onClick={() => onPick(q, true)}>
                {q.name}
                <span>{q.region}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { status, place, weather, air } = data;
  const c = weather?.current;
  const d = weather?.daily;
  const aq = air?.current;
  const band = aq?.us_aqi != null ? aqiBand(aq.us_aqi) : null;

  return (
    <div className="detail" aria-live="polite">
      <div className="where">
        <h2>{place?.name || (status === 'loading' ? 'Locating…' : 'Selected point')}</h2>
        {place?.region && <p>{place.region}</p>}
        <p className="muted">{coords(selected)}</p>
      </div>

      <div className="units" role="group" aria-label="Temperature units">
        {['c', 'f'].map((u) => (
          <button key={u} aria-pressed={units === u} onClick={() => onUnits(u)}>°{u.toUpperCase()}</button>
        ))}
      </div>

      {status === 'loading' && <p className="muted">Loading conditions…</p>}

      {status === 'ready' && !c && <p className="muted">Weather data is unavailable here. Try another place.</p>}
      {c && (
        <section className="now" aria-label="Current weather">
          <p className="temp">{temp(c.temperature_2m, units)}</p>
          <p className="cond">{describeWeather(c.weather_code)}</p>
          <dl className="facts">
            <div><dt>Feels like</dt><dd>{temp(c.apparent_temperature, units)}</dd></div>
            <div><dt>Humidity</dt><dd>{c.relative_humidity_2m}%</dd></div>
            <div><dt>Wind</dt><dd>{Math.round(c.wind_speed_10m)} km/h {compass(c.wind_direction_10m)}</dd></div>
            <div><dt>Rain now</dt><dd>{c.precipitation} mm</dd></div>
          </dl>
        </section>
      )}

      {status === 'ready' && (
        <section className="air" aria-label="Air quality">
          <h3>Air quality</h3>
          {band ? (
            <div className="air-row">
              <AqiGauge aqi={aq.us_aqi} color={band.color} />
              <div>
                <p className="band" style={{ color: band.color }}>{band.label}</p>
                <p className="muted">
                  PM2.5 {aq.pm2_5 ?? '–'} µg/m³<br />PM10 {aq.pm10 ?? '–'} µg/m³<br />Ozone {aq.ozone ?? '–'} µg/m³
                </p>
              </div>
            </div>
          ) : (
            <p className="muted">No air quality reading covers this spot.</p>
          )}
        </section>
      )}

      {d && (
        <section aria-label="Five day forecast">
          <h3>Next five days</h3>
          <ol className="days">
            {d.time.map((t, i) => (
              <li key={t}>
                <span>{new Date(`${t}T00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <strong>{temp(d.temperature_2m_max[i], units)}</strong>
                <span className="muted">{temp(d.temperature_2m_min[i], units)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="credit muted">Weather and air quality from Open-Meteo.</p>
    </div>
  );
}
