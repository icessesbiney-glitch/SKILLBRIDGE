import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";


// Initialize your secure cross-platform client bindings inside the native smartphone layer
import { supabase } from '@skillbridge/shared';

export default function MobileRiderDashboard() {
  const [email, setEmail] = useState("test@acme.com");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("400.00");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleMobileCashout = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatusMsg("Please input a valid transfer value.");
      return;
    }
    setLoading(true);
    setStatusMsg("");

    try {
      // Electron and Expo native bridge calls insert directly into your verified withdrawal requests data grid
      const { error } = await supabase
        .from("platform_wallets")
        .insert([{ email: email, amount: parseFloat(amount), status: "pending" }]);

      if (error) {
        setStatusMsg(`? Ledger Error: ${error.message}`);
      } else {
        setStatusMsg("? Cashout Requested! Sent to Mobile Money.");
        // Decrease native client layout balance representation atomically
        setBalance((prev) => (parseFloat(prev) - parseFloat(amount)).toFixed(2));
        setAmount("");
      }
    } catch (err: any) {
      setStatusMsg(`? Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>SkillBridge Rider Node</Text>
        <Text style={styles.subheader}>Hyperlocal Delivery Ledger Wallet</Text>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance (GHS)</Text>
          <Text style={styles.balanceValue}>�{balance}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Withdrawal Value (�)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 50.00"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleMobileCashout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Authorize Instant Cashout</Text>
          )}
        </TouchableOpacity>

        {statusMsg ? <Text style={styles.statusText}>{statusMsg}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#f9f9f9", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  header: { fontSize: 22, fontWeight: "bold", color: "#111", textAlign: "center" },
  subheader: { fontSize: 12, color: "#666", textAlign: "center", marginBottom: 20 },
  balanceContainer: { backgroundColor: "#f0f4ff", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#d0e0ff" },
  balanceLabel: { fontSize: 11, fontWeight: "600", color: "#5570e0", textTransform: "uppercase" },
  balanceValue: { fontSize: 28, fontWeight: "bold", color: "#1d3edb", marginTop: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 14, color: "#111" },
  button: { backgroundColor: "#228be6", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#a5d8ff" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  statusText: { marginTop: 14, fontSize: 12, fontWeight: "500", textAlign: "center", color: "#333" }
});
