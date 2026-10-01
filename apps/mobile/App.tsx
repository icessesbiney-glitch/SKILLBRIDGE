import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, TextInput, StatusBar, ActivityIndicator } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://supabase.co", "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo");

export default function App() {
  const [status, setStatus] = useState("Online");
  const [balance, setBalance] = useState(0.00);
  const [amt, setAmt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      const { data } = await supabase.from("profiles").select("wallet_balance, current_status").eq("email", "customer@skillbridge.club").single();
      if (data) {
        setBalance(data.wallet_balance || 0.00);
        setStatus(data.current_status || "Online");
      }
      setLoading(false);
    }
    fetchWallet();
  }, []);

  const changeStatus = async (newStatus) => {
    setStatus(newStatus);
    await supabase.from("profiles").update({ current_status: newStatus }).eq("email", "customer@skillbridge.club");
  };

  const goCashout = async () => {
    if (!amt || parseFloat(amt) <= 0 || parseFloat(amt) > balance) return alert("Invalid amount or insufficient balance.");
    setLoading(true);
    const { error } = await supabase.rpc("decrement_wallet_balance", { user_email: "customer@skillbridge.club", amount_to_sub: parseFloat(amt) });
    if (!error) {
      setBalance(prev => prev - parseFloat(amt));
      alert("✅ Cashout Transacted! Allocated to Mobile Money wallet.");
      setAmt("");
    }
    setLoading(false);
  };

  if (loading) return <View style={s.box}><ActivityIndicator size="large" color="#2563eb"/></View>;

  return (
    <SafeAreaView style={s.win}>
      <StatusBar barStyle="dark-content"/>
      <View style={s.box}>
        <Text style={s.t}>SkillBridge Rider Node</Text>
        <Text style={s.sub}>Hyperlocal Independent Delivery Log Ledger</Text>
        <View style={s.card}>
          <Text style={s.lbl}>AVAILABLE BALANCE (GHS)</Text>
          <Text style={s.amt}>₵ {balance.toFixed(2)}</Text>
        </View>
        <View style={s.grp}>
          <Text style={s.sec}>RIDER OPERATIONAL STATUS</Text>
          <View style={s.row}>
            {["Online", "Offline", "In-Routine"].map(m => (
              <TouchableOpacity key={m} onPress={() => changeStatus(m)} style={[s.btn, status === m && (m === "Online" ? s.on : m === "Offline" ? s.off : s.rtn)]}>
                <Text style={[s.btnT, status === m && s.w]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={s.grp}>
          <Text style={s.sec}>Withdrawal Value (₵)</Text>
          <TextInput placeholder="e.g. 50.00" value={amt} onChangeText={setAmt} keyboardType="numeric" style={s.input}/>
          <TouchableOpacity onPress={goCashout} style={s.go}><Text style={s.w}>Authorize Instant Cashout</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({ win: { flex: 1, backgroundColor: "#f9fafb" }, box: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }, t: { fontSize: 26, fontWeight: "900", color: "#111827" }, sub: { fontSize: 13, color: "#4b5563", marginBottom: 24 }, card: { width: "100%", maxWidth: 440, backgroundColor: "#eff6ff", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe" }, lbl: { fontSize: 11, fontWeight: "800", color: "#2563eb" }, amt: { fontSize: 32, fontWeight: "900", color: "#1e3a8a", marginTop: 6 }, grp: { width: "100%", maxWidth: 440, marginTop: 24 }, sec: { fontSize: 11, fontWeight: "700", color: "#374151", marginBottom: 8 }, row: { flexDirection: "row", gap: 8 }, btn: { flex: 1, paddingVertical: 10, backgroundColor: "#fff", borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#d1d5db" }, btnT: { fontSize: 13, fontWeight: "600", color: "#4b5563" }, w: { color: "#fff", fontWeight: "700" }, on: { backgroundColor: "#16a34a", borderColor: "#16a34a" }, off: { backgroundColor: "#dc2626", borderColor: "#dc2626" }, rtn: { backgroundColor: "#d97706", borderColor: "#d97706" }, input: { width: "100%", backgroundColor: "#fff", padding: 12, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, marginBottom: 14, color: "#111" }, go: { width: "100%", backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center" } });
