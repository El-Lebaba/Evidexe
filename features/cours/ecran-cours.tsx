import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

const SUBJECTS: MatiereCours[] = ['java', 'mathematiques', 'physique'];

function isCourseSubject(value: string | undefined): value is MatiereCours {
  return Boolean(value && SUBJECTS.includes(value as MatiereCours));
}

const themeActif = {
  background: '#EAE3D2',
  border: '#243B53',
  copper: '#BC8559',
  ink: '#243B53',
  muted: '#6E7F73',
  panel: '#DDE4D5',
  sage: '#B7C7B0',
  soft: '#F3F1E7',
  blue: '#7EA6E0',
  yellow: '#D8A94A',
};

export function EcranCours() {
  const params = useLocalSearchParams<{ subject?: string }>();
  const schemaCouleur = useSchemaCouleur();
  const isDarkMode = schemaCouleur === 'dark';
  const themeApplication = obtenirThemeApplication(isDarkMode);
  const initialSubject = isCourseSubject(params.subject) ? params.subject : 'java';
  const [activeSubject, setActiveSubject] = useState<MatiereCours>(initialSubject);
  const [courseSummaries, setCourseSummaries] = useState(obtenirResumesCoursApprentissage);
  const subjectMotion = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCourseSubject(params.subject)) {
      setActiveSubject(params.subject);
    }
  }, [params.subject]);

  useFocusEffect(
      useCallback(() => {
        setCourseSummaries(obtenirResumesCoursApprentissage());
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
        <VueTheme lightColor={themeApplication.background} darkColor={themeApplication.background} style={styles.page}>
          <SymbolesMathematiquesFlottants
            showGlow={false}
            style={[
              styles.mathSymbols,
              { backgroundColor: themeApplication.background, opacity: isDarkMode ? 0.18 : 0.72 },
            ]}
          />
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Pressable
              onPress={() => {
                router.dismissAll();
                router.push('/(tabs)/accueil' as Href);
              }}
              style={[
                styles.backButton,
                isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null,
              ]}>
              <MaterialCommunityIcons color={isDarkMode ? themeApplication.text : themeActif.ink} name="arrow-left" size={18} />
              <TexteTheme lightColor={isDarkMode ? themeApplication.text : themeActif.ink} style={styles.backButtonText}>
                Retour
              </TexteTheme>
            </Pressable>

            <TexteTheme lightColor={isDarkMode ? themeApplication.muted : themeActif.muted} style={styles.screenKicker}>
              Cours / {ETIQUETTES_MATIERES[activeSubject]}
            </TexteTheme>

            <Animated.View style={[styles.hero, { opacity: subjectMotion, transform: [{ translateY: subjectTranslate }] }]}>
              <Pressable onPress={() => router.push('/(tabs)/accueil' as Href)} style={styles.logoBadge}>
                <LogoEvidexe
                  resizeMode="contain"
                  style={styles.logoBadgeImage}
                />
              </Pressable>

              <TexteTheme lightColor={isDarkMode ? themeApplication.text : themeActif.ink} style={styles.title}>
                Apprendre {ETIQUETTES_MATIERES[activeSubject]}
              </TexteTheme>
              <TexteTheme lightColor={isDarkMode ? themeApplication.yellow : '#8f9b8e'} style={styles.titleAccent}>
                visuellement.
              </TexteTheme>
              <TexteTheme lightColor={isDarkMode ? themeApplication.muted : themeActif.muted} style={styles.subtitle}>
                Mini-cours interactifs avec exemples clairs, suivi de progression et questions rapides.
              </TexteTheme>

              <View style={styles.statsRow}>
                <TexteTheme
                  lightColor={isDarkMode ? themeApplication.text : themeActif.muted}
                  style={[styles.statText, isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null]}>
                  {courses.length} mini-cours
                </TexteTheme>
                <TexteTheme
                  lightColor={isDarkMode ? themeApplication.text : themeActif.muted}
                  style={[styles.statText, isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null]}>
                  {totalSlides} diapos
                </TexteTheme>
                <TexteTheme
                  lightColor={isDarkMode ? themeApplication.text : themeActif.muted}
                  style={[styles.statText, isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null]}>
                  {subjectProgress}% termine
                </TexteTheme>
              </View>
            </Animated.View>

            <Animated.View style={[styles.courseSection, { opacity: subjectMotion, transform: [{ translateX: subjectTranslate }] }]}>
              <TexteTheme lightColor={isDarkMode ? themeApplication.muted : themeActif.muted} style={styles.sectionLabel}>
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
    backgroundColor: themeActif.background,
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
  screenKicker: {
    color: themeActif.muted,
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
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
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
    color: themeActif.ink,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  titleAccent: {
    color: themeActif.yellow,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  subtitle: {
    color: themeActif.muted,
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
    color: themeActif.ink,
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
    color: themeActif.muted,
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

