import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TriangleAlert, X } from 'lucide-react-native';

export default function AlertsModal({ visible, alerts, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Alertas Climáticos Recentes</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {alerts.length === 0 ? (
            <Text style={styles.empty}>
              Nenhum evento crítico nas próximas 24h. Tudo tranquilo! 🌤️
            </Text>
          ) : (
            <FlatList
              data={alerts}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <View style={styles.alert}>
                  <TriangleAlert size={18} color="#FF8A00" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>
                      {item.title} • {item.hourLabel}
                    </Text>
                    <Text style={styles.alertMsg}>{item.message}</Text>
                  </View>
                </View>
              )}
              style={{ maxHeight: 380 }}
            />
          )}
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
    paddingBottom: 34,
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
  empty: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  alert: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF6E8',
    borderColor: '#FFD9A0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#7A4A00',
  },
  alertMsg: {
    fontSize: 13,
    color: '#5b4a2f',
    marginTop: 2,
  },
});
