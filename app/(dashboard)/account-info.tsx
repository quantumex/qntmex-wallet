// app/(dashboard)/account-info.tsx
// Design: exact translation of pg-account from qntmex-wallet.html
import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useWalletStore } from "@/walletStore";
import { C } from "@/app/theme";

export default function AccountInfo() {
  const router = useRouter();
  const { wallet } = useWalletStore();
  const addr = wallet?.address || "";
  const addrShort = addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : "—";

  const copy = async (val: string, lbl: string) => {
    if (val) { await Clipboard.setStringAsync(val); Alert.alert("✓ Copied", `${lbl} copied`); }
  };

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.push("/(dashboard)/settings")}><Text style={st.bkTx}>←</Text></Pressable>
        <Text style={st.ptitle}>Account</Text>
        <Pressable style={[st.ib, { marginLeft:"auto" }]} onPress={() => Alert.alert("Edit","Edit name coming soon")}>
          <Text style={{ fontSize:16 }}>✏️</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={st.acctTop}>
          <View style={st.avatar}><Text style={st.avatarTx}>♟</Text></View>
          <Text style={st.acctName}>QNTMEX Wanllet</Text>
          <Text style={st.acctAddr}>{addr||"0x3F5aCd91B4b12C6B9D3F2E8a7C4D0E9F2B1A5C8"}</Text>
          <View style={st.connBadge}><Text style={st.connTx}>● Connected · Mainnet</Text></View>
        </View>
        <View style={st.statRow}>
          {[{v:"$28,261",l:"Portfolio Value"},{v:"5",l:"Tokens"},{v:"4",l:"Transactions"}].map((s) => (
            <View key={s.l} style={st.statCard}>
              <Text style={st.statVal}>{s.v}</Text>
              <Text style={st.statLbl}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal:20 }}>
          <Text style={st.secTitle}>Wallet Details</Text>
          <View style={st.card}>
            {[
              { ic:"👤", lbl:"Display Name",   sub:"QNTMEX Wallet",   onPress:()=>{} },
              { ic:"📋", lbl:"Copy Address",   sub:addrShort,         onPress:()=>copy(addr,"Wallet address") },
              { ic:"🔑", lbl:"View Private Key",sub:"Export with caution", onPress:()=>Alert.alert("Warning","Never share your private key") },
              { ic:"📝", lbl:"Recovery Phrase", sub:"12 words",        onPress:()=>router.push("/(auth)/seed-backup" as any) },
            ].map((r,i,a) => (
              <Pressable key={r.lbl} style={[st.setRow, i<a.length-1&&st.setRowBorder]} onPress={r.onPress}>
                <Text style={st.setIc}>{r.ic}</Text>
                <View style={st.setInf}>
                  <Text style={st.setLbl}>{r.lbl}</Text>
                  <Text style={st.setSub}>{r.sub}</Text>
                </View>
                <Text style={st.setR}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ paddingHorizontal:20, marginTop:18 }}>
          <Pressable style={st.btnRed} onPress={() => Alert.alert("Remove Wallet","This will delete all wallet data. Make sure you have your recovery phrase.", [{text:"Cancel",style:"cancel"},{text:"Remove",style:"destructive",onPress:()=>router.replace("/(auth)/onboarding")}])}>
            <Text style={st.btnRedTx}>Remove Wallet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  phdr: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingTop:56, paddingBottom:14 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  ptitle: { flex:1, fontSize:18, fontWeight:"700", color:C.tx },
  ib: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  acctTop: { alignItems:"center", paddingVertical:20, paddingHorizontal:20 },
  avatar: { width:80, height:80, borderRadius:40, borderWidth:2, borderColor:C.gbd, backgroundColor:C.gb, alignItems:"center", justifyContent:"center", marginBottom:14 },
  avatarTx: { fontSize:34, color:C.gold },
  acctName: { fontSize:20, fontWeight:"700", color:C.tx },
  acctAddr: { fontSize:12, color:C.dim, marginTop:4, fontFamily:"monospace", textAlign:"center" },
  connBadge: { marginTop:10, backgroundColor:C.greenBg, borderWidth:1, borderColor:C.greenBd, borderRadius:20, paddingHorizontal:14, paddingVertical:5 },
  connTx: { fontSize:11, fontWeight:"600", color:C.green },
  statRow: { flexDirection:"row", gap:10, paddingHorizontal:20, marginBottom:20 },
  statCard: { flex:1, backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.b2, padding:14, alignItems:"center" },
  statVal: { fontSize:18, fontWeight:"700", color:C.tx },
  statLbl: { fontSize:11, color:C.dim, marginTop:3, textAlign:"center" },
  secTitle: { fontSize:14, fontWeight:"700", color:C.tx, marginBottom:11 },
  card: { backgroundColor:C.card, borderRadius:16, borderWidth:1, borderColor:C.b2, overflow:"hidden" },
  setRow: { flexDirection:"row", alignItems:"center", paddingHorizontal:15, paddingVertical:13, gap:12 },
  setRowBorder: { borderBottomWidth:1, borderBottomColor:C.border },
  setIc: { fontSize:16, color:C.gold, width:20, textAlign:"center" },
  setInf: { flex:1 },
  setLbl: { fontSize:13, fontWeight:"500", color:C.tx },
  setSub: { fontSize:11, color:C.dim, marginTop:2 },
  setR: { fontSize:18, color:C.m2 },
  btnRed: { paddingVertical:13, borderRadius:14, borderWidth:1, borderColor:"rgba(224,92,92,0.22)", backgroundColor:"rgba(224,92,92,0.06)", alignItems:"center" },
  btnRedTx: { color:C.red, fontSize:14, fontWeight:"600" },
});
