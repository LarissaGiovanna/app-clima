import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LAST_CITY: '@app-clima:last-city',
  HISTORY: '@app-clima:history',
  CACHE_PREFIX: '@app-clima:cache:',
  ALERTS_SEEN: '@app-clima:alerts-seen',
};

export const DEFAULT_CITY = {
  name: 'Recife',
  admin1: 'Pernambuco',
  country: 'Brasil',
  latitude: -8.0476,
  longitude: -34.877,
};

export async function getLastCity() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LAST_CITY);
    if (raw) return JSON.parse(raw);
    return DEFAULT_CITY;
  } catch {
    return DEFAULT_CITY;
  }
}

export async function saveLastCity(city) {
  try {
    await AsyncStorage.setItem(KEYS.LAST_CITY, JSON.stringify(city));
    const hist = await getHistory();
    const filtered = hist.filter(
      (h) => !(h.name === city.name && h.latitude === city.latitude)
    );
    filtered.unshift(city);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(filtered.slice(0, 8)));
  } catch {}
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCache(lat, lon, payload) {
  try {
    await AsyncStorage.setItem(
      `${KEYS.CACHE_PREFIX}${lat.toFixed(4)},${lon.toFixed(4)}`,
      JSON.stringify({ ts: Date.now(), payload })
    );
  } catch {}
}

export async function getCache(lat, lon) {
  try {
    const raw = await AsyncStorage.getItem(
      `${KEYS.CACHE_PREFIX}${lat.toFixed(4)},${lon.toFixed(4)}`
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getAlertsSeen() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ALERTS_SEEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function markAlertsSeen(signature) {
  try {
    const seen = await getAlertsSeen();
    seen[signature] = Date.now();
    await AsyncStorage.setItem(KEYS.ALERTS_SEEN, JSON.stringify(seen));
  } catch {}
}
