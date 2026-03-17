// app/(auth)/passcode-login.tsx
// Design: exact translation of pg-pc-login from qntmex-wallet.html
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { loadWallet } from "@/walletStore";
import { C } from "@/app/theme";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

export default function PasscodeLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const press = async (k: string) => {
    if (loading || k === "") return;
    if (k === "⌫") { setPin((p) => p.slice(0, -1)); return; }
    if (pin.length >= 6) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 6) {
      setLoading(true);
      try {
        const w = await loadWallet(next);
        if (!w) throw new Error("Incorrect passcode");
        router.replace("/(dashboard)/home");
      } catch {
        setShake(true);
        setTimeout(() => { setShake(false); setPin(""); }, 500);
      } finally { setLoading(false); }
    }
  };

  return (
    <View style={st.container}>
      <View style={st.wrap}>
        <Text style={st.logo}>♟</Text>
        <Text style={st.title}>Welcome Back</Text>
        <Text style={st.sub}>Enter your passcode to unlock</Text>
        <View style={st.dotsRow}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={[st.dot, pin.length > i ? (shake ? st.dotErr : st.dotOn) : st.dotOff]} />
          ))}
        </View>
        <View style={st.grid}>
          {KEYS.map((k, i) => (
            <Pressable key={i} style={[st.key, !k && st.keyEmpty]} onPress={() => k && press(k)} disabled={!k || loading}>
              <Text style={[st.keyTx, k === "⌫" && st.keyDelTx]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={st.link} onPress={() => router.push("/(auth)/onboarding" as any)}>
          <Text style={st.linkTx}>Forgot passcode?</Text>
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, alignItems: "center", paddingTop: 50, paddingHorizontal: 28, paddingBottom: 36 },
  logo: { fontSize: 56, color: C.gold, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "700", color: C.tx, marginBottom: 5, textAlign: "center" },
  sub: { fontSize: 13, color: C.dim, marginBottom: 38, textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 16, marginBottom: 38 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  dotOff: { borderColor: C.b2, backgroundColor: "transparent" },
  dotOn: { borderColor: C.gold, backgroundColor: C.gold },
  dotErr: { borderColor: C.red, backgroundColor: C.red },
  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 11 },
  key: { width: "30%", height: 66, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, alignItems: "center", justifyContent: "center" },
  keyEmpty: { backgroundColor: "transparent", borderColor: "transparent" },
  keyTx: { fontSize: 24, fontWeight: "300", color: C.tx },
  keyDelTx: { fontSize: 18, color: C.dim },
  link: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 8 },
  linkTx: { fontSize: 13, color: C.dim, textAlign: "center" },
});
