import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const webAppUrl = (() => {
  try {
    const url = new URL(process.env.EXPO_PUBLIC_WEB_URL ?? '');
    return url.protocol === 'https:' || url.hostname === 'localhost'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
})();

export default function App() {
  const [error, setError] = React.useState('');

  const openWebApp = async () => {
    if (!webAppUrl) return;
    try {
      await Linking.openURL(webAppUrl);
      setError('');
    } catch {
      setError('SkillBridge could not be opened. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.brand}>SKILLBRIDGE</Text>
        <Text style={styles.title}>Your SkillBridge account</Text>
        <Text style={styles.message}>Sign in to manage your account, wallet, and available work.</Text>
        {webAppUrl ? (
          <Pressable accessibilityRole="link" onPress={openWebApp} style={styles.button}>
            <Text style={styles.buttonText}>Open SkillBridge</Text>
          </Pressable>
        ) : (
          <Text style={styles.status}>Web access is not configured for this build.</Text>
        )}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  card: { padding: 24, borderRadius: 18, backgroundColor: '#fff', elevation: 3 },
  brand: { color: '#2563eb', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  title: { marginTop: 12, color: '#0f172a', fontSize: 24, fontWeight: '700' },
  message: { marginTop: 12, color: '#475569', lineHeight: 22 },
  button: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#2563eb', borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  status: { marginTop: 18, color: '#64748b', fontSize: 13, fontWeight: '600' },
  error: { marginTop: 12, color: '#b91c1c', fontSize: 13 },
});
