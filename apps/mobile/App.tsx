<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://lSpdxSSepvlSwkwSvel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGR4c3NlcHZsc3drd3N3dmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTUxOTIsImV4cCI6MjETA4OTUxOTJ9.example_signature");

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location access denied.");
        setLoading(false);
        return;
      }
      try {
        const current = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      } catch {
        setErrorMsg("Signal acquisition timed out.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    async function startTracking() {
      if (isTracking) {
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
          async (loc) => {
            const coords: Coordinate = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setLocation(coords);
            await supabase.from("driver_locations").upsert({
              driver_id: "driver-accra-001",
              ...coords,
              updated_at: new Date().toISOString()
            });
          }
        );
      }
    }
    startTracking();
    return () => { if (sub) sub.remove(); };
  }, [isTracking]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0052FF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {location ? (
        <MapView style={styles.map} initialRegion={{ ...location, latitudeDelta: 0.015, longitudeDelta: 0.012 }}>
          <Marker coordinate={location} title="Active Courier" />
        </MapView>
      ) : <View style={styles.center}><Text>{errorMsg || "Acquiring GPS fix..."}</Text></View>}
      <View style={styles.card}>
        <TouchableOpacity style={styles.btn} onPress={() => setIsTracking(!isTracking)}>
          <Text style={styles.btnTxt}>{isTracking ? "STOP LIVE TRACKING" : "START LIVE LOGGING"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
=======
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, type Region } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@skillbridge/shared';

type Coordinates = {
  latitude: number;
  longitude: number;
};

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

  const syncLocation = async (
    userIdToSync: string,
    nextCoordinates: Coordinates,
    currentStatus: TrackingStatus,
  ) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        latitude: nextCoordinates.latitude,
        longitude: nextCoordinates.longitude,
        current_status: currentStatus,
      })
      .eq('id', userIdToSync);

    if (error) {
      throw error;
    }
  };

  const updateLocation = (location: Location.LocationObject) => {
    const nextCoordinates = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setCoordinates(nextCoordinates);
    map.current?.animateToRegion(
      { ...nextCoordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );

    if (userId.current) {
      void syncLocation(userId.current, nextCoordinates, 'online').catch((error: Error) => {
        setMessage(`Location sync failed: ${error.message}`);
      });
    }
  };

  const startTracking = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw new Error('Sign in before starting location tracking.');
      }
      userId.current = data.user.id;

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission is required to start tracking.');
      }

      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      updateLocation(initialLocation);

      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
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
        if (coordinates) {
          await syncLocation(userId.current, coordinates, 'offline');
        } else {
          const { error } = await supabase
            .from('profiles')
            .update({ current_status: 'offline' })
            .eq('id', userId.current);
          if (error) throw error;
        }
      }
      setMessage('Tracking stopped. Your status is offline.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update your status.');
    } finally {
      userId.current = null;
      setLoading(false);
    }
  };

  useEffect(
    () => () => {
      subscription.current?.remove();
    },
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={tracking}
        showsMyLocationButton={tracking}
      >
        {coordinates ? (
          <Marker coordinate={coordinates} title="Your location" />
        ) : null}
      </MapView>

      <View style={styles.dashboard}>
        <Text style={styles.eyebrow}>SKILLBRIDGE RIDER</Text>
        <Text style={styles.title}>Location tracking</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, tracking ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>{tracking ? 'Online' : 'Offline'}</Text>
        </View>

        {coordinates ? (
          <Text style={styles.coordinates}>
            {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
          </Text>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.button, tracking && styles.stopButton]}
          onPress={tracking ? stopTracking : startTracking}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {tracking ? 'Stop tracking' : 'Start tracking'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
>>>>>>> 356ff02f2d094918805c748016051d372a432dc9
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  card: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#FFF", padding: 15, borderRadius: 10 },
  btn: { backgroundColor: "#0052FF", padding: 12, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#FFF", fontWeight: "600" }
});
=======
  container: {
    flex: 1,
    backgroundColor: '#e8eef5',
  },
  dashboard: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#16a34a',
  },
  offline: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  coordinates: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  message: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
>>>>>>> 356ff02f2d094918805c748016051d372a432dc9
