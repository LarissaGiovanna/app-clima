// ADR 0001 — Motor de Alertas Climáticos Locais (sintetizado no cliente).
// Limiares: chuva intensa WMO >= 65 (exceto neve), prob chuva > 70%,
// vento > 30 km/h, umidade < 30%, calor extremo > 35°C.

export function buildAlerts(hourly, cityName = '') {
  if (!hourly || !hourly.time) return [];
  const alerts = [];
  const n = hourly.time.length;
  // Analisa as próximas 24h a partir de "agora" (ou o dia vigente).
  const now = Date.now();
  let startIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < n; i++) {
    const diff = Math.abs(new Date(hourly.time[i]).getTime() - now);
    if (diff < minDiff) {
      minDiff = diff;
      startIdx = i;
    }
  }
  const endIdx = Math.min(n, startIdx + 24);

  for (let i = startIdx; i < endIdx; i++) {
    const time = hourly.time[i];
    const code = hourly.weather_code?.[i];
    const prob = hourly.precipitation_probability?.[i];
    const wind = hourly.wind_speed_10m?.[i];
    const hum = hourly.relative_humidity_2m?.[i];
    const temp = hourly.temperature_2m?.[i];
    const hourLabel = formatAlertHour(time);

    if (typeof code === 'number' && code >= 65 && code <= 82) {
      alerts.push({
        id: `rain-${time}`,
        type: 'rain',
        title: 'Chuva intensa',
        message: `${hourLabel} — WMO ${code}${cityName ? ` em ${cityName}` : ''}. Leve guarda-chuva.`,
        time,
        hourLabel,
      });
    }
    if (typeof prob === 'number' && prob > 70) {
      // Evita duplicar se já houve alerta de chuva intensa no mesmo horário
      if (!alerts.some((a) => a.time === time && a.type === 'rain')) {
        alerts.push({
          id: `prob-${time}`,
          type: 'prob',
          title: 'Alta probabilidade de chuva',
          message: `${hourLabel} — ${prob}% de chance de precipitação.`,
          time,
          hourLabel,
        });
      }
    }
    if (typeof wind === 'number' && wind > 30) {
      alerts.push({
        id: `wind-${time}`,
        type: 'wind',
        title: 'Vento forte',
        message: `${hourLabel} — rajadas de ${Math.round(wind)} km/h.`,
        time,
        hourLabel,
      });
    }
    if (typeof hum === 'number' && hum < 30) {
      alerts.push({
        id: `hum-${time}`,
        type: 'humidity',
        title: 'Umidade baixa',
        message: `${hourLabel} — umidade de ${hum}%. Hidrate-se.`,
        time,
        hourLabel,
      });
    }
    if (typeof temp === 'number' && temp > 35) {
      alerts.push({
        id: `heat-${time}`,
        type: 'heat',
        title: 'Calor extremo',
        message: `${hourLabel} — ${Math.round(temp)}°C. Evite sol direto.`,
        time,
        hourLabel,
      });
    }
  }
  // Ordena por horário
  alerts.sort((a, b) => new Date(a.time) - new Date(b.time));
  return alerts;
}

export function formatAlertHour(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function alertsSignature(alerts) {
  return alerts.map((a) => a.id).join('|');
}
