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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  card: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#FFF", padding: 15, borderRadius: 10 },
  btn: { backgroundColor: "#0052FF", padding: 12, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#FFF", fontWeight: "600" }
});