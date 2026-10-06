import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lspdxssepvlswkwswvel.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGR4c3NlcHZsc3drd3N3dmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTUxOTIsImV4cCI6MjETA4OTUxOTJ9.example_signature";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [driverId] = useState<string>("driver-accra-001");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          ...
        });
      } catch (err) {
        console.error("Error retrieving baseline coordinates:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let positionSubscription: any = null;

    async function startLocationTracking() {
      if (!isTracking) return;
      positionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        async (newLocation) => {
          const coords: Coordinate = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setLocation(coords);

          await supabase.from("driver_locations").upsert({
            driver_id: driverId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            updated_at: new Date().toISOString(),
          });
        }
      );
    }

    if (isTracking) {
      startLocationTracking();
    }
    return () => {
      if (positionSubscription) positionSubscription.remove();
    };
  }, [isTracking]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0052FF" />
        <Text style={styles.loadingText}>Initializing GPS Navigation Systems...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
        >
          <Marker coordinate={location} title="Active Driver" description="Live synchronization active" />
        </MapView>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMsg || "Unable to acquire GPS signaling maps."}</Text>
        </View>
      )}
      <View style={styles.dashboardCard}>
        <Text style={styles.titleText}>SkillBridge Mobility Hub</Text>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.buttonStop : styles.buttonStart]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Text style={styles.buttonText}>{isTracking ? "DISCONNECT TRACKING" : "INITIALIZE LIVE LOGGING"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  map: { flex: 1, width: "100%" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748B", fontWeight: "500" },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center", fontWeight: "500" },
  dashboardCard: { position: "absolute", bottom: 24, left: 16, right: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20 },
  titleText: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 12 },
  button: { width: "100%", height: 48, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  buttonStart: { backgroundColor: "#0052FF" },
  buttonStop: { backgroundColor: "#EF4444" },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
