import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import { LogoEvidexe } from '@/components/logo-evidexe';
import ListeSucces from '@/components/profil/ListeSucces';
import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { ParametresApplication, SuccesProgression } from '@/db/donnees-principales';

export default function PageSucces() {
  const [successes, setSuccesses] = useState<SuccesProgression[]>([]);
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    fpsCounterEnabled: true,
    language: 'fr',
    notifications: true,
  });
  const themeActif = obtenirThemeApplication(settings.darkMode);

  const refresh = useCallback(() => {
    donneesLocales.init();
    setSettings(donneesLocales.obtenirParametres());
    setSuccesses(donneesLocales.obtenirSuccesProgression());
  }, []);

  useFocusEffect(refresh);

  const completedCount = successes.filter((success) => success.completed).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/(tabs)/accueil' as Href)} style={styles.logoButton}>
          <LogoEvidexe resizeMode="contain" style={styles.logo} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/profil' as Href)}
          style={[styles.profileButton, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}25` }]}>
          <MaterialIcons name="person" size={21} color={themeActif.blue} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}25` }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${themeActif.yellow}24` }]}>
            <MaterialIcons name="emoji-events" size={28} color={themeActif.yellow} />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={[styles.title, { color: themeActif.text }]}>Succes</Text>
            <Text style={[styles.subtitle, { color: themeActif.muted }]}>
              {completedCount}/{successes.length} succes termines
            </Text>
          </View>
        </View>

        <ListeSucces successes={successes} themeActif={themeActif} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 142,
  },
  logo: {
    height: 44,
    width: 142,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  content: {
    alignSelf: 'center',
    gap: 14,
    maxWidth: 720,
    padding: 16,
    paddingBottom: 42,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  heroTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
});
