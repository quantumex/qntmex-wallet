// app/(dashboard)/notifications.tsx
// Design: exact translation of pg-notif from qntmex-wallet.html
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { C } from "@/app/theme";

const INIT_NOTIFS = [
  { id:"1", ic:"↓", type:"recv", title:"Received 0.5000 ETH", sub:"From 0x4f3a...b12c", time:"2h ago", read:false },
  { id:"2", ic:"↑", type:"sent", title:"Sent 500 USDT",       sub:"To 0x9d1e...44fa · Confirmed", time:"5h ago", read:false },
  { id:"3", ic:"⇄", type:"swap", title:"Swap Complete",        sub:"Swapped ETH → QNTM successfully", time:"1d ago", read:true },
  { id:"4", ic:"📈", type:"price", title:"ETH up 4.2%",        sub:"Ethereum reached $3,374.12", time:"1d ago", read:true },
  { id:"5", ic:"🔔", type:"sys", title:"Security Reminder",    sub:"Back up your recovery phrase if you haven't yet", time:"2d ago", read:true },
];

const IC_COLORS: Record<string,{ bg:string; bd:string; c:string }> = {
  recv:  { bg:C.greenBg, bd:C.greenBd, c:C.green },
  sent:  { bg:C.redBg,   bd:C.redBd,   c:C.red   },
  swap:  { bg:C.gb,      bd:C.gbd,     c:C.gold  },
  price: { bg:C.gb,      bd:C.gbd,     c:C.gold  },
  sys:   { bg:C.greenBg, bd:C.greenBd, c:C.green },
};

export default function Notifications() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const clear = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  return (
    <View style={st.container}>
      <View style={st.phdr}>
        <Pressable style={st.bk} onPress={() => router.back()}><Text style={st.bkTx}>←</Text></Pressable>
        <Text style={st.ptitle}>Notifications</Text>
        <Pressable style={[st.ib, { width: "auto", paddingHorizontal: 10 }]} onPress={clear}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: C.dim }}>Clear all</Text>
        </Pressable>
      </View>
      <FlatList data={notifs} keyExtractor={(n) => n.id}
        renderItem={({ item: n }) => {
          const col = IC_COLORS[n.type] || IC_COLORS.sys;
          return (
            <Pressable style={st.row} onPress={() => setNotifs((arr) => arr.map((x) => x.id === n.id ? { ...x, read: true } : x))}>
              <View style={[st.notifIc, { backgroundColor: col.bg, borderColor: col.bd }]}><Text style={{ color: col.c, fontSize: 18 }}>{n.ic}</Text></View>
              <View style={st.notifInfo}>
                <Text style={st.notifTitle}>{n.title}</Text>
                <Text style={st.notifSub}>{n.sub}</Text>
                <Text style={st.notifTime}>{n.time}</Text>
              </View>
              {!n.read && <View style={st.unreadDot} />}
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={{ padding: 40, alignItems: "center" }}><Text style={{ color: C.dim }}>No notifications</Text></View>}
      />
    </View>
  );
}
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  phdr:{ flexDirection:"row",alignItems:"center",gap:12,paddingHorizontal:20,paddingTop:56,paddingBottom:14},
  bk:{ width:36,height:36,borderRadius:10,borderWidth:1,borderColor:C.b2,backgroundColor:C.card,alignItems:"center",justifyContent:"center"},
  bkTx:{ color:C.dim,fontSize:17},
  ptitle:{ flex:1,fontSize:18,fontWeight:"700",color:C.tx},
  ib:{ height:36,borderRadius:10,borderWidth:1,borderColor:C.b2,backgroundColor:C.card,alignItems:"center",justifyContent:"center"},
  row:{ flexDirection:"row",alignItems:"flex-start",gap:12,paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:C.border},
  notifIc:{ width:40,height:40,borderRadius:20,borderWidth:1,alignItems:"center",justifyContent:"center"},
  notifInfo:{ flex:1},
  notifTitle:{ fontSize:13,fontWeight:"600",color:C.tx},
  notifSub:{ fontSize:12,color:C.dim,marginTop:2,lineHeight:17},
  notifTime:{ fontSize:11,color:C.dim,marginTop:3},
  unreadDot:{ width:8,height:8,orderRadius:4,backgroundColor:C.gold,marginTop:5},
});
