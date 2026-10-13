import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function WeatherHero({ temperature, condition, max, min }) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../assets/cloud-with-sun-3d-weather-png.webp')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.temp}>{Math.round(temperature)}°</Text>
      <Text style={styles.condition}>{condition}</Text>
      <View style={styles.limits}>
        <Text style={styles.limitText}>Max.: {Math.round(max)}°</Text>
        <Text style={styles.limitText}>Min.: {Math.round(min)}°</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  image: {
    width: 150,
    height: 150,
  },
  temp: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '600',
    marginTop: -6,
  },
  condition: {
    color: '#fff',
    fontSize: 16,
    marginTop: -4,
  },
  limits: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  limitText: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
  },
});
