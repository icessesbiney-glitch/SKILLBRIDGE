import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, type Region } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@skillbridge/shared';

type Coordinates = { latitude: number; longitude: number };
const DEFAULT_REGION: Region = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.08, longitudeDelta: 0.08 };

export default function App() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Start tracking to share your location.');
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const userId = useRef<string | null>(null);
  const map = useRef<MapView | null>(null);

  const sync = async (id: string, next: Coordinates, status: 'online' | 'offline') => {
    const { error } = await supabase.from('profiles').update({ latitude: next.latitude, longitude: next.longitude, current_status: status }).eq('id', id);
    if (error) throw error;
  };

  const updateLocation = (location: Location.LocationObject) => {
    const next = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setCoordinates(next);
    map.current?.animateToRegion({ ...next, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    if (userId.current) void sync(userId.current, next, 'online').catch((error: Error) => setMessage(error.message));
  };

  const toggleTracking = async () => {
    setLoading(true);
    if (tracking) {
      subscription.current?.remove();
      subscription.current = null;
      if (userId.current && coordinates) await sync(userId.current, coordinates, 'offline').catch((error: Error) => setMessage(error.message));
      userId.current = null;
      setTracking(false);
      setMessage('Tracking stopped.');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Sign in before starting location tracking.');
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission is required.');
      userId.current = data.user.id;
      updateLocation(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      subscription.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 }, updateLocation);
      setTracking(true);
      setMessage('Your location is being shared.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start tracking.');
      userId.current = null;
    } finally {
      setLoading(false);
    }
  };

  return <View style={styles.container}>
    <StatusBar style="dark" />
    <MapView ref={map} style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION} showsUserLocation={tracking}>
      {coordinates ? <Marker coordinate={coordinates} title="Your location" /> : null}
    </MapView>
    <View style={styles.dashboard}>
      <Text style={styles.eyebrow}>SKILLBRIDGE RIDER</Text>
      <Text style={styles.title}>Location tracking</Text>
      <Text style={styles.status}>{tracking ? 'Online' : 'Offline'}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleTracking} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{tracking ? 'Stop tracking' : 'Start tracking'}</Text>}
      </TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8eef5' },
  dashboard: { position: 'absolute', top: 64, left: 20, right: 20, padding: 20, borderRadius: 18, backgroundColor: '#fff', elevation: 5 },
  eyebrow: { color: '#2563eb', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { marginTop: 6, color: '#0f172a', fontSize: 22, fontWeight: '700' },
  status: { marginTop: 14, color: '#334155', fontWeight: '600' },
  message: { marginTop: 10, color: '#64748b', lineHeight: 18 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderRadius: 10, backgroundColor: '#2563eb' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
