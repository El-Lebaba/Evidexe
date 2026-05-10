import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import type { ThemeApplication } from '@/constantes/theme';
import { DetailsProgressionCours, MatiereCours, CoursApprentissage, ETIQUETTES_MATIERES } from '@/data/cours';

type ProprietesCarteCours = {
  CoursLocal: CoursApprentissage;
  progressDetails: DetailsProgressionCours;
  index: number;
  subject: MatiereCours;
  themeApplication: ThemeApplication;
};

const themeActif = {
  border: '#243B53',
  ink: '#243B53',
  muted: '#243B53',
  panel: '#F3F1E7',
  soft: '#E9ECE4',
  pale: '#DDE4D5',
};

const accentColors = ['#D8A94A', '#7EA6E0', '#7CCFBF', '#BC8559', '#AAB58A', '#D97B6C'];

const subjectIcons: Record<MatiereCours, keyof typeof MaterialCommunityIcons.glyphMap> = {
  java: 'language-java',
  mathematiques: 'function-variant',
  physique: 'atom',
};

export default function CarteCours({ CoursLocal, progressDetails, index, subject, themeApplication }: ProprietesCarteCours) {
  const accent = accentColors[index % accentColors.length];
  // CoursLocal cards display saved tracking only; progress changes happen inside the reader/exercise flow.
  const hasStarted = progressDetails.progress > 0;
  const progress = progressDetails.progress;
  const exerciseStatus = progressDetails.exerciseCompleted ? 'exercice termine' : 'exercice a faire';
  const href = {
    pathname: '/(tabs)/cours/sujet/courseId',
    params: { courseId: CoursLocal.id, subject },
  } as unknown as Href;

  return (
      <Pressable
          onPress={() => router.replace(href)}
          style={({ pressed }) => [
              styles.card,
            {
              backgroundColor: themeApplication.card,
              borderColor: themeApplication.border,
              borderTopColor: accent,
            },
            pressed ? styles.pressed : null,
          ]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { backgroundColor: `${accent}18` }]}>
            <MaterialCommunityIcons color={accent} name={subjectIcons[subject]} size={27} />
          </View>
          <View style={[styles.numberBadge, { backgroundColor: themeApplication.soft, borderColor: themeApplication.border }]}>
            <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.numberText}>
              {String(index + 1).padStart(2, '0')}
            </TexteTheme>
          </View>
        </View>

        <View style={styles.meta}>
          <TexteTheme lightColor={themeApplication.text} darkColor={themeApplication.text} style={styles.title}>
            {CoursLocal.title}
          </TexteTheme>
          <TexteTheme lightColor={accent} darkColor={accent} style={styles.subjectLabel}>
            {CoursLocal.subtitle || ETIQUETTES_MATIERES[subject]}
          </TexteTheme>
          <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} numberOfLines={2} style={styles.description}>
            {CoursLocal.description}
          </TexteTheme>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: `${themeApplication.border}24` }]}>
          <View style={styles.footerMeta}>
            <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.slideText}>
              {CoursLocal.totalSlides} diapos
            </TexteTheme>
            {hasStarted ? (
              <TexteTheme lightColor={themeApplication.muted} darkColor={themeApplication.muted} style={styles.slideText}>
                {`${progress}%`}
              </TexteTheme>
            ) : null}
            {hasStarted ? (
              <TexteTheme
                lightColor={progressDetails.exerciseCompleted ? themeApplication.green : themeApplication.yellow}
                darkColor={progressDetails.exerciseCompleted ? themeApplication.green : themeApplication.yellow}
                style={styles.slideText}>
                {exerciseStatus}
              </TexteTheme>
            ) : null}
          </View>
          <View style={[styles.openButton, { backgroundColor: `${accent}12` }]}>
            <MaterialCommunityIcons color={accent} name="chevron-right" size={22} />
          </View>
        </View>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 4,
    flexBasis: 260,
    flexGrow: 1,
    gap: 16,
    minHeight: 240,
    overflow: 'hidden',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }, { translateY: 1 }],
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  numberBadge: {
    alignItems: 'center',
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: 10,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  openButton: {
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: themeActif.pale,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  meta: {
    flex: 1,
    gap: 7,
  },
  subjectLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopColor: 'rgba(36,59,83,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  footerMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  slideText: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
});
