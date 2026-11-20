import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
export default function App() {
    return (<View style={styles.container}>
      <StatusBar style="dark"/>
      <View style={styles.card}>
        <Text style={styles.brand}>SKILLBRIDGE</Text>
        <Text style={styles.title}>Driver and delivery services</Text>
        <Text style={styles.message}>
          Rider onboarding, location sharing, and delivery tools are deferred until 2029. No location
          data is collected by this app.
        </Text>
        <Text style={styles.status}>This app is not active for the current launch.</Text>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
    card: { padding: 24, borderRadius: 18, backgroundColor: '#fff', elevation: 3 },
    brand: { color: '#2563eb', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
    title: { marginTop: 12, color: '#0f172a', fontSize: 24, fontWeight: '700' },
    message: { marginTop: 12, color: '#475569', lineHeight: 22 },
    status: { marginTop: 18, color: '#64748b', fontSize: 13, fontWeight: '600' },
});
