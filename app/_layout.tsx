import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CompteurFpsDev } from '@/components/compteur-fps-dev';
import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const schemaCouleur = useSchemaCouleur();
  const darkMode = schemaCouleur === 'dark';
  const themeApplication = obtenirThemeApplication(darkMode);
  const baseNavigationTheme = darkMode ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: themeApplication.background,
      border: themeApplication.border,
      card: themeApplication.surface,
      primary: themeApplication.blue,
      text: themeApplication.text,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <CompteurFpsDev />
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
