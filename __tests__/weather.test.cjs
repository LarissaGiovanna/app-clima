const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadService } = require('./helpers.cjs');

function loadWeather() {
  return loadService('services/weather.js', {
    exportNames: [
      'wmoToPt',
      'wmoKind',
      'fetchForecast',
      'searchCities',
      'THEME_DAY',
      'THEME_NIGHT',
      'resolveTheme',
      'formatHourLabel',
      'formatDayHeader',
      'weekdayPt',
    ],
  });
}

describe('services/weather — wmoToPt (GLOSSARY ClimaAtual / condição em português)', () => {
  const w = loadWeather();
  const cases = [
    [0, 'Ensolarado'],
    [1, 'Principalmente limpo'],
    [2, 'Parcialmente nublado'],
    [3, 'Nublado'],
    [45, 'Nevoeiro'],
    [48, 'Nevoeiro'],
    [51, 'Garoa'],
    [53, 'Garoa'],
    [55, 'Garoa'],
    [56, 'Garoa congelante'],
    [57, 'Garoa congelante'],
    [61, 'Chuva fraca'],
    [63, 'Chuva moderada'],
    [65, 'Chuva intensa'],
    [66, 'Chuva congelante'],
    [67, 'Chuva congelante'],
    [71, 'Neve'],
    [73, 'Neve'],
    [75, 'Neve'],
    [77, 'Neve'],
    [80, 'Pancadas fracas'],
    [81, 'Pancadas de chuva'],
    [82, 'Pancadas violentas'],
    [85, 'Pancadas de neve'],
    [86, 'Pancadas de neve'],
    [95, 'Tempestade'],
    [96, 'Tempestade com granizo'],
    [99, 'Tempestade com granizo'],
  ];
  for (const [code, expected] of cases) {
    it(`mapeia WMO ${code} -> "${expected}"`, () => {
      assert.equal(w.wmoToPt(code), expected);
    });
  }
  it('retorna fallback "Precipitações" para código desconhecido', () => {
    assert.equal(w.wmoToPt(999), 'Precipitações');
    assert.equal(w.wmoToPt(undefined), 'Precipitações');
  });
});

describe('services/weather — wmoKind (kinds de ícones)', () => {
  const w = loadWeather();
  it('sun para 0 e 1', () => {
    assert.equal(w.wmoKind(0), 'sun');
    assert.equal(w.wmoKind(1), 'sun');
  });
  it('cloud-sun para 2, cloud para 3', () => {
    assert.equal(w.wmoKind(2), 'cloud-sun');
    assert.equal(w.wmoKind(3), 'cloud');
  });
  it('fog para 45/48', () => {
    assert.equal(w.wmoKind(45), 'fog');
    assert.equal(w.wmoKind(48), 'fog');
  });
  it('drizzle para 51-57', () => {
    for (const c of [51, 53, 55, 56, 57]) assert.equal(w.wmoKind(c), 'drizzle');
  });
  it('rain para 61-67 e 80-82', () => {
    for (const c of [61, 63, 65, 66, 67, 80, 81, 82]) assert.equal(w.wmoKind(c), 'rain');
  });
  it('snow para 71-77, 85, 86', () => {
    for (const c of [71, 73, 75, 77, 85, 86]) assert.equal(w.wmoKind(c), 'snow');
  });
  it('storm para >= 95', () => {
    assert.equal(w.wmoKind(95), 'storm');
    assert.equal(w.wmoKind(96), 'storm');
    assert.equal(w.wmoKind(99), 'storm');
  });
});

describe('services/weather — resolveTheme (TemaClimático diurno/noturno)', () => {
  const w = loadWeather();
  it('expõe paletas fixas da spec', () => {
    assert.deepEqual(w.THEME_DAY, ['#29B2FE', '#008AE6', '#0070D1']);
    assert.deepEqual(w.THEME_NIGHT, ['#08244F', '#134CB5', '#0B42AB']);
  });
  it('dia limpo (isDay=1, code 0) -> tema claro diurno', () => {
    const t = w.resolveTheme(1, 0);
    assert.equal(t.night, false);
    assert.deepEqual(t.colors, w.THEME_DAY);
  });
  it('noite (isDay=0) -> tema noturno mesmo com sol', () => {
    const t = w.resolveTheme(0, 0);
    assert.equal(t.night, true);
    assert.deepEqual(t.colors, w.THEME_NIGHT);
  });
  it('adverso de dia (chuva/tempestade/neve/garoa/nevoeiro) -> noturno', () => {
    for (const code of [65, 95, 75, 55, 45]) {
      const t = w.resolveTheme(1, code);
      assert.equal(t.night, true, `code ${code} deveria ser noturno`);
    }
  });
  it('nublado leve de dia (code 2) -> diurno', () => {
    assert.equal(w.resolveTheme(1, 2).night, false);
  });
});

describe('services/weather — formatação', () => {
  const w = loadWeather();
  it('formatHourLabel "2026-10-13T15:00" -> "15.00"', () => {
    assert.equal(w.formatHourLabel('2026-10-13T15:00'), '15.00');
  });
  it('formatDayHeader "2026-10-13" -> "Oct, 13"', () => {
    assert.equal(w.formatDayHeader('2026-10-13'), 'Oct, 13');
  });
  it('weekdayPt "2026-10-13" (terça) e "2026-10-12" (segunda)', () => {
    assert.equal(w.weekdayPt('2026-10-13'), 'Terça');
    assert.equal(w.weekdayPt('2026-10-12'), 'Segunda');
  });
});

describe('services/weather — fetchForecast e searchCities (geocoding)', () => {
  const w = loadWeather();
  let origFetch;
  beforeEach(() => {
    origFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = origFetch;
  });

  it('fetchForecast monta URL open-meteo e retorna JSON', async () => {
    let seenUrl = '';
    global.fetch = async (url) => {
      seenUrl = String(url);
      return { ok: true, json: async () => ({ current: { temperature_2m: 30 } }) };
    };
    const data = await w.fetchForecast(-8.0476, -34.877);
    assert.equal(data.current.temperature_2m, 30);
    assert.match(seenUrl, /api\.open-meteo\.com\/v1\/forecast/);
    assert.match(seenUrl, /latitude=-8\.0476/);
    assert.match(seenUrl, /forecast_days=8/);
  });

  it('fetchForecast lança erro em HTTP não-ok', async () => {
    global.fetch = async () => ({ ok: false, status: 500 });
    await assert.rejects(() => w.fetchForecast(0, 0), /Open-Meteo HTTP 500/);
  });

  it('searchCities retorna [] para busca curta (<2 chars)', async () => {
    let called = false;
    global.fetch = async () => {
      called = true;
      return { ok: true, json: async () => ({}) };
    };
    assert.deepEqual(await w.searchCities('a'), []);
    assert.equal(called, false);
  });

  it('searchCities mapeia geocoding para {name, admin1, country, latitude, longitude}', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        results: [
          { name: 'Recife', admin1: 'Pernambuco', country: 'Brasil', latitude: -8.0476, longitude: -34.877 },
        ],
      }),
    });
    const r = await w.searchCities('Recife');
    assert.deepEqual(r, [
      { name: 'Recife', admin1: 'Pernambuco', country: 'Brasil', latitude: -8.0476, longitude: -34.877 },
    ]);
  });

  it('searchCities lança erro em HTTP não-ok', async () => {
    global.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(() => w.searchCities('Recife'), /Geocoding HTTP 429/);
  });
});
