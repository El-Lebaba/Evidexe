import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  MatiereCours,
  ETIQUETTES_MATIERES,
  trouverCours,
  obtenirProgressionCours,
  obtenirDetailsProgressionCours,
  obtenirQuizCours,
} from '@/data/cours';
import { donneesLocales } from '@/db/donnees-principales';

const themeActif = obtenirThemeApplication(false);

const SUBJECTS: MatiereCours[] = ['java', 'mathematiques', 'physique'];

function isCourseSubject(value: string): value is MatiereCours {
  return SUBJECTS.includes(value as MatiereCours);
}

const highlightedKeywords = [
  'variable',
  'variables',
  'condition',
  'conditions',
  'methode',
  'methodes',
  'parametres',
  'tableau',
  'tableaux',
  'index',
  'classe',
  'classes',
  'objet',
  'objets',
  'constructeur',
  'boucle',
  'boucles',
  'booleen',
  'booleens',
  'String',
  'boolean',
  'true',
  'false',
  'if',
  'else',
  'switch',
  'case',
  'default',
  'break',
  'for',
  'while',
  'return',
  'final',
  'new',
  'derivee',
  'derivees',
  'integrale',
  'integrales',
  'limite',
  'limites',
  'fonction',
  'fonctions',
  'tangente',
  'vitesse',
  'acceleration',
  'position',
  'force',
  'forces',
  'energie',
  'travail',
  'conservation',
];

function normalizeText(value: string) {
  return value
    .replace(/â€”/g, '-')
    .replace(/â†’/g, '->')
    .replace(/âœ“/g, 'ok')
    .replace(/âœ—/g, 'non')
    .replace(/Ã—/g, 'x');
}

function cleanCodeText(value: string) {
  return normalizeText(value).replace(/\*\*/g, '').replace(/`/g, '');
}

function renderHighlightedText(value: string) {
  const text = normalizeText(value);
  const markerPattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const keywordPattern = new RegExp(`\\b(${highlightedKeywords.join('|')})\\b`, 'gi');

  return text.split(markerPattern).flatMap((part, index) => {
    if (!part) {
      return [];
    }

    const markedAsCode = part.startsWith('`') && part.endsWith('`');
    const markedAsBold = part.startsWith('**') && part.endsWith('**');

    if (markedAsCode || markedAsBold) {
      const content = markedAsCode ? part.slice(1, -1) : part.slice(2, -2);

      return (
        <Text key={`marked-${index}`} style={markedAsCode ? styles.inlineCode : styles.keywordText}>
          {content}
        </Text>
      );
    }

    return part.split(keywordPattern).map((piece, pieceIndex) => {
      const isKeyword = highlightedKeywords.some((keyword) => keyword.toLowerCase() === piece.toLowerCase());

      return isKeyword ? (
        <Text key={`keyword-${index}-${pieceIndex}`} style={styles.keywordText}>
          {piece}
        </Text>
      ) : (
        piece
      );
    });
  });
}

export default function EcranLectureCours() {
  const schemaCouleur = useSchemaCouleur();
  const themeDynamique = obtenirThemeApplication(schemaCouleur === 'dark');
  const params = useLocalSearchParams<{ courseId?: string; subject?: string }>();
  const subject = params.subject && isCourseSubject(params.subject) ? params.subject : undefined;
  const courseId = params.courseId;
  const CoursLocal = subject && courseId ? trouverCours(subject, courseId) : undefined;

  const initialSlide = useMemo(() => {
    if (!subject || !courseId || !CoursLocal) {
      return 0;
    }

    return Math.min(obtenirProgressionCours(subject, courseId), Math.max(CoursLocal.totalSlides - 1, 0));
  }, [CoursLocal, courseId, subject]);

  const [slideIndex, setSlideIndex] = useState(initialSlide);
  const [savedProgressDetails, setSavedProgressDetails] = useState(() =>
    subject && courseId ? obtenirDetailsProgressionCours(subject, courseId) : {
      completed: false,
      exerciseCompleted: false,
      highestSlideIndex: -1,
      progress: 0,
    }
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(savedProgressDetails.exerciseCompleted);
  const [confettiRound, setConfettiRound] = useState(0);

  useEffect(() => {
    setSlideIndex(initialSlide);
    setSavedProgressDetails(
      subject && courseId ? obtenirDetailsProgressionCours(subject, courseId) : {
        completed: false,
        exerciseCompleted: false,
        highestSlideIndex: -1,
        progress: 0,
      }
    );
    setSelectedAnswer(null);
    setWrongAnswers([]);
    setQuizCompleted(subject && courseId ? obtenirDetailsProgressionCours(subject, courseId).exerciseCompleted : false);
  }, [courseId, initialSlide, subject]);

  // Each opened page is persisted immediately so the home/profile cards can show the same integer percentage.
  useEffect(() => {
    if (subject && courseId && CoursLocal) {
      donneesLocales.saveCourseProgress(
        subject,
        courseId,
        slideIndex,
        CoursLocal.totalSlides,
        `${ETIQUETTES_MATIERES[subject]} - ${CoursLocal.title}`,
        savedProgressDetails.exerciseCompleted,
      );
      setSavedProgressDetails(obtenirDetailsProgressionCours(subject, courseId));
    }
  }, [CoursLocal, courseId, savedProgressDetails.exerciseCompleted, slideIndex, subject]);

  if (!subject || !courseId || !CoursLocal) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeDynamique.background }]}>
        <VueTheme lightColor={themeDynamique.background} darkColor={themeDynamique.background} style={styles.emptyPage}>
          <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.emptyTitle, { color: themeDynamique.ink }]}>
            Cours introuvable
          </TexteTheme>
          <Pressable onPress={() => router.replace('/(tabs)/cours' as Href)} style={[styles.backButton, { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border }]}>
            <MaterialCommunityIcons color={themeDynamique.ink} name="arrow-left" size={18} />
            <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={styles.backButtonText}>
              Retour
            </TexteTheme>
          </Pressable>
        </VueTheme>
      </SafeAreaView>
    );
  }

  const slide = CoursLocal.slides[slideIndex];
  const maxSlideIndex = CoursLocal.totalSlides - 1;
  const progress = savedProgressDetails.progress;
  const isLastSlide = slideIndex === maxSlideIndex;
  const quiz = obtenirQuizCours(subject, courseId);
  const canGoPrevious = slideIndex > 0;
  const canGoNext = slideIndex < maxSlideIndex || (isLastSlide && quizCompleted);
  const nextButtonLabel = isLastSlide ? 'Completer' : 'Suivant';
  const utiliseCarteFormule = subject === 'mathematiques' || subject === 'physique';
  const contenuDiapoTraite = {
    lignesCode: slide.code ? cleanCodeText(slide.code).split('\n') : [],
    theorieRendue: renderHighlightedText(slide.theory),
  };
  const codeLines = contenuDiapoTraite.lignesCode;

  function goPrevious() {
    setSlideIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }

  function goNext() {
    if (isLastSlide && quizCompleted) {
      goBackToCourses();
      return;
    }

    setSlideIndex((currentIndex) => Math.min(currentIndex + 1, maxSlideIndex));
  }

  function goBackToCourses() {
    router.replace({
      pathname: '/(tabs)/cours',
      params: { subject },
    } as unknown as Href);
  }

  function chooseAnswer(answerIndex: number) {
    if (quizCompleted || wrongAnswers.includes(answerIndex)) {
      return;
    }

    setSelectedAnswer(answerIndex);

    // The final exercise acts as the 100% gate: correct answer sets the boolean flag and awards XP in donneesLocales once.
    if (answerIndex === quiz.answerIndex && subject && courseId && CoursLocal) {
      setQuizCompleted(true);
      setConfettiRound((currentRound) => currentRound + 1);
      donneesLocales.saveCourseProgress(
        subject,
        courseId,
        maxSlideIndex,
        CoursLocal.totalSlides,
        `${ETIQUETTES_MATIERES[subject]} - ${CoursLocal.title}`,
        true,
      );
      setSavedProgressDetails(obtenirDetailsProgressionCours(subject, courseId));
      return;
    }

    setWrongAnswers((answers) => [...answers, answerIndex]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeDynamique.background }]}>
      <VueTheme lightColor={themeDynamique.background} darkColor={themeDynamique.background} style={[styles.page, { backgroundColor: themeDynamique.background }]}>
        <View style={styles.topBar}>
          <Pressable onPress={goBackToCourses} style={[styles.iconButton, { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border }]}>
            <MaterialCommunityIcons color={themeDynamique.ink} name="arrow-left" size={22} />
          </Pressable>

          <View style={styles.topMeta}>
            <TexteTheme lightColor={themeDynamique.muted} darkColor={themeDynamique.muted} numberOfLines={1} style={[styles.subjectText, { color: themeDynamique.muted }]}>
              {ETIQUETTES_MATIERES[subject]}
            </TexteTheme>
            <TexteTheme lightColor={themeDynamique.text} darkColor={themeDynamique.text} numberOfLines={1} style={[styles.courseTitle, { color: themeDynamique.text }]}>
              {CoursLocal.title}
            </TexteTheme>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressMeta}>
            <TexteTheme lightColor={themeDynamique.text} darkColor={themeDynamique.text} style={[styles.progressLabel, { color: themeDynamique.text }]}>
              Page {slideIndex + 1}/{CoursLocal.totalSlides}
            </TexteTheme>
            <TexteTheme lightColor={themeDynamique.text} darkColor={themeDynamique.text} style={[styles.progressLabel, { color: themeDynamique.text }]}>
              {progress}%
            </TexteTheme>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: themeDynamique.soft, borderColor: themeDynamique.border }]}>
            <View style={[styles.progressFill, { backgroundColor: themeDynamique.yellow, width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.slideCard, { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border }]}>
            <TexteTheme lightColor={themeDynamique.muted} darkColor={themeDynamique.muted} style={[styles.slideKicker, { color: themeDynamique.muted }]}>
              {CoursLocal.subtitle}
            </TexteTheme>
            <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.slideTitle, { color: themeDynamique.ink }]}>
              {slide.title}
            </TexteTheme>
            <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.theoryText, { color: themeDynamique.ink }]}>
              {contenuDiapoTraite.theorieRendue}
            </TexteTheme>

            {slide.code && subject === 'java' ? (
              <View style={styles.codeWindow}>
                <View style={styles.codeChrome}>
                  <View style={[styles.windowDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.windowDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.windowDot, { backgroundColor: '#10B981' }]} />
                  <TexteTheme lightColor="#8492A6" style={styles.fileName}>
                    Main.java
                  </TexteTheme>
                </View>
                <View style={styles.codeBody}>
                  {codeLines.map((line, index) => (
                    <View key={`${line}-${index}`} style={styles.codeLine}>
                      <TexteTheme lightColor="#526071" style={styles.lineNumber}>
                        {index + 1}
                      </TexteTheme>
                      <TexteTheme lightColor="#E5E7EB" style={styles.codeText}>
                        {line}
                      </TexteTheme>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {slide.code && utiliseCarteFormule ? (
              <View style={styles.formulaCard}>
                <View style={styles.formulaCardHeader}>
                  <View style={styles.formulaBadge}>
                    <MaterialCommunityIcons color={themeDynamique.ink} name="function-variant" size={18} />
                    <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.formulaBadgeText, { color: themeDynamique.ink }]}>
                      Vue mathematique
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeDynamique.muted} darkColor={themeDynamique.muted} style={[styles.formulaHint, { color: themeDynamique.muted }]}>
                    Formule cle
                  </TexteTheme>
                </View>

                <View style={styles.formulaSurface}>
                  {codeLines.map((line, index) => (
                    <View key={`${line}-${index}`} style={styles.formulaLine}>
                      <RenduFormule centered fallback={line} mathematiques={line} size="lg" />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {isLastSlide ? (
              <View style={[styles.quizCard, { backgroundColor: themeDynamique.soft, borderColor: themeDynamique.border }]}>
                {confettiRound > 0 ? <QuizConfetti key={confettiRound} /> : null}
                <TexteTheme lightColor={themeDynamique.muted} darkColor={themeDynamique.muted} style={[styles.quizKicker, { color: themeDynamique.muted }]}>
                  Question rapide
                </TexteTheme>
                <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.quizQuestion, { color: themeDynamique.ink }]}>
                  {quiz.question}
                </TexteTheme>
                <View style={styles.choiceList}>
                  {quiz.choices.map((choice, index) => {
                    const selected = selectedAnswer === index;
                    const correct = quizCompleted && index === quiz.answerIndex;
                    const incorrect = wrongAnswers.includes(index);
                    const locked = quizCompleted || incorrect;

                    return (
                      <Pressable
                        key={choice}
                        disabled={locked}
                        onPress={() => chooseAnswer(index)}
                        style={[
                          styles.choiceButton,
                          { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border },
                          selected ? styles.choiceButtonSelected : null,
                          correct ? styles.choiceButtonCorrect : null,
                          incorrect ? styles.choiceButtonIncorrect : null,
                          locked && !correct ? styles.choiceButtonLocked : null,
                        ]}>
                        <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} style={[styles.choiceText, { color: themeDynamique.ink }]}>
                          {choice}
                        </TexteTheme>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: themeDynamique.background }]}>
          <Pressable
            disabled={!canGoPrevious}
            onPress={goPrevious}
            style={({ pressed }) => [
              styles.navButton,
              { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border },
              !canGoPrevious ? styles.navButtonDisabled : null,
              pressed ? styles.pressed : null,
            ]}>
            <MaterialCommunityIcons color={themeDynamique.ink} name="chevron-left" size={24} />
            <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} selectable={false} style={[styles.navButtonText, { color: themeDynamique.ink }]}>
              Precedent
            </TexteTheme>
          </Pressable>

          <Pressable
            disabled={!canGoNext}
            onPress={goNext}
            style={({ pressed }) => [
              styles.navButton,
              { backgroundColor: themeDynamique.panel, borderColor: themeDynamique.border },
              !canGoNext ? styles.navButtonDisabled : null,
              pressed ? styles.pressed : null,
            ]}>
            <TexteTheme lightColor={themeDynamique.ink} darkColor={themeDynamique.ink} selectable={false} style={[styles.navButtonText, { color: themeDynamique.ink }]}>
              {nextButtonLabel}
            </TexteTheme>
            <MaterialCommunityIcons color={themeDynamique.ink} name="chevron-right" size={24} />
          </Pressable>
        </View>
      </VueTheme>
    </SafeAreaView>
  );
}

function QuizConfetti() {
  const particles = useRef(
    Array.from({ length: 18 }, (_, index) => ({
      color: [themeActif.yellow, themeActif.green, themeActif.blue, themeActif.red][index % 4],
      left: 12 + ((index * 17) % 76),
      rotate: `${(index * 29) % 180}deg`,
      size: 7 + (index % 3) * 3,
      value: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    const animations = particles.map((particle, index) =>
      Animated.timing(particle.value, {
        delay: index * 18,
        duration: 820,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    Animated.parallel(animations).start();
  }, [particles]);

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {particles.map((particle, index) => (
        <Animated.View
          key={`confetti-${index}`}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: particle.color,
              height: particle.size,
              left: `${particle.left}%`,
              opacity: particle.value.interpolate({
                inputRange: [0, 0.15, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: particle.value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, -90 - (index % 5) * 12],
                  }),
                },
                {
                  translateX: particle.value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, ((index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 8))],
                  }),
                },
                {
                  rotate: particle.value.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', particle.rotate],
                  }),
                },
              ],
              width: particle.size,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  page: {
    backgroundColor: themeActif.background,
    flex: 1,
  },
  emptyPage: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: themeActif.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  topBar: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    maxWidth: 980,
    padding: 16,
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  topMeta: {
    flex: 1,
  },
  subjectText: {
    color: themeActif.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  courseTitle: {
    color: themeActif.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  progressWrap: {
    alignSelf: 'center',
    gap: 8,
    maxWidth: 980,
    paddingHorizontal: 16,
    width: '100%',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: themeActif.ink,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  progressTrack: {
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: themeActif.yellow,
    height: '100%',
  },
  content: {
    alignSelf: 'center',
    maxWidth: 980,
    padding: 16,
    paddingBottom: 110,
    width: '100%',
  },
  slideCard: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 18,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  slideKicker: {
    color: themeActif.muted,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  slideTitle: {
    color: themeActif.ink,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  theoryText: {
    color: themeActif.ink,
    fontSize: 17,
    lineHeight: 27,
  },
  keywordText: {
    backgroundColor: 'rgba(216, 169, 74, 0.18)',
    borderRadius: 6,
    color: themeActif.ink,
    fontWeight: '900',
    paddingHorizontal: 4,
  },
  inlineCode: {
    backgroundColor: 'rgba(126, 166, 224, 0.18)',
    borderRadius: 6,
    color: themeActif.ink,
    fontFamily: 'monospace',
    fontWeight: '900',
    paddingHorizontal: 4,
  },
  codeWindow: {
    backgroundColor: '#0B1020',
    borderRadius: 10,
    overflow: 'hidden',
  },
  codeChrome: {
    alignItems: 'center',
    backgroundColor: '#172033',
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  windowDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  fileName: {
    color: '#8492A6',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  codeBody: {
    gap: 6,
    padding: 18,
  },
  codeLine: {
    flexDirection: 'row',
    gap: 14,
  },
  lineNumber: {
    color: '#526071',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
    minWidth: 22,
    textAlign: 'right',
  },
  codeText: {
    color: '#E5E7EB',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  formulaCard: {
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 16,
  },
  formulaCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formulaBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(216, 169, 74, 0.18)',
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  formulaBadgeText: {
    color: themeActif.ink,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  formulaHint: {
    color: themeActif.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  formulaSurface: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  formulaLine: {
    backgroundColor: 'rgba(126, 166, 224, 0.12)',
    borderColor: 'rgba(36, 59, 83, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 62,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quizCard: {
    backgroundColor: themeActif.soft,
    borderColor: themeActif.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    overflow: 'visible',
    padding: 16,
    position: 'relative',
  },
  confettiLayer: {
    bottom: 0,
    left: 0,
    overflow: 'visible',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 4,
  },
  confettiPiece: {
    borderRadius: 2,
    position: 'absolute',
    top: 42,
  },
  quizKicker: {
    color: themeActif.muted,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  quizQuestion: {
    color: themeActif.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  choiceList: {
    gap: 8,
  },
  choiceButton: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choiceButtonSelected: {
    backgroundColor: 'rgba(126, 166, 224, 0.14)',
    borderColor: themeActif.blue,
  },
  choiceButtonCorrect: {
    backgroundColor: 'rgba(124, 207, 191, 0.16)',
    borderColor: themeActif.green,
  },
  choiceButtonIncorrect: {
    backgroundColor: 'rgba(217, 123, 108, 0.14)',
    borderColor: themeActif.red,
  },
  choiceButtonLocked: {
    opacity: 0.52,
  },
  choiceText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  footer: {
    alignSelf: 'center',
    backgroundColor: themeActif.background,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    maxWidth: 980,
    padding: 16,
    position: 'absolute',
    width: '100%',
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  navButtonDisabled: {
    opacity: 0.42,
  },
  navButtonText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});

