import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { HourIcon } from './HourlyForecastCard';
import { weekdayPt } from '../services/weather';

export default function DailyForecastList({ daily }) {
  if (!daily?.time) return null;
  // 7 dias (pula hoje)
  const items = daily.time.slice(1, 8).map((d, k) => ({
    date: d,
    i: k + 1,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Next Forecast</Text>
        <CalendarDays size={18} color="#fff" />
      </View>
      {items.map(({ date, i }) => (
        <View key={date} style={styles.row}>
          <Text style={styles.day}>{weekdayPt(date)}</Text>
          <HourIcon code={daily.weather_code[i]} size={20} />
          <View style={styles.temps}>
            <Text style={styles.max}>{Math.round(daily.temperature_2m_max[i])}°</Text>
            <Text style={styles.min}>{Math.round(daily.temperature_2m_min[i])}°</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,40,120,0.28)',
    borderRadius: 22,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  day: {
    color: '#fff',
    fontSize: 13,
    width: 90,
  },
  temps: {
    flexDirection: 'row',
    gap: 10,
    width: 70,
    justifyContent: 'flex-end',
  },
  max: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  min: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 13,
  },
});
