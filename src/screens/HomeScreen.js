import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { TOKENS, TRANSACTIONS } from '../data/constants';
import { QNTMLogo, Sparkline, SectionTitle } from '../components';

export default function HomeScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [balVisible, setBalVisible] = useState(true);
  const quickActions = [
    { icon: '↑', label: 'SEND',    route: 'Send'    },
    { icon: '↓', label: 'RECEIVE', route: 'Receive' },
    { icon: '⇄', label: 'SWAP',    route: 'Swap'    },
    { icon: '+', label: 'BUY',     route: null       },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[theme.heroStart, theme.heroEnd]} style={styles.hero}>
          <View style={[styles.ring1, { borderColor: theme.ring1 }]} />
          <View style={[styles.ring2, { borderColor: theme.ring2 }]} />
          <View style={styles.logoRow}>
            <View style={styles.logoLeft}>
              <QNTMLogo size={30} />
              <Text style={[styles.logoText, { color: theme.gold }]}>QNTMEX</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={[styles.modeBtn, { backgroundColor: theme.ring1, borderColor: theme.border }]}>
              <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.portfolioLabel, { color: theme.muted }]}>TOTAL PORTFOLIO</Text>
          <Text style={[styles.balance, { color: theme.text }]}>
            {balVisible ? (
              <Text>{'$28,'}<Text style={{ color: theme.gold }}>261</Text>{'.67'}</Text>
            ) : '••••••••'}
          </Text>
          <Text style={[styles.change, { color: theme.green }]}>▲ +$1,204.32 · +4.45% today</Text>
          <TouchableOpacity onPress={() => setBalVisible(v => !v)} style={[styles.visBtn, { borderColor: theme.border }]}>
            <Text style={[styles.visBtnText, { color: theme.muted }]}>{balVisible ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            {quickActions.map(({ icon, label, route }) => (
              <TouchableOpacity key={label}
                style={[styles.actionBtn, { backgroundColor: 'rgba(201,168,76,0.07)', borderColor: theme.border }]}
                onPress={() => route && navigation.navigate(route)} activeOpacity={0.7}>
                <Text style={[styles.actionIcon, { color: theme.gold }]}>{icon}</Text>
                <Text style={[styles.actionLabel, { color: theme.muted }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
        <View style={styles.section}>
          <SectionTitle title="ASSETS" />
          {TOKENS.map((tk, i) => (
            <View key={tk.symbol} style={[styles.assetRow, i < TOKENS.length-1 && {borderBottomWidth:1,borderBottomColor:theme.border}]}>
              <View style={[styles.tokenIcon, {backgroundColor:`${tk.color}18`,borderColor:`${tk.color}30`}]}>
                <Text style={[styles.tokenIconText, {color:tk.color}]}>{tk.symbol.slice(0,2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tokenName, {color:theme.text}]}>{tk.name}</Text>
                <Text style={[styles.tokenBal, {color:theme.muted}]}>{tk.bal} {tk.symbol}</Text>
              </View>
              <Sparkline data={tk.spark} color={tk.color} />
              <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                <Text style={[styles.tokenUsd, {color:theme.text}]}>${tk.usd}</Text>
                <Text style={[styles.tokenChange, {color:tk.up?theme.green:theme.red}]}>{tk.change}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.section, { paddingBottom: 24 }]}>
          <SectionTitle title="RECENT ACTIVITY" />
          {TRANSACTIONS.map((tx, i) => (
            <View key={i} style={[styles.txRow, i < TRANSACTIONS.length-1 && {borderBottomWidth:1,borderBottomColor:theme.border}]}>
              <View style={[styles.txIcon, {backgroundColor:tx.up?'rgba(61,139,94,0.12)':'rgba(139,61,61,0.12)',borderColor:tx.up?'rgba(61,139,94,0.25)':'rgba(139,61,61,0.25)'}]}>
                <Text style={{fontSize:14,color:tx.up?theme.green:theme.red}}>{tx.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txLabel, {color:theme.text}]}>{tx.label}</Text>
                <Text style={[styles.txSub, {color:theme.muted}]}>{tx.sub}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmt, {color:tx.up?theme.green:theme.red}]}>{tx.amt}</Text>
                <Text style={[styles.txTime, {color:theme.muted}]}>{tx.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {padding:22,paddingTop:16,position:'relative',overflow:'hidden'},
  ring1: {position:'absolute',top:-70,right:-70,width:220,height:220,borderRadius:110,borderWidth:1},
  ring2: {position:'absolute',top:-30,right:-30,width:140,height:140,borderRadius:70,borderWidth:1},
  logoRow: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28},
  logoLeft: {flexDirection:'row',alignItems:'center',gap:10},
  logoText: {fontSize:13,letterSpacing:3.5,fontWeight:'600'},
  modeBtn: {width:36,height:36,borderRadius:18,borderWidth:1,alignItems:'center',justifyContent:'center'},
  portfolioLabel: {fontSize:9,letterSpacing:3,marginBottom:6},
  balance: {fontSize:40,fontWeight:'300',lineHeight:44},
  change: {marginTop:8,fontSize:11},
  visBtn: {marginTop:10,borderWidth:1,borderRadius:6,paddingHorizontal:10,paddingVertical:4,alignSelf:'flex-start'},
  visBtnText: {fontSize:9,letterSpacing:1.5},
  actions: {flexDirection:'row',gap:8,marginTop:24},
  actionBtn: {flex:1,borderWidth:1,borderRadius:12,paddingVertical:12,alignItems:'center',gap:5},
  actionIcon: {fontSize:20}, actionLabel: {fontSize:8,letterSpacing:1.5},
  section: {paddingHorizontal:22,paddingTop:18},
  assetRow: {flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12},
  tokenIcon: {width:38,height:38,borderRadius:19,borderWidth:1,alignItems:'center',justifyContent:'center'},
  tokenIconText: {fontSize:9,fontWeight:'bold'},
  tokenName: {fontSize:12}, tokenBal: {fontSize:10,marginTop:2},
  tokenUsd: {fontSize:12}, tokenChange: {fontSize:9,marginTop:2},
  txRow: {flexDirection:'row',alignItems:'center',gap:12,paddingVertical:11},
  txIcon: {width:34,height:34,borderRadius:17,borderWidth:1,alignItems:'center',justifyContent:'center'},
  txLabel: {fontSize:12}, txSub: {fontSize:10,marginTop:1,fontFamily:'monospace'},
  txAmt: {fontSize:11}, txTime: {fontSize:9,marginTop:1},
});
