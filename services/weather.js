// Mapeamento WMO -> português + ícone lógico.
// Ref: https://open-meteo.com/en/docs (weather_code WMO)

export function wmoToPt(code) {
  if (code === 0) return 'Ensolarado';
  if (code === 1) return 'Principalmente limpo';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code === 45 || code === 48) return 'Nevoeiro';
  if (code === 51 || code === 53 || code === 55) return 'Garoa';
  if (code === 56 || code === 57) return 'Garoa congelante';
  if (code === 61) return 'Chuva fraca';
  if (code === 63) return 'Chuva moderada';
  if (code === 65) return 'Chuva intensa';
  if (code === 66 || code === 67) return 'Chuva congelante';
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'Neve';
  if (code === 80) return 'Pancadas fracas';
  if (code === 81) return 'Pancadas de chuva';
  if (code === 82) return 'Pancadas violentas';
  if (code === 85 || code === 86) return 'Pancadas de neve';
  if (code === 95) return 'Tempestade';
  if (code === 96 || code === 99) return 'Tempestade com granizo';
  return 'Precipitações';
}

export function wmoKind(code) {
  if (code === 0 || code === 1) return 'sun';
  if (code === 2) return 'cloud-sun';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloud';
}

export async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m',
    hourly:
      'temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '8',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return res.json();
}

export async function searchCities(name) {
  const q = name.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    name: q,
    count: '5',
    language: 'pt',
    format: 'json',
  });
  const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const json = await res.json();
  return (json.results || []).map((r) => ({
    name: r.name,
    admin1: r.admin1 || '',
    country: r.country || '',
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

// Tema: diurno/sol vs noturno/chuva (spec fixa)
export const THEME_DAY = ['#29B2FE', '#008AE6', '#0070D1'];
export const THEME_NIGHT = ['#08244F', '#134CB5', '#0B42AB'];

export function resolveTheme(isDay, weatherCode) {
  const kind = wmoKind(weatherCode ?? 2);
  const adverse = ['rain', 'storm', 'snow', 'drizzle', 'fog'].includes(kind);
  if (isDay === 0 || adverse) return { colors: THEME_NIGHT, night: true };
  return { colors: THEME_DAY, night: false };
}

export function formatHourLabel(iso) {
  // iso: "2026-10-13T15:00" -> "15.00"
  const t = iso.split('T')[1] || '';
  return t.slice(0, 5).replace(':', '.');
}

export function formatDayHeader(isoDate) {
  // "2026-10-13" -> "Mar, 9" style (en curto p/ fidelidade Figma)
  const d = new Date(`${isoDate}T12:00:00`);
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  // Figma usa "Mar, 9" (inglês abreviado). Mantemos padrão curto pt->en fallback:
  const enMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const enDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  void months; void days;
  return `${enMonths[d.getMonth()]}, ${d.getDate()}`;
}

export function weekdayPt(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`);
  const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  return days[d.getDay()];
}
