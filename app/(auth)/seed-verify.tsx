// app/(auth)/seed-verify.tsx
// Design: exact translation of pg-seed-verify from qntmex-wallet.html
import { View, Text, StyleSheet, Alert, Pressable, ScrollView, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { C } from "@/app/theme";

export default function SeedVerify() {
  const router = useRouter();
  const { mnemonic } = useLocalSearchParams<{ mnemonic: string }>();
  const originalWords = useMemo(() => (mnemonic?.trim() ? mnemonic.split(" ").filter(Boolean) : []), [mnemonic]);
  const [positions, setPositions] = useState<number[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [k: number]: string }>({});

  useEffect(() => {
    if (!originalWords.length) return;
    const pos: number[] = [];
    while (pos.length < 3) {
      const r = Math.floor(Math.random() * originalWords.length);
      if (!pos.includes(r)) pos.push(r);
    }
    setPositions(pos.sort((a, b) => a - b));
    setShuffled([...originalWords].sort(() => Math.random() - 0.5));
  }, [mnemonic]);

  const select = (w: string) => {
    const empty = positions.find((p) => !answers[p]);
    if (empty !== undefined) setAnswers({ ...answers, [empty]: w });
  };
  const deselect = (p: number) => { const a = { ...answers }; delete a[p]; setAnswers(a); };

  const allFilled = positions.length > 0 && positions.every((p) => answers[p]);
  const verify = () => {
    if (positions.every((p) => answers[p] === originalWords[p])) {
      router.push({ pathname: "/(auth)/passcode-setup", params: { mnemonic } });
    } else {
      Alert.alert("Incorrect", "The words don't match. Try again.");
      setAnswers({});
    }
  };

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View>
          <Text style={st.ptitle}>Verify Phrase</Text>
          <Text style={st.psub}>Confirm you saved it</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={st.hint}>Enter the missing words to confirm your backup.</Text>

        {/* verify-grid: 3-col slots */}
        <View style={st.verifyGrid}>
          {positions.map((pos) => (
            <Pressable key={pos} style={[st.vSlot, answers[pos] ? st.vSlotFilled : st.vSlotEmpty]} onPress={() => answers[pos] && deselect(pos)}>
              <Text style={st.vNum}>Word {pos + 1}</Text>
              <Text style={[st.vWord, !answers[pos] && { color: C.dim }]}>{answers[pos] || "_ _ _"}</Text>
            </Pressable>
          ))}
        </View>

        {/* word chips */}
        <View style={st.chips}>
          {shuffled.map((w) => {
            const used = Object.values(answers).includes(w);
            return (
              <Pressable key={w} style={[st.chip, used && st.chipUsed]} onPress={() => !used && select(w)} disabled={used}>
                <Text style={[st.chipTx, used && st.chipTxUsed]}>{w}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Pressable style={[st.btnGold, !allFilled && { opacity: 0.4 }]} disabled={!allFilled} onPress={verify} testID="seed-verify-confirm-button">
            <Text style={st.btnGoldTx}>Confirm</Text>
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
  hint: { fontSize: 13, color: C.dim, textAlign: "center", paddingHorizontal: 20, paddingBottom: 14 },
  verifyGrid: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 24 },
  vSlot: { flex: 1, borderRadius: 10, borderWidth: 1.5, paddingVertical: 13, paddingHorizontal: 6, alignItems: "center", gap: 5 },
  vSlotEmpty: { borderColor: C.b2, backgroundColor: C.card },
  vSlotFilled: { borderColor: C.gold, backgroundColor: C.gb },
  vNum: { fontSize: 10, color: C.dim, fontWeight: "700", letterSpacing: 0.4 },
  vWord: { fontSize: 14, fontWeight: "700", color: C.gold2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 24 },
  chip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card },
  chipUsed: { opacity: 0.3 },
  chipTx: { fontSize: 13, fontWeight: "600", color: C.tx2 },
  chipTxUsed: { color: C.dim },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
});
