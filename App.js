import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

import Header from './components/Header';
import WeatherHero from './components/WeatherHero';
import WeatherMetricsBar from './components/WeatherMetricsBar';
import HourlyForecastCard from './components/HourlyForecastCard';
import DailyForecastList from './components/DailyForecastList';
import CitySearchModal from './components/CitySearchModal';
import AlertsModal from './components/AlertsModal';

import {
  fetchForecast,
  resolveTheme,
  wmoToPt,
  formatDayHeader,
} from './services/weather';
import { buildAlerts, alertsSignature } from './services/alertsEngine';
import {
  DEFAULT_CITY,
  getCache,
  getLastCity,
  getAlertsSeen,
  markAlertsSeen,
  saveCache,
  saveLastCity,
} from './services/storage';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  const [city, setCity] = useState(DEFAULT_CITY);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsSeen, setAlertsSeen] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const load = useCallback(async (target, { silent = false } = {}) => {
    if (!silent) setLoading(true);
    setOffline(false);
    try {
      const data = await fetchForecast(target.latitude, target.longitude);
      setForecast(data);
      await saveCache(target.latitude, target.longitude, data);
      const a = buildAlerts(data.hourly, target.name);
      setAlerts(a);
    } catch (e) {
      // Fallback offline: cache
      const cached = await getCache(target.latitude, target.longitude);
      if (cached?.payload) {
        setForecast(cached.payload);
        setAlerts(buildAlerts(cached.payload.hourly, target.name));
        setOffline(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const last = await getLastCity();
      setCity(last);
      setAlertsSeen(await getAlertsSeen());
      await load(last);
    })();
  }, [load]);

  const signature = useMemo(() => alertsSignature(alerts), [alerts]);
  const hasUnseenAlerts = alerts.length > 0 && !alertsSeen[signature];

  const theme = useMemo(() => {
    if (!forecast?.current) return { colors: ['#08244F', '#134CB5', '#0B42AB'], night: true };
    return resolveTheme(forecast.current.is_day, forecast.current.weather_code);
  }, [forecast]);

  async function handleSelectCity(c) {
    setSearchOpen(false);
    setCity(c);
    await saveLastCity(c);
    await load(c);
  }

  async function handleOpenAlerts() {
    setAlertsOpen(true);
    if (signature) {
      await markAlertsSeen(signature);
      setAlertsSeen((s) => ({ ...s, [signature]: Date.now() }));
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await load(city, { silent: true });
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const current = forecast?.current;
  const daily = forecast?.daily;
  const condition = current ? wmoToPt(current.weather_code) : '—';
  const rainProb = daily?.precipitation_probability_max?.[0] ?? current?.precipitation ?? 0;
  const dateLabel = daily?.time?.[0] ? formatDayHeader(daily.time[0]) : '';

  return (
    <LinearGradient colors={theme.colors} style={styles.container}>
      <StatusBar style="light" />
      <Header
        cityName={city.name}
        hasAlerts={hasUnseenAlerts}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAlerts={handleOpenAlerts}
      />
      {loading && !forecast ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando clima de {city.name}...</Text>
        </View>
      ) : !forecast ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Sem dados. Verifique a conexão.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          showsVerticalScrollIndicator={false}
        >
          {offline ? (
            <Text style={styles.offline}>Modo offline — dados em cache</Text>
          ) : null}
          <WeatherHero
            temperature={current.temperature_2m}
            condition={condition}
            max={daily.temperature_2m_max[0]}
            min={daily.temperature_2m_min[0]}
          />
          <WeatherMetricsBar
            rainProb={rainProb}
            humidity={current.relative_humidity_2m}
            wind={current.wind_speed_10m}
          />
          <HourlyForecastCard hourly={forecast.hourly} dateLabel={dateLabel} />
          <DailyForecastList daily={daily} />
        </ScrollView>
      )}

      <CitySearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectCity}
      />
      <AlertsModal visible={alertsOpen} alerts={alerts} onClose={() => setAlertsOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#0B42AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  offline: {
    color: '#FFE1A8',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
