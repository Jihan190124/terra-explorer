const CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers', 85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm, hail', 99: 'Thunderstorm, hail',
};
export const describeWeather = (code) => CODES[code] ?? 'Unknown conditions';

// US AQI bands
const BANDS = [
  [50, 'Good', '#5fbf8a'],
  [100, 'Moderate', '#e8c547'],
  [150, 'Unhealthy for sensitive groups', '#f0954b'],
  [200, 'Unhealthy', '#e0594f'],
  [300, 'Very unhealthy', '#a35fc7'],
  [Infinity, 'Hazardous', '#c24668'],
];
export const aqiBand = (aqi) => {
  const [, label, color] = BANDS.find(([max]) => aqi <= max);
  return { label, color };
};

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export const compass = (deg) => DIRS[Math.round(deg / 45) % 8];

export const temp = (c, units) =>
  c == null ? '–' : `${Math.round(units === 'f' ? (c * 9) / 5 + 32 : c)}°`;
