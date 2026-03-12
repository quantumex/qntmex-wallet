import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { TOKENS, BALANCES, RATES } from '../data/constants';
import { GoldButton, Card } from '../components';

const TOKEN_SYMBOLS = TOKENS.map(t => t.symbol);

export default function SwapScreen() {
  const { theme } = useTheme();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('QNTM');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.1');

  const flip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  const getRate = () => {
    const key = `${fromToken}-${toToken}`;
    const revKey = `${toToken}-${fromToken}`;
    if (RATES[key]) return RATES[key];
    if (RATES[revKey]) return 1 / RATES[revKey];
    return 1;
  };

  const rate = getRate();
  const outAmount = amount ? (parseFloat(amount) * rate).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.00';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerIcon, { color: theme.gold }]}>⇄</Text>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Swap</Text>
            <Text style={[styles.headerSub, { color: theme.muted }]}>INSTANT EXCHANGE</Text>
          </View>
        </View>

        {/* FROM */}
        <Card style={styles.swapBox}>
          <View style={styles.swapBoxHeader}>
            <Text style={[styles.swapBoxLabel, { color: theme.muted }]}>FROM</Text>
            <Text style={[styles.swapBoxBal, { color: theme.muted }]}>Bal: {BALANCES[fromToken] || '—'} {fromToken}</Text>
          </View>
          <View style={styles.swapBoxRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 160 }}>
              <View style={styles.tokenPicker}>
                {TOKEN_SYMBOLS.map(sym => (
                  <TouchableOpacity key={sym} onPress={() => setFromToken(sym)}
                    style={[styles.pickerChip, { borderColor: fromToken === sym ? theme.gold : theme.border, backgroundColor: fromToken === sym ? 'rgba(201,168,76,0.12)' : 'transparent' }]}>
                    <Text style={{ fontSize: 10, color: fromToken === sym ? theme.gold : theme.muted }}>{sym}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.muted}
              keyboardType="decimal-pad"
              style={[styles.swapInput, { color: theme.text }]}
            />
          </View>
        </Card>

        {/* FLIP */}
        <View style={styles.flipRow}>
          <TouchableOpacity onPress={flip} style={styles.flipBtn}>
            <Text style={{ fontSize: 18, color: '#0A0700', fontWeight: 'bold' }}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* TO */}
        <Card style={styles.swapBox}>
          <View style={styles.swapBoxHeader}>
            <Text style={[styles.swapBoxLabel, { color: theme.muted }]}>TO</Text>
            <Text style={[styles.swapBoxBal, { color: theme.muted }]}>Bal: {BALANCES[toToken] || '—'} {toToken}</Text>
          </View>
          <View style={styles.swapBoxRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 160 }}>
              <View style={styles.tokenPicker}>
                {TOKEN_SYMBOLS.map(sym => (
                  <TouchableOpacity key={sym} onPress={() => setToToken(sym)}
                    style={[styles.pickerChip, { borderColor: toToken === sym ? theme.gold : theme.border, backgroundColor: toToken === sym ? 'rgba(201,168,76,0.12)' : 'transparent' }]}>
                    <Text style={{ fontSize: 10, color: toToken === sym ? theme.gold : theme.muted }}>{sym}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.outAmount, { color: theme.gold }]}>{outAmount}</Text>
          </View>
          <Text style={[styles.rateText, { color: theme.muted }]}>1 {fromToken} ≈ {rate.toLocaleString()} {toToken}</Text>
        </Card>

        {/* SLIPPAGE */}
        <Card style={styles.slippageBox}>
          <Text style={[styles.slipLabel, { color: theme.muted }]}>SLIPPAGE TOLERANCE</Text>
          <View style={styles.slipRow}>
            {['0.1', '0.5', '1.0'].map(v => (
              <TouchableOpacity key={v} onPress={() => setSlippage(v)}
                style={[styles.slipChip, { borderColor: slippage === v ? theme.gold : theme.border, backgroundColor: slippage === v ? 'rgba(201,168,76,0.12)' : 'transparent' }]}>
                <Text style={{ fontSize: 11, color: slippage === v ? theme.gold : theme.muted }}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* INFO */}
        <View style={styles.infoBox}>
          {[['Route', 'Uniswap V3'], ['Est. Gas', '~$4.20'], ['Price Impact', '< 0.01%']].map(([k, v]) => (
            <View key={k} style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: theme.muted }]}>{k}</Text>
              <Text style={[styles.infoVal, { color: k === 'Price Impact' ? theme.green : theme.dim }]}>{v}</Text>
            </View>
          ))}
        </View>

        <GoldButton title="REVIEW SWAP" onPress={() => {}} disabled={!amount} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 48, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 9, letterSpacing: 2 },
  swapBox: { padding: 18, marginBottom: 4 },
  swapBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  swapBoxLabel: { fontSize: 9, letterSpacing: 2 },
  swapBoxBal: { fontSize: 9 },
  swapBoxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tokenPicker: { flexDirection: 'row', gap: 6 },
  pickerChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  swapInput: { fontSize: 28, textAlign: 'right', flex: 1, marginLeft: 8 },
  outAmount: { fontSize: 28, textAlign: 'right', flex: 1, marginLeft: 8 },
  rateText: { fontSize: 10, textAlign: 'right', marginTop: 6 },
  flipRow: { alignItems: 'center', marginVertical: 4 },
  flipBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  slippageBox: { padding: 14, marginTop: 18, marginBottom: 18 },
  slipLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 10 },
  slipRow: { flexDirection: 'row', gap: 8 },
  slipChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  infoBox: { marginBottom: 18, paddingHorizontal: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoKey: { fontSize: 10 },
  infoVal: { fontSize: 10 },
});
