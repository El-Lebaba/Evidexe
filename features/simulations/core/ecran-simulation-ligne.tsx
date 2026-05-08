import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication, obtenirThemesSimulationEcrans } from '@/constantes/theme';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type DomaineSimulation = 'mathematiques' | 'physique' | 'programmation-java';

type ProprietesEcranSimulationLigne = {
  domaine: DomaineSimulation;
  titre: string;
};

type NomIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

const themeBase = obtenirThemeApplication(false);

const DETAILS_DOMAINE: Record<
  DomaineSimulation,
  {
    cheminRetour: Href;
    couleurAccent: string;
    couleurDouce: string;
    description: string;
    icone: NomIcone;
    libelle: string;
    motif: string[];
  }
> = {
  mathematiques: {
    cheminRetour: '/(tabs)/mathematiques' as Href,
    couleurAccent: themeBase.blue,
    couleurDouce: themeBase.cardDark,
    description: 'Une nouvelle visualisation interactive est en construction pour rendre ce concept plus clair.',
    icone: 'function-variant',
    libelle: 'Mathematiques',
    motif: ['f(x)', 'dx', 'Somme', 'pi', 'infini'],
  },
  physique: {
    cheminRetour: '/(tabs)/physique' as Href,
    couleurAccent: themeBase.green,
    couleurDouce: themeBase.cardDark,
    description: 'Le laboratoire est presque pret: schema, controles et animation arrivent dans une prochaine version.',
    icone: 'atom',
    libelle: 'Physique',
    motif: ['F', 'v', 'a', 'E', 'lambda'],
  },
  'programmation-java': {
    cheminRetour: '/(tabs)/programmation-java' as Href,
    couleurAccent: themeBase.orange,
    couleurDouce: themeBase.cardDark,
    description: 'Un atelier Java est en preparation avec une logique pas a pas et des essais interactifs.',
    icone: 'code-braces',
    libelle: 'Java',
    motif: ['{ }', 'if', 'for', 'new', ';'],
  },
};

export function EcranSimulationLigne({ titre, domaine }: ProprietesEcranSimulationLigne) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const themeSimulationJava = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  const defilementY = useRef(new Animated.Value(0)).current;
  const pulsation = useRef(new Animated.Value(0)).current;
  const detailDomaine = DETAILS_DOMAINE[domaine];
  const couleurs =
    domaine === 'programmation-java'
      ? {
          accent: themeSimulationJava.accent,
          background: themeSimulationJava.background,
          border: themeSimulationJava.border,
          cardText: themeSimulationJava.mutedInk,
          halo: themeSimulationJava.approximation,
          ink: themeSimulationJava.ink,
          panel: themeSimulationJava.panel,
          soft: themeSimulationJava.surface,
        }
      : {
          accent: detailDomaine.couleurAccent,
          background: themeActif.background,
          border: themeActif.border,
          cardText: themeActif.cardText,
          halo: modeSombre ? themeActif.cardDark : detailDomaine.couleurDouce,
          ink: themeActif.ink,
          panel: themeActif.panel,
          soft: themeActif.soft,
        };

  useEffect(() => {
    const animationPulsation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulsation, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulsation, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animationPulsation.start();

    return () => {
      animationPulsation.stop();
    };
  }, [pulsation]);

  const deplacementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });
  const opaciteEntete = defilementY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 1, 1],
    extrapolate: 'clamp',
  });
  const echelleHalo = pulsation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const opaciteHalo = pulsation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.38],
  });

  return (
    <SafeAreaView edges={[]} style={[styles.safeArea, { backgroundColor: couleurs.background }]}>
      <VueTheme
        darkColor={couleurs.background}
        lightColor={couleurs.background}
        style={[styles.container, { backgroundColor: couleurs.background }]}>
        <Animated.View
          style={[
            styles.superpositionEntete,
            {
              opacity: opaciteEntete,
              transform: [{ translateY: deplacementEnteteY }],
            },
          ]}>
          <EnteteEcranSimulation titre={titre} domaine={domaine} />
        </Animated.View>
        <Animated.ScrollView
          contentContainerStyle={styles.contenuDefilement}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: defilementY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <VueTheme
            darkColor={couleurs.background}
            lightColor={couleurs.background}
            style={[styles.contenu, { backgroundColor: couleurs.background }]}>
            <View
              style={[
                styles.vitrine,
                { backgroundColor: couleurs.panel, borderColor: couleurs.border },
              ]}>
              <View style={styles.motif}>
                {detailDomaine.motif.map((symbole, index) => (
                  <TexteTheme
                    key={`${symbole}-${index}`}
                    darkColor={couleurs.ink}
                    lightColor={couleurs.ink}
                    style={[
                      styles.symbole,
                      {
                        color: couleurs.ink,
                        left: `${10 + index * 18}%`,
                        top: index % 2 === 0 ? 20 : 72,
                      },
                    ]}>
                    {symbole}
                  </TexteTheme>
                ))}
              </View>

              <Animated.View
                style={[
                  styles.halo,
                  {
                    backgroundColor: couleurs.halo,
                    opacity: opaciteHalo,
                    transform: [{ scale: echelleHalo }],
                  },
                ]}
              />

              <View
                style={[
                  styles.cercleIcone,
                  { backgroundColor: couleurs.halo, borderColor: couleurs.border },
                ]}>
                <MaterialCommunityIcons color={couleurs.accent} name={detailDomaine.icone} size={52} />
              </View>

              <View
                style={[
                  styles.badgeDomaine,
                  { backgroundColor: couleurs.soft, borderColor: couleurs.border },
                ]}>
                <MaterialCommunityIcons color={couleurs.ink} name="timer-sand" size={16} />
                <TexteTheme
                  darkColor={couleurs.ink}
                  lightColor={couleurs.ink}
                  style={[styles.texteBadgeDomaine, { color: couleurs.ink }]}>
                  {detailDomaine.libelle}
                </TexteTheme>
              </View>

              <TexteTheme
                darkColor={couleurs.ink}
                lightColor={couleurs.ink}
                style={[styles.titrePrincipal, { color: couleurs.ink }]}>
                Bientot disponible
              </TexteTheme>

              <TexteTheme
                darkColor={couleurs.cardText}
                lightColor={couleurs.cardText}
                style={[styles.description, { color: couleurs.cardText }]}>
                {detailDomaine.description}
              </TexteTheme>

              <View style={styles.zoneProgression}>
                <View style={[styles.ligneProgression, { backgroundColor: couleurs.soft }]}>
                  <View style={[styles.progressionActive, { backgroundColor: couleurs.accent }]} />
                </View>
                <View style={styles.etapes}>
                  {['Idee', 'Design', 'Simulation'].map((etape) => (
                    <TexteTheme
                      key={etape}
                      darkColor={couleurs.cardText}
                      lightColor={couleurs.cardText}
                      style={[styles.texteEtape, { color: couleurs.cardText }]}>
                      {etape}
                    </TexteTheme>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={() => router.replace(detailDomaine.cheminRetour)}
                style={({ pressed, hovered }) => [
                  styles.boutonRetour,
                  { backgroundColor: couleurs.soft, borderColor: couleurs.accent },
                  pressed || hovered ? styles.boutonRetourSurvol : null,
                ]}>
                <MaterialCommunityIcons color={couleurs.ink} name="arrow-left" size={18} />
                <TexteTheme
                  darkColor={couleurs.ink}
                  lightColor={couleurs.ink}
                  style={[styles.texteBoutonRetour, { color: couleurs.ink }]}>
                  Retour aux simulations
                </TexteTheme>
              </Pressable>
            </View>
          </VueTheme>
        </Animated.ScrollView>
      </VueTheme>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: themeBase.background,
    flex: 1,
  },
  container: {
    backgroundColor: themeBase.background,
    flex: 1,
  },
  superpositionEntete: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  contenuDefilement: {
    paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
  },
  contenu: {
    alignItems: 'center',
    minHeight: 680,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  vitrine: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    maxWidth: 620,
    minHeight: 500,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    width: '100%',
  },
  motif: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  symbole: {
    fontSize: 24,
    fontWeight: '900',
    position: 'absolute',
  },
  halo: {
    borderRadius: 120,
    height: 240,
    position: 'absolute',
    top: 44,
    width: 240,
  },
  cercleIcone: {
    alignItems: 'center',
    borderRadius: 56,
    borderWidth: 1.5,
    height: 112,
    justifyContent: 'center',
    marginTop: 16,
    width: 112,
  },
  badgeDomaine: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  texteBadgeDomaine: {
    fontSize: 13,
    fontWeight: '800',
  },
  titrePrincipal: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 460,
    textAlign: 'center',
  },
  zoneProgression: {
    marginTop: 28,
    maxWidth: 420,
    width: '100%',
  },
  ligneProgression: {
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressionActive: {
    borderRadius: 999,
    height: '100%',
    width: '58%',
  },
  etapes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  texteEtape: {
    fontSize: 12,
    fontWeight: '700',
  },
  boutonRetour: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 30,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  boutonRetourSurvol: {
    transform: [{ translateY: -1 }],
  },
  texteBoutonRetour: {
    fontSize: 15,
    fontWeight: '800',
  },
});
