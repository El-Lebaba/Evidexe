/**
 * Accueil principal.
 *
 * Cet écran présente les grands accès de l'application: cours, simulations,
 * profil et succès. Il garde aussi l'état du carrousel et ouvre les panneaux
 * latéraux comme les paramètres.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PanneauParametres from '@/components/accueil/PanneauParametres';
import type { ParametresApplication } from '@/components/accueil/PanneauParametres';
import { LogoEvidexe } from '@/components/logo-evidexe';
import { obtenirThemeApplication, ThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

const palette = {
  charcoal: '#19191F',
  copper: '#BC8559',
  cream: '#EEF5ED',
  creamDark: '#DFE9DC',
  sage: '#B8C7B1',
  sageDeep: '#AABBA1',
  ink: '#20242B',
  slate: '#536165',
  blue: '#7EA6E0',
  yellow: '#D8A94A',
  green: '#7CCFBF',
  white: '#FFFFFF',
};

const studyingBoy = require('@/assets/images/studying-boy-hq.png');
const NOMBRE_VIGNETTES_ACCUEIL = 3;
const SLOT_DEPART_VIGNETTES = 1;
const ORDRE_DEFILEMENT_VIGNETTES = [2, 0, 1, 2, 0] as const;
const STYLE_BOUTON_CLIQUABLE_WEB =
  Platform.OS === 'web' ? ({ cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none' } as any) : undefined;
const STYLE_VISUEL_NON_CLIQUABLE_WEB = Platform.OS === 'web' ? ({ pointerEvents: 'none' } as any) : undefined;

type BubbleSpec = {
  height: number;
  left: number;
  opacity: number;
  top: number;
  width: number;
};

type FeaturePanel = 'cours' | 'simulations';

function seededValue(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function intersects(x: number, y: number, size: number, rect: { x: number; y: number; width: number; height: number }) {
  return x < rect.x + rect.width && x + size > rect.x && y < rect.y + rect.height && y + size > rect.y;
}

function createBubblesAccueil(panelWidth: number, panelHeight: number, isCompact: boolean): BubbleSpec[] {
  const safePadding = isCompact ? 14 : 18;
  const bubbleCount = isCompact ? 24 : 28;
  const maxBubble = isCompact ? 76 : 108;
  const minBubble = isCompact ? 14 : 18;
  const exclusionZones = isCompact
    ? [
        { x: panelWidth * 0.16, y: 120, width: panelWidth * 0.68, height: 250 },
        { x: panelWidth - 110, y: 14, width: 100, height: 64 },
      ]
    : [
        { x: panelWidth * 0.18, y: 150, width: panelWidth * 0.64, height: 260 },
        { x: panelWidth - 126, y: 14, width: 112, height: 64 },
      ];

  const bubbles: BubbleSpec[] = [];

  for (let index = 0; index < bubbleCount; index += 1) {
    let placed = false;

    for (let attempt = 0; attempt < 60 && !placed; attempt += 1) {
      const seed = index * 71 + attempt * 17 + panelWidth;
      const size = Math.round(minBubble + seededValue(seed) * (maxBubble - minBubble));
      const x = Math.round(safePadding + seededValue(seed + 1) * (panelWidth - size - safePadding * 2));
      const y = Math.round(safePadding + seededValue(seed + 2) * (panelHeight - size - safePadding * 2));
      const opacity = 0.14 + seededValue(seed + 3) * 0.16;
      const blocked = exclusionZones.some((zone) => intersects(x, y, size, zone));

      if (!blocked) {
        bubbles.push({
          height: size,
          left: x,
          opacity,
          top: y,
          width: size,
        });
        placed = true;
      }
    }
  }
  return bubbles;
}

function createSlideBubbles(panelWidth: number, panelHeight: number, isCompact: boolean, seedOffset: number) {
  return createBubblesAccueil(panelWidth + seedOffset, panelHeight, isCompact).map((bubble, index) => ({
    ...bubble,
    left: Math.max(0, Math.min(panelWidth - bubble.width, bubble.left + ((index % 3) - 1) * 6)),
  }));
}

function wrapSlideIndex(index: number) {
  return (index + NOMBRE_VIGNETTES_ACCUEIL) % NOMBRE_VIGNETTES_ACCUEIL;
}

function getCircularOffset(slideIndex: number, activeIndex: number) {
  const directOffset = slideIndex - activeIndex;

  if (directOffset > 1) {
    return directOffset - NOMBRE_VIGNETTES_ACCUEIL;
  }

  if (directOffset < -1) {
    return directOffset + NOMBRE_VIGNETTES_ACCUEIL;
  }

  return directOffset;
}

type PropsVignetteAccueil = {
  slideWidth: number;
  panelHeight: number;
  isCompact: boolean;
  isDarkMode: boolean;
  themeApplication: ThemeApplication;
  driftProgress: Animated.Value;
  animatedStyle: any;
  bubbles: BubbleSpec[];
  onExplore: () => void;
};

export default function EcranAccueil() {


  const { width, height } = useWindowDimensions();
  const schemaCouleur = useSchemaCouleur();
  const isDarkMode = schemaCouleur === 'dark';
  const themeApplication = obtenirThemeApplication(isDarkMode);
  const isCompact = width < 480;
  const slideWidth = Math.max(width - (isCompact ? 24 : 44), 280);
  const hauteurPanneauAccueil = isCompact ? Math.max(height - 150, 570) : Math.max(height - 146, 700);
  const [expandedPanel, setExpandedPanel] = useState<'cours' | 'simulations' | null>(null);
  const [featuresAnchorY, setFeaturesAnchorY] = useState(0);
  const [indexRenduVignetteAccueil, setIndexRenduVignetteAccueil] = useState(0);
  const [indexPointVignetteAccueil, setIndexPointVignetteAccueil] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userName, setUserName] = useState('Utilisateur');
  const [userAvatarUri, setUserAvatarUri] = useState<string | undefined>();
  const [activeCourses, setActiveCourses] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    language: 'fr',
    notifications: true,
  });

  const expandProgress = useRef(new Animated.Value(0)).current;
  const translationWebVignettesAccueil = useRef(new Animated.Value(0)).current;
  const bubbleDrift = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollVignettesRef = useRef<ScrollView | null>(null);
  const autoAdvanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalisationVignetteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationWebVignetteId = useRef(0);
  const slotVignetteCourant = useRef(SLOT_DEPART_VIGNETTES);
  const indexVignetteAccueilCourant = useRef(0);
  const indexVignetteCibleCourant = useRef(0);
  const coursesExpanded = expandedPanel === 'cours';
  const simulationsExpanded = expandedPanel === 'simulations';
  const expandedTitle = coursesExpanded ? 'Choisis ta matiere' : 'Choisis ta section';
  const expandedEyebrow = coursesExpanded ? 'Cours' : 'Simulations';
  const bubblesMarque = useMemo(
    () => createSlideBubbles(slideWidth - 12, hauteurPanneauAccueil, isCompact, 0),
    [hauteurPanneauAccueil, isCompact, slideWidth],
  );
  const bubblesAPropos = useMemo(
    () => createSlideBubbles(slideWidth - 12, hauteurPanneauAccueil, isCompact, 37),
    [hauteurPanneauAccueil, isCompact, slideWidth],
  );
  const bubblesProfil = useMemo(
    () => createSlideBubbles(slideWidth - 12, hauteurPanneauAccueil, isCompact, 91),
    [hauteurPanneauAccueil, isCompact, slideWidth],
  );

  const expandedCards = [
    {
      key: 'mathematiques',
      title: 'Math',
      subtitle: 'Fonctions, calcul et plus',
      accent: palette.yellow,
      icon: 'functions',
      href: (coursesExpanded ? { pathname: '/(tabs)/cours', params: { subject: 'mathematiques' } } : '/(tabs)/mathematiques') as Href
    },
    {
      key: 'physique',
      title: 'Physique',
      subtitle: 'Mouvement, forces, energie',
      accent: palette.blue,
      icon: 'science',
      href: (coursesExpanded ? { pathname: '/(tabs)/cours', params: { subject: 'physique' } } : '/(tabs)/physique') as Href
    },
    {
      key: 'java',
      title: 'Java',
      subtitle: 'Programmation et logique',
      accent: palette.copper,
      icon: 'code',
      href: (coursesExpanded ? { pathname: '/(tabs)/cours', params: { subject: 'java' } } : '/(tabs)/programmation-java') as Href
    }
  ];

  useEffect(() => {
    let isMounted = true;

    async function chargerDonneesAccueil() {
      await donneesLocales.init();

      if (!isMounted) {
        return;
      }

      const user = donneesLocales.obtenirUtilisateur();
      const courses = donneesLocales.obtenirCoursRecents();
      setUserName(user.name ?? 'Utilisateur');
      setUserAvatarUri(user.avatarUri);
      setUserLevel(user.level);
      setUserXp(user.xp);
      setActiveCourses(courses.filter((CoursLocal) => !CoursLocal.completed).length);
      setSettings(donneesLocales.obtenirParametres());
    }

    void chargerDonneesAccueil();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const isExpanded = expandedPanel !== null;
    Animated.timing(expandProgress, {
      duration: isExpanded ? 420 : 280,
      easing: isExpanded ? Easing.out(Easing.cubic) : Easing.inOut(Easing.ease),
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [expandedPanel, expandProgress]);

  useEffect(() => {
    if (expandedPanel === null) {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        animated: true,
        y: Math.max(featuresAnchorY + 180, 0),
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [expandedPanel, featuresAnchorY]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleDrift, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleDrift, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [bubbleDrift]);

  useEffect(() => {
    translationWebVignettesAccueil.setValue(0);
    requestAnimationFrame(() => {
      scrollVignettesRef.current?.scrollTo({
        animated: false,
        x: slotVignetteCourant.current * slideWidth,
      });
    });
  }, [slideWidth, translationWebVignettesAccueil]);

  const synchroniserPositionVignettesAccueil = useCallback(
    (realIndex: number) => {
      translationWebVignettesAccueil.setValue(0);
      indexVignetteAccueilCourant.current = realIndex;
      setIndexRenduVignetteAccueil(realIndex);
      setIndexPointVignetteAccueil(realIndex);
    },
    [translationWebVignettesAccueil],
  );

  const getStyleVignetteWeb = useCallback(
    (slideIndex: number) => {
      const offset = getCircularOffset(slideIndex, indexRenduVignetteAccueil);
      const basePosition = offset * slideWidth;
      const inputRange = [-slideWidth, 0, slideWidth];

      return {
        left: 0,
        opacity: translationWebVignettesAccueil.interpolate({
          inputRange,
          outputRange:
            offset === 0
              ? [0.34, 1, 0.34]
              : [offset === 1 ? 1 : 0.08, 0.34, offset === -1 ? 1 : 0.08],
          extrapolate: 'clamp',
        }),
        position: 'absolute' as const,
        transform: [
          {
            translateX: Animated.add(translationWebVignettesAccueil, basePosition),
          },
          {
            scale: translationWebVignettesAccueil.interpolate({
              inputRange,
              outputRange:
                offset === 0
                  ? [0.96, 1, 0.96]
                  : [offset === 1 ? 1 : 0.96, 0.96, offset === -1 ? 1 : 0.96],
              extrapolate: 'clamp',
            }),
          },
        ],
        zIndex: 2 - Math.abs(offset),
      };
    },
    [indexRenduVignetteAccueil, slideWidth, translationWebVignettesAccueil],
  );

  const animerVignetteWeb = useCallback(
    (translationCible: number, indexVignetteCible: number) => {
      const animationId = animationWebVignetteId.current + 1;
      animationWebVignetteId.current = animationId;
      indexVignetteCibleCourant.current = indexVignetteCible;

      setIndexPointVignetteAccueil(indexVignetteCible);
      translationWebVignettesAccueil.stopAnimation();
      Animated.spring(translationWebVignettesAccueil, {
        damping: 28,
        mass: 0.85,
        stiffness: 210,
        toValue: translationCible,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || animationWebVignetteId.current !== animationId) {
          return;
        }

        synchroniserPositionVignettesAccueil(indexVignetteCible);
      });
    },
    [synchroniserPositionVignettesAccueil, translationWebVignettesAccueil],
  );

  const cardWidth = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: isCompact ? [164, 194] : [286, 338],
  });

  const detailHeight = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isCompact ? 1120 : 520],
  });
  const detailOpacity = expandProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.2, 1],
  });
  const detailTranslateY = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
  });
  const simulationCardLift = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  function togglePanel(panel: 'cours' | 'simulations') {
    setExpandedPanel((current) => (current === panel ? null : panel));
  }

  function enregistrerParametres(nextSettings: ParametresApplication) {
    setSettings(nextSettings);
  }

  function renderFeatureCard({
    accent,
    expanded,
    footerText,
    icon,
    panel,
    subtitle,
    title,
  }: {
    accent: string;
    expanded: boolean;
    footerText: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    panel: FeaturePanel;
    subtitle: string;
    title: string;
  }) {
    const isSimulationCard = panel === 'simulations';

    return (
      <Animated.View
        key={panel}
        style={[
          styles.cardWrap,
          { transform: [{ translateY: simulationCardLift }], width: cardWidth },
        ]}>
        <Pressable
          onPress={() => togglePanel(panel)}
          style={({ hovered, pressed }) => [
            styles.card,
            isCompact ? styles.cardCompact : null,
            expandedPanel === null ? styles.cardDimmed : null,
            isSimulationCard ? styles.simulationCard : null,
            isDarkMode
              ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border }
              : null,
            expanded ? styles.simulationCardExpanded : null,
            hovered && expandedPanel === null ? styles.cardHovered : null,
            pressed ? styles.cardPressed : null,
          ]}>
          <View
            style={[
              styles.cardMedia,
              isCompact ? styles.cardMediaCompact : null,
              { backgroundColor: `${accent}20` },
            ]}>
            <View
              style={[
                styles.cardIconWrap,
                isCompact ? styles.cardIconWrapCompact : null,
                { backgroundColor: accent },
              ]}>
              <MaterialIcons name={icon} size={34} color={palette.ink} />
            </View>
          </View>

          <View style={[styles.cardText, isCompact ? styles.cardTextCompact : null]}>
            <Text
              style={[
                styles.cardTitle,
                isCompact ? styles.cardTitleCompact : null,
                isDarkMode ? { color: themeApplication.ink } : null,
              ]}>
              {title}
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                isCompact ? styles.cardSubtitleCompact : null,
                isDarkMode ? { color: palette.white } : null,
              ]}>
              {subtitle}
            </Text>
          </View>

          <View style={[styles.cardFooter, isCompact ? styles.cardFooterCompact : null]}>
            <Text
              style={[
                styles.cardFooterText,
                isCompact ? styles.cardFooterTextCompact : null,
                isDarkMode ? { color: palette.white } : null,
              ]}>
              {footerText}
            </Text>
            <MaterialIcons
              name={expanded ? 'expand-less' : 'chevron-right'}
              size={22}
              color={palette.slate}
            />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  const scrollToExplore = useCallback(() => {
    scrollRef.current?.scrollTo({
      animated: true,
      y: Math.max(featuresAnchorY - 16, 0),
    });
  }, [featuresAnchorY]);

  const defilerVersSlotVignette = useCallback(
    (slotCible: number, animated = true) => {
      slotVignetteCourant.current = slotCible;
      scrollVignettesRef.current?.scrollTo({
        animated,
        x: slotCible * slideWidth,
      });
    },
    [slideWidth],
  );

  const gererFinDefilementVignettes = useCallback(
    (offsetX: number) => {
      if (normalisationVignetteTimeout.current) {
        clearTimeout(normalisationVignetteTimeout.current);
        normalisationVignetteTimeout.current = null;
      }

      let slot = Math.round(offsetX / slideWidth);
      slot = Math.max(0, Math.min(ORDRE_DEFILEMENT_VIGNETTES.length - 1, slot));

      const indexReel = ORDRE_DEFILEMENT_VIGNETTES[slot];
      synchroniserPositionVignettesAccueil(indexReel);

      if (slot === 0) {
        slotVignetteCourant.current = 3;
        requestAnimationFrame(() => defilerVersSlotVignette(3, false));
        return;
      }

      if (slot === ORDRE_DEFILEMENT_VIGNETTES.length - 1) {
        slotVignetteCourant.current = 1;
        requestAnimationFrame(() => defilerVersSlotVignette(1, false));
        return;
      }

      slotVignetteCourant.current = slot;
    },
    [defilerVersSlotVignette, slideWidth, synchroniserPositionVignettesAccueil],
  );

  const gererDefilementVignettes = useCallback(
    (offsetX: number) => {
      const slot = Math.max(
        0,
        Math.min(ORDRE_DEFILEMENT_VIGNETTES.length - 1, Math.round(offsetX / slideWidth)),
      );
      const indexReel = ORDRE_DEFILEMENT_VIGNETTES[slot];

      if (indexPointVignetteAccueil !== indexReel) {
        setIndexPointVignetteAccueil(indexReel);
      }
    },
    [indexPointVignetteAccueil, slideWidth],
  );

  const scheduleAutoAdvance = useCallback(
    (nextIndex: number) => {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
      autoAdvanceTimeout.current = setTimeout(() => {
        const indexVignetteSuivante = wrapSlideIndex(nextIndex + 1);

        if (Platform.OS === 'web') {
          animerVignetteWeb(-slideWidth, indexVignetteSuivante);
          return;
        }

        const slotSuivant = slotVignetteCourant.current + 1;
        setIndexPointVignetteAccueil(indexVignetteSuivante);
        defilerVersSlotVignette(slotSuivant);
      }, 15000);
    },
    [animerVignetteWeb, defilerVersSlotVignette, slideWidth],
  );

  useEffect(() => {
    scheduleAutoAdvance(indexPointVignetteAccueil);
    return () => {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
    };
  }, [indexPointVignetteAccueil, scheduleAutoAdvance]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const reinitialiserVignettesApresVisibilite = () => {
      synchroniserPositionVignettesAccueil(indexVignetteAccueilCourant.current);
      scheduleAutoAdvance(indexVignetteAccueilCourant.current);
    };

    document.addEventListener('visibilitychange', reinitialiserVignettesApresVisibilite);
    window.addEventListener('blur', reinitialiserVignettesApresVisibilite);

    return () => {
      document.removeEventListener('visibilitychange', reinitialiserVignettesApresVisibilite);
      window.removeEventListener('blur', reinitialiserVignettesApresVisibilite);
    };
  }, [scheduleAutoAdvance, synchroniserPositionVignettesAccueil]);

  const gestionGlisserSourisVignettes = useMemo(
    () =>
      Platform.OS === 'web'
        ? PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
              Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
            onPanResponderGrant: () => {
              if (autoAdvanceTimeout.current) {
                clearTimeout(autoAdvanceTimeout.current);
                autoAdvanceTimeout.current = null;
              }
              animationWebVignetteId.current += 1;
              if (indexVignetteAccueilCourant.current !== indexVignetteCibleCourant.current) {
                synchroniserPositionVignettesAccueil(indexVignetteCibleCourant.current);
              }
              translationWebVignettesAccueil.stopAnimation();
            },
            onPanResponderMove: (_, gestureState) => {
              translationWebVignettesAccueil.setValue(
                Math.max(-slideWidth - 36, Math.min(slideWidth + 36, gestureState.dx)),
              );
            },
            onPanResponderRelease: (_, gestureState) => {
              const seuil = slideWidth * 0.18;
              let translationCible = 0;
              let indexVignetteCible = indexVignetteAccueilCourant.current;

              if (gestureState.dx <= -seuil || gestureState.vx <= -0.45) {
                translationCible = -slideWidth;
                indexVignetteCible = wrapSlideIndex(indexVignetteAccueilCourant.current + 1);
              } else if (gestureState.dx >= seuil || gestureState.vx >= 0.45) {
                translationCible = slideWidth;
                indexVignetteCible = wrapSlideIndex(indexVignetteAccueilCourant.current - 1);
              }

              if (translationCible === 0) {
                setIndexPointVignetteAccueil(indexVignetteAccueilCourant.current);
              }
              animerVignetteWeb(translationCible, indexVignetteCible);
            },
            onPanResponderTerminate: () => {
              animerVignetteWeb(0, indexVignetteAccueilCourant.current);
            },
          })
        : null,
    [animerVignetteWeb, slideWidth, synchroniserPositionVignettesAccueil, translationWebVignettesAccueil],
  );

  function renderVignetteAccueil(realIndex: number, slotKey: string, animatedStyle: any = null) {
    if (realIndex === 0) {
      return (
        <VignetteAccueilMarque
          key={slotKey}
          animatedStyle={animatedStyle}
          bubbles={bubblesMarque}
          driftProgress={bubbleDrift}
          isCompact={isCompact}
          isDarkMode={isDarkMode}
          onExplore={scrollToExplore}
          panelHeight={hauteurPanneauAccueil}
          slideWidth={slideWidth}
          themeApplication={themeApplication}
        />
      );
    }

    if (realIndex === 1) {
      return (
        <VignetteAccueilAPropos
          key={slotKey}
          animatedStyle={animatedStyle}
          bubbles={bubblesAPropos}
          driftProgress={bubbleDrift}
          isCompact={isCompact}
          isDarkMode={isDarkMode}
          onExplore={scrollToExplore}
          panelHeight={hauteurPanneauAccueil}
          slideWidth={slideWidth}
          themeApplication={themeApplication}
        />
      );
    }

    return (
      <VignetteAccueilProfil
        key={slotKey}
        activeCourses={activeCourses}
        animatedStyle={animatedStyle}
        bubbles={bubblesProfil}
        driftProgress={bubbleDrift}
        isCompact={isCompact}
        isDarkMode={isDarkMode}
        level={userLevel}
        avatarUri={userAvatarUri}
        onExplore={scrollToExplore}
        panelHeight={hauteurPanneauAccueil}
        slideWidth={slideWidth}
        themeApplication={themeApplication}
        userName={userName}
        xp={userXp}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeApplication.background }]}>
      <PanneauParametres
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={enregistrerParametres}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: themeApplication.background }]}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.zoneVignettesAccueil, { backgroundColor: themeApplication.background }]}>
          <View style={styles.homeProfileRow}>
            <View style={styles.homeProfileSpacer} />
            <Pressable
              hitSlop={8}
              onPress={() => setSettingsOpen(true)}
              style={[
                styles.menuButton,
                STYLE_BOUTON_CLIQUABLE_WEB,
                isCompact ? styles.menuButtonCompact : null,
                isDarkMode ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
              ]}>
              <View style={[styles.menuIconWrapper, STYLE_VISUEL_NON_CLIQUABLE_WEB]}>
                <View style={[styles.menuIconBar, { backgroundColor: isDarkMode ? themeApplication.ink : palette.ink }]} />
                <View style={[styles.menuIconBar, { backgroundColor: isDarkMode ? themeApplication.ink : palette.ink }]} />
                <View style={[styles.menuIconBar, { backgroundColor: isDarkMode ? themeApplication.ink : palette.ink }]} />
              </View>
            </Pressable>
          </View>

          <View
            {...(gestionGlisserSourisVignettes?.panHandlers ?? {})}
            style={styles.fenetreVignettesAccueil}>
            {Platform.OS === 'web' ? (
              <View style={{ height: hauteurPanneauAccueil, width: slideWidth }}>
                {[0, 1, 2].map((realIndex) =>
                  renderVignetteAccueil(
                    realIndex,
                    `vignette-accueil-web-${realIndex}`,
                    getStyleVignetteWeb(realIndex),
                  ),
                )}
              </View>
            ) : (
              <ScrollView
                contentOffset={{ x: SLOT_DEPART_VIGNETTES * slideWidth, y: 0 }}
                decelerationRate="fast"
                horizontal
                onMomentumScrollEnd={(event) => gererFinDefilementVignettes(event.nativeEvent.contentOffset.x)}
                onScroll={(event) => gererDefilementVignettes(event.nativeEvent.contentOffset.x)}
                onScrollBeginDrag={() => {
                  if (autoAdvanceTimeout.current) {
                    clearTimeout(autoAdvanceTimeout.current);
                    autoAdvanceTimeout.current = null;
                  }
                }}
                pagingEnabled
                ref={scrollVignettesRef}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                style={{ height: hauteurPanneauAccueil, width: slideWidth }}>
                {ORDRE_DEFILEMENT_VIGNETTES.map((realIndex, slotIndex) =>
                  renderVignetteAccueil(realIndex, `vignette-accueil-slot-${slotIndex}`),
                )}
              </ScrollView>
            )}
          </View>

          <View style={styles.rangeePointsAccueil}>
            {[0, 1, 2].map((index) => (
              <View key={`dot-${index}`} style={[styles.pointAccueil, indexPointVignetteAccueil === index ? styles.pointAccueilActif : null]} />
            ))}
          </View>
        </View>

        <View
          onLayout={(event) => setFeaturesAnchorY(event.nativeEvent.layout.y)}
          style={[styles.featuresSection, isCompact ? styles.featuresSectionCompact : null]}>
          <View style={[styles.cardsGrid, isCompact ? styles.cardsGridCompact : null]}>
            {renderFeatureCard({
              accent: palette.yellow,
              expanded: coursesExpanded,
              footerText: coursesExpanded ? 'Refermer' : 'Ouvrir',
              icon: 'menu-book',
              panel: 'cours',
              subtitle: coursesExpanded ? 'Choisis une matiere' : 'Explorer les matieres',
              title: 'Cours',
            })}
            {renderFeatureCard({
              accent: palette.blue,
              expanded: simulationsExpanded,
              footerText: simulationsExpanded ? 'Refermer' : 'Ouvrir',
              icon: 'bolt',
              panel: 'simulations',
              subtitle: simulationsExpanded ? 'Choisis une section' : 'Explorer les sections',
              title: 'Simulations',
            })}
          </View>

          <Animated.View
            style={[
              styles.sectionReveal,
              isCompact ? styles.sectionRevealCompact : null,
              { height: detailHeight, opacity: detailOpacity, transform: [{ translateY: detailTranslateY }] },
            ]}>
            <View style={[
              styles.sectionPanel,
              isCompact ? styles.sectionPanelCompact : null,
              isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null,
            ]}>
              <View style={[styles.sectionPanelHeader, isCompact ? styles.sectionPanelHeaderCompact : null]}>
                <Text style={[styles.sectionEyebrow, isCompact ? styles.sectionEyebrowCompact : null, isDarkMode ? { color: themeApplication.muted } : null]}>{expandedEyebrow}</Text>
                <Text style={[styles.sectionTitle, isCompact ? styles.sectionTitleCompact : null, isDarkMode ? { color: themeApplication.text } : null]}>{expandedTitle}</Text>
              </View>

              <View style={[styles.sectionCardsGrid, isCompact ? styles.sectionCardsGridCompact : null]}>
                {expandedCards.map((card) => (
                  <Pressable
                    key={card.key}
                    onPress={() => router.push(card.href)}
                    style={({ hovered, pressed }) => [
                      styles.sectionCard,
                      isCompact ? styles.sectionCardCompact : null,
                      isDarkMode ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
                      pressed || hovered ? styles.sectionCardPressed : null,
                    ]}>
                    <View style={[styles.sectionCardMedia, isCompact ? styles.sectionCardMediaCompact : null, { backgroundColor: `${card.accent}20` }]}>
                      <View style={[styles.sectionCardIcon, isCompact ? styles.sectionCardIconCompact : null, { backgroundColor: card.accent }]}>
                        <MaterialIcons name={card.icon as never} size={42} color={palette.ink} />
                      </View>
                    </View>
                    <Text style={[styles.sectionCardTitle, isCompact ? styles.sectionCardTitleCompact : null, isDarkMode ? { color: themeApplication.ink } : null]}>{card.title}</Text>
                    <Text style={[styles.sectionCardSubtitle, isCompact ? styles.sectionCardSubtitleCompact : null, isDarkMode ? { color: palette.white } : null]}>{card.subtitle}</Text>
                    <View style={[styles.sectionCardFooter, isCompact ? styles.sectionCardFooterCompact : null]}>
                      <Text style={[styles.sectionCardFooterText, isCompact ? styles.sectionCardFooterTextCompact : null, isDarkMode ? { color: palette.white } : null]}>Entrer</Text>
                      <MaterialIcons name="chevron-right" size={24} color={palette.slate} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VignetteAccueilMarque({ animatedStyle, bubbles, driftProgress, isCompact, isDarkMode, onExplore, panelHeight, slideWidth, themeApplication }: PropsVignetteAccueil) {
  return (
    <Animated.View style={[styles.vignetteAccueil, { width: slideWidth }, animatedStyle]}>
      <View
        style={[
          styles.panneauAccueil,
          isCompact ? styles.panneauAccueilCompact : null,
          isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border, borderWidth: 1 } : null,
          { height: panelHeight, minHeight: panelHeight },
        ]}>
        {bubbles.map((bubble, index) => (
          <Animated.View
            key={`brand-bubble-${index}`}
            style={[
              styles.cadreBulleAccueil,
              {
                left: bubble.left,
                top: bubble.top,
                transform: [
                  {
                    translateX: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 4) + 2) * 2, ((index % 4) + 2) * 2],
                    }),
                  },
                  {
                    translateY: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 5) + 2) * 2, ((index % 5) + 2) * 2],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.bulleAccueil,
                { height: bubble.height, opacity: bubble.opacity, width: bubble.width },
              ]}
            />
          </Animated.View>
        ))}
        <View style={[styles.blocTexteAccueil, isCompact ? styles.blocTexteAccueilCompact : null]}>
          <Text style={[styles.eyebrow, isCompact ? styles.eyebrowCompact : null, isDarkMode ? { color: themeApplication.muted } : null]}>Accueil Evidex</Text>
          <Text style={[styles.titreAccueil, isCompact ? styles.titreAccueilCompact : null, isDarkMode ? { color: themeApplication.text } : null]}>Ton espace</Text>
          <Text style={[styles.titreAccueil, isCompact ? styles.titreAccueilCompact : null, isDarkMode ? { color: themeApplication.text } : null]}>d&apos;apprentissage</Text>
        </View>
        <View style={[styles.logoStage, isCompact ? styles.logoStageCompact : null]}>
          <View style={[styles.logoAura, isCompact ? styles.logoAuraCompact : null]}/>
          <LogoEvidexe resizeMode="contain" style={[styles.logoImage, isCompact ? styles.logoImageCompact : null]}/>
        </View>
        <Pressable onPress={onExplore} style={[styles.boutonExplorerAccueil, styles.boutonExplorerAccueilFlottant, isCompact ? styles.boutonExplorerAccueilCompact : null]}>
          <Text style={[styles.texteBoutonExplorerAccueil, isCompact ? styles.texteBoutonExplorerAccueilCompact : null]}>Explorer</Text>
          <MaterialIcons name="south" size={20} color={palette.ink} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function VignetteAccueilAPropos({ animatedStyle, bubbles, driftProgress, isCompact, isDarkMode, onExplore, panelHeight, slideWidth, themeApplication }: PropsVignetteAccueil) {
  return (
    <Animated.View style={[styles.vignetteAccueil, { width: slideWidth }, animatedStyle]}>
      <View
        style={[
          styles.panneauAccueil,
          styles.panneauAccueilSecondaire,
          isCompact ? styles.panneauAccueilCompact : null,
          isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border, borderWidth: 1 } : null,
          { height: panelHeight, minHeight: panelHeight },
        ]}>
        {bubbles.map((bubble, index) => (
          <Animated.View
            key={`about-bubble-${index}`}
            style={[
              styles.cadreBulleAccueil,
              {
                left: bubble.left,
                top: bubble.top,
                transform: [
                  {
                    translateX: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 3) + 2) * 2, ((index % 3) + 2) * 2],
                    }),
                  },
                  {
                    translateY: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 4) + 2) * 2, ((index % 4) + 2) * 2],
                    }),
                  },
                ],
              },
            ]}>
            <View style={[styles.bulleAccueil, { height: bubble.height, opacity: bubble.opacity, width: bubble.width }]} />
          </Animated.View>
        ))}
        <View style={[styles.aboutLayout, isCompact ? styles.aboutLayoutCompact : null]}>
          <View style={[styles.aboutCopyBlock, isCompact ? styles.aboutCopyBlockCompact : null]}>
            <Text style={[styles.eyebrow, isCompact ? styles.eyebrowCompact : null, isDarkMode ? { color: themeApplication.muted } : null]}>A propos</Text>
            <Text style={[styles.aboutTitle, isCompact ? styles.aboutTitleCompact : null, isDarkMode ? { color: themeApplication.text } : null]}>Evidex rassemble cours, progression et simulations.</Text>
            <Text style={[styles.aboutText, isCompact ? styles.aboutTextCompact : null, isDarkMode ? { color: themeApplication.muted } : null]}>
              Un seul espace pour apprendre, tester des idees et suivre ce qui compte vraiment dans ton parcours.
            </Text>
            <View style={[styles.aboutHighlights, isCompact ? styles.aboutHighlightsCompact : null]}>
              <View style={styles.aboutChip}>
                <MaterialIcons name="menu-book" size={18} color={palette.charcoal} />
                <Text style={styles.aboutChipText}>Cours</Text>
              </View>
              <View style={styles.aboutChip}>
                <MaterialIcons name="bolt" size={18} color={palette.charcoal} />
                <Text style={styles.aboutChipText}>Simulations</Text>
              </View>
            </View>
          </View>
          <View style={[styles.studyImageShell, isCompact ? styles.studyImageShellCompact : null]}>
            <View style={[styles.studyGlow, isCompact ? styles.studyGlowCompact : null]} />
            <Image resizeMode="cover" source={studyingBoy} style={[styles.studyImage, isCompact ? styles.studyImageCompact : null]} />
          </View>
        </View>
        <Pressable onPress={onExplore} style={[styles.boutonExplorerAccueil, styles.boutonExplorerAccueilFlottant, isCompact ? styles.boutonExplorerAccueilCompact : null]}>
          <Text style={[styles.texteBoutonExplorerAccueil, isCompact ? styles.texteBoutonExplorerAccueilCompact : null]}>Explorer</Text>
          <MaterialIcons name="south" size={20} color={palette.ink} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function VignetteAccueilProfil({ activeCourses, animatedStyle, avatarUri, bubbles, driftProgress, isCompact, isDarkMode, level, onExplore, panelHeight, slideWidth, themeApplication, userName, xp }: PropsVignetteProfilAccueil) {
  return (
    <Animated.View style={[styles.vignetteAccueil, { width: slideWidth }, animatedStyle]}>
      <View
        style={[
          styles.panneauAccueil,
          styles.panneauAccueilSecondaire,
          isCompact ? styles.panneauAccueilCompact : null,
          isDarkMode ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border, borderWidth: 1 } : null,
          { height: panelHeight, minHeight: panelHeight },
        ]}>
        {bubbles.map((bubble, index) => (
          <Animated.View
            key={`profile-bubble-${index}`}
            style={[
              styles.cadreBulleAccueil,
              {
                left: bubble.left,
                top: bubble.top,
                transform: [
                  {
                    translateX: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 3) + 2) * 2, ((index % 3) + 2) * 2],
                    }),
                  },
                  {
                    translateY: driftProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-((index % 4) + 2) * 2, ((index % 4) + 2) * 2],
                    }),
                  },
                ],
              },
            ]}>
            <View style={[styles.bulleAccueil, { height: bubble.height, opacity: bubble.opacity, width: bubble.width }]} />
          </Animated.View>
        ))}
        <View style={[styles.enTeteApercuProfilAccueil, isCompact ? styles.enTeteApercuProfilAccueilCompact : null]}>
          <Text style={[styles.eyebrow, isCompact ? styles.eyebrowCompact : null,isDarkMode ? { color: themeApplication.muted } : null]}>Profil en bref</Text>
          <Text style={[
              styles.titreApercuProfilAccueil,
            isCompact ? styles.titreApercuProfilAccueilCompact : null,
            isDarkMode ? { color: themeApplication.text } : null]}>Un apercu rapide de ta progression</Text>
        </View>
        <View style={[styles.profilePreviewCard, isCompact ? styles.profilePreviewCardCompact : null]}>
          <View style={styles.profileBadgeRow}>
            <View style={styles.profileAvatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.profileAvatarImage} />
              ) : (
                <MaterialIcons name="person" size={24} color={palette.white} />
              )}
            </View>
            <View>
              <Text style={[styles.profileName, isCompact ? styles.profileNameCompact : null]}>{userName}</Text>
            </View>
          </View>
          <View style={[styles.profileStatsGrid, isCompact ? styles.profileStatsGridCompact : null]}>
            <View style={[styles.profileStatCard, isCompact ? styles.profileStatCardCompact : null]}>
              <Text style={[styles.profileStatValue, { color: palette.blue }]}>{level}</Text>
              <Text style={styles.profileStatLabel}>Niveau</Text>
            </View>
            <View style={[styles.profileStatCard, isCompact ? styles.profileStatCardCompact : null]}>
              <Text style={[styles.profileStatValue, { color: palette.yellow }]}>{xp}</Text>
              <Text style={styles.profileStatLabel}>XP</Text>
            </View>
            <View style={[styles.profileStatCard, isCompact ? styles.profileStatCardCompact : null]}>
              <Text style={[styles.profileStatValue, { color: palette.green }]}>{activeCourses}</Text>
              <Text style={styles.profileStatLabel}>Cours actifs</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={onExplore} style={[styles.boutonExplorerAccueil, styles.boutonExplorerAccueilFlottant, isCompact ? styles.boutonExplorerAccueilCompact : null]}>
          <Text style={[styles.texteBoutonExplorerAccueil, isCompact ? styles.texteBoutonExplorerAccueilCompact : null]}>Explorer</Text>
          <MaterialIcons name="south" size={20} color={palette.ink} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

type PropsVignetteProfilAccueil = PropsVignetteAccueil & {
  activeCourses: number;
  avatarUri?: string;
  level: number;
  userName: string;
  xp: number;
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.cream, flex: 1 },
  content: { backgroundColor: palette.cream, paddingBottom: 56 },
  zoneVignettesAccueil: { backgroundColor: palette.cream, paddingHorizontal: 22, paddingTop: 8, position: 'relative' },
  homeProfileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  homeProfileSpacer: {
    height: 44,
    width: 44,
  },
  fenetreVignettesAccueil: { overflow: 'hidden' },
  pisteVignettesAccueil: {
    flexDirection: 'row',
    userSelect: 'none',
  },
  vignetteAccueil: {
    paddingRight: 12,
    userSelect: 'none',
  },
  panneauAccueil: {
    backgroundColor: palette.sage,
    borderRadius: 38,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 18,
    position: 'relative',
    userSelect: 'none',
  },
  panneauAccueilSecondaire: { backgroundColor: palette.sageDeep },
  panneauAccueilCompact: {
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bulleAccueil: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    borderWidth: 1,
  },
  cadreBulleAccueil: {
    position: 'absolute',
  },
  blocTexteAccueil: { alignItems: 'center', marginTop: 20 },
  blocTexteAccueilCompact: { marginTop: 44 },
  rangeePointsAccueil: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 24,
    zIndex: 5,
  },
  pointAccueil: { backgroundColor: 'rgba(32,36,43,0.18)', borderRadius: 999, height: 8, width: 8 },
  pointAccueilActif: { backgroundColor: palette.charcoal, width: 24 },
  menuButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(32,36,43,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
    zIndex: 50,
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
  menuButtonCompact: {
    height: 40,
    width: 40,
  },
  eyebrow: {
    color: 'rgba(25,25,31,0.55)',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  eyebrowCompact: {
    fontSize: 12,
    marginBottom: 8,
  },
  titreAccueil: { color: palette.ink, fontSize: 44, fontWeight: '900', lineHeight: 46, textAlign: 'center' },
  titreAccueilCompact: {
    fontSize: 28,
    lineHeight: 31,
    maxWidth: 280,
  },
  accountChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(32,36,43,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accountText: { color: palette.ink, fontSize: 14, fontWeight: '800', userSelect: 'none' },
  accountChipCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoStage: {
    alignItems: 'center',
    alignSelf: 'center',
    height: 260,
    justifyContent: 'center',
    marginTop: 30,
    position: 'relative',
    width: '100%',
  },
  logoStageCompact: {
    height: 200,
    marginTop: 26,
  },
  logoAura: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 220,
    height: 250,
    position: 'absolute',
    top: 2,
    width: 320,
  },
  logoAuraCompact: {
    borderRadius: 160,
    height: 196,
    width: 250,
  },
  logoImage: { height: 164, width: '96%' },
  logoImageCompact: {
    height: 108,
    width: '82%',
  },
  boutonExplorerAccueil: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(32,36,43,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  boutonExplorerAccueilFlottant: {
    bottom: 24,
    marginTop: 0,
    position: 'absolute',
  },
  boutonExplorerAccueilCompact: {
    bottom: 18,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  texteBoutonExplorerAccueil: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  texteBoutonExplorerAccueilCompact: {
    fontSize: 13,
  },
  aboutLayout: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingBottom: 36,
    paddingTop: 42,
  },
  aboutLayoutCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 18,
    justifyContent: 'flex-start',
    paddingBottom: 28,
    paddingTop: 52,
  },
  aboutCopyBlock: { flex: 0.9, maxWidth: 360, paddingLeft: 10 },
  aboutCopyBlockCompact: {
    flex: 0,
    maxWidth: '100%',
    paddingLeft: 0,
  },
  aboutTitle: { color: palette.ink, fontSize: 34, fontWeight: '900', lineHeight: 40 },
  aboutTitleCompact: {
    fontSize: 26,
    lineHeight: 31,
    textAlign: 'center',
  },
  aboutText: { color: 'rgba(32,36,43,0.76)', fontSize: 17, fontWeight: '600', lineHeight: 25, marginTop: 16 },
  aboutTextCompact: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  aboutHighlights: { flexDirection: 'row', gap: 10, marginTop: 20 },
  aboutHighlightsCompact: {
    justifyContent: 'center',
    marginTop: 16,
  },
  aboutChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(32,36,43,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aboutChipText: { color: palette.charcoal, fontSize: 14, fontWeight: '800' },
  studyImageShell: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    borderColor: 'rgba(255,255,255,0.76)',
    borderRadius: 24,
    borderWidth: 3,
    flex: 1.15,
    justifyContent: 'center',
    minWidth: 320,
    overflow: 'hidden',
    position: 'relative',
  },
  studyImageShellCompact: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 22,
    flex: 0,
    height: 230,
    minWidth: 0,
    overflow: 'hidden',
    width: '100%',
  },
  studyGlow: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 220,
    height: 320,
    position: 'absolute',
    right: 18,
    width: 320,
  },
  studyGlowCompact: {
    height: 220,
    right: undefined,
    width: 220,
  },
  studyImage: {
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    width: '100%',
  },
  studyImageCompact: {
    height: '100%',
    width: '100%',
  },
  enTeteApercuProfilAccueil: { alignItems: 'center', paddingTop: 46 },
  enTeteApercuProfilAccueilCompact: { paddingTop: 54 },
  titreApercuProfilAccueil: { color: palette.ink, fontSize: 34, fontWeight: '900', lineHeight: 40, maxWidth: 520, textAlign: 'center' },
  titreApercuProfilAccueilCompact: {
    fontSize: 26,
    lineHeight: 31,
    maxWidth: 280,
  },
  profilePreviewCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(73,81,77,0.34)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    borderWidth: 1,
    marginTop: 34,
    maxWidth: 560,
    padding: 22,
    width: '100%',
  },
  profilePreviewCardCompact: {
    marginBottom: 28,
    marginTop: 20,
    padding: 16,
  },
  profileBadgeRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  profileAvatar: { alignItems: 'center', backgroundColor: palette.blue, borderRadius: 24, height: 48, justifyContent: 'center', overflow: 'hidden', width: 48 },
  profileAvatarImage: { height: '100%', width: '100%' },
  profileName: { color: palette.ink, fontSize: 18, fontWeight: '900' },
  profileNameCompact: {
    fontSize: 16,
  },
  profileStatsGrid: { flexDirection: 'row', gap: 12, marginTop: 20 },
  profileStatsGridCompact: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 14,
  },
  profileStatCard: { alignItems: 'center', backgroundColor: palette.cream, borderColor: '#E2DACB', borderRadius: 20, borderWidth: 1, flex: 1, padding: 18 },
  profileStatCardCompact: {
    flex: 0,
    minHeight: 78,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  profileStatValue: { fontSize: 30, fontWeight: '900' },
  profileStatLabel: { color: palette.slate, fontSize: 13, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  featuresSection: { alignItems: 'center', marginTop: 54, paddingHorizontal: 16 },
  featuresSectionCompact: {
    marginTop: 28,
    paddingHorizontal: 12,
  },
  symbolField: {
    backgroundColor: 'transparent',
    bottom: 16,
    left: 10,
    overflow: 'hidden',
    position: 'absolute',
    right: 10,
    top: 122,
    zIndex: 0,
  },
  symbolFieldCompact: {
    bottom: 12,
    left: 8,
    right: 8,
    top: 104,
  },
  cardsGrid: { alignItems: 'flex-end', flexDirection: 'row', gap: 16, justifyContent: 'center', width: '100%', zIndex: 1 },
  cardsGridCompact: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  cardWrap: { overflow: 'visible' },
  card: {
    alignItems: 'stretch',
    backgroundColor: palette.cream,
    borderColor: '#E2DACB',
    borderRadius: 26,
    borderWidth: 1,
    elevation: 2,
    minHeight: 430,
    paddingBottom: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: '100%',
  },
  cardCompact: {
    minHeight: 272,
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  cardDisabled: { opacity: 0.84 },
  simulationCard: { borderColor: 'rgba(126,166,224,0.3)' },
  simulationCardExpanded: { shadowOpacity: 0.14, shadowRadius: 22 },
  cardHovered: { opacity: 1, transform: [{ scale: 1.06 }] },
  cardDimmed: {
    backgroundColor: '#E6EDE3',
    borderColor: '#D6E0D2',
    shadowOpacity: 0.04,
    transform: [{ scale: 0.93 }],
  },
  cardPressed: { transform: [{ scale: 1.02 }] },
  cardMedia: { alignItems: 'center', borderRadius: 24, height: 226, justifyContent: 'center' },
  cardMediaCompact: {
    height: 122,
  },
  cardIconWrap: { alignItems: 'center', borderRadius: 22, height: 116, justifyContent: 'center', width: 116 },
  cardIconWrapCompact: {
    borderRadius: 16,
    height: 64,
    width: 64,
  },
  cardText: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 4, paddingTop: 18 },
  cardTextCompact: {
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  cardTitle: { color: palette.ink, fontSize: 38, fontWeight: '900', textAlign: 'center' },
  cardTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  cardSubtitle: { color: palette.slate, fontSize: 18, fontWeight: '700', lineHeight: 24, marginTop: 10, textAlign: 'center' },
  cardSubtitleCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  cardFooter: { alignItems: 'center', borderTopColor: '#E2DACB', borderTopWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 14 },
  cardFooterCompact: {
    paddingTop: 10,
  },
  cardFooterText: { color: palette.slate, fontSize: 16, fontWeight: '800' },
  cardFooterTextCompact: {
    fontSize: 13,
  },
  sectionReveal: { marginTop: 18, overflow: 'hidden', width: '100%' },
  sectionRevealCompact: {
    marginTop: 12,
  },
  sectionPanel: { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(184,199,177,0.5)', borderRadius: 34, borderWidth: 1, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 20 },
  sectionPanelCompact: {
    borderRadius: 24,
    paddingBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  sectionPanelHeader: { alignItems: 'center', marginBottom: 18 },
  sectionPanelHeaderCompact: {
    marginBottom: 12,
  },
  sectionEyebrow: { color: palette.slate, fontSize: 13, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  sectionEyebrowCompact: {
    fontSize: 11,
  },
  sectionTitle: { color: palette.ink, fontSize: 28, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  sectionTitleCompact: {
    fontSize: 22,
    marginTop: 4,
  },
  sectionCardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  sectionCardsGridCompact: {
    gap: 12,
  },
  sectionCard: { backgroundColor: palette.cream, borderColor: '#E2DACB', borderRadius: 30, borderWidth: 1, minHeight: 330, paddingBottom: 20, paddingHorizontal: 18, paddingTop: 18, shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, width: 250 },
  sectionCardCompact: {
    minHeight: 250,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    width: '100%',
  },
  sectionCardPressed: { transform: [{ scale: 1.02 }] },
  sectionCardMedia: { alignItems: 'center', borderRadius: 24, height: 170, justifyContent: 'center' },
  sectionCardMediaCompact: {
    height: 120,
  },
  sectionCardIcon: { alignItems: 'center', borderRadius: 24, height: 110, justifyContent: 'center', width: 110 },
  sectionCardIconCompact: {
    borderRadius: 18,
    height: 74,
    width: 74,
  },
  sectionCardTitle: { color: palette.ink, fontSize: 32, fontWeight: '900', marginTop: 22, textAlign: 'center' },
  sectionCardTitleCompact: {
    fontSize: 24,
    marginTop: 14,
  },
  sectionCardSubtitle: { color: palette.slate, fontSize: 16, fontWeight: '700', lineHeight: 22, marginTop: 8, textAlign: 'center' },
  sectionCardSubtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionCardFooter: { alignItems: 'center', borderTopColor: '#E2DACB', borderTopWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 20, paddingTop: 14 },
  sectionCardFooterCompact: {
    marginTop: 14,
    paddingTop: 10,
  },
  sectionCardFooterText: { color: palette.slate, fontSize: 16, fontWeight: '800' },
  sectionCardFooterTextCompact: {
    fontSize: 14,
  },
});

