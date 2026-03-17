// app/(dashboard)/home.tsx
// Design: exact translation of pg-home from qntmex-wallet.html
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useWalletData, Token as WalletToken } from "@/hooks/useWalletData";
import { useTokenPrices, getToken24hChange } from "@/hooks/useTokenPrices";
import { C } from "@/app/theme";
import Constants from "expo-constants";

const EthLogo = require("@/assets/eth.png");

// mini sparkling bars
function SparkBars({ up }: { up: boolean }) {
  const heights = [3,4,3.5,5,4.8,6,5.5, up ? 7 : 2.5];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 24, width: 50 }}>
      {heights.map((h, i) => (
        <View key={i} style={{ width: 4, height: h * 3, borderRadius: 2, backgroundColor: up ? C.green : C.red, opacity: 0.55 + i * 0.04 }} />
      ))}
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { ethBalance, ethBalanceUsd, tokens: walletTokens, usdValue, transactions, loading, error, refresh } = useWalletData();
  const { prices } = useTokenPrices();
  const eth24h = getToken24hChange("ETH", prices);
  const topTokens = (walletTokens || []).filter((t) => t?.balance > 0).slice(0, 3);

  if (error) return (
    <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text style={{ color: C.red, fontSize: 14 }}>{error}</Text>
    </View>
  );

  return (
    <View style={st.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* hero section */}
        <View style={st.hero}>
          {/* hero-top */}
          <View style={st.heroTop}>
            {/* logo-r */}
            <View style={st.logoRow}>
              <View style={st.logoSvgWrap}>
                {/* SVG logo represented as styled view */}
                <Text style={st.logoIcon}>♟</Text>
              </View>
              <Text style={st.logoName}>QNTMEX</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={st.ib} onPress={() => router.push("/(dashboard)/notifications")}>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.ib} onPress={() => router.push("/(dashboard)/settings")}>
                <Text style={{ fontSize: 16 }}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* bal-sec */}
          <View style={st.balSec}>
            <Text style={st.balLbl}>Total Balance</Text>
            <View style={st.balRow}>
              <Text style={st.balNum}>
                <Text style={st.balS}>$</Text>
                {typeof usdValue === "number" && usdValue > 0
                  ? usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : "0.00"}
              </Text>
            </View>
            <Text style={[st.balChg, eth24h >= 0 ? st.txGreen : st.txRed]}>
              {eth24h >= 0 ? "▲" : "▼"} {Math.abs(eth24h).toFixed(2)}% today
            </Text>
          </View>

          {/* qa — quick actions */}
          <View style={st.qa}>
            {[
              { icon: "↑", label: "Send",    go: "/(dashboard)/send" },
              { icon: "↓", label: "Receive", go: "/(dashboard)/receive" },
              { icon: "⇄", label: "Swap",    go: "/(dashboard)/swap" },
              { icon: "+", label: "Buy",     go: null },
            ].map((a) => (
              <TouchableOpacity key={a.label} style={st.qb} onPress={() => a.go && router.push(a.go as any)}>
                <View style={st.qc}><Text style={st.qcTx}>{a.icon}</Text></View>
                <Text style={st.ql}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* divider */}
        <View style={st.dvdr} />

        {/* Assets section */}
        <View style={st.sec}>
          <View style={st.shdr}>
            <Text style={st.stitle}>Assets</Text>
            <Pressable onPress={() => router.push("/(dashboard)/portfolio")}><Text style={st.slink}>See all</Text></Pressable>
          </View>

          {loading ? (
            <View style={st.skRow}><View style={[st.skCircle, { backgroundColor: C.b2 }]} /><View style={{ flex: 1, gap: 6 }}><View style={[st.skLine, { width: "60%", backgroundColor: C.b2 }]} /><View style={[st.skLine, { width: "40%", backgroundColor: C.border }]} /></View></View>
          ) : (
            <View>
              {ethBalanceUsd > 0 && (
                <Pressable style={st.arow} onPress={() => router.push({ pathname: "/(dashboard)/token-details", params: { symbol: "ETH", name: "Ethereum", balance: ethBalance, usdValue: ethBalanceUsd } })}>
                  <View style={[st.toki, { backgroundColor: "#627EEA18", borderColor: "#627EEA35" }]}><Text style={{ color: "#627EEA", fontSize: 10, fontWeight: "700" }}>ET</Text></View>
                  <View style={st.ti}>
                    <Text style={st.tn}>Ethereum</Text>
                    <Text style={st.tb}>{parseFloat(ethBalance || "0").toFixed(4)} ETH</Text>
                  </View>
                  <SparkBars up={eth24h >= 0} />
                  <View style={st.tr}>
                    <Text style={st.tu}>${ethBalanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                    <Text style={[st.tc, eth24h >= 0 ? st.txGreen : st.txRed]}>{eth24h >= 0 ? "+" : ""}{eth24h.toFixed(2)}%</Text>
                  </View>
                </Pressable>
              )}
              {topTokens.map((t: WalletToken) => {
                const chg = getToken24hChange(t.symbol || "", prices);
                return (
                  <Pressable key={t.contractAddress} style={st.arow} onPress={() => router.push({ pathname: "/(dashboard)/token-details", params: { symbol: t.symbol, name: t.name, balance: t.balance, usdValue: t.usdValue } })}>
                    <View style={[st.toki, { backgroundColor: C.gb, borderColor: C.gbd }]}>
                      {t.logo ? <Image source={{ uri: t.logo }} style={{ width: 22, height: 22, borderRadius: 11 }} /> : <Text style={{ color: C.gold, fontSize: 10, fontWeight: "700" }}>{(t.symbol || "?").slice(0, 2)}</Text>}
                    </View>
                    <View style={st.ti}>
                      <Text style={st.tn}>{t.name || "Unknown"}</Text>
                      <Text style={st.tb}>{t.balance.toFixed(4)} {t.symbol}</Text>
                    </View>
                    <SparkBars up={chg >= 0} />
                    <View style={st.tr}>
                      <Text style={st.tu}>${(t.usdValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                      <Text style={[st.tc, chg >= 0 ? st.txGreen : st.txRed]}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</Text>
                    </View>
                  </Pressable>
                );
              })}
              {!ethBalanceUsd && !topTokens.length && (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={{ color: C.dim, fontSize: 13 }}>No assets yet</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* divider */}
        <View style={[st.dvdr, { marginTop: 4 }]} />

        {/* Recent Activity */}
        <View style={[st.sec, st.secLast]}>
          <View style={[st.shdr, { marginTop: 4 }]}>
            <Text style={st.stitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/(dashboard)/notifications")}><Text style={st.slink}>See all</Text></Pressable>
          </View>
          {transactions && transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => {
            const out = tx.direction === "out";
            const color = out ? C.red : C.green;
            const bg = out ? C.redBg : C.greenBg;
            const bd = out ? C.redBd : C.greenBd;
            return (
              <Pressable key={`${tx.hash}-${i}`} style={st.txrow} onPress={() => router.push({ pathname: "/(dashboard)/transaction-details", params: { hash: tx.hash, symbol: tx.symbol || "ETH", amount: parseFloat(tx.amount).toFixed(4), direction: tx.direction, from: tx.from, to: tx.to, timestamp: tx.timestamp.toString() } })}>
                <View style={[st.txic, { backgroundColor: bg, borderWidth: 1, borderColor: bd }]}>
                  <Text style={{ color, fontSize: 15 }}>{out ? "↑" : "↓"}</Text>
                </View>
                <View style={st.txi}>
                  <Text style={st.txl}>{tx.name || tx.symbol || "ETH"}</Text>
                  <Text style={st.txs}>{new Date(tx.timestamp * 1000).toLocaleDateString()}</Text>
                </View>
                <View style={st.txrr}>
                  <Text style={[st.txa, { color }]}>{out ? "-" : "+"}{parseFloat(tx.amount).toFixed(4)} {tx.symbol || "ETH"}</Text>
                </View>
              </Pressable>
            );
          }) : (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <Text style={{ color: C.dim, fontSize: 13 }}>No transactions yet</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  hero: { paddingHorizontal: 20, paddingTop: 20, flexShrink: 0 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoSvgWrap: { width: 28, height: 28, backgroundColor: C.gb, borderRadius: 6, borderWidth: 1, borderColor: C.gbd, alignItems: "center", justifyContent: "center" },
  logoIcon: { color: C.gold, fontSize: 18 },
  logoName: { fontSize: 18, fontWeight: "800", letterSpacing: 3, color: C.gold },
  ib: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  balSec: { alignItems: "center", paddingBottom: 18 },
  balLbl: { fontSize: 12, fontWeight: "500", color: C.m2, letterSpacing: 0.4, marginBottom: 8 },
  balRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  balNum: { fontSize: 46, fontWeight: "200", color: C.tx, letterSpacing: -1.5, lineHeight: 54 },
  balS: { fontSize: 24, fontWeight: "400", color: C.dim },
  balChg: { marginTop: 7, fontSize: 13, fontWeight: "600" },
  qa: { flexDirection: "row", gap: 9, paddingBottom: 16 },
  qb: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 7 },
  qc: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gb, borderWidth: 1, borderColor: C.gbd, alignItems: "center", justifyContent: "center" },
  qcTx: { color: C.gold, fontSize: 18 },
  ql: { fontSize: 11, fontWeight: "600", color: C.tx2 },
  dvdr: { height: 1, backgroundColor: C.border, marginHorizontal: 20 },
  sec: { paddingHorizontal: 20, paddingTop: 18 },
  secLast: { paddingBottom: 20 },
  shdr: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  stitle: { fontSize: 14, fontWeight: "700", color: C.tx },
  slink: { fontSize: 12, fontWeight: "600", color: C.gold },
  arow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border },
  toki: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  ti: { flex: 1 },
  tn: { fontSize: 14, fontWeight: "600", color: C.tx, lineHeight: 20 },
  tb: { fontSize: 12, color: C.dim, marginTop: 2 },
  tr: { alignItems: "flex-end" },
  tu: { fontSize: 14, fontWeight: "600", color: C.tx },
  tc: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  txrow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  txic: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  txi: { flex: 1 },
  txl: { fontSize: 13, fontWeight: "600", color: C.tx },
  txs: { fontSize: 11, color: C.dim, marginTop: 1 },
  txrr: { alignItems: "flex-end" },
  txa: { fontSize: 13, fontWeight: "600" },
  txGreen: { color: C.green },
  txRed: { color: C.red },
  skRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  skCircle: { width: 40, height: 40, borderRadius: 20 },
  skLine: { height: 12, borderRadius: 6 },
});
