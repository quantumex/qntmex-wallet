// app/(dashboard)/swap-confirm.tsx
// Design: exact translation of pg-swap-confirm from qntmex-wallet.html
// Logic: preserved from original swap-confirm.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ethers } from "ethers";
import { useWalletStore } from "@/walletStore";
import { provider } from "@/lib/provider";
import { executeSwap, parseAmount } from "@/lib/uniswapScwapService";
import { TOKENS } from "@/app/constants/tokens";
import { SWAP_FEE_PERCENTAGE } from "@/app/constants/chainConfig";
import { C } from "@/app/theme";

export default function SwapConfirm() {
  const params = useLocalSearchParams<{ [key: string]: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWalletStore();

  let toDecimals = 18;
  if (params.toSymbol !== "ETH") {
    const t = TOKENS.find((x) => x.symbol === params.toSymbol);
    if (t) toDecimals = t.decimals;
  }

  const outStr   = params.quotedAmountOut   ? parseFloat(ethers.formatUnits(params.quotedAmountOut, toDecimals)).toFixed(4) : "0";
  const minStr   = params.amountOutMinimum  ? parseFloat(ethers.formatUnits(params.amountOutMinimum, toDecimals)).toFixed(4) : "0";
  const feeStr   = params.feeAmount         ? parseFloat(ethers.formatUnits(params.feeAmount, toDecimals)).toFixed(4) : "0";
  const slip     = parseFloat(params.slippage || "0.5");
  const gasCostETH = params.gasCostWei && params.gasCostWei !== "0" ? ethers.formatUnits(params.gasCostWei, 18) : "0";
  const priceImpact = parseFloat(params.priceImpactPercent || "0.5");

  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const dl = parseInt(params.deadline || "0", 10);
    if (!dl) return;
    const tick = () => setSecs(Math.max(0, dl - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [params.deadline]);

  const fmt = () => { const m = Math.floor(secs / 60); const s = secs % 60; return `${m}:${s.toString().padStart(2, "0")}`; };
  const impactColor = priceImpact < 1 ? C.green : priceImpact < 3 ? C.gold2 : C.red;

  const handleConfirm = async () => {
    if (!wallet?.address) { Alert.alert("Error", "Wallet not connected"); return; }
    const now = Math.floor(Date.now() / 1000);
    const dl = parseInt(params.deadline || "0", 10);
    if (now >= dl) { Alert.alert("Quote Expired", "Please go back and request a fresh quote."); return; }
    if (priceImpact > 15) {
      Alert.alert("Extreme Price Impact", `${priceImpact.toFixed(2)}% impact. Continue?`, [{ text:"Cancel", style:"cancel" }, { text:"Continue", onPress: () => exec(wallet) }]);
      return;
    }
    exec(wallet);
  };

  const exec = async (w: typeof wallet) => {
    if (!w) return;
    setIsLoading(true);
    try {
      if (!params.quotedAmountOut || !params.amountOutMinimum || !params.feeTier || !params.deadline) throw new Error("Missing quote data");
      const fTok = params.fromSymbol === "ETH" ? { address:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals:18, symbol:"ETH" } : (() => { const t = TOKENS.find((x) => x.symbol === params.fromSymbol); if (!t) throw new Error(`Token not found: ${params.fromSymbol}`); return { address:t.address, decimals:t.decimals, symbol:t.symbol }; })();
      const tTok = params.toSymbol === "ETH" ? { address:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals:18, symbol:"ETH" } : (() => { const t = TOKENS.find((x) => x.symbol === params.toSymbol); if (!t) throw new Error(`Token not found: ${params.toSymbol}`); return { address:t.address, decimals:t.decimals, symbol:t.symbol }; })();
      const amt = parseAmount(params.fromAmount || "0", fTok.decimals);
      const signer = w.connect(provider);
      const res = await executeSwap({ fromToken:fTok, toToken:tTok, amount:amt, userAddress:w.address, slippagePercentage:slip }, signer);
      if (!res?.transactionHash) throw new Error("No transaction hash");
      router.push({ pathname:"/(dashboard)/swap-success", params: { fromSymbol:params.fromSymbol, toSymbol:params.toSymbol, fromAmount:params.fromAmount, toAmount:params.toAmount, transactionHash:res.transactionHash.toString(), blockNumber:res.blockNumber.toString(), gasUsed:res.gasUsed.toString(), feePercent:`${SWAP_FEE_PERCENTAGE*100}%`, priceImpactPercent:params.priceImpactPercent } });
    } catch (e: any) {
      Alert.alert("Swap Failed", e.message || "Try again");
    } finally { setIsLoading(false); }
  };

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <Text style={st.ptitle}>Confirm Swap</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* sc-hero */}
        <View style={st.hero}>
          <Text style={st.heroLabel}>You're swapping</Text>
          <Text style={st.fromAmt}>{params.fromAmount} <Text style={st.fromTok}>{params.fromSymbol}</Text></Text>
          <Text style={st.arrow}>⇓</Text>
          <Text style={st.toAmt}>{parseFloat(outStr).toLocaleString(undefined,{maximumFractionDigits:4})} <Text style={st.toTok}>{params.toSymbol}</Text></Text>
          <Text style={st.rateDisp}>1 {params.fromSymbol} ≈ {params.routePath || `${params.fromSymbol} → ${params.toSymbol}`}</Text>
        </View>

        {/* detail card */}
        <View style={[st.detCard, { marginHorizontal: 20, marginBottom: 14 }]}>
          {[
            ["Route",         "Uniswap V3"],
            ["Slippage",      `${slip}%`],
            ["Min. Received", `${minStr} ${params.toSymbol}`],
            ["Network Fee",   `~${parseFloat(gasCostETH).toFixed(6)} ETH`],
            ["Price Impact",  `${priceImpact.toFixed(2)}%`],
          ].map(([k, v], i, arr) => (
            <View key={k} style={[st.drow, i < arr.length - 1 && st.drowBorder]}>
              <Text style={st.dk}>{k}</Text>
              <Text style={[st.dv, k === "Price Impact" && { color: impactColor }]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* countdown */}
        {secs > 0 && (
          <View style={[st.detCard, { marginHorizontal: 20, marginBottom: 14 }]}>
            <View style={st.drow}>
              <Text style={st.dk}>Quote Expires</Text>
              <Text style={[st.dv, secs < 30 && { color: C.red }]}>{fmt()}</Text>
            </View>
          </View>
        )}

        {/* warn */}
        <View style={st.warn}>
          <Text style={st.warnIc}>⚠️</Text>
          <Text style={st.warnTx}>Output is estimated. You will receive at least the minimum amount or the transaction will revert.</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <Pressable style={[st.btnGold, isLoading && { opacity: 0.6 }]} disabled={isLoading} onPress={handleConfirm} testID="confirm-swap-button">
            {isLoading ? <ActivityIndicator color="#040301" /> : <Text style={st.btnGoldTx}>Confirm Swap</Text>}
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
  hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  heroLabel: { fontSize: 11, fontWeight: "700", color: C.m2, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 },
  fromAmt: { fontSize: 42, fontWeight: "200", color: C.tx, letterSpacing: -1.5, lineHeight: 50 },
  fromTok: { fontSize: 18, color: C.dim },
  arrow: { fontSize: 24, color: C.gold, marginVertical: 8 },
  toAmt: { fontSize: 42, fontWeight: "200", color: C.gold2, letterSpacing: -1.5, lineHeight: 50 },
  toTok: { fontSize: 18, color: C.m2 },
  rateDisp: { fontSize: 12, color: C.dim, marginTop: 10 },
  detCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, borderRadius: 14, overflow: "hidden" },
  drow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  drowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  dk: { fontSize: 12, color: C.dim },
  dv: { fontSize: 12, fontWeight: "500", color: C.tx },
  warn: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderColor: C.gb2, backgroundColor: "rgba(201,168,76,0.03)", borderRadius: 12, padding: 13, marginHorizontal: 20 },
  warnIc: { fontSize: 14 },
  warnTx: { flex: 1, fontSize: 11, color: C.m2, lineHeight: 17 },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301" },
});
