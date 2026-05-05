import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
  EnteteEcranSimulation,
} from '@/features/simulations/core/entete-ecran-simulation';
import { utiliserIntervalleSimulation } from '@/features/simulations/core/utiliser-intervalle-simulation';

type ProprietesCurseurNumerique = {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  precision?: number;
  step: number;
  unit?: string;
  value: number;
};

type EtatMouvement = {
  acceleration: number;
  forceFrottement: number;
  forceFrottementCinetique: number;
  forceMinimalePourBouger: number;
  forceNette: number;
  forceNormale: number;
  messageEtat: string;
  mouvement: boolean;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const GRAVITE = 9.8;

const themeActif = {
  accent: '#D8A94A',
  applied: '#7CCFBF',
  background: '#E9ECE4',
  block: '#D8A94A',
  blockDeep: '#9A7432',
  border: '#243B53',
  friction: '#D97B6C',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ground: '#B7C7B0',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  surface: '#F3F1E7',
};

const STYLE_INTERACTION_WEB =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirAuPas(valeur: number, pas: number) {
  return Math.round(valeur / pas) * pas;
}

function formaterNombre(valeur: number, chiffres = 1) {
  if (!Number.isFinite(valeur)) {
    return '--';
  }

  const arrondi = Number(valeur.toFixed(chiffres));
  return Object.is(arrondi, -0) ? (0).toFixed(chiffres) : arrondi.toFixed(chiffres);
}

function calculerForceNormale(masse: number, gravite: number) {
  return Math.max(masse, 0) * gravite;
}

function calculerFrottementStatiqueMax(coefficientStatique: number, forceNormale: number) {
  return coefficientStatique * forceNormale;
}

function calculerFrottementCinetique(coefficientCinetique: number, forceNormale: number) {
  return coefficientCinetique * forceNormale;
}

function verifierBlocEnMouvement(forceAppliquee: number, frottementStatiqueMax: number) {
  return forceAppliquee > frottementStatiqueMax;
}

function calculerFrottementActuel(forceAppliquee: number, frottementStatiqueMax: number, frottementCinetique: number, mouvement: boolean) {
  return mouvement ? frottementCinetique : Math.min(forceAppliquee, frottementStatiqueMax);
}

function calculerForceNette(forceAppliquee: number, frottementActuel: number, mouvement: boolean) {
  return mouvement ? forceAppliquee - frottementActuel : 0;
}

function calculerAcceleration(forceNette: number, masse: number) {
  return masse <= 0 ? Number.NaN : forceNette / masse;
}

function obtenirEtatBloc(mouvement: boolean) {
  return mouvement ? 'En mouvement' : 'Immobile';
}

function calculerForcesFrottement(
  masse: number,
  coefficientStatique: number,
  coefficientCinetique: number,
  forceAppliquee: number
): EtatMouvement {
  const masseBornee = Math.max(masse, 0.001);
  const forceNormale = calculerForceNormale(masseBornee, GRAVITE);
  const forceFrottementStatiqueMax = calculerFrottementStatiqueMax(coefficientStatique, forceNormale);
  const forceFrottementCinetique = calculerFrottementCinetique(coefficientCinetique, forceNormale);
  const mouvement = verifierBlocEnMouvement(forceAppliquee, forceFrottementStatiqueMax);
  const forceFrottement = calculerFrottementActuel(
    forceAppliquee,
    forceFrottementStatiqueMax,
    forceFrottementCinetique,
    mouvement
  );
  const forceNette = calculerForceNette(forceAppliquee, forceFrottement, mouvement);
  const acceleration = calculerAcceleration(forceNette, masseBornee);

  return {
    acceleration,
    forceFrottement,
    forceFrottementCinetique,
    forceMinimalePourBouger: forceFrottementStatiqueMax,
    forceNette,
    forceNormale,
    messageEtat: obtenirEtatBloc(mouvement),
    mouvement,
  };
}

function cheminPointeFleche(x: number, y: number, directionX: number, directionY: number) {
  const longueur = Math.sqrt(directionX * directionX + directionY * directionY) || 1;
  const ux = directionX / longueur;
  const uy = directionY / longueur;
  const px = -uy;
  const py = ux;
  const taille = 8;
  const gaucheX = x - ux * taille + px * taille * 0.55;
  const gaucheY = y - uy * taille + py * taille * 0.55;
  const droiteX = x - ux * taille - px * taille * 0.55;
  const droiteY = y - uy * taille - py * taille * 0.55;

  return `M ${x.toFixed(2)} ${y.toFixed(2)} L ${gaucheX.toFixed(2)} ${gaucheY.toFixed(2)} L ${droiteX.toFixed(2)} ${droiteY.toFixed(2)} Z`;
}

function CurseurNumerique({
  label,
  max,
  min,
  onChange,
  precision = 0,
  step,
  unit = '',
  value,
}: ProprietesCurseurNumerique) {
  const definirDepuisEvenement = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, largeurMesuree);
      const valeurBrute = min + (position / largeurMesuree) * (max - min);
      const valeurSuivante = borner(arrondirAuPas(valeurBrute, step), min, max);

      onChange(Number(valeurSuivante.toFixed(precision)));
    });
  }, [max, min, onChange, precision, step]);

  const gestionGlissement = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: definirDepuisEvenement,
        onPanResponderMove: definirDepuisEvenement,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
      }),
    [definirDepuisEvenement]
  );

  const pourcentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.blocCurseur}>
      <View style={styles.enteteCurseur}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteCurseur}>
          {label}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.ink} style={styles.valeurCurseur}>
          {value.toFixed(precision)} {unit}
        </TexteTheme>
      </View>
      <View {...gestionGlissement.panHandlers} style={[styles.pisteCurseur, STYLE_INTERACTION_WEB]}>
        <View style={[styles.remplissageCurseur, { width: `${pourcentage}%` }]} />
        <View style={[styles.poigneeCurseur, STYLE_INTERACTION_WEB, { left: `${pourcentage}%` }]} />
      </View>
    </View>
  );
}

function GraphiqueFrottement({
  etat,
  forceAppliquee,
  hauteur,
  largeur,
  masse,
  positionBloc,
}: {
  etat: EtatMouvement;
  forceAppliquee: number;
  hauteur: number;
  largeur: number;
  masse: number;
  positionBloc: number;
}) {
  const solY = hauteur * 0.68;
  const tailleBloc = borner(32 + masse * 5, 34, 82);
  const marge = tailleBloc / 2 + 18;
  const largeurDisponible = Math.max(largeur - marge * 2, 1);
  const blocX = marge + ((positionBloc % largeurDisponible) + largeurDisponible) % largeurDisponible;
  const blocY = solY - tailleBloc;
  const milieuY = blocY + tailleBloc / 2;
  const forceEchelle = Math.min(3.3, largeur / 160);
  const longueurForce = Math.max(forceAppliquee * forceEchelle, forceAppliquee > 0 ? 12 : 0);
  const longueurFrottement = Math.max(etat.forceFrottement * forceEchelle, etat.forceFrottement > 0 ? 12 : 0);
  const textureSol = useMemo(
    () => Array.from({ length: 18 }, (_, index) => (index / 17) * largeur),
    [largeur]
  );

  return (
    <View style={[styles.graph, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={themeActif.panel} height={hauteur} width={largeur} x={0} y={0} />
        <Rect fill={themeActif.ground} height={hauteur - solY} opacity={0.46} width={largeur} x={0} y={solY} />
        {textureSol.map((x, index) => (
          <Line
            key={`texture-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1.2}
            x1={x}
            x2={x - 18}
            y1={solY + 5}
            y2={solY + 22}
          />
        ))}

        <Rect
          fill={themeActif.block}
          height={tailleBloc}
          rx={6}
          stroke={themeActif.blockDeep}
          strokeWidth={2}
          width={tailleBloc}
          x={blocX - tailleBloc / 2}
          y={blocY}
        />

        {longueurForce > 0 ? (
          <>
            <Line
              stroke={themeActif.applied}
              strokeLinecap="round"
              strokeWidth={3}
              x1={blocX + tailleBloc / 2}
              x2={blocX + tailleBloc / 2 + longueurForce}
              y1={milieuY}
              y2={milieuY}
            />
            <Path
              d={cheminPointeFleche(blocX + tailleBloc / 2 + longueurForce, milieuY, 1, 0)}
              fill={themeActif.applied}
            />
            <SvgText fill={themeActif.applied} fontSize="11" fontWeight="800" x={blocX + tailleBloc / 2 + longueurForce + 8} y={milieuY - 7}>
              F = {formaterNombre(forceAppliquee, 1)} N
            </SvgText>
          </>
        ) : null}

        {longueurFrottement > 0 ? (
          <>
            <Line
              stroke={themeActif.friction}
              strokeLinecap="round"
              strokeWidth={3}
              x1={blocX - tailleBloc / 2}
              x2={blocX - tailleBloc / 2 - longueurFrottement}
              y1={milieuY + 12}
              y2={milieuY + 12}
            />
            <Path
              d={cheminPointeFleche(blocX - tailleBloc / 2 - longueurFrottement, milieuY + 12, -1, 0)}
              fill={themeActif.friction}
            />
            <SvgText
              fill={themeActif.friction}
              fontSize="11"
              fontWeight="800"
              textAnchor="end"
              x={blocX - tailleBloc / 2 - longueurFrottement - 8}
              y={milieuY + 27}>
              f = {formaterNombre(etat.forceFrottement, 1)} N
            </SvgText>
          </>
        ) : null}

      </Svg>
    </View>
  );
}

export function SimulationFrottement() {
  const [masse, definirMasse] = useState(2);
  const [coefficientCinetique, definirCoefficientCinetique] = useState(0.3);
  const [coefficientStatique, definirCoefficientStatique] = useState(0.5);
  const [forceAppliquee, definirForceAppliquee] = useState(5);
  const [enPause, definirEnPause] = useState(false);
  const [image, definirImage] = useState(0);
  const mouvementRef = useRef({ position: 0, vitesse: 0 });
  const defilementY = useRef(new Animated.Value(0)).current;
  const estActif = useIsFocused();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (coefficientCinetique > coefficientStatique) {
      definirCoefficientCinetique(coefficientStatique);
    }
  }, [coefficientCinetique, coefficientStatique]);

  const etat = useMemo(
    () => calculerForcesFrottement(masse, coefficientStatique, coefficientCinetique, forceAppliquee),
    [coefficientCinetique, coefficientStatique, forceAppliquee, masse]
  );

  const avancerSimulation = useCallback(() => {
    if (!etat.mouvement) {
      mouvementRef.current.vitesse = 0;
      definirImage((valeur) => valeur + 1);
      return;
    }

    const prochaineVitesse = mouvementRef.current.vitesse + etat.acceleration * 0.033;
    mouvementRef.current.vitesse = Math.max(prochaineVitesse, 0);
    mouvementRef.current.position += mouvementRef.current.vitesse * 0.033 * 42;
    definirImage((valeur) => valeur + 1);
  }, [etat.acceleration, etat.mouvement]);

  utiliserIntervalleSimulation(estActif && !enPause, avancerSimulation, 33);

  const reinitialiserBloc = useCallback(() => {
    mouvementRef.current = { position: 0, vitesse: 0 };
    definirImage((valeur) => valeur + 1);
  }, []);

  const remplissageHorizontal = width >= 1200 ? 12 : 16;
  const largeurContenu = width - remplissageHorizontal * 2;
  const affichageLarge = width >= 980;
  const affichageCompact = width < 560;
  const largeurGraphique = affichageLarge ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const hauteurGraphique = affichageLarge
    ? borner(Math.round(largeurGraphique * 0.45), 340, 480)
    : borner(Math.round(largeurGraphique * 0.58), 260, 380);
  const largeurPanneau = affichageLarge ? largeurContenu - largeurGraphique - 28 : largeurContenu;

  const deplacementEnteteY = defilementY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 120],
    outputRange: [0, -HAUTEUR_TOTALE_ENTETE_SIMULATION],
  });
  const opaciteEntete = defilementY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0],
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <VueTheme lightColor={themeActif.background} style={styles.container}>
        <Animated.View
          style={[
            styles.headerOverlay,
            {
              opacity: opaciteEntete,
              transform: [{ translateY: deplacementEnteteY }],
            },
          ]}>
          <EnteteEcranSimulation titre="Frottement" domaine="physique" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.workspace,
              {
                alignItems: affichageLarge ? 'center' : 'stretch',
                flexDirection: affichageLarge ? 'row' : 'column',
                minHeight: affichageLarge ? hauteurGraphique + 40 : undefined,
                paddingLeft: affichageLarge ? 22 : 0,
                paddingRight: affichageLarge ? 22 : 0,
                width: largeurContenu,
              },
            ]}>
            <GraphiqueFrottement
              etat={etat}
              forceAppliquee={forceAppliquee}
              hauteur={hauteurGraphique}
              largeur={largeurGraphique}
              masse={masse}
              positionBloc={mouvementRef.current.position + image * 0}
            />

            <View style={[styles.sidebar, { paddingRight: affichageLarge ? 44 : 0, width: largeurPanneau }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="fs <= mu_s N ; fk = mu_k N"
                  mathematiques={'f_s\\le\\mu_s N\\\\f_k=\\mu_k N'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Force appliquée" max={50} min={0} onChange={definirForceAppliquee} precision={1} step={0.5} unit="N" value={forceAppliquee} />
                <CurseurNumerique label="Masse" max={10} min={0.5} onChange={definirMasse} precision={1} step={0.1} unit="kg" value={masse} />
                <CurseurNumerique label="μ statique" max={1} min={0.1} onChange={definirCoefficientStatique} precision={2} step={0.05} value={coefficientStatique} />
                <CurseurNumerique label="μ cinétique" max={coefficientStatique} min={0.05} onChange={definirCoefficientCinetique} precision={2} step={0.05} value={coefficientCinetique} />
                <View style={styles.rangeeBoutons}>
                  <Pressable onPress={() => definirEnPause((valeur) => !valeur)} style={styles.bouton}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteBouton}>
                      {enPause ? 'Reprendre' : 'Pause'}
                    </TexteTheme>
                  </Pressable>
                  <Pressable onPress={reinitialiserBloc} style={styles.bouton}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteBouton}>
                      Réinitialiser
                    </TexteTheme>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force normale
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(etat.forceNormale, 1)} N
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force minimale pour bouger
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(etat.forceMinimalePourBouger, 1)} N
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Frottement actuel
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(etat.forceFrottement, 1)} N
                  </TexteTheme>
                </View>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force nette
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(etat.forceNette, 1)} N
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Accélération
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(etat.acceleration, 2)} m/s²
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    État
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {etat.messageEtat}
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Le frottement s oppose au mouvement relatif entre deux surfaces.',
          'Le frottement statique peut s ajuster jusqu a une limite. Quand la force appliquee depasse cette limite, le frottement cinetique prend le relais.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Augmente la force appliquee jusqu a depasser le frottement statique maximal pour mettre le bloc en mouvement."
        eyebrow="Definition"
        title="Qu est-ce que le frottement ?"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: SIMULATION_PAGE_BACKGROUND,
    flex: 1,
  },
  container: {
    backgroundColor: SIMULATION_PAGE_BACKGROUND,
    flex: 1,
  },
  headerOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 28,
    paddingHorizontal: 12,
    paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
  },
  workspace: {
    gap: 20,
  },
  sidebar: {
    gap: 16,
  },
  formulaCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  graph: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 18,
    padding: 16,
    width: '100%',
  },
  blocCurseur: {
    gap: 12,
  },
  enteteCurseur: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etiquetteCurseur: {
    color: themeActif.mutedInk,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  valeurCurseur: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  pisteCurseur: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  remplissageCurseur: {
    backgroundColor: themeActif.accent,
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  poigneeCurseur: {
    backgroundColor: themeActif.ink,
    borderColor: themeActif.surface,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: -10,
    position: 'absolute',
    width: 20,
  },
  rangeeBoutons: {
    flexDirection: 'row',
    gap: 10,
  },
  bouton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  texteBouton: {
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statsGrid: {
    gap: 12,
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 104,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  statLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statValueSmall: {
    color: themeActif.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
});
