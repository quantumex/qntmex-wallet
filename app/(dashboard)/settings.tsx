// app/(dashboard)/settings.tsx
// Design: exact translation of pg-settings from qntmex-wallet.html
// Logic: preserved from original settings.tsx
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert, Modal } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useWalletStore } from "@/walletStore";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "@/components/BottomNav";
import * as Clipboard from "expo-clipboard";
import { C } from "@/app/theme";

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[st.tog, value ? st.togOn : st.togOff]}>
      <View style={[st.tok, { left: value ? 23 : 3, backgroundColor: value ? "#040301" : C.m2 }]} />
    </Pressable>
  );
}

export default function Settings() {
  const router = useRouter();
  const { wallet, clearWallet, userName, userNameEdited, setUserName } = useWalletStore();
  const { theme, setTheme } = useTheme();
  const [biometric, setBiometric] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [hideSmall, setHideSmall] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const addr = wallet?.address || "";
  const addrShort = addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : "—";

  const copyAddr = async () => {
    if (addr) { await Clipboard.setStringAsync(addr); Alert.alert("✓ Copied","Wallet address copied"); }
  };

  const handleClear = () => {
    clearWallet();
    Alert.alert("Wallet Cleared","All wallet data removed");
    router.replace("/(auth)/onboarding");
  };

  type SetRow = { ic: string; lbl: string; sub?: string; right?: React.ReactNode; onPress?: () => void };
  const Section = ({ title, rows }: { title: string; rows: SetRow[] }) => (
    <View style={st.setSec}>
      <Text style={st.setTitle}>{title}</Text>
      <View style={st.card}>
        {rows.map((r, i) => (
          <Pressable key={r.lbl} style={[st.setRow, i < rows.length-1 && st.setRowBorder]} onPress={r.onPress}>
            <Text style={st.setIc}>{r.ic}</Text>
            <View style={st.setInf}>
              <Text style={st.setLbl}>{r.lbl}</Text>
              {r.sub && <Text style={st.setSub}>{r.sub}</Text>}
            </View>
            {r.right ?? <Text style={st.setR}>›</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={st.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* prof */}
        <View style={st.prof}>
          <View style={st.av}><Text style={st.avTx}>♟</Text></View>
          <Text style={st.profNm}>{userName || "QNTMEX Wallet"}</Text>
          <Text style={st.profAd}>{addrShort}</Text>
          <View style={st.connBadge}><Text style={st.connTx}>● Connected</Text></View>
        </View>

        <Section title="Account" rows={[
          { ic:"👤", lbl:"Account Info", sub:"View wallet details", onPress:()=>router.push("/(dashboard)/account-info") },
        ]} />

        <Section title="Appearance" rows={[
          { ic:"🌙", lbl:"Dark Mode", sub:theme==="dark"?"Enabled":"Disabled",
            right:<Toggle value={theme==="dark"} onToggle={()=>setTheme(theme==="dark"?"light":"dark")} /> },
        ]} />

        <Section title="Security" rows={[
          { ic:"🔒", lbl:"Passcode",       sub:"Set up passcode lock",      onPress:()=>router.push("/(auth)/passcode-setup" as any) },
          { ic:"👁",  lbl:"Biometric Auth", sub:"Face ID / Fingerprint",     right:<Toggle value={biometric} onToggle={()=>setBiometric(!biometric)} /> },
          { ic:"📝", lbl:"Recovery Phrase", sub:"View backup words",         onPress:()=>router.push("/(auth)/seed-backup" as any) },
        ]} />

        <Section title="Preferences" rows={[
          { ic:"💱", lbl:"Currency",           right:<Text style={st.prefV}>USD ›</Text> },
          { ic:"🌐", lbl:"Network",             right:<Text style={st.prefV}>Mainnet ›</Text> },
          { ic:"🔔", lbl:"Transaction Alerts",  right:<Toggle value={notifEnabled} onToggle={()=>setNotifEnabled(!notifEnabled)} /> },
          { ic:"🫥", lbl:"Hide Small Balances", right:<Toggle value={hideSmall}    onToggle={()=>setHideSmall(!hideSmall)}        /> },
        ]} />

        <Section title="About" rows={[
          { ic:"ℹ️", lbl:"Version", right:<Text style={st.versionTx}>1.0.0</Text> },
          { ic:"📄", lbl:"Terms of Service" },
          { ic:"🛡️", lbl:"Privacy Policy" },
        ]} />

        <View style={st.setSec}>
          <Pressable style={st.btnRed} onPress={()=>setShowClear(true)}>
            <Text style={st.btnRedTx}>Disconnect Wallet</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Clear confirm modal */}
      <Modal transparent visible={showClear} animationType="fade">
        <View style={st.overlay}>
          <View style={st.modalBox}>
            <Text style={{ fontSize:32, marginBottom:12 }}>⚠️</Text>
            <Text style={st.modalTitle}>Clear Wallet?</Text>
            <Text style={st.modalSub}>This will permanently remove all wallet data from this device. Make sure you have backed up your seed phrase.</Text>
            <View style={{ flexDirection:"row", gap:12, marginTop:20 }}>
              <Pressable style={[st.modalBtn, st.modalBtnOut]} onPress={()=>setShowClear(false)}>
                <Text style={st.modalBtnOutTx}>Keep It</Text>
              </Pressable>
              <Pressable style={[st.modalBtn, st.btnGold]} onPress={handleClear}>
                <Text style={st.btnGoldTx}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  prof: { alignItems:"center", paddingHorizontal:20, paddingTop:60, paddingBottom:20, borderBottomWidth:1, borderBottomColor:C.b2, marginBottom:14 },
  av: { width:68, height:68, borderRadius:34, backgroundColor:C.gb, borderWidth:2, borderColor:C.gbd, alignItems:"center", justifyContent:"center", marginBottom:11 },
  avTx: { fontSize:26, color:C.gold },
  profNm: { fontSize:17, fontWeight:"700", color:C.tx },
  profAd: { fontSize:11, color:C.dim, marginTop:3, fontFamily:"monospace" },
  connBadge: { marginTop:9, backgroundColor:C.greenBg, borderWidth:1, borderColor:C.greenBd, borderRadius:20, paddingHorizontal:14, paddingVertical:5 },
  connTx: { fontSize:11, fontWeight:"600", color:C.green },
  setSec: { marginBottom:14, paddingHorizontal:20 },
  setTitle: { fontSize:11, fontWeight:"700", color:C.m2, letterSpacing:0.9, textTransform:"uppercase", marginBottom:7 },
  card: { backgroundColor:C.card, borderRadius:16, borderWidth:1, borderColor:C.b2, overflow:"hidden" },
  setRow: { flexDirection:"row", alignItems:"center", paddingHorizontal:15, paddingVertical:13, gap:12 },
  setRowBorder: { borderBottomWidth:1, borderBottomColor:C.border },
  setIc: { fontSize:16, color:C.gold, width:20, textAlign:"center" },
  setInf: { flex:1 },
  setLbl: { fontSize:13, fontWeight:"500", color:C.tx },
  setSub: { fontSize:11, color:C.dim, marginTop:2 },
  setR: { fontSize:18, color:C.m2 },
  prefV: { fontSize:13, fontWeight:"600", color:C.gold },
  versionTx: { fontSize:12, color:C.dim },
  tog: { width:46, height:26, borderRadius:13, position:"relative" },
  togOn: { backgroundColor:C.gold },
  togOff: { backgroundColor:C.b2 },
  tok: { width:20, height:20, borderRadius:10, position:"absolute", top:3 },
  btnRed: { paddingVertical:13, borderRadius:14, borderWidth:1, borderColor:"rgba(224,92,92,0.22)", backgroundColor:"rgba(224,92,92,0.06)", alignItems:"center" },
  btnRedTx: { color:C.red, fontSize:14, fontWeight:"600" },
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.7)", justifyContent:"center", alignItems:"center", padding:24 },
  modalBox: { backgroundColor:C.card, borderRadius:20, borderWidth:1, borderColor:C.b2, padding:24, width:"100%", alignItems:"center" },
  modalTitle: { fontSize:20, fontWeight:"700", color:C.tx, marginBottom:8 },
  modalSub: { fontSize:13, color:C.dim, textAlign:"center", lineHeight:20 },
  modalBtn: { flex:1, paddingVertical:13, borderRadius:14, alignItems:"center" },
  modalBtnOut: { borderWidth:1, borderColor:C.b2 },
  modalBtnOutTx: { color:C.m2, fontWeight:"600" },
  btnGold: { backgroundColor:C.gold, shadowColor:C.gold, shadowOffset:{width:0,height:4}, shadowOpacity:0.28, shadowRadius:12, elevation:6 },
  btnGoldTx: { color:"#040301", fontWeight:"700" },
});
