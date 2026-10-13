import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, CloudDrizzle } from 'lucide-react-native';
import { wmoKind, formatHourLabel } from '../services/weather';

function HourIcon({ code, size = 22, color = '#fff' }) {
  const kind = wmoKind(code);
  if (kind === 'sun') return <Sun size={size} color={color} />;
  if (kind === 'cloud-sun') return <CloudSun size={size} color={color} />;
  if (kind === 'rain') return <CloudRain size={size} color={color} />;
  if (kind === 'storm') return <CloudLightning size={size} color={color} />;
  if (kind === 'snow') return <Snowflake size={size} color={color} />;
  if (kind === 'fog') return <CloudFog size={size} color={color} />;
  if (kind === 'drizzle') return <CloudDrizzle size={size} color={color} />;
  return <Cloud size={size} color={color} />;
}

export { HourIcon };

export default function HourlyForecastCard({ hourly, dateLabel }) {
  const [selected, setSelected] = useState(null);

  if (!hourly?.time) return null;

  const now = Date.now();
  let currentIdx = 0;
  let minDiff = Infinity;
  hourly.time.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - now);
    if (diff < minDiff) {
      minDiff = diff;
      currentIdx = i;
    }
  });

  // Exibe janela de 12h a partir da hora atual
  const items = hourly.time.slice(currentIdx, currentIdx + 12).map((t, k) => ({
    time: t,
    idx: currentIdx + k,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map(({ time, idx }) => {
          const isCurrent = idx === (selected ?? currentIdx);
          return (
            <TouchableOpacity
              key={time}
              style={[styles.hour, isCurrent && styles.hourActive]}
              onPress={() => setSelected(idx)}
              activeOpacity={0.7}
            >
              <Text style={styles.temp}>{Math.round(hourly.temperature_2m[idx])}°C</Text>
              <HourIcon code={hourly.weather_code[idx]} />
              <Text style={styles.label}>{formatHourLabel(time)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,40,120,0.28)',
    borderRadius: 22,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  date: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  hour: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 64,
  },
  hourActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  temp: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
  },
});
