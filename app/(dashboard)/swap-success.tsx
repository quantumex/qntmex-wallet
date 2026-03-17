// app/(dashboard)/swap-success.tsx
// Design: exact translation of pg-swap-success from qntmex-wallet.html
// Logic: preserved from original swap-success.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Linking, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useWalletData } from "@/hooks/useWalletData";
import { C } from "@/app/theme";

export default function SwapSuccess() {
  const params = useLocalSearchParams<{ [key: string]: string }>();
  const { refresh } = useWalletData();
  const [scaleAnim] = useState(new Animated.Value(0));
  const txHash = params.transactionHash ?? "";

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    const t = setTimeout(() => refresh(), 1500);
    return () => clearTimeout(t);
  }, []);

  const short = txHash.length > 18 ? `${txHash.slice(0,10)}...${txHash.slice(-8)}` : txHash;

  if (!txHash) return (
    <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={{ color: C.red }}>Invalid transaction hash</Text>
      <Pressable style={[st.btnGold, { marginTop: 20, width: 160 }]} onPress={() => router.replace("/(dashboard)/home")}>
        <Text style={st.btnGoldTx}>Go Home</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={st.container}>
      {/* close */}
      <View style={st.topBar}>
        <Pressable style={st.closeBtn} onPress={() => router.replace("/(dashboard)/home")}>
          <Text style={{ color: C.dim, fontSize: 17 }}>✕</Text>
        </Pressable>
      </View>

      {/* ss-wrap */}
      <View style={st.wrap}>
        {/* ss-icon */}
        <Animated.View style={[st.successIcon, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={st.checkmark}>✓</Text>
        </Animated.View>

        {/* ss-title */}
        <Text style={st.title}>Swap Complete!</Text>

        {/* ss-sub */}
        <Text style={st.sub}>
          You successfully swapped{"\n"}
          <Text style={{ color: C.gold2, fontWeight: "700" }}>
            {params.fromAmount} {params.fromSymbol} → {params.toAmount} {params.toSymbol}
          </Text>
        </Text>

        {/* tx card */}
        <View style={st.txCard}>
          <Text style={st.txLbl}>Transaction Hash</Text>
          <View style={st.txRow}>
            <Text style={st.txHash}>{short}</Text>
            <Pressable onPress={async () => { await Clipboard.setStringAsync(txHash); Alert.alert("Copied", "Hash copied"); }}>
              <Text style={{ color: C.gold, fontSize: 14 }}>📋</Text>
            </Pressable>
          </View>
          <Pressable style={st.explorerBtn} onPress={() => Linking.openURL(`https://etherscan.io/tx/${txHash}`).catch(() => {})}>
            <Text style={st.explorerTx}>View on Etherscan ↗</Text>
          </Pressable>
        </View>

        {/* buttons */}
        <View style={{ width: "100%", gap: 10 }}>
          <Pressable style={st.btnGold} onPress={() => router.replace("/(dashboard)/home")}>
            <Text style={st.btnGoldTx}>Back to Home</Text>
          </Pressable>
          <Pressable style={st.btnOut} onPress={() => router.push({ pathname: "/(dashboard)/transaction-details", params: { hash: txHash } } as any)}>
            <Text style={st.btnOutTx}>View Transaction</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 0 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.greenBg, borderWidth: 2, borderColor: C.greenBd, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  checkmark: { fontSize: 36, color: C.green },
  title: { fontSize: 24, fontWeight: "700", color: C.tx, marginBottom: 8 },
  sub: { fontSize: 14, color: C.dim, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  txCard: { width: "100%", backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.b2, padding: 16, marginBottom: 28, gap: 10 },
  txLbl: { fontSize: 11, fontWeight: "700", color: C.m2, letterSpacing: 0.7 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  txHash: { fontSize: 13, color: C.tx, fontFamily: "monospace", flex: 1 },
  explorerBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.gb, borderRadius: 8, padding: 12 },
  explorerTx: { fontSize: 12, fontWeight: "600", color: C.gold },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
  btnOut: { width: "100%", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: C.b2, alignItems: "center" },
  btnOutTx: { fontSize: 14, fontWeight: "600", color: C.m2 },
});
