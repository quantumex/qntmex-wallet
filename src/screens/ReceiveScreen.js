import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { TOKENS, WALLET_ADDRESS } from '../data/constants';
import { Card, TokenChip } from '../components';

function QRCode() {
  const modules = [[20,20],[32,20],[44,20],[56,20],[68,20],[20,32],[68,32],[20,44],[44,44],[68,44],[20,56],[44,56],[68,56],[20,68],[32,68],[44,68],[56,68],[68,68],[92,20],[116,20],[140,20],[92,32],[104,32],[128,32],[80,44],[104,44],[116,44],[140,44],[80,56],[92,56],[128,56],[80,80],[104,80],[128,80],[92,92],[116,92],[140,92],[80,104],[104,104],[80,116],[92,116],[116,116],[128,116],[140,116],[20,92],[44,92],[56,92],[20,104],[32,104],[56,104],[20,116],[44,116],[20,128],[32,128],[56,128],[20,140],[44,140],[56,140],[92,128],[116,128],[140,128],[104,140],[128,140]];
  const corners = [[16,16],[108,16],[16,108]];
  return (
    <View style={styles.qrWrapper}>
      <Svg width="180" height="180" viewBox="0 0 180 180">
        <Rect x="0" y="0" width="180" height="180" fill="#fff" />
        {modules.map(([x,y],i) => <Rect key={i} x={x} y={y} width="10" height="10" rx="1" fill="#0A0700" />)}
        {corners.map(([x,y],i) => (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width="56" height="56" rx="6" fill="none" stroke="#0A0700" strokeWidth="4" />
            <Rect x={x+10} y={y+10} width="36" height="36" rx="3" fill="#0A0700" />
            <Rect x={x+16} y={y+16} width="24" height="24" rx="2" fill="#fff" />
            <Rect x={x+20} y={y+20} width="16" height="16" rx="1" fill="#0A0700" />
          </React.Fragment>
        ))}
        <Rect x="76" y="76" width="28" height="28" rx="14" fill="#fff" />
        <SvgText x="90" y="95" textAnchor="middle" fontSize="18" fill="#C9A84C">♛</SvgText>
      </Svg>
    </View>
  );
}

export default function ReceiveScreen() {
  const { theme } = useTheme();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [copied, setCopied] = useState(false);
  const copyAddress = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); Alert.alert('Copied', 'Wallet address copied!'); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerIcon, { color: theme.gold }]}>↓</Text>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Receive</Text>
            <Text style={[styles.headerSub, { color: theme.muted }]}>YOUR ADDRESS</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {TOKENS.map(tk => <TokenChip key={tk.symbol} symbol={tk.symbol} color={tk.color} selected={selectedToken === tk.symbol} onPress={() => setSelectedToken(tk.symbol)} />)}
        </ScrollView>
        <View style={styles.qrSection}>
          <Text style={[styles.qrLabel, { color: theme.muted }]}>SCAN TO SEND {selectedToken}</Text>
          <QRCode />
        </View>
        <Card style={styles.addrCard}>
          <Text style={[styles.addrCardLabel, { color: theme.muted }]}>WALLET ADDRESS</Text>
          <Text style={[styles.addrText, { color: theme.dim }]}>{WALLET_ADDRESS}</Text>
          <TouchableOpacity onPress={copyAddress} style={[styles.copyBtn, { backgroundColor: 'rgba(201,168,76,0.08)', borderColor: copied ? theme.gold : theme.border }]}>
            <Text style={[styles.copyBtnText, { color: copied ? theme.gold : theme.muted }]}>{copied ? '✓ COPIED' : 'COPY ADDRESS'}</Text>
          </TouchableOpacity>
        </Card>
        <View style={[styles.warning, { backgroundColor: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.12)' }]}>
          <Text style={[styles.warnIcon, { color: theme.gold }]}>⚠</Text>
          <Text style={[styles.warnText, { color: theme.muted }]}>Only send ERC-20 compatible tokens to this address.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 48, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  headerIcon: { fontSize: 22 }, headerTitle: { fontSize: 17 }, headerSub: { fontSize: 9, letterSpacing: 2 },
  chipRow: { marginBottom: 28 },
  qrSection: { alignItems: 'center', marginBottom: 28 },
  qrLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 14 },
  qrWrapper: { padding: 16, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  addrCard: { padding: 18, marginBottom: 14 },
  addrCardLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 10 },
  addrText: { fontSize: 11, fontFamily: 'monospace', lineHeight: 18, marginBottom: 14 },
  copyBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  copyBtnText: { fontSize: 10, letterSpacing: 2 },
  warning: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 10, padding: 14 },
  warnIcon: { fontSize: 13 }, warnText: { flex: 1, fontSize: 10, lineHeight: 16 },
});
