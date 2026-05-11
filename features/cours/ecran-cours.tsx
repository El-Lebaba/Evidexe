import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PanneauParametres from '@/components/accueil/PanneauParametres';
import type { ParametresApplication } from '@/components/accueil/PanneauParametres';
import CarteCours from '@/components/cours/CarteCours';
import { LogoEvidexe } from '@/components/logo-evidexe';
import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import {
  COURS_PAR_MATIERE,
  MatiereCours,
  ETIQUETTES_MATIERES,
  obtenirResumesCoursApprentissage,
} from '@/data/cours';
import { donneesLocales } from '@/db/donnees-principales';
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

const SUBJECTS: MatiereCours[] = ['java', 'mathematiques', 'physique'];
const STYLE_BOUTON_CLIQUABLE_WEB =
  Platform.OS === 'web' ? ({ cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none' } as any) : undefined;
const STYLE_VISUEL_NON_CLIQUABLE_WEB = Platform.OS === 'web' ? ({ pointerEvents: 'none' } as any) : undefined;

function isCourseSubject(value: string | undefined): value is MatiereCours {
  return Boolean(value && SUBJECTS.includes(value as MatiereCours));
}

const themeActif = {
  background: '#EAE3D2',
  border: '#243B53',
  soft: '#F3F1E7',
};

export function EcranCours() {
  const params = useLocalSearchParams<{ subject?: string }>();
  const schemaCouleur = useSchemaCouleur();
  const isDarkMode = schemaCouleur === 'dark';
  const themeApplication = obtenirThemeApplication(isDarkMode);
  const initialSubject = isCourseSubject(params.subject) ? params.subject : 'java';
  const [activeSubject, setActiveSubject] = useState<MatiereCours>(initialSubject);
  const [courseSummaries, setCourseSummaries] = useState(obtenirResumesCoursApprentissage);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    fpsCounterEnabled: true,
    language: 'fr',
    notifications: true,
  });
  const subjectMotion = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCourseSubject(params.subject)) {
      setActiveSubject(params.subject);
    }
  }, [params.subject]);

  useEffect(() => {
    let isMounted = true;

    void donneesLocales.init().then(() => {
      if (isMounted) {
        setSettings(donneesLocales.obtenirParametres());
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
      useCallback(() => {
        setCourseSummaries(obtenirResumesCoursApprentissage());
        setSettings(donneesLocales.obtenirParametres());
      }, [])
  );

  const courses = COURS_PAR_MATIERE[activeSubject];
  // Summaries join catalog courses to local user progress so the CoursLocal tab and profile tab show the same state.
  const courseSummaryMap = useMemo(
      () => new Map(courseSummaries.map((summary) => [summary.id, summary])),
      [courseSummaries],
  );
  const totalSlides = useMemo(() => courses.reduce((total, CoursLocal) => total + CoursLocal.totalSlides, 0), [courses]);

  useEffect(() => {
    subjectMotion.setValue(0);
    Animated.timing(subjectMotion, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [activeSubject, subjectMotion]);

  const subjectTranslate = subjectMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const subjectProgress = useMemo(() => {
    const totalCourseProgress = courses.reduce((total, CoursLocal) => {
      const progressKey = `${activeSubject}:${CoursLocal.id}`;
      return total + (courseSummaryMap.get(progressKey)?.progress ?? 0);
    }, 0);

    return courses.length === 0 ? 0 : Math.round(totalCourseProgress / courses.length);
  }, [activeSubject, courses, courseSummaryMap]);

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeApplication.background }]}>
        <PanneauParametres
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={setSettings}
        />
        <VueTheme lightColor={themeApplication.background} darkColor={themeApplication.background} style={styles.page}>
          <SymbolesMathematiquesFlottants
            showGlow={false}
            style={[
              styles.mathSymbols,
              { backgroundColor: themeApplication.background, opacity: isDarkMode ? 0.18 : 0.72 },
            ]}
          />
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.replace('/(tabs)/accueil' as Href)}
                style={[
                  styles.backButton,
                  { backgroundColor: themeApplication.soft, borderColor: themeApplication.border },
                ]}>
                <MaterialCommunityIcons color={themeApplication.text} name="arrow-left" size={18} />
                <TexteTheme lightColor={themeApplication.text} darkColor={themeApplication.text} style={styles.backButtonText}>
                  Retour
                </TexteTheme>
              </Pressable>

              <Pressable
                hitSlop={8}
                onPress={() => setSettingsOpen(true)}
                style={[
                  styles.menuButton,
                  STYLE_BOUTON_CLIQUABLE_WEB,
                  { backgroundColor: themeApplication.soft, borderColor: themeApplication.border },
                ]}>
                <View style={[styles.menuIconWrapper, STYLE_VISUEL_NON_CLIQUABLE_WEB]}>
                  <View style={[styles.menuIconBar, { backgroundColor: themeApplication.text }]} />
                  <View style={[styles.menuIconBar, { backgroundColor: themeApplication.text }]} />
                  <View style={[styles.menuIconBar, { backgroundColor: themeApplication.text }]} />
                </View>
              </Pressable>
            </View>

            <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.screenKicker}>
              Cours / {ETIQUETTES_MATIERES[activeSubject]}
            </TexteTheme>

            <Animated.View style={[styles.hero, { opacity: subjectMotion, transform: [{ translateY: subjectTranslate }] }]}>
              <Pressable onPress={() => router.push('/(tabs)/accueil' as Href)} style={styles.logoBadge}>
                <LogoEvidexe
                  resizeMode="contain"
                  style={styles.logoBadgeImage}
                />
              </Pressable>

              <TexteTheme lightColor={themeApplication.text} darkColor={themeApplication.text} style={styles.title}>
                Apprendre {ETIQUETTES_MATIERES[activeSubject]}
              </TexteTheme>
              <TexteTheme lightColor={themeApplication.yellow} darkColor={themeApplication.yellow} style={styles.titleAccent}>
                visuellement.
              </TexteTheme>
              <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.subtitle}>
                Mini-cours interactifs avec exemples clairs, suivi de progression et questions rapides.
              </TexteTheme>

              <View style={styles.statsRow}>
                <TexteTheme
                  lightColor={themeApplication.text}
                  darkColor={themeApplication.text}
                  style={[styles.statText, { backgroundColor: themeApplication.soft, borderColor: themeApplication.border }]}>
                  {courses.length} mini-cours
                </TexteTheme>
                <TexteTheme
                  lightColor={themeApplication.text}
                  darkColor={themeApplication.text}
                  style={[styles.statText, { backgroundColor: themeApplication.soft, borderColor: themeApplication.border }]}>
                  {totalSlides} diapos
                </TexteTheme>
                <TexteTheme
                  lightColor={themeApplication.text}
                  darkColor={themeApplication.text}
                  style={[styles.statText, { backgroundColor: themeApplication.soft, borderColor: themeApplication.border }]}>
                  {subjectProgress}% termine
                </TexteTheme>
              </View>
            </Animated.View>

            <Animated.View style={[styles.courseSection, { opacity: subjectMotion, transform: [{ translateX: subjectTranslate }] }]}>
              <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.sectionLabel}>
                Mini-cours
              </TexteTheme>

              <View style={styles.courseList}>
                {courses.map((CoursLocal, index) => {
                  const progressKey = `${activeSubject}:${CoursLocal.id}`;
                  const progressDetails = courseSummaryMap.get(progressKey) ?? {
                    completed: false,
                    exerciseCompleted: false,
                    highestSlideIndex: -1,
                    progress: 0,
                  };

                  return (
                      <CarteCours
                          CoursLocal={CoursLocal}
                          progressDetails={progressDetails}
                          index={index}
                          key={CoursLocal.id}
                          subject={activeSubject}
                          themeApplication={themeApplication}
                      />
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>
        </VueTheme>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  mathSymbols: {
    backgroundColor: themeActif.background,
    opacity: 0.72,
  },
  scrollContent: {
    alignSelf: 'center',
    gap: 22,
    maxWidth: 980,
    padding: 16,
    paddingBottom: 42,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screenKicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
    zIndex: 5,
  },
  menuIconWrapper: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    left: 9,
    position: 'absolute',
    top: 9,
    width: 24,
  },
  menuIconBar: {
    borderRadius: 999,
    height: 2,
    marginVertical: 2,
    width: 18,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
  logoBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logoBadgeImage: {
    height: 50,
    width: 160,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  statText: {
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  courseSection: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  courseList: {
    gap: 14,
    flexWrap: 'wrap',
    flexDirection: 'row',
    flexGrow: 1,
  },
});

