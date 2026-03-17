// app/(auth)/seed-backup.tsx
// Design: exact translation of pg-seed-backup from qntmex-wallet.html
import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useWalletStore } from "@/walletStore";
import * as Clipboard from "expo-clipboard";
import { C } from "@/app/theme";

export default function Backup() {
  const router = useRouter();
  const { wallet } = useWalletStore();
  const { phrase, isRestored } = useLocalSearchParams<{ phrase?: string; isRestored?: string }>();

  const go = () => {
    if (!wallet?.address) { Alert.alert("Wallet Error", "Wallet not set up. Please start over."); router.replace("/(auth)/onboarding"); return; }
    router.replace("/(dashboard)/home");
  };

  if (!phrase || isRestored === "true") return (
    <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={st.successTitle}>Wallet Restored Successfully! 🎉</Text>
      <Pressable style={[st.btnGold, { width: "80%", marginTop: 28 }]} onPress={go} testID="backup-go-to-wallet-button">
        <Text style={st.btnGoldTx}>Go to Wallet</Text>
      </Pressable>
    </View>
  );

  const words = phrase.split(" ");

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View>
          <Text style={st.ptitle}>Backup Phrase</Text>
          <Text style={st.psub}>Tap to copy each word</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={st.hint}>Your backup is your responsibility. Store it offline.</Text>
        {/* seed-grid (backup-grid) */}
        <View style={st.grid}>
          {words.map((w, i) => (
            <Pressable key={i} style={st.wordCard} onPress={async () => { await Clipboard.setStringAsync(w); Alert.alert("Copied", `"${w}" copied`); }}>
              <Text style={st.wordNum}>{i + 1}</Text>
              <Text style={st.wordTx}>{w}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable style={st.btnGold} onPress={go} testID="backup-continue-button">
            <Text style={st.btnGoldTx}>Verify Phrase</Text>
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
  ptitle: { fontSize: 18, fontWeight: "700", color: C.tx },
  psub: { fontSize: 11, color: C.dim, marginTop: 2 },
  hint: { fontSize: 13, color: C.dim, textAlign: "center", paddingHorizontal: 20, paddingBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 20 },
  wordCard: { width: "30%", backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, borderRadius: 10, paddingVertical: 10, alignItems: "center", gap: 3 },
  wordNum: { fontSize: 10, color: C.dim, fontWeight: "700" },
  wordTx: { fontSize: 13, fontWeight: "600", color: C.tx },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
  successTitle: { fontSize: 22, fontWeight: "700", color: C.tx, textAlign: "center" },
});
