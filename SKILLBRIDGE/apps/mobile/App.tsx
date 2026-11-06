import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, type Region } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@skillbridge/shared';

type Coordinates = { latitude: number; longitude: number };
type TrackingStatus = 'online' | 'offline';

const DEFAULT_REGION: Region = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function App() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Start tracking to share your location.');
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const userId = useRef<string | null>(null);
  const map = useRef<MapView | null>(null);

  const syncLocation = async (id: string, next: Coordinates, status: TrackingStatus) => {
    const { error } = await supabase.from('profiles').update({
      latitude: next.latitude,
      longitude: next.longitude,
      current_status: status,
    }).eq('id', id);
    if (error) throw error;
  };

  const updateLocation = (location: Location.LocationObject) => {
    const next = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setCoordinates(next);
    map.current?.animateToRegion({ ...next, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    if (userId.current) {
      void syncLocation(userId.current, next, 'online').catch((error: Error) => {
        setMessage(`Location sync failed: ${error.message}`);
      });
    }
  };

  const startTracking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Sign in before starting location tracking.');
      userId.current = data.user.id;
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission is required to start tracking.');
      updateLocation(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      subscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 },
        updateLocation,
      );
      setTracking(true);
      setMessage('Your location is being shared.');
    } catch (error) {
      subscription.current?.remove();
      subscription.current = null;
      userId.current = null;
      setMessage(error instanceof Error ? error.message : 'Unable to start location tracking.');
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    setLoading(true);
    subscription.current?.remove();
    subscription.current = null;
    setTracking(false);
    try {
      if (userId.current) {
        await syncLocation(userId.current, coordinates || DEFAULT_REGION, 'offline');
      }
      setMessage('Tracking stopped. Your status is offline.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update your status.');
    } finally {
      userId.current = null;
      setLoading(false);
    }
  };

  useEffect(() => () => subscription.current?.remove(), []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <MapView ref={map} style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION}
        showsUserLocation={tracking} showsMyLocationButton={tracking}>
        {coordinates ? <Marker coordinate={coordinates} title="Your location" /> : null}
      </MapView>
      <View style={styles.dashboard}>
        <Text style={styles.eyebrow}>SKILLBRIDGE RIDER</Text>
        <Text style={styles.title}>Location tracking</Text>
        <Text style={styles.statusText}>{tracking ? 'Online' : 'Offline'}</Text>
        {coordinates ? <Text style={styles.coordinates}>{coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</Text> : null}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={[styles.button, tracking && styles.stopButton]} onPress={tracking ? stopTracking : startTracking} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{tracking ? 'Stop tracking' : 'Start tracking'}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8eef5' },
  dashboard: { position: 'absolute', top: 64, left: 20, right: 20, padding: 20, borderRadius: 18, backgroundColor: '#ffffff', elevation: 5 },
  eyebrow: { color: '#2563eb', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { marginTop: 6, color: '#0f172a', fontSize: 22, fontWeight: '700' },
  statusText: { marginTop: 14, color: '#334155', fontSize: 14, fontWeight: '600' },
  coordinates: { marginTop: 10, color: '#64748b', fontSize: 13 },
  message: { marginTop: 10, color: '#64748b', fontSize: 13, lineHeight: 18 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderRadius: 10, backgroundColor: '#2563eb' },
  stopButton: { backgroundColor: '#dc2626' },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
