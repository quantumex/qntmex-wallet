import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { TOKENS, RECENT_ADDRESSES } from '../data/constants';
import { GoldButton, Card, TokenChip } from '../components';

export default function SendScreen() {
  const { theme } = useTheme();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState(1);
  const token = TOKENS.find(t => t.symbol === selectedToken);
  const canReview = amount && address;

  if (step === 2) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View style={styles.confirmContainer}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.muted }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.confirmCenter}>
          <Text style={[styles.confirmLabel, { color: theme.muted }]}>CONFIRM SEND</Text>
          <Text style={[styles.confirmAmt, { color: theme.gold }]}>{amount}</Text>
          <Text style={[styles.confirmToken, { color: theme.muted }]}>{selectedToken}</Text>
        </View>
        <Card style={styles.confirmCard}>
          {[['To', address],['Network','Ethereum Mainnet'],['Gas Fee','~$4.20'],['Total',`${amount} ${selectedToken} + gas`]].map(([k,v],i,arr) => (
            <View key={k} style={[styles.confirmRow, i < arr.length-1 && {borderBottomWidth:1,borderBottomColor:theme.border}]}>
              <Text style={[styles.confirmKey, {color:theme.muted}]}>{k}</Text>
              <Text style={[styles.confirmVal, {color:theme.text}]}>{v}</Text>
            </View>
          ))}
        </Card>
        <GoldButton title="CONFIRM & SEND ↑" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerIcon, { color: theme.gold }]}>↑</Text>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Send</Text>
            <Text style={[styles.headerSub, { color: theme.muted }]}>TRANSFER TOKENS</Text>
          </View>
        </View>
        <Text style={[styles.sectionLabel, {color:theme.muted}]}>TOKEN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {TOKENS.map(tk => <TokenChip key={tk.symbol} symbol={tk.symbol} color={tk.color} selected={selectedToken===tk.symbol} onPress={() => setSelectedToken(tk.symbol)} />)}
        </ScrollView>
        <Card style={styles.amtCard}>
          <View style={styles.amtHeader}>
            <Text style={[styles.amtLabel,{color:theme.muted}]}>AMOUNT</Text>
            <TouchableOpacity onPress={() => setAmount(token?.bal.replace(',','') || '')} style={styles.maxBtn}>
              <Text style={{color:theme.gold,fontSize:9}}>MAX</Text>
            </TouchableOpacity>
          </View>
          <TextInput value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={theme.muted} keyboardType="decimal-pad" style={[styles.amtInput,{color:theme.text}]} />
          <Text style={[styles.balLine,{color:theme.muted}]}>Bal: {token?.bal} {selectedToken}</Text>
        </Card>
        <Text style={[styles.sectionLabel,{color:theme.muted}]}>RECIPIENT</Text>
        <Card style={styles.addrCard}>
          <Text style={[styles.addrIcon,{color:theme.muted}]}>◎</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="0x... or ENS name" placeholderTextColor={theme.muted} style={[styles.addrInput,{color:theme.text}]} />
        </Card>
        <Text style={[styles.sectionLabel,{color:theme.muted}]}>RECENT</Text>
        {RECENT_ADDRESSES.map(addr => (
          <TouchableOpacity key={addr} onPress={() => setAddress(addr)} style={[styles.recentBtn,{backgroundColor:theme.card,borderColor:theme.border}]}>
            <View style={[styles.recentIcon,{backgroundColor:'rgba(201,168,76,0.1)'}]}>
              <Text style={{color:theme.gold,fontSize:10}}>◈</Text>
            </View>
            <Text style={[styles.recentAddr,{color:theme.dim}]}>{addr}</Text>
          </TouchableOpacity>
        ))}
        <View style={{marginTop:20}}>
          <GoldButton title="REVIEW TRANSACTION" onPress={() => setStep(2)} disabled={!canReview} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {padding:22,paddingTop:48,paddingBottom:32},
  header: {flexDirection:'row',alignItems:'center',gap:10,marginBottom:28},
  headerIcon: {fontSize:22}, headerTitle: {fontSize:17}, headerSub: {fontSize:9,letterSpacing:2},
  sectionLabel: {fontSize:9,letterSpacing:2.5,textTransform:'uppercase',marginBottom:10},
  chipRow: {marginBottom:22},
  amtCard: {padding:18,marginBottom:14},
  amtHeader: {flexDirection:'row',justifyContent:'space-between',marginBottom:10},
  amtLabel: {fontSize:9,letterSpacing:2},
  maxBtn: {backgroundColor:'rgba(201,168,76,0.1)',borderWidth:1,borderColor:'rgba(201,168,76,0.2)',borderRadius:6,paddingHorizontal:8,paddingVertical:3},
  amtInput: {fontSize:34},
  balLine: {fontSize:10,marginTop:6},
  addrCard: {flexDirection:'row',alignItems:'center',paddingHorizontal:14,marginBottom:14},
  addrIcon: {fontSize:13,marginRight:8},
  addrInput: {flex:1,fontSize:13,paddingVertical:14},
  recentBtn: {flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderRadius:10,padding:11,marginBottom:8},
  recentIcon: {width:26,height:26,borderRadius:13,alignItems:'center',justifyContent:'center'},
  recentAddr: {fontSize:11,fontFamily:'monospace'},
  confirmContainer: {flex:1,padding:22,paddingTop:48},
  backBtn: {marginBottom:24}, backBtnText: {fontSize:22},
  confirmCenter: {alignItems:'center',marginBottom:32},
  confirmLabel: {fontSize:10,letterSpacing:2.5,marginBottom:12},
  confirmAmt: {fontSize:52,fontWeight:'300'},
  confirmToken: {fontSize:16,marginTop:4},
  confirmCard: {padding:18,marginBottom:24},
  confirmRow: {flexDirection:'row',justifyContent:'space-between',paddingVertical:11},
  confirmKey: {fontSize:11}, confirmVal: {fontSize:11,fontFamily:'monospace'},
});
