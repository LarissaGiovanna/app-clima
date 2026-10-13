import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { LocateFixed, MapPin, X } from 'lucide-react-native';
import { searchCities } from '../services/weather';
import { getHistory } from '../services/storage';

export default function CitySearchModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      getHistory().then(setHistory);
      setQuery('');
      setResults([]);
      setError('');
    }
  }, [visible]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const r = await searchCities(query);
        setResults(r);
      } catch {
        setError('Falha na busca. Verifique a conexão.');
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  async function handleGps() {
    setGpsLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const first = rev?.[0];
      onSelect({
        name: first?.city || first?.subregion || 'Localização atual',
        admin1: first?.region || '',
        country: first?.country || '',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      setError('Não foi possível obter o GPS.');
    } finally {
      setGpsLoading(false);
    }
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
        <MapPin size={16} color="#0B42AB" />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSub}>
            {[item.admin1, item.country].filter(Boolean).join(' • ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Escolher localização</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Buscar cidade..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <TouchableOpacity style={styles.gpsBtn} onPress={handleGps}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <LocateFixed size={16} color="#fff" />
            )}
            <Text style={styles.gpsText}>Usar minha localização (GPS)</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
          <FlatList
            data={query.trim().length >= 2 ? results : history}
            keyExtractor={(it, idx) => `${it.latitude},${it.longitude},${idx}`}
            renderItem={renderItem}
            ListHeaderComponent={
              query.trim().length < 2 && history.length > 0 ? (
                <Text style={styles.section}>Recentes</Text>
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.empty}>
                  {query.trim().length >= 2
                    ? 'Nenhuma cidade encontrada.'
                    : 'Digite ao menos 2 letras para buscar.'}
                </Text>
              ) : null
            }
            style={{ marginTop: 8, maxHeight: 320 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B42AB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5DDEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B42AB',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 10,
  },
  gpsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    color: '#C00',
    marginTop: 8,
    fontSize: 13,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  itemSub: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 16,
    fontSize: 13,
  },
});
