import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import MobileRiderDashboard from "./components/MobileRiderDashboard";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
      <MobileRiderDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
});
