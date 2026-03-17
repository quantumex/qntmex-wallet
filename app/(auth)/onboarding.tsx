// app/(auth)/onboarding.tsx
// Design: exact translation of pg-onboard from qntmex-wallet.html
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { C } from "@/app/theme";

const SLIDES = [
  { title: "Your Web3 Wallet", sub: "Secure, simple, and powerful. Manage your crypto assets with QNTMEX — built for the next generation of finance." },
  { title: "Your Keys, Your Crypto", sub: "Self-custodial. Your private keys never leave your device. Full ownership, always." },
  { title: "Swap Instantly On-Chain", sub: "Access best rates via Uniswap V3 directly in-app. No custodians, no middlemen." },
];

export default function Onboarding() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1);
    else router.push("/(auth)/seed-intro");
  };

  return (
    <View style={st.container}>
      <View style={st.wrap}>
        {/* ob-icon */}
        <Text style={st.icon}>♟</Text>

        {/* ob-dots */}
        <View style={st.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[st.dot, i === slide ? st.dotOn : st.dotOff]} />
          ))}
        </View>

        {/* ob-title */}
        <Text style={st.title}>{SLIDES[slide].title}</Text>

        {/* ob-sub */}
        <Text style={st.sub}>{SLIDES[slide].sub}</Text>

        {/* ob-btns */}
        <View style={st.btns}>
          <Pressable style={st.btnGold} onPress={next} testID="onboarding-create-button">
            <Text style={st.btnGoldTx}>{slide === SLIDES.length - 1 ? "Create Wallet" : "Get Started"}</Text>
          </Pressable>
          <Pressable style={st.btnOut} onPress={() => router.push("/(auth)/restore")} testID="onboarding-restore-button">
            <Text style={st.btnOutTx}>Restore Wallet</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingVertical: 40 },
  icon: { fontSize: 80, color: C.gold, marginBottom: 24 },
  dots: { flexDirection: "row", gap: 6, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4 },
  dotOn: { width: 22, backgroundColor: C.gold },
  dotOff: { width: 8, backgroundColor: C.b2 },
  title: { fontSize: 26, fontWeight: "800", color: C.tx, textAlign: "center", marginBottom: 12, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: C.dim, textAlign: "center", lineHeight: 22, marginBottom: 40 },
  btns: { width: "100%", gap: 10 },
  btnGold: { width: "100%", paddingVertical: 15, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  btnGoldTx: { fontSize: 15, fontWeight: "700", color: "#040301", letterSpacing: 0.3 },
  btnOut: { width: "100%", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: C.b2, alignItems: "center" },
  btnOutTx: { fontSize: 14, fontWeight: "600", color: C.m2 },
});
