/**
 * Panneau de cours utilisé sur l'accueil.
 *
 * Il affiche un aperçu rapide des cours et de leur progression sans remplacer
 * la vraie page `Cours`, qui reste la liste complète.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';
import { MatiereCours } from '@/data/cours';

const Couleurs = obtenirThemeApplication(false);

export type CoursLocal = {
  id: number | string;
  name: string;
  progress: number;
  completed: boolean;
  subject?: MatiereCours;
  courseId?: string;
  totalSlides?: number;
  highestSlideIndex?: number;
  exerciseCompleted?: boolean;
};

type ProprietesPanneauCours = {
  courses: CoursLocal[];
  darkMode?: boolean;
  onCourseUpdate?: () => void;
};

export default function PanneauCours({
  courses,
  darkMode = false,
}: ProprietesPanneauCours) {
  const themeActif = obtenirThemeApplication(darkMode);
  const activeCourses = courses.filter((CoursLocal) => CoursLocal.progress > 0 && CoursLocal.subject && CoursLocal.courseId);

  function openCourse(CoursLocal: CoursLocal) {
    if (!CoursLocal.subject || !CoursLocal.courseId) {
      return;
    }

    // Profile cards are read-only launchers; the reader decides the correct resume page from saved progress.
    router.push({
      pathname: '/(tabs)/cours/sujet/courseId',
      params: { courseId: CoursLocal.courseId, subject: CoursLocal.subject },
    } as unknown as Href);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeActif.text }]}>Cours actifs</Text>
        <View style={[styles.syncBadge, { borderColor: `${themeActif.border}30` }]}>
          <MaterialIcons name="lock-outline" size={17} color={themeActif.muted} />
          <Text style={[styles.syncBadgeText, { color: themeActif.muted }]}>Lecture</Text>
        </View>
      </View>

      <View style={styles.list}>
        {activeCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="menu-book" size={34} color={themeActif.muted} />
            <Text style={[styles.emptyText, { color: themeActif.muted }]}>
              Commence un cours pour le voir ici.
            </Text>
          </View>
        ) : (
          activeCourses.map((CoursLocal) => (
            <Pressable
              key={CoursLocal.id}
              onPress={() => openCourse(CoursLocal)}
              style={({ pressed }) => [
                styles.courseCard,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.courseTop}>
                <View style={styles.courseMeta}>
                  <Text style={[styles.courseName, { color: themeActif.text }]}>{CoursLocal.name}</Text>
                  <Text style={[styles.courseSubject, { color: themeActif.muted }]}>
                    {CoursLocal.progress}% termine
                  </Text>
                  <Text
                    style={[
                      styles.exerciseText,
                      { color: CoursLocal.exerciseCompleted ? themeActif.green : themeActif.yellow },
                    ]}>
                    {CoursLocal.exerciseCompleted ? 'Exercice termine' : 'Exercice a completer'}
                  </Text>
                </View>
                <View style={[styles.openButton, { backgroundColor: themeActif.background }]}>
                  <MaterialIcons name="chevron-right" size={22} color={themeActif.text} />
                </View>
              </View>

              <View
                style={[
                  styles.progressTrack,
                  {
                    backgroundColor: themeActif.background,
                    borderColor: `${themeActif.border}30`,
                  },
                ]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: themeActif.green,
                      width: `${CoursLocal.progress}%`,
                    },
                  ]}
                />
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: Couleurs.text,
    fontSize: 17,
    fontWeight: '900',
  },
  syncBadge: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 36,
  },
  emptyText: {
    color: Couleurs.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5325',
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ translateY: 1 }],
  },
  courseTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  courseMeta: {
    flex: 1,
    gap: 3,
  },
  courseName: {
    color: Couleurs.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  courseSubject: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  exerciseText: {
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  openButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  progressTrack: {
    borderRadius: 999,
    borderWidth: 1,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
