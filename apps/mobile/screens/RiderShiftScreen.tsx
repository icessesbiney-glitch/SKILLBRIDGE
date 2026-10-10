@
import React, { useState } from 'react'; import { View, Text, Switch, StyleSheet } from 'react-native';
export default function RiderShiftScreen() {
  const [isOnDuty, setIsOnDuty] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RIDER WORKSPACE METRICS</Text>
      <Text style={[styles.status, isOnDuty ? styles.active : styles.inactive]}>STATUS: {isOnDuty ? 'ON DUTY (TRANSMITTING GPS)' : 'OFF DUTY'}</Text>
      <Switch value={isOnDuty} onValueChange={(val) => setIsOnDuty(val)} trackColor={{ true: '#22c55e', false: '#334155' }} thumbColor="#f8fafc" />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 }, title: { color: '#22d3ee', fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 10 }, status: { fontSize: 12, fontFamily: 'monospace', marginBottom: 20 }, active: { color: '#4ade80' }, inactive: { color: '#94a3b8' } });
