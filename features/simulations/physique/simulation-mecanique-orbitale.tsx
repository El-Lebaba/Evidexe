import { useIsFocused } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

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

type PointOrbital = {
  anomalieExcentrique: number;
  r: number;
  x: number;
  y: number;
};

type ResultatOrbital = {
  aphelie: number;
  cheminOrbite: string;
  cheminTrace: string;
  demiGrandAxe: number;
  distanceActuelle: number;
  periodeRelative: number;
  perihelie: number;
  planete: PointOrbital;
  positionOrbitale: string;
  vitesseRelative: number;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const CONSTANTE_GRAVITATIONNELLE_SIMULATION = 1;
const NOMBRE_POINTS_ORBITE = 180;
const NOMBRE_POINTS_TRACE = 46;

const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  orbit: '#7CCFBF',
  panel: '#DDE4D5',
  planet: '#7CCFBF',
  planetDeep: '#3F8D83',
  star: '#D8A94A',
  starDeep: '#9A7432',
  surface: '#F3F1E7',
  sweep: '#D97B6C',
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

function resoudreKepler(anomalieMoyenne: number, excentricite: number) {
  let anomalieExcentrique = anomalieMoyenne;

  for (let index = 0; index < 5; index += 1) {
    const correction =
      (anomalieExcentrique - excentricite * Math.sin(anomalieExcentrique) - anomalieMoyenne) /
      (1 - excentricite * Math.cos(anomalieExcentrique));
    anomalieExcentrique -= correction;
  }

  return anomalieExcentrique;
}

function obtenirPointOrbital(
  anomalieMoyenne: number,
  excentricite: number,
  demiGrandAxe: number,
  demiPetitAxe: number,
  centreEllipseX: number,
  centreEllipseY: number,
  orientationRad: number
): PointOrbital {
  const anomalieNormalisee = ((anomalieMoyenne % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const anomalieExcentrique = resoudreKepler(anomalieNormalisee, excentricite);
  const localX = demiGrandAxe * Math.cos(anomalieExcentrique);
  const localY = demiPetitAxe * Math.sin(anomalieExcentrique);
  const cosOrientation = Math.cos(orientationRad);
  const sinOrientation = Math.sin(orientationRad);
  const x = centreEllipseX + localX * cosOrientation - localY * sinOrientation;
  const y = centreEllipseY + localX * sinOrientation + localY * cosOrientation;
  const r = demiGrandAxe * (1 - excentricite * Math.cos(anomalieExcentrique));

  return {
    anomalieExcentrique,
    r,
    x,
    y,
  };
}

function cheminDepuisPoints(points: PointOrbital[], fermer = false) {
  if (points.length === 0) {
    return '';
  }

  const depart = points[0];
  const commandes = [`M ${depart.x.toFixed(2)} ${depart.y.toFixed(2)}`];

  for (let index = 1; index < points.length; index += 1) {
    commandes.push(`L ${points[index].x.toFixed(2)} ${points[index].y.toFixed(2)}`);
  }

  if (fermer) {
    commandes.push('Z');
  }

  return commandes.join(' ');
}

function calculerDemiGrandAxe(perihelie: number, aphelie: number) {
  return (perihelie + aphelie) / 2;
}

function calculerPerihelie(demiGrandAxe: number, excentricite: number) {
  return demiGrandAxe * (1 - excentricite);
}

function calculerAphelie(demiGrandAxe: number, excentricite: number) {
  return demiGrandAxe * (1 + excentricite);
}

function calculerPeriodeOrbitale(demiGrandAxe: number, gravitation: number, masseAstre: number) {
  if (demiGrandAxe <= 0 || gravitation <= 0 || masseAstre <= 0) {
    return Number.NaN;
  }

  return 2 * Math.PI * Math.sqrt((demiGrandAxe * demiGrandAxe * demiGrandAxe) / (gravitation * masseAstre));
}

function calculerDistanceActuelle(positionObjet: PointOrbital, positionAstre: { x: number; y: number }) {
  const dx = positionObjet.x - positionAstre.x;
  const dy = positionObjet.y - positionAstre.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function calculerVitesseVisViva(distanceActuelle: number, demiGrandAxe: number, gravitation: number, masseAstre: number) {
  if (distanceActuelle <= 0 || demiGrandAxe <= 0 || gravitation <= 0 || masseAstre <= 0) {
    return Number.NaN;
  }

  const terme = gravitation * masseAstre * (2 / distanceActuelle - 1 / demiGrandAxe);

  return terme < 0 ? Number.NaN : Math.sqrt(terme);
}

function obtenirPositionOrbitale(
  distanceActuelle: number,
  perihelie: number,
  aphelie: number,
  demiGrandAxe: number
) {
  if (![distanceActuelle, perihelie, aphelie, demiGrandAxe].every(Number.isFinite)) {
    return '—';
  }

  const amplitude = aphelie - perihelie;
  const tolerance = Math.max(amplitude * 0.05, 0.001);

  if (Math.abs(distanceActuelle - perihelie) < tolerance) {
    return 'Proche du périhélie';
  }

  if (Math.abs(distanceActuelle - aphelie) < tolerance) {
    return 'Proche de l’aphélie';
  }

  return distanceActuelle < demiGrandAxe ? 'S’éloigne du périhélie' : 'Se rapproche de l’aphélie';
}

function calculerOrbite(
  largeur: number,
  hauteur: number,
  excentricite: number,
  masseAstre: number,
  phase: number,
  orientationDegres: number
): ResultatOrbital {
  const foyerX = largeur / 2;
  const foyerY = hauteur / 2;
  const orientationRad = (orientationDegres * Math.PI) / 180;
  const excentriciteBornee = borner(excentricite, 0, 0.95);
  const demiGrandAxe = Math.min(largeur * 0.31, hauteur * 0.34);
  const demiPetitAxe = demiGrandAxe * Math.sqrt(1 - excentriciteBornee * excentriciteBornee);
  const centreEllipseX = foyerX - demiGrandAxe * excentriciteBornee * Math.cos(orientationRad);
  const centreEllipseY = foyerY - demiGrandAxe * excentriciteBornee * Math.sin(orientationRad);
  const planete = obtenirPointOrbital(phase, excentriciteBornee, demiGrandAxe, demiPetitAxe, centreEllipseX, centreEllipseY, orientationRad);
  const pointsOrbite = Array.from({ length: NOMBRE_POINTS_ORBITE + 1 }, (_, index) =>
    obtenirPointOrbital(
      (index / NOMBRE_POINTS_ORBITE) * Math.PI * 2,
      excentriciteBornee,
      demiGrandAxe,
      demiPetitAxe,
      centreEllipseX,
      centreEllipseY,
      orientationRad
    )
  );
  const pointsTrace = Array.from({ length: NOMBRE_POINTS_TRACE }, (_, index) =>
    obtenirPointOrbital(
      phase - (index / (NOMBRE_POINTS_TRACE - 1)) * Math.PI * 0.9,
      excentriciteBornee,
      demiGrandAxe,
      demiPetitAxe,
      centreEllipseX,
      centreEllipseY,
      orientationRad
    )
  );
  const masseBornee = Math.max(masseAstre, 0);
  const perihelie = calculerPerihelie(demiGrandAxe, excentriciteBornee);
  const aphelie = calculerAphelie(demiGrandAxe, excentriciteBornee);
  const demiGrandAxeDepuisDistances = calculerDemiGrandAxe(perihelie, aphelie);
  const distanceActuelle = calculerDistanceActuelle(planete, { x: foyerX, y: foyerY });
  const vitesseRelative = calculerVitesseVisViva(
    distanceActuelle,
    demiGrandAxeDepuisDistances,
    CONSTANTE_GRAVITATIONNELLE_SIMULATION,
    masseBornee
  );

  return {
    aphelie,
    cheminOrbite: cheminDepuisPoints(pointsOrbite),
    cheminTrace: cheminDepuisPoints(pointsTrace),
    demiGrandAxe: demiGrandAxeDepuisDistances,
    distanceActuelle,
    periodeRelative: calculerPeriodeOrbitale(
      demiGrandAxeDepuisDistances,
      CONSTANTE_GRAVITATIONNELLE_SIMULATION,
      masseBornee
    ),
    perihelie,
    planete,
    positionOrbitale: obtenirPositionOrbitale(distanceActuelle, perihelie, aphelie, demiGrandAxeDepuisDistances),
    vitesseRelative,
  };
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

function GraphiqueMecaniqueOrbitale({
  hauteur,
  largeur,
  orbite,
}: {
  hauteur: number;
  largeur: number;
  orbite: ResultatOrbital;
}) {
  const centreX = largeur / 2;
  const centreY = hauteur / 2;
  const lignesVerticales = useMemo(
    () => Array.from({ length: 7 }, (_, index) => (index / 6) * largeur),
    [largeur]
  );
  const lignesHorizontales = useMemo(
    () => Array.from({ length: 5 }, (_, index) => (index / 4) * hauteur),
    [hauteur]
  );
  const rayonAstre = borner(largeur * 0.027, 10, 17);
  const foyerX = centreX;

  return (
    <View style={[styles.graph, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Defs>
          <RadialGradient cx="50%" cy="50%" id="degradeAstre" r="50%">
            <Stop offset="0%" stopColor="#F7D889" stopOpacity="1" />
            <Stop offset="52%" stopColor={themeActif.star} stopOpacity="0.65" />
            <Stop offset="100%" stopColor={themeActif.star} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect fill={themeActif.panel} height={hauteur} width={largeur} x={0} y={0} />
        {lignesVerticales.map((x, index) => (
          <Line key={`grille-x-${index}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={x} x2={x} y1={0} y2={hauteur} />
        ))}
        {lignesHorizontales.map((y, index) => (
          <Line key={`grille-y-${index}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={0} x2={largeur} y1={y} y2={y} />
        ))}

        <Path d={orbite.cheminOrbite} fill="none" stroke={themeActif.border} strokeDasharray="6 7" strokeOpacity={0.58} strokeWidth={1.5} />
        <Path d={orbite.cheminTrace} fill="none" stroke={themeActif.orbit} strokeLinecap="round" strokeOpacity={0.62} strokeWidth={3} />

        <Line stroke={themeActif.sweep} strokeOpacity={0.5} strokeWidth={1.4} x1={foyerX} x2={orbite.planete.x} y1={centreY} y2={orbite.planete.y} />
        <Circle cx={foyerX} cy={centreY} fill="url(#degradeAstre)" r={rayonAstre * 3.1} />
        <Circle cx={foyerX} cy={centreY} fill={themeActif.star} r={rayonAstre} stroke={themeActif.starDeep} strokeWidth={1.5} />
        <Circle cx={orbite.planete.x} cy={orbite.planete.y} fill={themeActif.planet} r={8.5} stroke={themeActif.planetDeep} strokeWidth={2} />
      </Svg>
    </View>
  );
}

export function SimulationMecaniqueOrbitale() {
  const [masseAstre, definirMasseAstre] = useState(50);
  const [excentricite, definirExcentricite] = useState(0.3);
  const [orientationOrbite, definirOrientationOrbite] = useState(0);
  const [vitesseOrbitale, definirVitesseOrbitale] = useState(1);
  const [enPause, definirEnPause] = useState(false);
  const [phase, definirPhase] = useState(0);
  const defilementY = useRef(new Animated.Value(0)).current;
  const estActif = useIsFocused();
  const { width } = useWindowDimensions();

  const remplissageHorizontal = width >= 1200 ? 12 : 16;
  const largeurContenu = width - remplissageHorizontal * 2;
  const affichageLarge = width >= 980;
  const affichageCompact = width < 560;
  const largeurGraphique = affichageLarge ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const hauteurGraphique = affichageLarge
    ? borner(Math.round(largeurGraphique * 0.56), 420, 620)
    : borner(Math.round(largeurGraphique * 0.76), 320, 500);
  const largeurPanneau = affichageLarge ? largeurContenu - largeurGraphique - 28 : largeurContenu;
  const orbite = useMemo(
    () => calculerOrbite(largeurGraphique, hauteurGraphique, excentricite, masseAstre, phase, orientationOrbite),
    [excentricite, hauteurGraphique, largeurGraphique, masseAstre, orientationOrbite, phase]
  );

  const avancerSimulation = useCallback(() => {
    definirPhase((phaseActuelle) => (phaseActuelle + vitesseOrbitale * 0.045) % (Math.PI * 2));
  }, [vitesseOrbitale]);

  utiliserIntervalleSimulation(estActif && !enPause, avancerSimulation, 33);

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
          <EnteteEcranSimulation titre="Mécanique orbitale" domaine="physique" />
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
            <GraphiqueMecaniqueOrbitale hauteur={hauteurGraphique} largeur={largeurGraphique} orbite={orbite} />

            <View style={[styles.sidebar, { paddingRight: affichageLarge ? 44 : 0, width: largeurPanneau }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="T^2 = 4 pi^2 a^3 / GM"
                  mathematiques={'T^2=\\frac{4\\pi^2}{GM}a^3'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Masse de l’astre" max={100} min={10} onChange={definirMasseAstre} step={1} unit="u" value={masseAstre} />
                <CurseurNumerique label="Excentricité" max={0.9} min={0} onChange={definirExcentricite} precision={2} step={0.05} value={excentricite} />
                <CurseurNumerique label="Orientation" max={360} min={0} onChange={definirOrientationOrbite} step={15} unit="°" value={orientationOrbite} />
                <CurseurNumerique label="Vitesse orbitale" max={3} min={0.2} onChange={definirVitesseOrbitale} precision={1} step={0.1} unit="x" value={vitesseOrbitale} />
                <Pressable onPress={() => definirEnPause((valeur) => !valeur)} style={styles.bouton}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteBouton}>
                    {enPause ? 'Reprendre' : 'Pause'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Périhélie
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.perihelie, 1)} u
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Aphélie
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.aphelie, 1)} u
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Demi-grand axe
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.demiGrandAxe, 1)} u
                  </TexteTheme>
                </View>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Distance actuelle
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.distanceActuelle, 1)} u
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Vitesse actuelle
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.vitesseRelative, 2)} u/s
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Période orbitale relative
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(orbite.periodeRelative, 1)} s
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Une orbite képlérienne est une ellipse avec l’astre attracteur placé sur un foyer.',
          'La planète accélère près du périhélie et ralentit près de l’aphélie, tout en balayant des aires égales en temps égaux.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Augmente l’excentricité pour rendre la trajectoire plus allongée et observer une vitesse plus variable."
        eyebrow="Définition"
        title="Qu’est-ce qu’une orbite ?"
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
  bouton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  texteBouton: {
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
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
