// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { LogBox, useColorScheme } from 'react-native';

LogBox.ignoreLogs([
  'Invalid prop `style` supplied to `React.Fragment`',
]);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={(props) => {
        return {
          headerShown: false,
          tabBarActiveTintColor: '#0d6efd',
          tabBarInactiveTintColor: isDark ? '#adb5bd' : '#6c757d',
          tabBarStyle: {
            backgroundColor: isDark ? '#212529' : '#fff',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        };
      }}
    >

      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
