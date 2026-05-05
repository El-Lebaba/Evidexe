import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CoursLocal } from '@/components/accueil/PanneauCours';

const lightColors = {
  background: '#E9ECE4',
  panel: '#DDE4D5',
  border: '#243B53',
  text: '#243B53',
  muted: '#6E7F73',
  green: '#7CCFBF',
  yellow: '#D8A94A',
};

const darkColors = {
  background: '#151C22',
  panel: '#2A3741',
  border: '#9DB2C0',
  text: '#F3F1E7',
  muted: '#B7C7B0',
  green: '#7CCFBF',
  yellow: '#E0B95A',
};

type ProprietesPanneauCompletionsRecentes = {
  courses: CoursLocal[];
  darkMode?: boolean;
};

export default function PanneauCompletionsRecentes({
  courses,
  darkMode = false,
}: ProprietesPanneauCompletionsRecentes) {
  const themeActif = darkMode ? darkColors : lightColors;
  const completedCourses = courses.filter((course) => course.completed);

  function openCourse(course: CoursLocal) {
    if (!course.subject || !course.courseId) {
      return;
    }

    router.push({
      pathname: '/(tabs)/cours/sujet/courseId',
      params: { courseId: course.courseId, subject: course.subject },
    } as unknown as Href);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeActif.text }]}>Completions recentes</Text>
        <View style={[styles.countBadge, { borderColor: `${themeActif.border}30` }]}>
          <MaterialIcons name="done-all" size={17} color={themeActif.green} />
          <Text style={[styles.countText, { color: themeActif.muted }]}>
            {completedCourses.length}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {completedCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="workspace-premium" size={34} color={themeActif.muted} />
            <Text style={[styles.emptyText, { color: themeActif.muted }]}>
              Termine un cours pour le retrouver ici.
            </Text>
          </View>
        ) : (
          completedCourses.slice(0, 8).map((course) => (
            <Pressable
              key={course.id}
              onPress={() => openCourse(course)}
              style={({ pressed }) => [
                styles.completionCard,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                pressed ? styles.pressed : null,
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: `${themeActif.green}35` }]}>
                <MaterialIcons name="check-circle" size={21} color={themeActif.green} />
              </View>
              <View style={styles.completionText}>
                <Text style={[styles.courseName, { color: themeActif.text }]}>{course.name}</Text>
                <Text style={[styles.courseMeta, { color: themeActif.muted }]}>
                  100% termine
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={themeActif.muted} />
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
    color: lightColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  countBadge: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  countText: {
    color: lightColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 42,
  },
  emptyText: {
    color: lightColors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  completionCard: {
    alignItems: 'center',
    backgroundColor: lightColors.panel,
    borderColor: '#243B5325',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ translateY: 1 }],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  completionText: {
    flex: 1,
    gap: 3,
  },
  courseName: {
    color: lightColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  courseMeta: {
    color: lightColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
});
