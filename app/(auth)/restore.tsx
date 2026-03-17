// app/(auth)/restore.tsx
// Design: exact translation of pg-restore from qntmex-wallet.html
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as bip39 from "bip39";
import { C } from "@/app/theme";

export default function RestoreWallet() {
  const [phrase, setPhrase] = useState("");
  const router = useRouter();
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  const valid = words.length === 12 || words.length === 24;

  const restore = () => {
    const clean = phrase.trim().toLowerCase();
    if (!bip39.validateMnemonic(clean)) { Alert.alert("Invalid Phrase", "Please enter a valid 12 or 24-word recovery phrase."); return; }
    router.replace({ pathname: "/(auth)/passcode-setup", params: { mnemonic: clean } });
  };

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View>
          <Text style={st.ptitle}>Restore Wallet</Text>
          <Text style={st.psub}>Enter recovery phrase</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={st.scroll}>
        <Text style={st.desc}>Enter your 12 or 24-word recovery phrase, separated by spaces.</Text>
        {/* restore-inp */}
        <TextInput
          style={[st.input, valid && st.inputOk]}
          value={phrase}
          onChangeText={setPhrase}
          placeholder="word1 word2 word3 ..."
          placeholderTextColor={C.dim}
          multiline
          numberOfLines={5}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          testID="restore-input"
        />
        {/* restore-count */}
        <Text style={st.count}>{words.length} words entered</Text>
        {/* restore-btn */}
        <Pressable style={[st.btnGold, !valid && { opacity: 0.4 }]} disabled={!valid} onPress={restore} testID="restore-button">
          <Text style={st.btnGoldTx}>Restore Wallet</Text>
        </Pressable>
        <Text style={st.bip}>Supports BIP-39 compatible wallets</Text>
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
  desc: { fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 20 },
  input: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.b2, borderRadius: 14, padding: 16, fontSize: 14, color: C.tx, lineHeight: 22, minHeight: 130, fontFamily: "monospace", textAlignVertical: "top" },
  inputOk: { borderColor: C.gold },
  count: { fontSize: 12, color: C.dim, marginTop: 8, marginBottom: 20 },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
  bip: { fontSize: 12, color: C.dim, textAlign: "center", marginTop: 12 },
});
