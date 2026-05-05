import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
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

const ARRIERE_PLAN_PAGE_SIMULATION = '#EAE3D2';

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
    couleurAccent: '#8D9771',
    couleurDouce: '#DDE4D5',
    description: 'Une nouvelle visualisation interactive est en construction pour rendre ce concept plus clair.',
    icone: 'function-variant',
    libelle: 'Mathematiques',
    motif: ['f(x)', 'dx', 'Somme', 'pi', 'infini'],
  },
  physique: {
    cheminRetour: '/(tabs)/physique' as Href,
    couleurAccent: '#6E7F73',
    couleurDouce: '#D7E2DA',
    description: 'Le laboratoire est presque pret: schema, controles et animation arrivent dans une prochaine version.',
    icone: 'atom',
    libelle: 'Physique',
    motif: ['F', 'v', 'a', 'E', 'lambda'],
  },
  'programmation-java': {
    cheminRetour: '/(tabs)/programmation-java' as Href,
    couleurAccent: '#7B6F54',
    couleurDouce: '#E4DCC8',
    description: 'Un atelier Java est en preparation avec une logique pas a pas et des essais interactifs.',
    icone: 'code-braces',
    libelle: 'Java',
    motif: ['{ }', 'if', 'for', 'new', ';'],
  },
};

const themeBase = obtenirThemeApplication(false);

export function EcranSimulationLigne({ title, type}: LineSimulationScreenProps) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
export function EcranSimulationLigne({ titre, domaine }: ProprietesEcranSimulationLigne) {
  const defilementY = useRef(new Animated.Value(0)).current;
  const pulsation = useRef(new Animated.Value(0)).current;
  const detailDomaine = DETAILS_DOMAINE[domaine];

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
    outputRange: [0, -HAUTEUR_TOTALE_ENTETE_SIMULATION],
    extrapolate: 'clamp',
  });
  const opaciteEntete = defilementY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0],
    extrapolate: 'clamp',
  });
  const echelleHalo = pulsation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const opaciteHalo = pulsation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.46],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <VueTheme lightColor={themeActif.background} darkColor={themeActif.background} style={[styles.container, { backgroundColor: themeActif.background }]}>
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
          <VueTheme lightColor={themeActif.background} darkColor={themeActif.background} style={styles.content}>
            <TexteTheme lightColor={themeActif.text} darkColor={themeActif.text} style={{ color: themeActif.text }} type="title">{title}</TexteTheme>
          <VueTheme style={styles.contenu}>
            <View style={styles.vitrine}>
              <View style={styles.motif}>
                {detailDomaine.motif.map((symbole, index) => (
                  <TexteTheme
                    key={`${symbole}-${index}`}
                    darkColor="#243B53"
                    lightColor="#243B53"
                    style={[
                      styles.symbole,
                      {
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
                    backgroundColor: detailDomaine.couleurDouce,
                    opacity: opaciteHalo,
                    transform: [{ scale: echelleHalo }],
                  },
                ]}
              />

              <View style={[styles.cercleIcone, { backgroundColor: detailDomaine.couleurDouce }]}>
                <MaterialCommunityIcons color={detailDomaine.couleurAccent} name={detailDomaine.icone} size={52} />
              </View>

              <View style={styles.badgeDomaine}>
                <MaterialCommunityIcons color="#243B53" name="timer-sand" size={16} />
                <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.texteBadgeDomaine}>
                  {detailDomaine.libelle}
                </TexteTheme>
              </View>

              <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.titrePrincipal}>
                Bientot disponible
              </TexteTheme>

              <TexteTheme darkColor="#5E6D64" lightColor="#5E6D64" style={styles.description}>
                {detailDomaine.description}
              </TexteTheme>

              <View style={styles.zoneProgression}>
                <View style={styles.ligneProgression}>
                  <View style={[styles.progressionActive, { backgroundColor: detailDomaine.couleurAccent }]} />
                </View>
                <View style={styles.etapes}>
                  <TexteTheme darkColor="#5E6D64" lightColor="#5E6D64" style={styles.texteEtape}>
                    Idee
                  </TexteTheme>
                  <TexteTheme darkColor="#5E6D64" lightColor="#5E6D64" style={styles.texteEtape}>
                    Design
                  </TexteTheme>
                  <TexteTheme darkColor="#5E6D64" lightColor="#5E6D64" style={styles.texteEtape}>
                    Simulation
                  </TexteTheme>
                </View>
              </View>

              <Pressable
                onPress={() => router.replace(detailDomaine.cheminRetour)}
                style={({ pressed, hovered }) => [
                  styles.boutonRetour,
                  { borderColor: detailDomaine.couleurAccent },
                  pressed || hovered ? styles.boutonRetourSurvol : null,
                ]}>
                <MaterialCommunityIcons color="#243B53" name="arrow-left" size={18} />
                <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.texteBoutonRetour}>
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
    backgroundColor: ARRIERE_PLAN_PAGE_SIMULATION,
    minHeight: 680,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  vitrine: {
    alignItems: 'center',
    backgroundColor: '#F5F1E6',
    borderColor: '#243B53',
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
    opacity: 0.16,
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
    borderColor: '#243B53',
    borderRadius: 56,
    borderWidth: 1.5,
    height: 112,
    justifyContent: 'center',
    marginTop: 16,
    width: 112,
  },
  badgeDomaine: {
    alignItems: 'center',
    backgroundColor: '#E9E2D0',
    borderColor: '#243B53',
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
    backgroundColor: '#DDD7C8',
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
    backgroundColor: '#EFE8D8',
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
    backgroundColor: '#E4DCC8',
    transform: [{ translateY: -1 }],
  },
  texteBoutonRetour: {
    fontSize: 15,
    fontWeight: '800',
  },
});
