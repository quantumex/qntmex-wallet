// app/(dashboard)/swap.tsx
// Design: exact translation of pg-swap from qntmex-wallet.html
// Logic: preserved from original swap.tsx
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, FlatList, Image, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ethers } from "ethers";
import { useWalletStore } from "@/walletStore";
import { useWalletData } from "@/hooks/useWalletData";
import { useTokenPrices, getTokenPrice } from "@/hooks/useTokenPrices";
import { getSwapQuote, parseAmount } from "@/lib/uniswapSwapService";
import { TOKENS } from "../constants/tokens";
import BottomNav from "@/components/BottomNav";
import { C } from "@/app/theme";

const EthLogo = require("@/assets/eth.png");
const SLIPS = ["0.1","0.5","1.0"];

export default function Swap() {
  const router = useRouter();
  const { wallet } = useWalletStore();
  const { tokens } = useWalletData();
  const { prices } = useTokenPrices();

  const available = [
    { symbol:"ETH", label:"Ethereum", value:"ETH", decimals:18, logo:null },
    ...TOKENS.map((t) => ({ symbol:t.symbol, label:t.label, value:t.address, decimals:t.decimals, logo:t.logo })),
  ];

  const [from, setFrom] = useState(available[0]);
  const [to,   setTo]   = useState(available[1]);
  const [fromAmt, setFromAmt] = useState("");
  const [toAmt,   setToAmt]   = useState("");
  const [slip,    setSlip]    = useState("0.5");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<"from"|"to">("from");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);

  const getPrice = (sym: string) => getTokenPrice(sym, prices) || 0;
  const fromBal  = tokens.find((t) => t.symbol === from.symbol)?.balance;
  const toBal    = tokens.find((t) => t.symbol === to.symbol)?.balance;

  const flip = () => { const tmp=from; setFrom(to); setTo(tmp); setFromAmt(toAmt); setToAmt(fromAmt); };
  const openPicker = (t: "from"|"to") => { setPickerType(t); setSearch(""); setShowPicker(true); };
  const selectTok = (tok: typeof available[0]) => {
    if (tok.value === (pickerType==="from"?to:from).value) { Alert.alert("Error","Cannot select the same token"); return; }
    pickerType==="from" ? setFrom(tok) : setTo(tok);
    setShowPicker(false);
  };
  const filtered = available.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()));

  const doSwap = async () => {
    if (!wallet?.address) { Alert.alert("Error","Wallet not connected"); return; }
    if (!fromAmt || parseFloat(fromAmt) <= 0) { Alert.alert("Error","Enter a valid amount"); return; }
    if (from.value === to.value) { Alert.alert("Error","Select different tokens"); return; }
    setLoading(true);
    try {
      const parsed = parseAmount(fromAmt, from.decimals);
      const fTok = from.value==="ETH"?{address:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",decimals:18,symbol:"ETH"}:{address:from.value,decimals:from.decimals,symbol:from.symbol};
      const tTok = to.value  ==="ETH"?{address:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",decimals:18,symbol:"ETH"}:{address:to.value,  decimals:to.decimals,  symbol:to.symbol};
      const quote = await getSwapQuote({ fromToken:fTok, toToken:tTok, amount:parsed, userAddress:wallet.address, slippagePercentage:parseFloat(slip) });
      if (!quote) throw new Error("Empty quote");
      const outStr = ethers.formatUnits(quote.amountOut, to.decimals);
      const fromUsd = (parseFloat(fromAmt)*getPrice(from.symbol)).toFixed(2);
      const toUsd   = (parseFloat(outStr) *getPrice(to.symbol)).toFixed(2);
      router.push({ pathname:"/(dashboard)/swap-confirm", params:{
        fromSymbol:from.symbol, fromAmount:parseFloat(fromAmt).toFixed(6), fromLogo:String(from.logo||""),
        toSymbol:to.symbol, toAmount:outStr, toLogo:String(to.logo||""),
        quotedAmountOut:String(quote.amountOut), amountOutMinimum:String(quote.amountOutMinimum),
        feeAmount:String(quote.feeAmount), feeTier:String(quote.feeTier||"3000"), slippage:slip,
        fromUsdValue:fromUsd, toUsdValue:toUsd,
        estimatedGasUnits:String(quote.estimatedGasUnits||"300000"), gasCostWei:String(quote.gasCostWei||"0"),
        maxFeePerGas:String(quote.maxFeePerGas||"0"), priceImpactPercent:String(quote.priceImpactPercent||"0.5"),
        deadline:String(quote.deadline||Math.floor(Date.now()/1000)+120), routePath:String(quote.path||`${from.symbol} → ${to.symbol}`),
      }});
    } catch (e: any) { Alert.alert("Quote Error", e?.message||"Failed to fetch quote"); }
    finally { setLoading(false); }
  };

  const TokBadge = ({ sym, logo }: { sym:string; logo:string|null }) => (
    logo ? <Image source={{ uri:logo }} style={st.tokLogo} />
    : <View style={[st.tokLogo,{backgroundColor:C.gb,borderWidth:1,borderColor:C.gbd,alignItems:"center",justifyContent:"center"}]}>
        <Text style={{color:C.gold,fontSize:11,fontWeight:"700"}}>{sym.slice(0,2)}</Text>
      </View>
  );

  return (
    <View style={st.container}>
      <ScrollView contentContainerStyle={{ paddingBottom:100 }} showsVerticalScrollIndicator={false}>

        <View style={st.hdr}>
          <Text style={st.title}>Swap</Text>
          <Text style={st.sub}>Instant exchange</Text>
        </View>

        {/* sw-card FROM */}
        <View style={st.swCard}>
          <View style={st.swTop}>
            <Text style={st.swLbl}>From</Text>
            <Text style={st.swBal}>{fromBal!=null?`${fromBal.toFixed(4)} ${from.symbol}`:""}</Text>
          </View>
          <View style={st.swRow}>
            {/* prow — token picker chips */}
            <Pressable style={st.tokPill} onPress={() => openPicker("from")}>
              <TokBadge sym={from.symbol} logo={from.logo as string|null} />
              <Text style={st.tokPillTx}>{from.symbol}</Text>
              <Text style={{color:C.dim,fontSize:12}}>▾</Text>
            </Pressable>
            <TextInput style={st.swInp} value={fromAmt} onChangeText={setFromAmt} placeholder="0.00" placeholderTextColor={C.b2} keyboardType="decimal-pad" testID="from-amount" />
          </View>
        </View>

        {/* flip-wrap */}
        <View style={st.flipWrap}>
          <View style={st.flipLine}/>
          <Pressable style={st.flipBtn} onPress={flip}><Text style={st.flipTx}>⇅</Text></Pressable>
          <View style={st.flipLine}/>
        </View>

        {/* sw-card TO */}
        <View style={st.swCard}>
          <View style={st.swTop}>
            <Text style={st.swLbl}>To</Text>
            <Text style={st.swBal}>{toBal!=null?`${toBal.toFixed(4)} ${to.symbol}`:""}</Text>
          </View>
          <View style={st.swRow}>
            <Pressable style={st.tokPill} onPress={() => openPicker("to")}>
              <TokBadge sym={to.symbol} logo={to.logo as string|null} />
              <Text style={st.tokPillTx}>{to.symbol}</Text>
              <Text style={{color:C.dim,fontSize:12}}>▾</Text>
            </Pressable>
            <Text style={st.swOut}>{toAmt||"0.00"}</Text>
          </View>
          {fromAmt&&toAmt ? <Text style={st.swRate}>1 {from.symbol} ≈ {(parseFloat(toAmt)/parseFloat(fromAmt)).toFixed(4)} {to.symbol}</Text> : null}
        </View>

        {/* slippage */}
        <View style={[st.swCard,{marginTop:10}]}>
          <Text style={[st.swLbl,{marginBottom:9}]}>Slippage Tolerance</Text>
          <View style={st.slipRow}>
            {SLIPS.map((s) => (
              <Pressable key={s} style={[st.sc, slip===s&&st.scOn]} onPress={()=>setSlip(s)}>
                <Text style={[st.scTx, slip===s&&st.scTxOn]}>{s}%</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* info grid */}
        <View style={[st.swCard,{overflow:"hidden",marginTop:10,marginBottom:14,padding:0}]}>
          {[["Route","Uniswap V3"],["Est. Gas","~$4.20"],["Price Impact","< 0.01%"],["Min. Received",toAmt?`${(parseFloat(toAmt)*(1-parseFloat(slip)/100)).toFixed(4)} ${to.symbol}`:"—"]].map(([k,v],i,a)=>(
            <View key={k} style={[st.igRow,i<a.length-1&&{borderBottomWidth:1,borderBottomColor:C.border}]}>
              <Text style={st.ik}>{k}</Text>
              <Text style={[st.iv, k==="Price Impact"&&{color:C.green}]}>{v}</Text>
            </View>
          ))}
        </View>

        <Pressable style={[st.btnGold,{marginHorizontal:20},(!fromAmt||loading)&&{opacity:0.4}]} disabled={!fromAmt||loading} onPress={doSwap} testID="swap-button">
          {loading ? <ActivityIndicator color="#040301"/> : <Text style={st.btnGoldTx}>Review Swap</Text>}
        </Pressable>
      </ScrollView>

      {loading && (
        <View style={st.loadOverlay}>
          <ActivityIndicator size="large" color={C.gold}/>
          <Text style={{color:C.dim,fontSize:13,marginTop:10}}>Finding best route…</Text>
        </View>
      )}

      {/* Token picker modal */}
      <Modal transparent visible={showPicker} animationType="slide">
        <View style={st.modalContainer}>
          <View style={st.modalHdr}>
            <Text style={st.title}>Select Token</Text>
            <Pressable style={st.bk} onPress={()=>setShowPicker(false)}><Text style={st.bkTx}>✕</Text></Pressable>
          </View>
          <View style={st.searchBox}>
            <Text style={{color:C.dim,fontSize:14,marginRight:8}}>🔍</Text>
            <TextInput style={st.searchInp} placeholder="Search tokens…" placeholderTextColor={C.dim} value={search} onChangeText={setSearch} autoCapitalize="none"/>
          </View>
          <FlatList data={filtered} keyExtractor={(t)=>t.value} renderItem={({item})=>(
            <Pressable style={st.tokListRow} onPress={()=>selectTok(item)}>
              {item.symbol==="ETH"?<Image source={EthLogo} style={st.tokLogo}/>:item.logo?<Image source={{uri:item.logo as string}} style={st.tokLogo}/>:<View style={[st.tokLogo,{backgroundColor:C.gb,borderWidth:1,borderColor:C.gbd,alignItems:"center",justifyContent:"center"}]}><Text style={{color:C.gold,fontSize:11,fontWeight:"700"}}>{item.symbol.slice(0,2)}</Text></View>}
              <View style={{flex:1}}>
                <Text style={st.tokListName}>{item.label}</Text>
                <Text style={st.tokListSym}>{item.symbol}</Text>
              </View>
              <Text style={st.tokListPrice}>${getPrice(item.symbol).toFixed(2)}</Text>
            </Pressable>
          )} contentContainerStyle={{paddingBottom:40}}/>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  hdr: { paddingHorizontal:20, paddingTop:56, paddingBottom:16 },
  title: { fontSize:22, fontWeight:"800", color:C.tx, letterSpacing:-0.5 },
  sub: { fontSize:12, color:C.dim, marginTop:3 },
  swCard: { marginHorizontal:20, backgroundColor:C.card, borderRadius:16, borderWidth:1, borderColor:C.b2, padding:15, marginBottom:2 },
  swTop: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  swLbl: { fontSize:11, fontWeight:"700", color:C.m2, textTransform:"uppercase", letterSpacing:0.7 },
  swBal: { fontSize:12, color:C.dim },
  swRow: { flexDirection:"row", alignItems:"center", gap:10 },
  tokPill: { flexDirection:"row", alignItems:"center", gap:7, backgroundColor:C.bg, borderRadius:12, paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:C.border, flex:1 },
  tokLogo: { width:28, height:28, borderRadius:14 },
  tokPillTx: { flex:1, fontSize:13, fontWeight:"700", color:C.tx },
  swInp: { flex:1.2, color:C.tx, fontSize:34, fontWeight:"200", textAlign:"right", letterSpacing:-0.5 },
  swOut: { flex:1.2, fontSize:34, fontWeight:"200", color:C.gold2, textAlign:"right", letterSpacing:-0.5 },
  swRate: { fontSize:11, color:C.dim, textAlign:"right", marginTop:6 },
  flipWrap: { flexDirection:"row", alignItems:"center", marginHorizontal:20, marginVertical:7, gap:10 },
  flipLine: { flex:1, height:1, backgroundColor:C.b2 },
  flipBtn: { width:40, height:40, borderRadius:12, backgroundColor:C.gold, alignItems:"center", justifyContent:"center", shadowColor:C.gold, shadowOffset:{width:0,height:3}, shadowOpacity:0.3, shadowRadius:8, elevation:5 },
  flipTx: { color:"#040301", fontSize:18, fontWeight:"700" },
  slipRow: { flexDirection:"row", gap:8 },
  sc: { flex:1, paddingVertical:9, borderRadius:8, borderWidth:1, borderColor:C.b2, alignItems:"center" },
  scOn: { borderColor:C.gold, backgroundColor:C.gb },
  scTx: { fontSize:12, fontWeight:"500", color:C.m2 },
  scTxOn: { color:C.gold2 },
  igRow: { flexDirection:"row", justifyContent:"space-between", paddingHorizontal:15, paddingVertical:10 },
  ik: { fontSize:12, color:C.dim },
  iv: { fontSize:12, fontWeight:"500", color:C.tx2 },
  btnGold: { paddingVertical:15, borderRadius:14, backgroundColor:C.gold, alignItems:"center", shadowColor:C.gold, shadowOffset:{width:0,height:4}, shadowOpacity:0.28, shadowRadius:12, elevation:6 },
  btnGoldTx: { color:"#040301", fontSize:15, fontWeight:"700" },
  loadOverlay: { position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(7,7,5,0.85)", justifyContent:"center", alignItems:"center", zIndex:999 },
  modalContainer: { flex:1, backgroundColor:C.bg },
  modalHdr: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:56, paddingBottom:14 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  searchBox: { flexDirection:"row", alignItems:"center", marginHorizontal:20, marginBottom:14, paddingHorizontal:14, paddingVertical:11, backgroundColor:C.card, borderRadius:12, borderWidth:1, borderColor:C.b2 },
  searchInp: { flex:1, color:C.tx, fontSize:14 },
  tokListRow: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingVertical:13, borderBottomWidth:1, borderBottomColor:C.border },
  tokListName: { fontSize:14, fontWeight:"600", color:C.tx },
  tokListSym: { fontSize:12, color:C.dim, marginTop:1 },
  tokListPrice: { fontSize:13, fontWeight:"600", color:C.tx },
});
