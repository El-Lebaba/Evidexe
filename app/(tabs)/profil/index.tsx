/**
 * Page profil.
 *
 * Elle rassemble les données de l'utilisateur actif: XP, niveau, cours récents,
 * succès et cartes mémoire. À chaque retour sur l'écran, les données locales
 * sont relues pour rester alignées avec les cours et les simulations.
 */
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CoursLocal } from '@/components/accueil/PanneauCours';
import PanneauCartesMemoire from '@/components/accueil/PanneauCartesMemoire';
import PanneauParametres, { ParametresApplication } from '@/components/accueil/PanneauParametres';
import BarreSuperieure from '@/components/accueil/BarreSuperieure';
import PanneauCompletionsRecentes from '@/components/profil/PanneauCompletionsRecentes';
import PanneauSucces from '@/components/profil/PanneauSucces';
import { obtenirThemeApplication, ThemeApplication } from '@/constantes/theme';
import { obtenirCoursApprentissageRecents } from '@/data/cours';
import { donneesLocales } from '@/db/donnees-principales';
import type { InfosUtilisateur } from '@/db/donnees-principales';
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';

const Couleurs = obtenirThemeApplication(false);
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const profileTabs = [
  { key: 'cards', label: 'Cartes', icon: 'style', color: Couleurs.blue },
  { key: 'recent', label: 'Recents', icon: 'done-all', color: Couleurs.green },
  { key: 'achievements', label: 'Succes', icon: 'emoji-events', color: Couleurs.yellow },
] as const;

export default function EvidexProfile() {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [courses, setCourses] = useState<CoursLocal[]>([]);
  const [user, setUser] = useState<InfosUtilisateur>({ xp: 0, level: 1 });
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    language: 'fr',
    notifications: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function chargerProfil() {
      await donneesLocales.init();

      if (!isMounted) {
        return;
      }

      setCourses(obtenirCoursApprentissageRecents().filter((CoursLocal) => CoursLocal.progress > 0));
      const loadedUser = donneesLocales.obtenirUtilisateur();
      setUser(loadedUser);
      setSettings(donneesLocales.obtenirParametres());
    }

    void chargerProfil();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCourses = useCallback(() => {
    setCourses(obtenirCoursApprentissageRecents().filter((CoursLocal) => CoursLocal.progress > 0));
  }, []);

  const refreshProfile = useCallback(() => {
    refreshCourses();
    setUser(donneesLocales.obtenirUtilisateur());
    setSettings(donneesLocales.obtenirParametres());
  }, [refreshCourses]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function chargerCours() {
        await donneesLocales.init();

        if (isActive) {
          refreshProfile();
        }
      }

      void chargerCours();

      return () => {
        isActive = false;
      };
    }, [refreshProfile])
  );

  const activeCount = courses.filter((CoursLocal) => !CoursLocal.completed).length;
  const completedCount = courses.filter((CoursLocal) => CoursLocal.completed).length;
  const themeActif = obtenirThemeApplication(settings.darkMode);
  const phoneWidth = Math.min(Math.max(width - 24, 300), 390);
  const panelWidth = phoneWidth;

  function goToPanel(index: number) {
    setActivePanel(index);
    scrollRef.current?.scrollTo({ x: index * panelWidth, animated: true });
  }

  function handlePanelScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / panelWidth);
    setActivePanel(Math.max(0, Math.min(profileTabs.length - 1, nextIndex)));
  }

  function enregistrerParametres(nextSettings: ParametresApplication) {
    setSettings(nextSettings);
  }

  const stats = [
    { label: 'cours actifs', value: activeCount, color: themeActif.green },
    { label: 'cours termines', value: completedCount, color: themeActif.red },
    { label: 'niveau', value: user.level, color: themeActif.blue },
    { label: 'xp total', value: user.xp, color: themeActif.yellow },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <View style={[styles.page, { backgroundColor: themeActif.background }]}>
        <SymbolesMathematiquesFlottants
          showGlow={!settings.darkMode}
          style={[styles.backgroundSymbols, { backgroundColor: themeActif.background }]}
        />
        <BarreSuperieure
          darkMode={settings.darkMode}
          onSettingsClick={() => setSettingsOpen(true)}
          user={user}
        />
        <PanneauParametres
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={enregistrerParametres}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.phoneProfile,
              {
                backgroundColor: themeActif.surface,
                borderColor: `${themeActif.border}25`,
                width: phoneWidth,
              },
            ]}>
            <View style={styles.profileHeader}>
              <View style={styles.profileTopRow}>
                <View style={[styles.avatar, { backgroundColor: themeActif.blue }]}>
                  {user.avatarUri ? (
                    <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <MaterialIcons name="person" size={28} color="white" />
                  )}
                </View>
                <View style={styles.profileIdentity}>
                  <Text style={[styles.profileName, { color: themeActif.text }]}>
                    {user.name ?? 'Utilisateur'}
                  </Text>
                  <Text style={[styles.profileLevel, { color: themeActif.muted }]}>
                    Niveau {user.level} - {user.xp} XP
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {stats.map((stat) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statChip,
                      {
                        backgroundColor: `${stat.color}18`,
                        borderColor: `${stat.color}70`,
                      },
                    ]}>
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: themeActif.muted }]}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.profileTabs, { backgroundColor: themeActif.background, borderColor: `${themeActif.border}25` }]}>
                {profileTabs.map((tab, index) => {
                  const tabColor = settings.darkMode && tab.key === 'cards' ? themeActif.blue : tab.color;
                  const selected = activePanel === index;

                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => goToPanel(index)}
                      style={[
                        styles.profileTabButton,
                        selected
                          ? { backgroundColor: `${tabColor}30`, borderColor: `${tabColor}90` }
                          : { borderColor: 'transparent' },
                      ]}>
                      <MaterialIcons
                        name={tab.icon as MaterialIconName}
                        size={16}
                        color={selected ? tabColor : themeActif.muted}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.profileTabText,
                          { color: selected ? themeActif.text : themeActif.muted },
                        ]}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              bounces={false}
              decelerationRate="fast"
              onMomentumScrollEnd={handlePanelScrollEnd}
              onScrollEndDrag={handlePanelScrollEnd}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              style={{ width: panelWidth }}>
              <View style={[styles.pagerPage, { width: panelWidth }]}>
                <PanelBox accentColor={themeActif.blue} Couleurs={themeActif}>
                  <PanneauCartesMemoire darkMode={settings.darkMode} />
                </PanelBox>
              </View>
              <View style={[styles.pagerPage, { width: panelWidth }]}>
                <PanelBox accentColor={themeActif.green} Couleurs={themeActif}>
                  <PanneauCompletionsRecentes
                    courses={courses}
                    darkMode={settings.darkMode}
                  />
                </PanelBox>
              </View>
              <View style={[styles.pagerPage, { width: panelWidth }]}>
                <PanelBox accentColor={themeActif.yellow} Couleurs={themeActif}>
                  <PanneauSucces
                    darkMode={settings.darkMode}
                    user={user}
                  />
                </PanelBox>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type PanelBoxProps = {
  accentColor: string;
  Couleurs: ThemeApplication;
  children: ReactNode;
};

function PanelBox({ accentColor, Couleurs, children }: PanelBoxProps) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: Couleurs.surface,
          borderColor: `${Couleurs.border}30`,
        },
      ]}>
      <View style={[styles.panelAccent, { backgroundColor: accentColor }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Couleurs.background,
    flex: 1,
  },
  page: {
    backgroundColor: Couleurs.background,
    flex: 1,
  },
  backgroundSymbols: {
    opacity: 0.28,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  phoneProfile: {
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 1,
  },
  profileHeader: {
    gap: 12,
    padding: 12,
  },
  profileTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  profileIdentity: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: Couleurs.text,
    fontSize: 19,
    fontWeight: '900',
  },
  profileLevel: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: Couleurs.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  profileTabs: {
    backgroundColor: Couleurs.surface,
    borderColor: '#243B5325',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    padding: 5,
  },
  profileTabButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 4,
  },
  profileTabText: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  pagerPage: {
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  panel: {
    backgroundColor: Couleurs.surface,
    borderColor: '#243B5330',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 500,
    overflow: 'hidden',
    padding: 14,
    width: '100%',
  },
  panelAccent: {
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

