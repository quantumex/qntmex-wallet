// app/(dashboard)/send.tsx
// Design: exact translation of pg-send from qntmex-wallet.html
// Logic: preserved from original send.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ethers } from "ethers";
import * as Clipboard from "expo-clipboard";
import { useWalletStore } from "@/walletStore";
import { provider } from "@/lib/provider";
import { C } from "@/app/theme";

const RECENTS = ["0x4f3a...b12c", "0x9d1e...44fa", "vitalik.eth"];
const TOKENS_LIST = ["ETH","USDT","QNTM","LINK","WBTC"];

export default function Send() {
  const router = useRouter();
  const { wallet } = useWalletStore();
  const params = useLocalSearchParams();
  const sym = (params?.tokenSymbol as string) || "ETH";
  const [selToken, setSelToken] = useState(sym);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [ethBal, setEthBal] = useState("0");
  const [gas, setGas] = useState<string|null>(null);
  const [total, setTotal] = useState<string|null>(null);
  const [estimating, setEstimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [txHash, setTxHash] = useState<string|null>(null);
  const [modal, setModal] = useState(false);
  const [step, setStep] = useState<"form"|"confirm">("form");

  useEffect(() => {
    if (wallet?.address) provider.getBalance(wallet.address).then((b) => setEthBal(ethers.formatEther(b)));
  }, [wallet?.address]);

  useEffect(() => {
    if (!recipient || !amount || !wallet?.address) { setGas(null); setTotal(null); return; }
    const t = setTimeout(async () => {
      try {
        setEstimating(true); setErr(null);
        if (!ethers.isAddress(recipient)) { setErr("Invalid address"); return; }
        const val = ethers.parseEther(amount||"0");
        const bal = await provider.getBalance(wallet.address);
        if (val > bal) { setErr("Insufficient balance"); return; }
        const gl = await provider.estimateGas({ from:wallet.address, to:recipient, value:val });
        const fd = await provider.getFeeData();
        if (!fd.gasPrice) { setErr("Can't fetch gas price"); return; }
        const gc = gl * fd.gasPrice;
        setGas(ethers.formatEther(gc));
        setTotal(ethers.formatEther(val + gc));
        if (val + gc > bal) setErr("Insufficient balance for gas"); else setErr(null);
      } catch { setErr("Gas estimation failed"); setGas(null); }
      finally { setEstimating(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [recipient, amount, wallet?.address]);

  const send = async () => {
    if (!wallet || !recipient || !amount || err) return;
    setLoading(true);
    try {
      const signer = wallet.connect(provider);
      const tx = await signer.sendTransaction({ to:recipient, value:ethers.parseEther(amount) });
      const r = await tx.wait();
      if (!r?.hash) throw new Error("No hash");
      setTxHash(r.hash); setModal(true);
    } catch (e: any) { Alert.alert("Failed", e.shortMessage||e.message||"Transaction failed"); }
    finally { setLoading(false); }
  };

  if (step === "confirm") return (
    <View style={st.container}>
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => setStep("form")}><Text style={st.bkTx}>←</Text></Pressable>
        <Text style={st.ptitle}>Confirm Send</Text>
      </View>
      <View style={{ flex:1, paddingHorizontal:20 }}>
        <View style={st.confCenter}>
          <Text style={st.confBadge}>CONFIRM SEND</Text>
          <Text style={st.confAmt}>{amount}</Text>
          <Text style={st.confTok}>{selToken}</Text>
        </View>
        <View style={st.detCard}>
          {[["To",amount&&recipient?`${recipient.slice(0,10)}...${recipient.slice(-6)}`:"—"],["Network","Ethereum Mainnet"],["Network Fee",gas?`${parseFloat(gas).toFixed(6)} ETH`:"~$4.20"],["Total",total?`${parseFloat(total).toFixed(6)} ETH`:"—"]].map(([k,v],i,a) => (
            <View key={k} style={[st.drow,i<a.length-1&&st.drowBorder]}>
              <Text style={st.dk}>{k}</Text>
              <Text style={st.dv}>{v}</Text>
            </View>
          ))}
        </View>
        {loading ? <ActivityIndicator color={C.gold} size="large" style={{marginVertical:20}} /> : (
          <Pressable style={[st.btnGold,(!recipient||!amount||!!err)&&{opacity:0.4}]} disabled={!recipient||!amount||!!err||loading} onPress={send} testID="send-button">
            <Text style={st.btnGoldTx}>Confirm &amp; Send</Text>
          </Pressable>
        )}
      </View>
      <Modal transparent visible={modal} animationType="fade">
        <View style={st.overlay}>
          <View style={st.modalBox}>
            <View style={st.successRing}><Text style={{fontSize:32,color:C.green}}>✓</Text></View>
            <Text style={st.modalTitle}>Transaction Sent</Text>
            <Text style={st.txHashTx}>{(txHash||"").slice(0,14)}…{(txHash||"").slice(-10)}</Text>
            <Pressable style={[st.btnGold,{marginTop:16}]} onPress={() => { setModal(false); router.push("/(dashboard)/home"); }}>
              <Text style={st.btnGoldTx}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={st.container}>
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <View><Text style={st.ptitle}>Send</Text><Text style={st.psub}>Transfer tokens</Text></View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        {/* f-lbl Token */}
        <Text style={st.fLbl}>Token</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
          {TOKENS_LIST.map((t) => (
            <Pressable key={t} style={[st.chip, t===selToken&&st.chipOn]} onPress={() => setSelToken(t)}>
              <Text style={[st.chipTx, t===selToken&&st.chipTxOn]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* f-lbl Amount */}
        <Text style={[st.fLbl,{marginTop:14}]}>Amount</Text>
        <View style={st.amtCard}>
          <View style={st.amtTop}>
            <Text style={st.amtSym}>{selToken}</Text>
            <Pressable style={st.maxBtn} onPress={() => setAmount(parseFloat(ethBal).toFixed(6))}>
              <Text style={st.maxTx}>MAX</Text>
            </Pressable>
          </View>
          <TextInput style={st.amtInp} value={amount} onChangeText={(v)=>{setAmount(v);setErr(null);}} placeholder="0.00" placeholderTextColor={C.b2} keyboardType="decimal-pad" testID="amount-input" />
          <Text style={st.amtHint}>Available: {parseFloat(ethBal).toFixed(4)} {selToken}</Text>
        </View>

        {/* f-lbl Recipient */}
        <Text style={[st.fLbl,{marginTop:14}]}>Recipient</Text>
        <View style={st.addrCard}>
          <Text style={st.addrPre}>⬡</Text>
          <TextInput style={st.addrInp} value={recipient} onChangeText={(v)=>{setRecipient(v);setErr(null);}} placeholder="0x address or ENS name" placeholderTextColor={C.dim} autoCapitalize="none" autoCorrect={false} testID="recipient-input" />
          <Pressable style={st.pasteBtn} onPress={async()=>{const t=await Clipboard.getStringAsync();if(t)setRecipient(t);}}>
            <Text style={st.pasteTx}>Paste</Text>
          </Pressable>
        </View>

        {/* f-lbl Recent */}
        <Text style={[st.fLbl,{marginTop:14}]}>Recent</Text>
        {RECENTS.map((a) => (
          <Pressable key={a} style={st.recentRow} onPress={()=>setRecipient(a)}>
            <View style={st.recentIc}><Text style={{color:C.gold,fontSize:13}}>◈</Text></View>
            <Text style={st.recentTx}>{a}</Text>
          </Pressable>
        ))}

        {/* gas */}
        {(estimating||gas) && (
          <View style={st.gasCard}>
            {estimating ? <View style={{flexDirection:"row",alignItems:"center",gap:8}}><ActivityIndicator size="small" color={C.gold}/><Text style={st.gasLbl}>Estimating gas…</Text></View> : (
              <>
                <View style={[st.drow]}><Text style={st.gasLbl}>Network Fee</Text><Text style={st.gasVal}>{parseFloat(gas||"0").toFixed(6)} ETH</Text></View>
                <View style={[st.divider,{marginVertical:8}]}/>
                <View style={st.drow}><Text style={st.gasLbl}>Total Cost</Text><Text style={[st.gasVal,{color:C.gold}]}>{parseFloat(total||"0").toFixed(6)} ETH</Text></View>
              </>
            )}
          </View>
        )}

        {err && <View style={st.errCard}><Text style={{fontSize:12,color:C.red}}>⚠ {err}</Text></View>}

        <Pressable style={[st.btnGold,{marginTop:18},(!recipient||!amount||!!err)&&{opacity:0.4}]} disabled={!recipient||!amount||!!err} onPress={()=>setStep("confirm")} testID="review-button">
          <Text style={st.btnGoldTx}>Review Transaction</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  phdr: { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:20, paddingTop:56, paddingBottom:14 },
  bk: { width:36, height:36, borderRadius:10, borderWidth:1, borderColor:C.b2, backgroundColor:C.card, alignItems:"center", justifyContent:"center" },
  bkTx: { color:C.dim, fontSize:17 },
  ptitle: { fontSize:18, fontWeight:"700", color:C.tx },
  psub: { fontSize:11, color:C.dim, marginTop:2 },
  fLbl: { fontSize:11, fontWeight:"700", color:C.m2, textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 },
  chips: { gap:8, paddingBottom:2 },
  chip: { paddingHorizontal:16, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:C.b2, backgroundColor:C.card },
  chipOn: { borderColor:C.gold, backgroundColor:C.gb },
  chipTx: { fontSize:12, fontWeight:"600", color:C.m2 },
  chipTxOn: { color:C.gold2 },
  amtCard: { backgroundColor:C.card, borderRadius:16, borderWidth:1, borderColor:C.b2, padding:15 },
  amtTop: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:6 },
  amtSym: { fontSize:12, fontWeight:"700", color:C.m2, letterSpacing:0.5 },
  maxBtn: { paddingHorizontal:10, paddingVertical:4, borderRadius:6, borderWidth:1, borderColor:C.gbd, backgroundColor:C.gb },
  maxTx: { fontSize:11, fontWeight:"700", color:C.gold },
  amtInp: { fontSize:40, fontWeight:"200", color:C.tx, letterSpacing:-1.5, paddingVertical:4 },
  amtHint: { fontSize:12, color:C.dim, marginTop:4 },
  addrCard: { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:C.card, borderRadius:16, borderWidth:1, borderColor:C.b2, padding:14 },
  addrPre: { fontSize:18, color:C.m2 },
  addrInp: { flex:1, color:C.tx, fontSize:13, fontFamily:"monospace" },
  pasteBtn: { paddingHorizontal:10, paddingVertical:5, borderRadius:8, borderWidth:1, borderColor:C.gbd, backgroundColor:C.gb },
  pasteTx: { fontSize:11, fontWeight:"700", color:C.gold },
  recentRow: { flexDirection:"row", alignItems:"center", gap:10, paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border },
  recentIc: { width:30, height:30, borderRadius:15, backgroundColor:C.gb, borderWidth:1, borderColor:C.gbd, alignItems:"center", justifyContent:"center" },
  recentTx: { fontSize:13, color:C.dim, fontFamily:"monospace" },
  gasCard: { backgroundColor:C.card, borderRadius:12, borderWidth:1, borderColor:C.b2, padding:14, marginTop:12 },
  gasLbl: { fontSize:12, color:C.dim },
  gasVal: { fontSize:13, fontWeight:"600", color:C.tx },
  errCard: { marginTop:10, backgroundColor:C.redBg, borderRadius:12, borderWidth:1, borderColor:C.redBd, padding:13 },
  divider: { height:1, backgroundColor:C.border },
  drow: { flexDirection:"row", justifyContent:"space-between" },
  btnGold: { width:"100%", paddingVertical:15, borderRadius:14, backgroundColor:C.gold, alignItems:"center", shadowColor:C.gold, shadowOffset:{width:0,height:4}, shadowOpacity:0.28, shadowRadius:12, elevation:6 },
  btnGoldTx: { fontSize:15, fontWeight:"700", color:"#040301" },
  detCard: { backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.b2, overflow:"hidden", marginBottom:18 },
  drowBorder: { borderBottomWidth:1, borderBottomColor:C.border },
  dk: { fontSize:12, color:C.dim },
  dv: { fontSize:12, fontWeight:"500", color:C.tx },
  confCenter: { alignItems:"center", marginBottom:24, marginTop:10 },
  confBadge: { fontSize:11, fontWeight:"700", color:C.m2, letterSpacing:1, textTransform:"uppercase", marginBottom:11 },
  confAmt: { fontSize:56, fontWeight:"200", color:C.gold2, letterSpacing:-2, lineHeight:64 },
  confTok: { fontSize:13, fontWeight:"600", color:C.dim, marginTop:5, letterSpacing:0.5 },
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.7)", justifyContent:"center", alignItems:"center", padding:24 },
  modalBox: { backgroundColor:C.card, borderRadius:20, borderWidth:1, borderColor:C.b2, padding:28, width:"100%", alignItems:"center" },
  successRing: { width:80, height:80, borderRadius:40, borderWidth:2, borderColor:C.greenBd, backgroundColor:C.greenBg, alignItems:"center", justifyContent:"center", marginBottom:16 },
  modalTitle: { fontSize:20, fontWeight:"700", color:C.tx, marginBottom:8 },
  txHashTx: { fontSize:12, color:C.dim, fontFamily:"monospace" },
});
