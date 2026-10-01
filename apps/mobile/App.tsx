import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";

export default function App() {
  const [balance, setBalance] = useState("0.00");
  const [status, setStatus] = useState("Online"); 
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMobileWallet = async () => {
    try {
      const res = await fetch("https://vercel.app");
      const result = await res.json();
      if (result && result.data && result.data.amount) {
        setBalance(parseFloat(result.data.amount).toFixed(2));
      } else {
        setBalance("400.00"); 
      }
    } catch (err) {
      console.error("Supabase balance mapping bridge fault:", err);
      setBalance("400.00");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileWallet();
  }, []);

  const handleMobileCashout = async () => {
    if (!cashoutAmount || parseFloat(cashoutAmount) <= 0) return;
    setActionLoading(true);

    try {
      const res = await fetch("https://vercel.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cashoutAmount })
      });
      const result = await res.json();
      if (result.error) {
        alert(`Ledger Lock Error: ${result.error}`);
      } else {
        alert("✅ Instant Withdrawal Allocation Request Dispatched!");
        setCashoutAmount("");
        fetchMobileWallet();
      }
    } catch (err) {
      alert("Network routing sync error. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.windowWrapper}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.cardLayoutContainer}>
        
        <Text style={styles.mainTitleHeader}>SkillBridge Rider Node</Text>
        <Text style={styles.metaSubTextParagraph}>Hyperlocal Independent Delivery Log Ledger</Text>

        <View style={styles.walletLedgerBoxCard}>
          <Text style={styles.walletBoxDescriptorLabel}>AVAILABLE BALANCE (GHS)</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 8 }} />
          ) : (
            <Text style={styles.walletBalanceNumericString}>₵ {balance}</Text>
          )}
        </View>

        <View style={styles.statusPanelContainer}>
          <Text style={styles.inputCardLabelHeadlineText}>RIDER OPERATIONAL STATUS</Text>
          <View style={styles.statusControlGridRow}>
            {["Online", "Offline", "In-Routine"].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setStatus(mode)}
                style={[
                  styles.statusButtonSelectionPrimitive,
                  status === mode && (
                    mode === "Online" ? styles.bgSuccessGreen :
                    mode === "Offline" ? styles.bgDangerRed : styles.bgWarningAmber
                  )
                ]}
              >
                <Text style={[styles.statusButtonTextLabel, status === mode && styles.textWhiteColorWeight]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.cashoutFormPanelSegment}>
          <Text style={styles.inputCardLabelHeadlineText}>Withdrawal Value (₵)</Text>
          <TextInput
            value={cashoutAmount}
            onChangeText={setCashoutAmount}
            placeholder="e.g. 50.00"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            style={styles.numericTextInputBoxCardView}
          />

          <TouchableOpacity 
            onPress={handleMobileCashout}
            disabled={actionLoading}
            style={styles.actionSubmissionTriggerButtonPointer}
          >
            <Text style={styles.actionSubmissionButtonLabelText}>
              {actionLoading ? "Processing Authorization..." : "Authorize Instant Cashout"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  windowWrapper: { flex: 1, backgroundColor: "#f9fafb" },
  cardLayoutContainer: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  mainTitleHeader: { fontSize: 26, fontWeight: "900", color: "#111827", letterSpacing: -0.5 },
  metaSubTextParagraph: { fontSize: 13, color: "#4b5563", marginTop: 4, marginBottom: 28 },
  walletLedgerBoxCard: { width: "100%", maxWidth: 440, backgroundColor: "#eff6ff", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  walletBoxDescriptorLabel: { fontSize: 11, fontWeight: "800", color: "#2563eb", letterSpacing: 0.5 },
  walletBalanceNumericString: { fontSize: 32, fontWeight: "900", color: "#1e3a8a", marginTop: 6 },
  statusPanelContainer: { width: "100%", maxWidth: 440, marginTop: 24, alignItems: "flex-start" },
  inputCardLabelHeadlineText: { fontSize: 11, fontWeight: "700", color: "#374151", letterSpacing: 0.5, marginBottom: 8 },
  statusControlGridRow: { flexDirection: "row", width: "100%", gap: 8 },
  statusButtonSelectionPrimitive: { flex: 1, paddingVertical: 10, backgroundColor: "#fff", borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" },
  statusButtonTextLabel: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  textWhiteColorWeight: { color: "#fff", fontWeight: "700" },
  bgSuccessGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  bgDangerRed: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  bgWarningAmber: { backgroundColor: "#d97706", borderColor: "#d97706" },
  cashoutFormPanelSegment: { width: "100%", maxWidth: 440, marginTop: 24, alignItems: "flex-start" },
  numericTextInputBoxCardView: { width: "100%", backgroundColor: "#fff", padding: 12, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, fontSize: 14, color: "#111827", marginBottom: 14 },
  actionSubmissionTriggerButtonPointer: { width: "100%", backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center" },
  actionSubmissionButtonLabelText: { color: "#fff", fontSize: 14, fontWeight: "700" }
});
