import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '@skillbridge/shared';

const TRACKED_USER_EMAIL = 'customer@skillbridge.club';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [currentStatus, setCurrentStatus] = useState('offline');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const syncLocationToSupabase = async (coords: Coordinates, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude,
          current_status: status,
        })
        .eq('email', TRACKED_USER_EMAIL);

      if (error) {
        setErrorMessage(`Failed to sync location: ${error.message}`);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to sync location: ${err.message ?? 'Unknown error'}`);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) {
            setPermissionDenied(true);
            setCurrentStatus('permission_denied');
            setIsLoading(false);
          }
          return;
        }

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            if (!isMounted) return;

            const coords: Coordinates = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            setCoordinates(coords);
            setCurrentStatus('online');
            setErrorMessage('');
            setIsLoading(false);
            syncLocationToSupabase(coords, 'online');
          }
        );

        subscriptionRef.current = subscription;
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message ?? 'Unable to track location.');
          setCurrentStatus('error');
          setIsLoading(false);
        }
      }
    };

    startTracking();

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  const region: Region | undefined = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {isLoading && (
        <View style={styles.centeredOverlay}>
          <ActivityIndicator size="large" color="#1a56db" />
          <Text style={styles.statusText}>Locating you...</Text>
        </View>
      )}

      {permissionDenied && (
        <View style={styles.centeredOverlay}>
          <Text style={styles.errorTitle}>Location permission denied</Text>
          <Text style={styles.statusText}>
            SkillBridge needs location access to track your position on the map.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setPermissionDenied(false);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!permissionDenied && region && (
        <MapView style={styles.map} region={region} showsUserLocation>
          <Marker coordinate={coordinates!} title="You" description={currentStatus} />
        </MapView>
      )}

      {!permissionDenied && coordinates && (
        <View style={styles.infoPanel}>
          <Text style={styles.coordinatesText}>
            Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
          </Text>
          <Text style={styles.statusLabel}>Status: {currentStatus}</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  centeredOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1a56db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 14,
    color: '#1a56db',
    marginTop: 4,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 8,
  },
});
