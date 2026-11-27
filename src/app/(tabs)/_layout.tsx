import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../../theme/tokens';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Görevler',
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="check-square"
              size={size - 2}
              color={focused ? theme.accent : theme.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="clock"
              size={size - 2}
              color={focused ? theme.accent : theme.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="user"
              size={size - 2}
              color={focused ? theme.accent : theme.textMuted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
