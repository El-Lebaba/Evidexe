import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Href, router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import PanneauParametres from '@/components/accueil/PanneauParametres';
import { LogoEvidexe } from '@/components/logo-evidexe';
import ListeSucces from '@/components/profil/ListeSucces';
import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { ParametresApplication, SuccesProgression } from '@/db/donnees-principales';

const STYLE_BOUTON_CLIQUABLE_WEB =
  Platform.OS === 'web' ? ({ cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none' } as any) : undefined;
const STYLE_VISUEL_NON_CLIQUABLE_WEB = Platform.OS === 'web' ? ({ pointerEvents: 'none' } as any) : undefined;

export default function PageSucces() {
  const [successes, setSuccesses] = useState<SuccesProgression[]>([]);
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    fpsCounterEnabled: true,
    language: 'fr',
    notifications: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const themeActif = obtenirThemeApplication(settings.darkMode);

  const refresh = useCallback(() => {
    let isActive = true;

    async function chargerSucces() {
      await donneesLocales.init();

      if (!isActive) {
        return;
      }

      setSettings(donneesLocales.obtenirParametres());
      setSuccesses(donneesLocales.obtenirSuccesProgression());
    }

    void chargerSucces();

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(refresh);

  const completedCount = successes.filter((success) => success.completed).length;

  function enregistrerParametres(nextSettings: ParametresApplication) {
    setSettings(nextSettings);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <PanneauParametres
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={enregistrerParametres}
      />
      <View style={styles.topRow}>
        <Pressable
          hitSlop={8}
          onPress={() => setSettingsOpen(true)}
          style={[styles.utilityButton, STYLE_BOUTON_CLIQUABLE_WEB, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}25` }]}>
          <View pointerEvents="none" style={[styles.menuIconWrapper, STYLE_VISUEL_NON_CLIQUABLE_WEB]}>
            <View style={[styles.menuIconBar, { backgroundColor: themeActif.text }]} />
            <View style={[styles.menuIconBar, { backgroundColor: themeActif.text }]} />
            <View style={[styles.menuIconBar, { backgroundColor: themeActif.text }]} />
          </View>
        </Pressable>

        <Pressable onPress={() => router.push('/(tabs)/accueil' as Href)} style={styles.logoButton}>
          <LogoEvidexe resizeMode="contain" style={styles.logo} />
        </Pressable>

        <View style={styles.topSpacer} />
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
  topSpacer: {
    height: 44,
    width: 44,
  },
  utilityButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  menuIconWrapper: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    left: 10,
    position: 'absolute',
    top: 10,
    width: 24,
  },
  menuIconBar: {
    borderRadius: 999,
    height: 2,
    marginVertical: 2,
    width: 18,
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
