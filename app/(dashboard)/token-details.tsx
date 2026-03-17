// app/(dashboard)/token-details.tsx
// Design: exact translation of pg-token from qntmex-wallet.html
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, ActivityIndicator } from "react-native";
const { LineChart } = require("react-native-svg-charts");
const shape = require("d3-shape");
import { useLocalSearchParams, router } from "expo-router";
import { useWalletData, Token } from "@/hooks/useWalletData";
import { useTokenHistory } from "@/hooks/useTokenHistory";
import { C } from "@/app/theme";

const { width } = Dimensions.get("window");
const tokenIcons: Record<string,any> = { ETH: require("@/assets/eth.png") };
type Range = "1D"|"1W"|"1M"|"3M"|"1Y";
const RANGE_DAYS: Record<Range,number> = { "1D":1,"1W":7,"1M":30,"3M":90,"1Y":365 };
const CG: Record<string,string> = { ETH:"ethereum", BTC:"bitcoin", USDC:"usd-coin", WBTC:"wrapped-bitcoin", LINK:"chainlink", USDT:"tether" };
const MARKET: Record<string,{mc:string;supply:string;vol:string;ath:string;desc:string}> = {
  ETH: { mc:"$405.2B", supply:"120.4M ETH", vol:"$18.4B", ath:"$4,891", desc:"Ethereum is a decentralized platform enabling smart contracts and dApps. It powers the majority of on-chain finance and NFTs." },
  BTC: { mc:"$1.24T",  supply:"21M BTC",    vol:"$28.5B", ath:"$73,737",desc:"Bitcoin is the original decentralised digital currency, designed as a peer-to-peer electronic cash system." },
  DEFAULT: { mc:"—", supply:"—", vol:"—", ath:"—", desc:"Real-time data powered by CoinGecko." },
};

export default function TokenDetails() {
  const params = useLocalSearchParams();
  const { tokens } = useWalletData();
  const [range, setRange] = useState<Range>("1W");
  const [starred, setStarred] = useState(false);

  const token: Token = useMemo(() => (
    tokens.find((t) => t.symbol === params.symbol) ?? {
      symbol:String(params.symbol??"ETH"), name:String(params.name??"Token"),
      balance:Number(params.balance??0), usdValue:Number(params.usdValue??0),
      logo:params.logo as string|undefined, contractAddress:"", decimals:18,
    }
  ), [params, tokens]);

  const cgId = CG[token.symbol??""]||"ethereum";
  const { prices, loading, percentChange, currentPrice, priceChange } = useTokenHistory(cgId, RANGE_DAYS[range]);
  const market = MARKET[token.symbol??""]||MARKET.DEFAULT;
  const logoSrc = (token.symbol && tokenIcons[token.symbol]) ?? (token.logo ? { uri:token.logo } : require("@/assets/placeholder.png"));
  const up = percentChange >= 0;

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View><Text style={st.ptitle}>{token.name}</Text><Text style={st.psub}>{token.name} Network</Text></View>
        <Pressable style={[st.ib,{marginLeft:"auto"}]} onPress={() => setStarred(!starred)}>
          <Text style={{fontSize:16, color:starred?C.gold:C.dim}}>★</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* coin-hero */}
        <View style={st.hero}>
          <View style={[st.coinIc, { backgroundColor:C.gb, borderColor:C.gbd }]}>
            <Image source={logoSrc} style={{ width:40, height:40, borderRadius:20 }} />
          </View>
          <Text style={st.coinNm}>{token.name}</Text>
          <Text style={st.coinSm}>{token.symbol}</Text>
          <Text style={st.coinPx}><Text style={st.coinPs}>$</Text>{currentPrice.toLocaleString(undefined,{maximumFractionDigits:4})}</Text>
          <View style={st.coinCr}>
            <View style={[st.coinCb, up?st.cbGreen:st.cbRed]}>
              <Text style={[st.cbTx, up?{color:C.green}:{color:C.red}]}>{up?"▲ +":"▼ "}{Math.abs(percentChange).toFixed(2)}%</Text>
            </View>
            {token.balance > 0 && <Text style={st.coinHld}>{token.balance.toFixed(4)} {token.symbol}</Text>}
          </View>
        </View>

        {/* chart-bg */}
        <View style={st.chartBg}>
          {loading ? (
            <ActivityIndicator color={C.gold} style={{ height:86 }} />
          ) : prices.length > 0 ? (
            <LineChart style={{height:86}} data={prices} width={width-48} svg={{stroke:up?C.gold:C.red, strokeWidth:2}} contentInset={{top:8,bottom:8}} curve={shape.curveMonotoneX} />
          ) : (
            <View style={{height:86,alignItems:"center",justifyContent:"center"}}><Text style={{color:C.dim,fontSize:11}}>No chart data</Text></View>
          )}
          {/* rng */}
          <View style={st.rng}>
            {(["1D","1W","1M","3M","1Y"] as Range[]).map((r) => (
              <Pressable key={r} style={[st.rb, range===r&&st.rbOn]} onPress={() => setRange(r)}>
                <Text style={[st.rbTx, range===r&&st.rbTxOn]}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* coin-acts */}
        <View style={st.acts}>
          {[{icon:"↑",lbl:"Send",go:()=>router.push({pathname:"/(dashboard)/send",params:{tokenSymbol:token.symbol,tokenAddress:token.contractAddress||"ETH"}})},
            {icon:"↓",lbl:"Receive",go:()=>router.push("/(dashboard)/receive")},
            {icon:"⇄",lbl:"Swap",go:()=>router.push("/(dashboard)/swap")},
            {icon:"+",lbl:"Buy",go:()=>{}}].map((a) => (
            <Pressable key={a.lbl} style={st.actBtn} onPress={a.go}>
              <View style={st.actCircle}><Text style={st.actIc}>{a.icon}</Text></View>
              <Text style={st.actLbl}>{a.lbl}</Text>
            </Pressable>
          ))}
        </View>

        {/* stat-grid */}
        <View style={st.statGrid}>
          {[
            ["Holdings", token.balance>0?`${token.balance.toFixed(4)} ${token.symbol} ($${(token.usdValue||0).toLocaleString(undefined,{maximumFractionDigits:2})})`:"-"],
            ["Market Cap", market.mc], ["24h Volume", market.vol],
            ["Supply", market.supply], ["All-Time High", market.ath],
            ["24h Change", `${up?"+":""}${percentChange.toFixed(2)}%`],
          ].map(([k,v],i,a) => (
            <View key={k} style={[st.srow,i<a.length-1&&st.srowBorder]}>
              <Text style={st.sk}>{k}</Text>
              <Text style={[st.sv, k==="24h Change"?(up?{color:C.green}:{color:C.red}):null]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* about */}
        <View style={st.aboutSec}>
          <Text style={st.aboutTitle}>About {token.name}</Text>
          <Text style={st.aboutTx}>{market.desc}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  phdr: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingTop:56, paddingBottom:0 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  ptitle: { fontSize:18, fontWeight:"700", color:C.tx },
  psub: { fontSize:11, color:C.dim, marginTop:2 },
  ib: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  hero: { alignItems:"center", paddingHorizontal:20, paddingVertical:20 },
  coinIc: { width:64, height:64, borderRadius:32, borderWidth:2, alignItems:"center", justifyContent:"center", marginBottom:10 },
  coinNm: { fontSize:22, fontWeight:"700", color:C.tx },
  coinSm: { fontSize:12, color:C.dim, marginTop:2, letterSpacing:0.5 },
  coinPx: { fontSize:36, fontWeight:"200", color:C.tx, letterSpacing:-1, marginTop:12, lineHeight:44 },
  coinPs: { fontSize:19, color:C.dim },
  coinCr: { flexDirection:"row", alignItems:"center", gap:10, marginTop:9 },
  coinCb: { paddingHorizontal:12, paddingVertical:4, borderRadius:20, borderWidth:1 },
  cbGreen: { backgroundColor:C.greenBg, borderColor:C.greenBd },
  cbRed: { backgroundColor:C.redBg, borderColor:C.redBd },
  cbTx: { fontSize:12, fontWeight:"700" },
  coinHld: { fontSize:12, color:C.dim },
  chartBg: { backgroundColor:C.card, borderWidth:1, borderColor:C.b2, borderRadius:14, marginHorizontal:24, padding:14, paddingBottom:6 },
  rng: { flexDirection:"row", justifyContent:"center", gap:4, paddingVertical:8 },
  rb: { paddingHorizontal:11, paddingVertical:5, borderRadius:8, borderWidth:1, borderColor:"transparent" },
  rbOn: { borderColor:C.gbd, backgroundColor:C.gb },
  rbTx: { fontSize:11, fontWeight:"600", color:C.m2 },
  rbTxOn: { color:C.gold },
  acts: { flexDirection:"row", gap:9, paddingHorizontal:20, paddingVertical:16 },
  actBtn: { flex:1, backgroundColor:C.card, borderWidth:1, borderColor:C.b2, borderRadius:14, paddingVertical:12, alignItems:"center", gap:5 },
  actCircle: { width:38, height:38, borderRadius:19, backgroundColor:C.gb, borderWidth:1, borderColor:C.gbd, alignItems:"center", justifyContent:"center" },
  actIc: { fontSize:18, color:C.gold },
  actLbl: { fontSize:11, fontWeight:"600", color:C.tx2 },
  statGrid: { marginHorizontal:20, backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.b2, overflow:"hidden", marginBottom:16 },
  srow: { flexDirection:"row", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:11 },
  srowBorder: { borderBottomWidth:1, borderBottomColor:C.border },
  sk: { fontSize:12, color:C.dim },
  sv: { fontSize:12, fontWeight:"600", color:C.tx },
  aboutSec: { paddingHorizontal:20, paddingBottom:8 },
  aboutTitle: { fontSize:14, fontWeight:"700", color:C.tx, marginBottom:10 },
  aboutTx: { fontSize:13, color:C.dim, lineHeight:21 },
});
