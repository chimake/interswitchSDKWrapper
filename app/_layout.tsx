import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3498db',
    secondary: '#2ecc71',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Payment Details' }} />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </PaperProvider>
  );
}