import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CloudRainWind, Droplets, Wind } from 'lucide-react-native';

export default function WeatherMetricsBar({ rainProb, humidity, wind }) {
  return (
    <View style={styles.pill}>
      <View style={styles.item}>
        <CloudRainWind size={15} color="#fff" />
        <Text style={styles.text}>{rainProb}%</Text>
      </View>
      <View style={styles.item}>
        <Droplets size={15} color="#fff" />
        <Text style={styles.text}>{humidity}%</Text>
      </View>
      <View style={styles.item}>
        <Wind size={15} color="#fff" />
        <Text style={styles.text}>{Math.round(wind)} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 24,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
