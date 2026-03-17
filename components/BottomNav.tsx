// components/BottomNav.tsx — QNTMEX Design
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { C } from "@/app/theme";

type IconName = keyof typeof Ionicons.glyphMap;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: { label:string; route:string; activeIcon:IconName; inactiveIcon:IconName }[] = [
    { label:"Home",      route:"/(dashboard)/home",      activeIcon:"home",            inactiveIcon:"home-outline" },
    { label:"Portfolio", route:"/(dashboard)/portfolio", activeIcon:"stats-chart",     inactiveIcon:"stats-chart-outline" },
    { label:"Swap",      route:"/(dashboard)/swap",      activeIcon:"swap-horizontal", inactiveIcon:"swap-horizontal-outline" },
    { label:"Settings",  route:"/(dashboard)/settings",  activeIcon:"settings",        inactiveIcon:"settings-outline" },
  ];

  return (
    <View style={st.wrapper} pointerEvents="box-none">
      <View style={st.nav}>
        {tabs.map((t) => {
          const active = pathname === t.route;
          return (
            <Pressable key={t.route} style={st.tab} onPress={() => router.replace(t.route)}>
              <Ionicons name={active ? t.activeIcon : t.inactiveIcon} size={24} color={active ? C.gold : C.m2} />
              <Text style={[st.label, { color: active ? C.gold2 : C.m2 }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={st.spacer} />
    </View>
  );
}

const st = StyleSheet.create({
  wrapper: { position:"absolute", left:0, right:0, bottom:0 },
  nav: { height:68, backgroundColor:C.bg, borderTopWidth:1, borderTopColor:C.b2, flexDirection:"row", justifyContent:"space-around", alignItems:"center", paddingHorizontal:8 },
  tab: { alignItems:"center", justifyContent:"center", gap:4 },
  label: { fontSize:11, fontWeight:"600" },
  spacer: { height:6, backgroundColor:C.bg },
});
