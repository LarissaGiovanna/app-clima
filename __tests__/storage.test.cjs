const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadService } = require('./helpers.cjs');

function makeAsyncStorage() {
  const store = new Map();
  return {
    store,
    api: {
      async getItem(k) {
        return store.has(k) ? store.get(k) : null;
      },
      async setItem(k, v) {
        store.set(k, String(v));
      },
      async removeItem(k) {
        store.delete(k);
      },
    },
  };
}

function loadStorage(mock) {
  return loadService('services/storage.js', {
    mocks: { AsyncStorage: mock },
    exportNames: [
      'DEFAULT_CITY',
      'getLastCity',
      'saveLastCity',
      'getHistory',
      'saveCache',
      'getCache',
      'getAlertsSeen',
      'markAlertsSeen',
    ],
  });
}

describe('services/storage — cidade padrão Recife (GLOSSARY Localização)', () => {
  it('DEFAULT_CITY é Recife (-8.0476, -34.8770)', () => {
    const s = loadStorage(makeAsyncStorage().api);
    assert.equal(s.DEFAULT_CITY.name, 'Recife');
    assert.equal(s.DEFAULT_CITY.latitude, -8.0476);
    assert.ok(Math.abs(s.DEFAULT_CITY.longitude - -34.877) < 1e-4);
  });

  it('getLastCity retorna DEFAULT_CITY quando vazio', async () => {
    const s = loadStorage(makeAsyncStorage().api);
    assert.deepEqual(await s.getLastCity(), s.DEFAULT_CITY);
  });

  it('saveLastCity + getLastCity fazem roundtrip', async () => {
    const { api } = makeAsyncStorage();
    const s = loadStorage(api);
    const city = { name: 'São Paulo', admin1: 'SP', country: 'Brasil', latitude: -23.55, longitude: -46.63 };
    await s.saveLastCity(city);
    assert.deepEqual(await s.getLastCity(), city);
  });

  it('getLastCity retorna DEFAULT em caso de falha do AsyncStorage', async () => {
    const s = loadStorage({
      async getItem() {
        throw new Error('disk fail');
      },
      async setItem() {
        throw new Error('disk fail');
      },
    });
    assert.deepEqual(await s.getLastCity(), s.DEFAULT_CITY);
  });
});

describe('services/storage — histórico (até 8, sem duplicadas)', () => {
  let api;
  let s;
  beforeEach(() => {
    ({ api } = makeAsyncStorage());
    s = loadStorage(api);
  });

  it('getHistory retorna [] quando vazio', async () => {
    assert.deepEqual(await s.getHistory(), []);
  });

  it('salva a mais recente no topo e remove duplicadas', async () => {
    const a = { name: 'A', latitude: 1, longitude: 1 };
    const b = { name: 'B', latitude: 2, longitude: 2 };
    await s.saveLastCity(a);
    await s.saveLastCity(b);
    await s.saveLastCity(a);
    const hist = await s.getHistory();
    assert.equal(hist[0].name, 'A');
    assert.equal(hist.filter((h) => h.name === 'A').length, 1);
  });

  it('limita o histórico a 8 cidades', async () => {
    for (let i = 0; i < 12; i++) {
      await s.saveLastCity({ name: `C${i}`, latitude: i, longitude: i });
    }
    const hist = await s.getHistory();
    assert.equal(hist.length, 8);
    assert.equal(hist[0].name, 'C11');
  });
});

describe('services/storage — cache de previsão (offline)', () => {
  let s;
  beforeEach(() => {
    s = loadStorage(makeAsyncStorage().api);
  });

  it('saveCache + getCache fazem roundtrip com chave toFixed(4)', async () => {
    const payload = { current: { temperature_2m: 31 } };
    await s.saveCache(-8.0476, -34.877, payload);
    const cached = await s.getCache(-8.0476, -34.877);
    assert.deepEqual(cached.payload, payload);
    assert.ok(typeof cached.ts === 'number');
  });

  it('getCache retorna null quando ausente', async () => {
    assert.equal(await s.getCache(0, 0), null);
  });
});

describe('services/storage — alertas lidos (assinatura única)', () => {
  let s;
  beforeEach(() => {
    s = loadStorage(makeAsyncStorage().api);
  });

  it('getAlertsSeen retorna {} quando vazio', async () => {
    assert.deepEqual(await s.getAlertsSeen(), {});
  });

  it('markAlertsSeen persiste a assinatura', async () => {
    await s.markAlertsSeen('a|b|c');
    const seen = await s.getAlertsSeen();
    assert.ok(seen['a|b|c']);
  });
});
