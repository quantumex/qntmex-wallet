// app/(auth)/seed-generate.tsx
// Design: exact translation of pg-seed-gen from qntmex-wallet.html
import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as bip39 from "bip39";
import { C } from "@/app/theme";

export default function SeedGenerate() {
  const router = useRouter();
  const [words, setWords] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof global.Buffer === "undefined") { setError("Buffer not available. Please restart the app."); return; }
      if (typeof globalThis.crypto?.getRandomValues !== "function") { setError("Crypto not available. Please restart the app."); return; }
      const m = bip39.generateMnemonic(128);
      if (!m) { setError("Failed to generate seed phrase."); return; }
      setWords(m.split(" "));
    } catch (e: any) { setError(e?.message || "Failed to generate seed phrase"); }
  }, []);

  if (error) return (
    <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={{ color: C.red, fontSize: 14, textAlign: "center" }}>{error}</Text>
      <Pressable style={[st.btnGold, { marginTop: 24, width: 180 }]} onPress={() => { setError(null); setWords([]); }}>
        <Text style={st.btnGoldTx}>Try Again</Text>
      </Pressable>
    </View>
  );

  if (!words.length) return (
    <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={{ color: C.dim, fontSize: 14 }}>Generating your seed phrase...</Text>
    </View>
  );

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}>
          <Text style={st.bkTx}>←</Text>
        </Pressable>
        <Text style={st.ptitle}>Your Recovery Phrase</Text>
        <Pressable style={st.ib} onPress={() => setRevealed(!revealed)}>
          <Text style={{ fontSize: 16 }}>{revealed ? "🙈" : "👁"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={st.hint}>Tap the eye icon to reveal. Make sure no one is watching.</Text>

        {/* seed-grid */}
        <View style={st.grid}>
          {!revealed && (
            <View style={st.blurOverlay}>
              <Text style={st.blurHint}>Tap 👁 to reveal</Text>
            </View>
          )}
          {words.map((w, i) => (
            <View key={i} style={[st.wordCard, !revealed && { opacity: 0 }]}>
              <Text style={st.wordNum}>{i + 1}</Text>
              <Text style={st.wordTx}>{w}</Text>
            </View>
          ))}
        </View>

        <View style={st.warnBox}>
          <Text style={st.warnIc}>⚠️</Text>
          <Text style={st.warnTx}>Screenshot this phrase at your own risk. Anyone with access to it has full control of your wallet.</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            style={[st.btnGold, !revealed && { opacity: 0.4 }]}
            disabled={!revealed}
            onPress={() => {
              const mnemonic = words.join(" ");
              if (!mnemonic.trim()) { Alert.alert("Error", "Seed phrase is invalid"); return; }
              router.push({ pathname: "/(auth)/seed-verify", params: { mnemonic } });
            }}
            testID="seed-generate-button"
          >
            <Text style={st.btnGoldTx}>I've Written It Down</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  phdr: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14 },
  bk: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  bkTx: { color: C.dim, fontSize: 17 },
  ptitle: { flex: 1, fontSize: 18, fontWeight: "700", color: C.tx },
  ib: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 12, color: C.dim, textAlign: "center", paddingHorizontal: 20, paddingBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 20, position: "relative", minHeight: 280 },
  blurOverlay: { position: "absolute", top: 0, left: 20, right: 20, bottom: 0, zIndex: 10, backgroundColor: C.bg, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.b2 },
  blurHint: { color: C.dim, fontSize: 13 },
  wordCard: { width: "30%", backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 6, alignItems: "center", gap: 3 },
  wordNum: { fontSize: 10, color: C.dim, fontWeight: "700" },
  wordTx: { fontSize: 13, fontWeight: "600", color: C.tx },
  warnBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderColor: C.gb2, backgroundColor: "rgba(201,168,76,0.03)", borderRadius: 12, padding: 13, marginHorizontal: 20, marginBottom: 16 },
  warnIc: { fontSize: 14 },
  warnTx: { flex: 1, fontSize: 11, color: C.m2, lineHeight: 17 },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
});
