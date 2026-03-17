// app/(dashboard)/receive.tsx
// Design: exact translation of pg-receive from qntmex-wallet.html
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { useWalletStore } from "@/walletStore";
import { C } from "@/app/theme";

const TOKENS = ["ETH","USDT","QNTM","LINK","WBTC"];

export default function Receive() {
  const router = useRouter();
  const { wallet } = useWalletStore();
  const addr = wallet?.address || "No wallet connected";
  const [selToken, setSelToken] = useState("ETH");
  const [copied, setCopied] = useState(false);

  const copyAddr = async () => {
    if (!wallet?.address) { Alert.alert("Error","No wallet address."); return; }
    await Clipboard.setStringAsync(addr);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={st.container}>
      {/* phdr */}
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View><Text style={st.ptitle}>Receive</Text><Text style={st.psub}>Your address</Text></View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* rec-chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
          {TOKENS.map((t) => (
            <Pressable key={t} style={[st.chip, t===selToken&&st.chipOn]} onPress={() => setSelToken(t)}>
              <Text style={[st.chipTx, t===selToken&&st.chipTxOn]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* qr-wrap */}
        <View style={st.qrWrap}>
          {/* qr-lbl */}
          <Text style={st.qrLbl}>Scan to send {selToken}</Text>
          {/* qr-box */}
          <View style={st.qrBox}>
            {wallet?.address ? (
              <QRCode value={addr} size={200} backgroundColor="#fff" color="#070705" />
            ) : (
              <View style={{ width:200, height:200, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color:C.dim }}>No wallet</Text>
              </View>
            )}
          </View>
        </View>

        {/* addr-disp card */}
        <View style={st.addrCard}>
          <Text style={st.addrLbl}>Wallet Address</Text>
          <Text style={st.addrVal}>{addr}</Text>
          <Pressable style={[st.copyBtn, copied&&st.copyBtnOk]} onPress={copyAddr} testID="copy-button">
            <Text style={[st.copyTx, copied&&st.copyTxOk]}>{copied ? "✓  Copied!" : "Copy Address"}</Text>
          </Pressable>
        </View>

        {/* warn */}
        <View style={st.warn}>
          <Text style={st.warnIc}>⚠️</Text>
          <Text style={st.warnTx}>Only send ERC-20 compatible tokens. Other assets may be permanently lost.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  phdr: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingTop:56, paddingBottom:12 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  ptitle: { fontSize:18, fontWeight:"700", color:C.tx },
  psub: { fontSize:11, color:C.dim, marginTop:2 },
  chips: { paddingHorizontal:20, gap:8, paddingBottom:4 },
  chip: { paddingHorizontal:16, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:C.b2, backgroundColor:C.card },
  chipOn: { borderColor:C.gold, backgroundColor:C.gb },
  chipTx: { fontSize:12, fontWeight:"600", color:C.m2 },
  chipTxOn: { color:C.gold2 },
  qrWrap: { alignItems:"center", paddingVertical:20 },
  qrLbl: { fontSize:11, fontWeight:"700", color:C.m2, letterSpacing:0.8, textTransform:"uppercase", marginBottom:16 },
  qrBox: { padding:18, backgroundColor:"#fff", borderRadius:20, shadowColor:C.gold, shadowOffset:{width:0,height:0}, shadowOpacity:0.18, shadowRadius:24, elevation:8 },
  addrCard: { marginHorizontal:20, backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.b2, padding:16, marginBottom:14 },
  addrLbl: { fontSize:11, fontWeight:"700", color:C.m2, letterSpacing:0.7, marginBottom:9 },
  addrVal: { fontSize:11, fontFamily:"monospace", color:C.dim, lineHeight:18, letterSpacing:0.3, marginBottom:14 },
  copyBtn: { paddingVertical:12, borderRadius:10, borderWidth:1, borderColor:C.b2, alignItems:"center" },
  copyBtnOk: { borderColor:C.gold, backgroundColor:C.gb },
  copyTx: { fontSize:13, fontWeight:"600", color:C.m2 },
  copyTxOk: { color:C.gold2 },
  warn: { flexDirection:"row", alignItems:"flex-start", gap:8, borderWidth:1, borderColor:C.gb2, backgroundColor:"rgba(201,168,76,0.03)", borderRadius:12, padding:13, marginHorizontal:20 },
  warnIc: { fontSize:14 },
  warnTx: { flex:1, fontSize:11, color:C.m2, lineHeight:17 },
});
