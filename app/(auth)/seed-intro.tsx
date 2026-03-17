// app/(auth)/seed-intro.tsx
// Design: exact translation of pg-seed-intro from qntmex-wallet.html
import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { C } from "@/app/theme";

export default function SeedIntro() {
  const router = useRouter();
  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}>
          <Text style={st.bkTx}>←</Text>
        </Pressable>
        <View>
          <Text style={st.ptitle}>Secret Phrase</Text>
          <Text style={st.psub}>Recovery backup</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={st.scroll}>
        {/* gold info card */}
        <View style={st.infoCard}>
          <Text style={st.infoIcon}>🔑</Text>
          <Text style={st.infoTitle}>Your Recovery Phrase</Text>
          <Text style={st.infoDesc}>A 12-word phrase that gives full access to your wallet. Write it down and store it safely — never share it with anyone.</Text>
        </View>
        {/* points */}
        <View style={st.points}>
          {[
            { icon: "📝", text: "Write down the words in order" },
            { icon: "🔒", text: "Store it somewhere secure and private" },
            { icon: "🚫", text: "Never enter it on any website" },
          ].map((p, i, arr) => (
            <View key={i} style={[st.point, i < arr.length - 1 && st.pointBorder]}>
              <Text style={st.pointIcon}>{p.icon}</Text>
              <Text style={st.pointTx}>{p.text}</Text>
            </View>
          ))}
        </View>
        <Pressable style={st.btnGold} onPress={() => router.push("/(auth)/seed-generate")} testID="seed-intro-button">
          <Text style={st.btnGoldTx}>View Recovery Phrase</Text>
        </Pressable>
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
  scroll: { padding: 20 },
  infoCard: { backgroundColor: "rgba(201,168,76,0.06)", borderWidth: 1, borderColor: C.gbd, borderRadius: 16, padding: 20, marginBottom: 24, alignItems: "center" },
  infoIcon: { fontSize: 36, marginBottom: 10 },
  infoTitle: { fontSize: 15, fontWeight: "700", color: C.tx, marginBottom: 8 },
  infoDesc: { fontSize: 13, color: C.dim, lineHeight: 21, textAlign: "center" },
  points: { marginBottom: 20 },
  point: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  pointBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  pointIcon: { fontSize: 20 },
  pointTx: { fontSize: 13, color: C.dim, flex: 1 },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
});
