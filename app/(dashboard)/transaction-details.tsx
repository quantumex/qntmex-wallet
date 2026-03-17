// app/(dashboard)/transaction-details.tsx
// Design: exact translation of pg-tx from qntmex-wallet.html
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Platform, ToastAndroid, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { C } from "@/app/theme";

export default function TransactionDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const tx = useMemo(() => {
    try {
      if (!params?.hash || !params?.symbol) return null;
      return {
        hash:String(params.hash??""), from:String(params.from??"Unknown"),
        to:params.to?String(params.to):null,
        amount:parseFloat(String(params.amount??"0"))||0,
        symbol:String(params.symbol??""),
        direction:(params.direction==="in"?"in":"out") as "in"|"out",
        timestamp:parseInt(String(params.timestamp??Date.now()))||Date.now(),
        status:(["pending","confirmed","failed"].includes(String(params.status))?String(params.status):"confirmed") as "pending"|"confirmed"|"failed",
        gasUsed:params.gasUsed?String(params.gasUsed):undefined,
        fiatValue:params.fiatValue?String(params.fiatValue):undefined,
      };
    } catch { return null; }
  }, [params]);

  if (!tx) return (
    <View style={[st.container,{justifyContent:"center",alignItems:"center"}]}>
      <Text style={{color:C.dim}}>No transaction data</Text>
    </View>
  );

  const out = tx.direction === "out";
  const color = out ? C.red : C.green;
  const bg    = out ? C.redBg : C.greenBg;
  const bd    = out ? C.redBd : C.greenBd;
  const scColors: Record<string,string> = { confirmed:C.green, pending:C.gold2, failed:C.red };
  const sc = scColors[tx.status||"confirmed"];
  const date = new Date(tx.timestamp < 1e12 ? tx.timestamp*1000 : tx.timestamp);

  const copy = async (val:string, lbl:string) => {
    await Clipboard.setStringAsync(val);
    if (Platform.OS==="android") ToastAndroid.show(`${lbl} copied`,ToastAndroid.SHORT);
    else Alert.alert("Copied",`${lbl} copied`);
  };

  return (
    <SafeAreaView style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View><Text style={st.ptitle}>Transaction</Text><Text style={st.psub}>{date.toLocaleDateString()}</Text></View>
        <Pressable style={[st.ib,{marginLeft:"auto"}]} onPress={() => Linking.openURL(`https://etherscan.io/tx/${tx.hash}`).catch(()=>{})}>
          <Text style={{color:C.gold,fontSize:14}}>↗</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* txd-hero */}
        <View style={st.hero}>
          <View style={[st.typeTag, {backgroundColor:bg, borderColor:bd}]}>
            <Text style={[st.typeTx,{color}]}>{out?"↑ Sent":"↓ Received"}</Text>
          </View>
          <Text style={[st.amt,{color}]}>{out?"-":"+"}  {tx.amount} {tx.symbol}</Text>
          {tx.fiatValue && <Text style={st.fiat}>≈ ${tx.fiatValue}</Text>}
          <View style={st.stRow}>
            <View style={[st.stDot,{backgroundColor:sc}]}/>
            <Text style={[st.stTx,{color:sc}]}>{tx.status.charAt(0).toUpperCase()+tx.status.slice(1)}</Text>
          </View>
        </View>

        {/* timeline steps */}
        <View style={st.steps}>
          {[{lbl:"Transaction Submitted",tm:date.toLocaleTimeString()},{lbl:"Network Processing",tm:"~30 seconds"},{lbl:"Confirmed on Chain",tm:date.toLocaleDateString()}].map((s,i,arr) => (
            <View key={i} style={st.step}>
              <View style={st.stepCol}>
                <View style={[st.stepDot, tx.status!=="pending"&&st.stepDotDone]}><Text style={st.stepCheck}>✓</Text></View>
                {i<arr.length-1 && <View style={[st.stepLine, tx.status!=="pending"&&st.stepLineDone]}/>}
              </View>
              <View style={st.stepInfo}>
                <Text style={st.stepLbl}>{s.lbl}</Text>
                <Text style={st.stepTm}>{s.tm}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* det-card */}
        <View style={[st.detCard,{margin:20}]}>
          {[["From",tx.from],["To",tx.to||"—"],["Amount",`${tx.amount} ${tx.symbol}`],
            tx.fiatValue?["USD Value",`$${tx.fiatValue}`]:null,
            tx.gasUsed?["Gas Used",tx.gasUsed]:null,
            ["Date & Time",date.toLocaleString()],["Tx Hash",tx.hash]
          ].filter(Boolean).map(([k,v],i,a) => (
            <Pressable key={k} style={[st.drow,i<a.length-1&&st.drowBorder]} onPress={()=>v&&v!=="—"&&copy(String(v),String(k))}>
              <Text style={st.dk}>{k}</Text>
              <Text style={[st.dv,(k==="Tx Hash"||k==="From"||k==="To")&&{fontFamily:"monospace",fontSize:10}]} numberOfLines={1}>{String(v)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{paddingHorizontal:20,gap:10}}>
          <Pressable style={st.btnOut} onPress={()=>Linking.openURL(`https://etherscan.io/tx/${tx.hash}`).catch(()=>{})}>
            <Text style={st.btnOutTx}>View on Etherscan ↗</Text>
          </Pressable>
          <Pressable style={st.btnOut} onPress={()=>copy(tx.hash,"Transaction hash")}>
            <Text style={st.btnOutTx}>Copy Transaction Hash</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  phdr: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingTop:16, paddingBottom:12 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  ptitle: { fontSize:18, fontWeight:"700", color:C.tx },
  psub: { fontSize:11, color:C.dim, marginTop:2 },
  ib: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  hero: { alignItems:"center", paddingVertical:24, paddingHorizontal:20 },
  typeTag: { paddingHorizontal:16, paddingVertical:6, borderRadius:20, borderWidth:1, marginBottom:16 },
  typeTx: { fontSize:12, fontWeight:"700" },
  amt: { fontSize:50, fontWeight:"200", letterSpacing:-1.5, lineHeight:58, marginBottom:6 },
  fiat: { fontSize:13, color:C.m2, marginBottom:12 },
  stRow: { flexDirection:"row", alignItems:"center", gap:6 },
  stDot: { width:8, height:8, borderRadius:4 },
  stTx: { fontSize:12, fontWeight:"600" },
  steps: { padding:20, marginBottom:4 },
  step: { flexDirection:"row", gap:12 },
  stepCol: { alignItems:"center", width:20 },
  stepDot: { width:20, height:20, borderRadius:10, backgroundColor:C.b2, alignItems:"center", justifyContent:"center" },
  stepDotDone: { backgroundColor:C.green },
  stepCheck: { fontSize:10, fontWeight:"700", color:"#040301" },
  stepLine: { width:2, flex:1, minHeight:22, marginVertical:2, backgroundColor:C.b2 },
  stepLineDone: { backgroundColor:C.green },
  stepInfo: { flex:1, paddingBottom:14, paddingTop:1 },
  stepLbl: { fontSize:13, fontWeight:"600", color:C.tx },
  stepTm: { fontSize:11, color:C.dim, marginTop:2 },
  detCard: { backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.b2, overflow:"hidden" },
  drow: { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", paddingHorizontal:16, paddingVertical:12 },
  drowBorder: { borderBottomWidth:1, borderBottomColor:C.border },
  dk: { fontSize:12, color:C.dim },
  dv: { fontSize:12, fontWeight:"500", color:C.tx, textAlign:"right", maxWidth:"60%", flexWrap:"wrap" },
  btnOut: { paddingVertical:13, borderRadius:14, borderWidth:1, borderColor:C.b2, alignItems:"center" },
  btnOutTx: { color:C.m2, fontSize:14, fontWeight:"600" },
});
