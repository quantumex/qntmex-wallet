import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import SwapScreen from './src/screens/SwapScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const NAV_ICONS = {
  Home: '⌂',
  Swap: '⇄',
  Send: '↑',
  Receive: '↓',
  Settings: '⚙',
};

function TabIcon({ name, focused, color }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 18, color }}>{NAV_ICONS[name]}</Text>
      <Text style={{ fontSize: 8, color, letterSpacing: 1.5, textTransform: 'uppercase' }}>{name}</Text>
    </View>
  );
}

function AppNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: theme.navBg,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 8,
              paddingTop: 6,
            },
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={route.name} focused={focused} color={color} />
            ),
            tabBarActiveTintColor: theme.gold,
            tabBarInactiveTintColor: theme.muted,
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Swap" component={SwapScreen} />
          <Tab.Screen name="Send" component={SendScreen} />
          <Tab.Screen name="Receive" component={ReceiveScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
