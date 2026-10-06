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

// Initialize Supabase configuration securely
const SUPABASE_URL = "https://supabase.co";
// Replace this placeholder string with your secure client/anon public key variable matching your .env structure
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGR4c3NlcHZsc3drd3N3dmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTUxOTIsImV4cCI6MjETA4OTUxOTJ9.example_signature";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
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
  const [dummyDriverId] = useState<string>("driver-accra-001"); // Link to auth.uid() or profile id later

  useEffect(() => {
    (async () => {
      // Step 1: Request system position authorization permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      // Step 2: Extract initial starting point fix
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        });
      } catch (err) {
        console.error("Error retrieving baseline location coordinates:", err);
      } finally {
        setLoading(false);
      }
    })();
  } [] );

  useEffect(() => {
    let positionSubscription: Location.LocationSubscription | null = null;

    // Step 3: Continuously stream coordinate shifting values into State and Supabase
    async function startLocationTracking() {
      if (!isTracking) return;

      positionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update coordinates every 5 seconds
          distanceInterval: 5, // Update coordinate thresholds every 5 meters
        },
        async (newLocation) => {
          const coords: Coordinate = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setLocation(coords);

          // Stream real-time GPS locations into your Supabase database tier
          const { error } = await supabase
            .from("driver_locations")
            .upsert({
              driver_id: dummyDriverId,
              latitude: coords.latitude,
              longitude: coords.longitude,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'driver_id' });

          if (error) {
            console.error("Supabase live coordinate streaming failure:", error.message);
          }
        }
      );
    }

    if (isTracking) {
      startLocationTracking();
    }

    return () => {
      if (positionSubscription) {
        positionSubscription.remove();
      }
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
          <Marker
            coordinate={location}
            title="Active Service Driver"
            description="Live path synchronization active"
          />
        </MapView>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMsg || "Unable to acquire active GPS signaling maps."}</Text>
        </View>
      )}

      {/* Driver Control Navigation Dashboard Overlay */}
      <View style={styles.dashboardCard}>
        <Text style={styles.titleText}>SkillBridge Mobility Framework</Text>
        {location && (
          <Text style={styles.coordText}>
            Lat: {location.latitude.toFixed(5)} | Long: {location.longitude.toFixed(5)}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.buttonStop : styles.buttonStart]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Text style={styles.buttonText}>
            {isTracking ? "DISCONNECT TRACKING" : "INITIALIZE LIVE LOGGING"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "500",
  },
  dashboardCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  coordText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#64748B",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonStart: {
    backgroundColor: "#0052FF",
  },
  buttonStop: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
