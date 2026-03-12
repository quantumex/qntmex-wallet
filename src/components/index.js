import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Svg, { Polyline, Circle, Path, Rect, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export function QNTMLogo({ size = 32 }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Path d="M5 38 L15 13 L35 33 L50 8 L65 33 L85 13 L95 38 Z" fill="#C9A84C" />
      <Rect x="5" y="35" width="90" height="9" rx="4" fill="#C9A84C" />
      <Circle cx="15" cy="12" r="6" fill="#C9A84C" />
      <Circle cx="50" cy="7" r="6" fill="#C9A84C" />
      <Circle cx="85" cy="12" r="6" fill="#C9A84C" />
      <Circle cx="50" cy="80" r="28" fill="none" stroke="#C9A84C" strokeWidth="9" />
      <Line x1="66" y1="95" x2="82" y2="113" stroke="#C9A84C" strokeWidth="9" strokeLinecap="round" />
    </Svg>
  );
}

export function Sparkline({ data, color, width = 64, height = 28 }) {
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const points = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/rng)*height}`).join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
    </Svg>
  );
}

export function GoldButton({ title, onPress, disabled, style }) {
  const { theme } = useTheme();
  if (disabled) return (
    <View style={[styles.goldBtnDisabled, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <Text style={[styles.goldBtnText, { color: theme.muted }]}>{title}</Text>
    </View>
  );
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <LinearGradient colors={['#D4AE52', '#A8872E']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.goldBtn}>
        <Text style={styles.goldBtnText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} style={[styles.toggleTrack, { backgroundColor: value ? '#C9A84C' : '#1E1A0F' }]} activeOpacity={0.8}>
      <View style={[styles.toggleThumb, { left: value ? 23 : 3, backgroundColor: value ? '#0A0700' : '#4A4530' }]} />
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>{children}</View>;
}

export function SectionTitle({ title }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.muted }]}>{title}</Text>;
}

export function TokenChip({ symbol, color, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={[styles.tokenChip, { borderColor: selected ? color : '#1E1A0F', backgroundColor: selected ? `${color}18` : 'transparent' }]}
      activeOpacity={0.7}>
      <Text style={[styles.tokenChipText, { color: selected ? color : '#4A4530' }]}>{symbol}</Text>
    </TouchableOpacity>
  );
}

export function SettingsRow({ icon, label, sub, right, noBorder }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.settingsRow, !noBorder && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={[styles.settingsIcon, { color: theme.gold }]}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingsLabel, { color: theme.text }]}>{label}</Text>
        {sub ? <Text style={[styles.settingsSub, { color: theme.muted }]}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function GoldInput({ label, value, onChangeText, placeholder, prefix, keyboardType = 'default' }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[styles.inputLabel, { color: theme.muted }]}>{label}</Text> : null}
      <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        {prefix ? <Text style={[styles.inputPrefix, { color: theme.muted }]}>{prefix}</Text> : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} keyboardType={keyboardType} style={[styles.input, { color: theme.text }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goldBtn: {paddingVertical:15,borderRadius:10,alignItems:'center',justifyContent:'center'},
  goldBtnDisabled: {paddingVertical:15,borderRadius:10,alignItems:'center',justifyContent:'center',borderWidth:1},
  goldBtnText: {fontSize:12,letterSpacing:2,fontWeight:'bold',color:'#0A0700'},
  toggleTrack: {width:44,height:24,borderRadius:12,position:'relative'},
  toggleThumb: {width:18,height:18,borderRadius:9,position:'absolute',top:3},
  card: {borderWidth:1,borderRadius:14,overflow:'hidden'},
  sectionTitle: {fontSize:9,letterSpacing:3,textTransform:'uppercase',marginBottom:10,paddingLeft:2},
  tokenChip: {paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1,marginRight:8},
  tokenChipText: {fontSize:11,fontWeight:'600'},
  settingsRow: {flexDirection:'row',alignItems:'center',paddingVertical:15,paddingHorizontal:16,gap:12},
  settingsIcon: {fontSize:15,width:20,textAlign:'center'},
  settingsLabel: {fontSize:12}, settingsSub: {fontSize:9,marginTop:2},
  inputLabel: {fontSize:9,letterSpacing:2.5,textTransform:'uppercase',marginBottom:8},
  inputRow: {flexDirection:'row',alignItems:'center',borderWidth:1,borderRadius:10,paddingHorizontal:14},
  inputPrefix: {fontSize:13,marginRight:8},
  input: {flex:1,paddingVertical:14,fontSize:13},
});
