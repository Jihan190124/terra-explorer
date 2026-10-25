// All endpoints are free and keyless (Open-Meteo, BigDataCloud), so they work from a static site.
const get = async (url, signal) => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

const ll = (lat, lng) => `latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}`;

export const fetchWeather = (lat, lng, signal) =>
  get(
    `https://api.open-meteo.com/v1/forecast?${ll(lat, lng)}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
    signal
  );

export const fetchAir = (lat, lng, signal) =>
  get(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${ll(lat, lng)}` +
      `&current=us_aqi,pm2_5,pm10,ozone&timezone=auto`,
    signal
  );

export async function searchPlaces(query, signal) {
  const d = await get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
    signal
  );
  return (d.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lng: r.longitude,
  }));
}

export async function reversePlace(lat, lng, signal) {
  const d = await get(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    signal
  );
  const name = d.city || d.locality || d.principalSubdivision || d.countryName;
  if (!name) return null;
  return { name, region: [d.principalSubdivision, d.countryName].filter((x) => x && x !== name).join(', ') };
}
