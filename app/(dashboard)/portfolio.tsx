// app/(dashboard)/portfolio.tsx
// Design: QNTMEX dark-gold theme
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { C } from "@/app/theme";
import { useWalletData } from "@/hooks/useWalletData";
import { useTokenPrices, getToken24hChange } from "@/hooks/useTokenPrices";
import { TOKENS } from "../constants/tokens";
import BottomNav from "@/components/BottomNav";

const EthLogo = require("@/assets/eth.png");
type FilterTab = "all"|"gainers"|"losers"|"watch";

export default function Portfolio() {
  const { loading, error } = useWalletData();
  const { prices, loading: pl } = useTokenPrices();
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>("all");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => { AsyncStorage.getItem("@watchlist").then((s) => { if (s) setWatchlist(JSON.parse(s)); }); }, []);
  const toggleWatch = (sym: string) => {
    const n = watchlist.includes(sym) ? watchlist.filter((s) => s !== sym) : [...watchlist, sym];
    setWatchlist(n); AsyncStorage.setItem("@watchlist", JSON.stringify(n));
  };

  const all = [
    { symbol:"ETH", name:"Ethereum",   price:prices["ETH"]?.price||0, change24h:prices["ETH"]?.change24h||0, logo:null,     address:"0xEEE" },
    ...TOKENS.filter((t) => t.symbol !== "ETH").map((t) => ({ symbol:t.symbol, name:t.label, price:prices[t.symbol]?.price||0, change24h:prices[t.symbol]?.change24h||0, logo:t.logo, address:t.address })),
  ];
  const filtered = tab === "all" ? all : tab === "gainers" ? all.filter((t) => t.change24h>0).sort((a,b) => b.change24h-a.change24h) : tab === "losers" ? all.filter((t) => t.change24h<0).sort((a,b) => a.change24h-b.change24h) : all.filter((t) => watchlist.includes(t.symbol));

  const TABS: { k: FilterTab; l: string }[] = [
    { k:"all",     l:"All" },
    { k:"gainers", l:"Top Gainers" },
    { k:"losers",  l:"Top Losers" },
    { k:"watch",   l:`Watch${watchlist.length ? ` (${watchlist.length})` : ""}` },
  ];

  return (
    <View style={st.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={st.hdr}>
          <Text style={st.title}>Market</Text>
          <TouchableOpacity style={st.ib}><Text style={{ fontSize: 16, color: C.gold }}>🔍</Text></TouchableOpacity>
        </View>

        {/* filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.k} style={[st.tab, tab === t.k && st.tabOn]} onPress={() => setTab(t.k)} testID={`tab-${t.k}`}>
              <Text style={[st.tabTx, tab === t.k && st.tabTxOn]}>{t.l}</Text>
              {tab === t.k && <View style={st.tabLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* market list */}
        <View style={st.list}>
          {(loading || pl) ? (
            [1,2,3,4].map((i) => (
              <View key={i} style={st.skRow}>
                <View style={[st.skCircle, { backgroundColor: C.b2 }]} />
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={[st.skLine, { width: "50%" }]} />
                  <View style={[st.skLine, { width: "30%", backgroundColor: C.border }]} />
                </View>
              </View>
            ))
          ) : filtered.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}><Text style={{ color: C.dim, fontSize: 13 }}>No tokens in this category</Text></View>
          ) : filtered.map((t) => {
            const up = t.change24h >= 0;
            return (
              <Pressable key={t.address} style={st.row} onPress={() => router.push({ pathname: "/(dashboard)/token-details", params: { symbol: t.symbol, name: t.name, balance: 0, usdValue: t.price } })}>
                <View style={st.logoCircle}>
                  {t.symbol === "ETH" ? <Image source={EthLogo} style={{ width: 28, height: 28 }} /> : t.logo ? <Image source={{ uri: t.logo as string }} style={{ width: 28, height: 28 }} /> : <Text style={{ color: C.gold, fontSize: 13, fontWeight: "700" }}>{t.symbol.slice(0,2)}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.rowName}>{t.name}</Text>
                  <Text style={st.rowPrice}>${t.price > 0 ? t.price.toFixed(2) : "0.00"}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleWatch(t.symbol)} style={{ paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 18, color: watchlist.includes(t.symbol) ? C.gold : C.b2 }}>★</Text>
                </TouchableOpacity>
                <View style={[st.badge, up ? st.badgeGreen : st.badgeRed]}>
                  <Text style={[st.badgeTx, up ? { color: C.green } : { color: C.red }]}>{up ? "+" : ""}{t.change24h.toFixed(2)}%</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14 },
  title: { fontSize: 22, fontWeight: "800", color: C.tx, letterSpacing: -0.5 },
  ib: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: C.b2, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  tabs: { paddingHorizontal: 20, gap: 4, marginBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: C.gold },
  tabTx: { fontSize: 13, fontWeight: "600", color: C.dim },
  tabTxOn: { color: C.gold2 },
  tabLine: { height: 0 },
  list: { paddingHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, borderWidth: 1, borderColor: C.b2, alignItems: "center", justifyContent: "center" },
  rowName: { fontSize: 14, fontWeight: "600", color: C.tx },
  rowPrice: { fontSize: 12, color: C.dim, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  badgeGreen: { backgroundColor: C.greenBg, borderColor: C.greenBd },
  badgeRed: { backgroundColor: C.redBg, borderColor: C.redBd },
  badgeTx: { fontSize: 12, fontWeight: "600" },
  skRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  skCircle: { width: 44, height: 44, borderRadius: 22 },
  skLine: { height: 12, borderRadius: 6, backgroundColor: C.b2 },
});
