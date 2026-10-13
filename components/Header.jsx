import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPin, ChevronDown, Bell } from 'lucide-react-native';

export default function Header({ cityName, hasAlerts, onOpenSearch, onOpenAlerts }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.left} onPress={onOpenSearch} activeOpacity={0.7}>
        <MapPin size={18} color="#fff" />
        <Text style={styles.city} numberOfLines={1}>
          {cityName}
        </Text>
        <ChevronDown size={16} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bellWrap}
        onPress={onOpenAlerts}
        activeOpacity={0.7}
        accessibilityLabel="Alertas climáticos"
      >
        <Bell size={22} color="#fff" />
        {hasAlerts ? <View style={styles.dot} /> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  left: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    maxWidth: '70%',
  },
  city: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    maxWidth: 160,
  },
  bellWrap: {
    padding: 6,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF8A00',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
