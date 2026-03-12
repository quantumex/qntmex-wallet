import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Toggle, Card, SettingsRow, SectionTitle } from '../components';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [biometric, setBiometric] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [hideSmall, setHideSmall] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(201,168,76,0.08)', borderColor: theme.gold }]}>
            <Text style={{ fontSize: 28, color: theme.gold }}>♛</Text>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>QNTMEX Wallet</Text>
          <Text style={[styles.profileAddr, { color: theme.muted }]}>0x3F5a...C8b2</Text>
          <View style={styles.connectedBadge}>
            <Text style={[styles.connectedText, { color: theme.green }]}>⬟ CONNECTED</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="APPEARANCE" />
          <Card>
            <SettingsRow icon="☑" label="Dark Mode" sub="Toggle dark / light theme"
              right={<Toggle value={isDark} onToggle={toggleTheme} />} noBorder />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="SECURITY" />
          <Card>
            <SettingsRow icon="⬡" label="Biometric Auth" sub="Face ID / Fingerprint"
              right={<Toggle value={biometric} onToggle={() => setBiometric(v => !v)} />} />
            <SettingsRow icon="⬡" label="Change PIN" sub="Update your 6-digit PIN"
              right={<Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>} />
            <SettingsRow icon="⬡" label="Recovery Phrase" sub="View 12-word backup"
              right={<Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>} noBorder />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="PREFERENCES" />
          <Card>
            <SettingsRow icon="⬧" label="Currency"
              right={<Text style={[styles.prefVal, { color: theme.gold }]}>USD ›</Text>} />
            <SettingsRow icon="⬧" label="Network"
              right={<Text style={[styles.prefVal, { color: theme.gold }]}>Mainnet ›</Text>} />
            <SettingsRow icon="⬧" label="Hide Small Balances"
              right={<Toggle value={hideSmall} onToggle={() => setHideSmall(v => !v)} />} noBorder />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="NOTIFICATIONS" />
          <Card>
            <SettingsRow icon="⬧" label="Transaction Alerts" sub="Notify on sends & receives"
              right={<Toggle value={notifications} onToggle={() => setNotifications(v => !v)} />} noBorder />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionTitle title="ABOUT" />
          <Card>
            <SettingsRow icon="⬦" label="Version" right={<Text style={{ color: theme.muted, fontSize: 10 }}>v1.0.0</Text>} />
            <SettingsRow icon="⬦" label="Terms of Service" right={<Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>} />
            <SettingsRow icon="⬦" label="Privacy Policy" right={<Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>} noBorder />
          </Card>
        </View>

        <TouchableOpacity style={[styles.disconnectBtn, { backgroundColor: theme.disconnectBg, borderColor: theme.disconnectBorder }]}>
          <Text style={[styles.disconnectText, { color: theme.red }]}>DISCONNECT WALLET</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 48, paddingBottom: 32 },
  profile: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  profileName: { fontSize: 15 },
  profileAddr: { fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  connectedBadge: { marginTop: 10, backgroundColor: 'rgba(61,139,94,0.12)', borderWidth: 1, borderColor: 'rgba(61,139,94,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  connectedText: { fontSize: 9, letterSpacing: 1.5 },
  section: { marginBottom: 24 },
  prefVal: { fontSize: 12 },
  disconnectBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  disconnectText: { fontSize: 11, letterSpacing: 2 },
});
