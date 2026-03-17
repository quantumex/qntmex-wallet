// app/(auth)/passcode-setup.tsx
// Design: exact translation of pg-pc-setup from qntmex-wallet.html
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useWalletStore } from "@/walletStore";
import { Wallet } from "ethers";
import * as SecureStore from "expo-secure-store";
import { C } from "@/app/theme";

const waitForCrypto = async (max = 15) => {
  for (let i = 0; i < max; i++) {
    // @ts-ignore
    if (global.crypto && typeof global.crypto.getRandomValues === "function") {
      try { const t = new Uint8Array(4); global.crypto.getRandomValues(t); return; } catch {}
    }
    await new Promise((r) => setTimeout(r, 100));
  }
};

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

export default function PasscodeSetup() {
  const router = useRouter();
  const { mnemonic: restoredMnemonic } = useLocalSearchParams<{ mnemonic?: string }>();
  const { saveWallet } = useWalletStore();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create"|"confirm">("create");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const current = step === "create" ? pin : confirmPin;

  const press = async (k: string) => {
    if (loading || k === "") return;
    if (k === "⌫") {
      if (step === "create") setPin((p) => p.slice(0, -1));
      else setConfirmPin((c) => c.slice(0, -1));
      return;
    }
    if (current.length >= 6) return;
    const next = current + k;
    if (step === "create") {
      setPin(next);
      if (next.length === 6) setTimeout(() => { setStep("confirm"); }, 150);
    } else {
      setConfirmPin(next);
      if (next.length === 6) {
        setTimeout(async () => {
          if (next !== pin) {
            setShake(true);
            setTimeout(() => { setShake(false); setConfirmPin(""); setStep("create"); setPin(""); }, 500);
            return;
          }
          setLoading(true);
          try {
            await waitForCrypto();
            let wallet: Wallet; let mnemonic: string;
            if (restoredMnemonic) { mnemonic = restoredMnemonic; wallet = Wallet.fromPhrase(mnemonic); }
            else { wallet = Wallet.createRandom(); mnemonic = wallet.mnemonic?.phrase ?? ""; }
            if (!wallet?.address) throw new Error("Invalid wallet");
            await saveWallet(wallet, mnemonic, pin);
            await SecureStore.setItemAsync("user_mnemonic", mnemonic);
            router.replace({ pathname: "/(auth)/seed-backup", params: { phrase: mnemonic, isRestored: restoredMnemonia ? "true" : "false" } });
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Setup failed");
          } finally { setLoading(false); }
        }, 150);
      }
    }
  };

  const dots = Array.from({ length: 6 }, (_, i) => ({ filled: current.length > i, err: shake && step === "confirm" }));

  return (
    <View style={st.container}>
      <View style={st.wrap}>
        {/* pc-logo */}
        <Text style={st.logo}>♟</Text>
        {/* pc-title */}
        <Text style={st.title}>{step === "create" ? "Create Passcode" : "Confirm Passcode"}</Text>
        {/* pc-sub */}
        <Text style={st.sub}>{step === "create" ? "Set a 6-digit passcode to protect your wallet" : "Enter the same passcode again"}</Text>
        {/* pc-dots */}
        <View style={st.dotsRow}>
          {dots.map((d, i) => (
            <View key={i} style={[st.dot, d.filled ? (d.err ? st.dotErr : st.dotOn) : st.dotOff]} />
          ))}
        </View>
        {/* pc-grid */}
        <View style={st.grid}>
          {KEYS.map((k, i) => (
            <Pressable key={i} style={[st.key, !k && st.keyEmpty]} onPress={() => k && press(k)} disabled={!k || loading}>
              <Text style={[st.keyTx, k === "⌫" && st.keyDelTx]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        {/* pc-link */}
        <Pressable style={st.skip} onPress={() => router.replace("/(dashboard)/home" as any)}>
          <Text style={st.skipTx}>Skip for now</Text>
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
  sub: { fontSize: 13, color: C.dim, marginBottom: 38, textAlign: "center", lineHeight: 20 },
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
  skip: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 8 },
  skipTx: { fontSize: 13, color: C.dim, textAlign: "center" },
});
