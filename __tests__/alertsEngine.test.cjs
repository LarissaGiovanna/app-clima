const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadService } = require('./helpers.cjs');

function loadAlerts() {
  return loadService('services/alertsEngine.js', {
    exportNames: ['buildAlerts', 'formatAlertHour', 'alertsSignature'],
  });
}

// Gera hourly determinístico ancorado em Date.now() para que
// buildAlerts (janela de 24h a partir de "agora") cubra os slots.
function makeHourly(n, overrides = {}) {
  const now = Date.now();
  const base = Math.floor(now / 3600000) * 3600000;
  const time = [];
  const weather_code = [];
  const precipitation_probability = [];
  const wind_speed_10m = [];
  const relative_humidity_2m = [];
  const temperature_2m = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base + i * 3600000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    time.push(`${yyyy}-${mm}-${dd}T${hh}:00`);
    weather_code.push(1);
    precipitation_probability.push(10);
    wind_speed_10m.push(10);
    relative_humidity_2m.push(60);
    temperature_2m.push(28);
  }
  for (const [arr, map] of Object.entries(overrides)) {
    const target =
      arr === 'code'
        ? weather_code
        : arr === 'prob'
          ? precipitation_probability
          : arr === 'wind'
            ? wind_speed_10m
            : arr === 'hum'
              ? relative_humidity_2m
              : arr === 'temp'
                ? temperature_2m
                : null;
    if (!target) continue;
    for (const [idx, val] of Object.entries(map)) target[Number(idx)] = val;
  }
  return {
    time,
    weather_code,
    precipitation_probability,
    wind_speed_10m,
    relative_humidity_2m,
    temperature_2m,
  };
}

describe('services/alertsEngine — ADR 0001 (5 limiares individuais)', () => {
  const a = loadAlerts();

  it('chuva intensa: WMO 65 dispara alerta type=rain com horário', () => {
    const h = makeHourly(30, { code: { 2: 65 } });
    const alerts = a.buildAlerts(h, 'Recife');
    const rains = alerts.filter((x) => x.type === 'rain');
    assert.equal(rains.length, 1);
    assert.equal(rains[0].title, 'Chuva intensa');
    assert.match(rains[0].message, /WMO 65/);
    assert.match(rains[0].message, /Recife/);
    assert.ok(rains[0].time);
    assert.ok(rains[0].hourLabel);
  });

  it('probabilidade: prob > 70% dispara type=prob', () => {
    const h = makeHourly(30, { prob: { 3: 85 } });
    const alerts = a.buildAlerts(h, 'Recife');
    const probs = alerts.filter((x) => x.type === 'prob');
    assert.equal(probs.length, 1);
    assert.equal(probs[0].title, 'Alta probabilidade de chuva');
    assert.match(probs[0].message, /85%/);
  });

  it('vento: > 30 km/h dispara type=wind', () => {
    const h = makeHourly(30, { wind: { 4: 35 } });
    const alerts = a.buildAlerts(h);
    const winds = alerts.filter((x) => x.type === 'wind');
    assert.equal(winds.length, 1);
    assert.equal(winds[0].title, 'Vento forte');
    assert.match(winds[0].message, /35 km\/h/);
  });

  it('umidade: < 30% dispara type=humidity', () => {
    const h = makeHourly(30, { hum: { 5: 20 } });
    const alerts = a.buildAlerts(h);
    const hums = alerts.filter((x) => x.type === 'humidity');
    assert.equal(hums.length, 1);
    assert.equal(hums[0].title, 'Umidade baixa');
  });

  it('calor: > 35°C dispara type=heat', () => {
    const h = makeHourly(30, { temp: { 6: 38 } });
    const alerts = a.buildAlerts(h);
    const heats = alerts.filter((x) => x.type === 'heat');
    assert.equal(heats.length, 1);
    assert.equal(heats[0].title, 'Calor extremo');
    assert.match(heats[0].message, /38°C/);
  });
});

describe('services/alertsEngine — fronteiras (sem falsos positivos/negativos)', () => {
  const a = loadAlerts();

  it('tempo limpo não gera nenhum alerta', () => {
    const h = makeHourly(30); // code 1, prob 10, wind 10, hum 60, temp 28
    assert.deepEqual(a.buildAlerts(h, 'Recife'), []);
  });

  it('limites exatos NÃO disparam (prob=70, wind=30, hum=30, temp=35)', () => {
    const h = makeHourly(30, {
      prob: { 2: 70 },
      wind: { 2: 30 },
      hum: { 2: 30 },
      temp: { 2: 35 },
    });
    assert.deepEqual(a.buildAlerts(h), []);
  });

  it('neve (WMO 71/75) NÃO dispara alerta de chuva intensa (ADR: exceto neve)', () => {
    for (const snow of [71, 73, 75, 77]) {
      const h = makeHourly(30, { code: { 2: snow } });
      const rains = a.buildAlerts(h).filter((x) => x.type === 'rain');
      assert.equal(rains.length, 0, `WMO ${snow} (neve) não deve gerar alerta de chuva`);
    }
  });

  it('retorna [] para hourly ausente', () => {
    assert.deepEqual(a.buildAlerts(null), []);
    assert.deepEqual(a.buildAlerts({}), []);
  });
});

describe('services/alertsEngine — combinado, assinatura e ordenação', () => {
  const a = loadAlerts();

  it('cenário combinado gera os 4 tipos esperados com dedup chuva/prob no mesmo horário', () => {
    // slot 2: chuva intensa (code 65) + prob 90 (dedup: só rain) + vento + umidade + calor
    const h = makeHourly(30, {
      code: { 2: 65 },
      prob: { 2: 90 },
      wind: { 2: 40 },
      hum: { 2: 15 },
      temp: { 2: 39 },
    });
    const at = (t) => a.buildAlerts(h).filter((x) => x.time === t);
    const alerts = a.buildAlerts(h);
    const slotTime = h.time[2];
    const slot = at(slotTime).map((x) => x.type).sort();
    assert.deepEqual(slot, ['heat', 'humidity', 'rain', 'wind']);
    assert.ok(alerts.length >= 4);
  });

  it('prob + vento + umidade + calor combinados sem código de chuva (4 alertas)', () => {
    const h = makeHourly(30, {
      prob: { 2: 90 },
      wind: { 2: 40 },
      hum: { 2: 15 },
      temp: { 2: 39 },
    });
    const slot = a.buildAlerts(h).filter((x) => x.time === h.time[2]).map((x) => x.type).sort();
    assert.deepEqual(slot, ['heat', 'humidity', 'prob', 'wind']);
  });

  it('alertas vêm ordenados por horário', () => {
    const h = makeHourly(30, { wind: { 5: 40, 2: 40 } });
    const alerts = a.buildAlerts(h);
    const times = alerts.map((x) => new Date(x.time).getTime());
    assert.deepEqual(times, [...times].sort((x, y) => x - y));
  });

  it('alertsSignature é única por conjunto (join de ids com |)', () => {
    const h1 = makeHourly(30, { wind: { 2: 40 } });
    const h2 = makeHourly(30, { wind: { 3: 40 } });
    const s1 = a.alertsSignature(a.buildAlerts(h1));
    const s2 = a.alertsSignature(a.buildAlerts(h2));
    assert.ok(s1.length > 0);
    assert.notEqual(s1, s2);
    assert.equal(a.alertsSignature([]), '');
  });

  it('formatAlertHour formata "2026-10-13T09:05:00" como HH:MM', () => {
    assert.match(a.formatAlertHour('2026-10-13T09:05:00'), /^\d{2}:\d{2}$/);
  });
});
