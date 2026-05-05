import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
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

type ResultatSnell = {
  angleCritique: number | null;
  angleIncidentRad: number;
  angleReflechiDegres: number;
  angleRefracteDegres: number | null;
  angleRefracteRad: number | null;
  deviationDegres: number | null;
  directionDeviation: string;
  etat: string;
  ralentissement: {
    label: string;
    valeur: number | null;
  };
  reflexionTotale: boolean;
  sinRefracte: number;
  vitesse1: number;
  vitesse2: number;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';

const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  incident: '#D8A94A',
  ink: '#243B53',
  mediumA: 'rgba(124, 207, 191, 0.16)',
  mediumB: 'rgba(216, 169, 74, 0.15)',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  refracted: '#7CCFBF',
  reflected: '#D97B6C',
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

const VITESSE_LUMIERE_VIDE = 299792458;

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirAuPas(valeur: number, pas: number) {
  return Math.round(valeur / pas) * pas;
}

function formaterNombre(valeur: number | null, chiffres = 1) {
  if (valeur === null || !Number.isFinite(valeur)) {
    return '--';
  }

  const arrondi = Number(valeur.toFixed(chiffres));
  return Object.is(arrondi, -0) ? (0).toFixed(chiffres) : arrondi.toFixed(chiffres);
}

function cheminPointeFleche(x: number, y: number, angle: number) {
  const taille = 8;
  const gaucheX = x - taille * Math.cos(angle - 0.42);
  const gaucheY = y - taille * Math.sin(angle - 0.42);
  const droiteX = x - taille * Math.cos(angle + 0.42);
  const droiteY = y - taille * Math.sin(angle + 0.42);

  return `M ${x.toFixed(2)} ${y.toFixed(2)} L ${gaucheX.toFixed(2)} ${gaucheY.toFixed(2)} M ${x.toFixed(2)} ${y.toFixed(2)} L ${droiteX.toFixed(2)} ${droiteY.toFixed(2)}`;
}

function convertirDegresEnRadians(degres: number) {
  return (degres * Math.PI) / 180;
}

function convertirRadiansEnDegres(radians: number) {
  return (radians * 180) / Math.PI;
}

function calculerAngleCritique(n1: number, n2: number) {
  if (n1 <= 0 || n2 <= 0 || n1 <= n2) {
    return null;
  }

  return convertirRadiansEnDegres(Math.asin(borner(n2 / n1, -1, 1)));
}

function verifierReflexionTotale(n1: number, n2: number, angleIncidentDegres: number) {
  const angleCritique = calculerAngleCritique(n1, n2);

  return angleCritique !== null && angleIncidentDegres > angleCritique;
}

function calculerAngleRefracte(n1: number, n2: number, angleIncidentDegres: number) {
  if (n1 <= 0 || n2 <= 0 || verifierReflexionTotale(n1, n2, angleIncidentDegres)) {
    return null;
  }

  const sinRefracte = (n1 / n2) * Math.sin(convertirDegresEnRadians(angleIncidentDegres));
  return convertirRadiansEnDegres(Math.asin(borner(sinRefracte, -1, 1)));
}

function calculerVitesseLumiere(indice: number) {
  return indice <= 0 ? 0 : VITESSE_LUMIERE_VIDE / indice;
}

function formaterVitesseScientifique(vitesse: number) {
  if (!Number.isFinite(vitesse) || vitesse <= 0) {
    return '-- m/s';
  }

  const exposant = Math.floor(Math.log10(vitesse));
  const mantisse = vitesse / 10 ** exposant;
  const exposantAffiche = String(exposant).replace(/\d/g, (chiffre) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(chiffre)]);

  return `${mantisse.toFixed(2)} × 10${exposantAffiche} m/s`;
}

function calculerDeviation(angleIncidentDegres: number, angleRefracteDegres: number | null) {
  return angleRefracteDegres === null ? null : Math.abs(angleIncidentDegres - angleRefracteDegres);
}

function obtenirDirectionDeviation(n1: number, n2: number, reflexionTotale: boolean) {
  if (reflexionTotale) {
    return 'Réflexion totale interne';
  }

  if (Math.abs(n1 - n2) < 0.0001) {
    return 'Aucun changement';
  }

  return n2 > n1 ? 'Vers la normale' : 'Loin de la normale';
}

function calculerVariationVitesse(vitesse1: number, vitesse2: number) {
  if (vitesse1 <= 0 || vitesse2 <= 0 || Math.abs(vitesse1 - vitesse2) < 1) {
    return {
      label: 'Aucun changement de vitesse',
      valeur: null,
    };
  }

  if (vitesse2 < vitesse1) {
    return {
      label: 'Ralentissement',
      valeur: ((vitesse1 - vitesse2) / vitesse1) * 100,
    };
  }

  return {
    label: 'Accélération',
    valeur: ((vitesse2 - vitesse1) / vitesse1) * 100,
  };
}

function calculerSnell(n1: number, n2: number, angleIncidentDegres: number): ResultatSnell {
  const angleIncidentRad = convertirDegresEnRadians(angleIncidentDegres);
  const angleCritique = calculerAngleCritique(n1, n2);
  const reflexionTotale = verifierReflexionTotale(n1, n2, angleIncidentDegres);
  const angleRefracteDegres = calculerAngleRefracte(n1, n2, angleIncidentDegres);
  const angleRefracteRad = angleRefracteDegres === null ? null : convertirDegresEnRadians(angleRefracteDegres);
  const sinRefracte = n2 <= 0 ? 0 : (n1 * Math.sin(angleIncidentRad)) / n2;
  const vitesse1 = calculerVitesseLumiere(n1);
  const vitesse2 = calculerVitesseLumiere(n2);

  return {
    angleCritique,
    angleIncidentRad,
    angleReflechiDegres: angleIncidentDegres,
    angleRefracteDegres,
    angleRefracteRad,
    deviationDegres: calculerDeviation(angleIncidentDegres, angleRefracteDegres),
    directionDeviation: obtenirDirectionDeviation(n1, n2, reflexionTotale),
    etat: reflexionTotale ? 'Réflexion totale interne' : 'Réfraction',
    ralentissement: calculerVariationVitesse(vitesse1, vitesse2),
    reflexionTotale,
    sinRefracte,
    vitesse1,
    vitesse2,
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

function GraphiqueOptiqueRefraction({
  hauteur,
  largeur,
  n1,
  n2,
  resultat,
}: {
  hauteur: number;
  largeur: number;
  n1: number;
  n2: number;
  resultat: ResultatSnell;
}) {
  const centreX = largeur / 2;
  const interfaceY = hauteur / 2;
  const longueurIncident = Math.min(hauteur * 0.36, largeur * 0.28);
  const longueurSortie = Math.min(hauteur * 0.34, largeur * 0.27);
  const departIncidentX = centreX - longueurIncident * Math.sin(resultat.angleIncidentRad);
  const departIncidentY = interfaceY - longueurIncident * Math.cos(resultat.angleIncidentRad);
  const finReflechiX = centreX + longueurSortie * Math.sin(resultat.angleIncidentRad);
  const finReflechiY = interfaceY - longueurSortie * Math.cos(resultat.angleIncidentRad);
  const finRefracteX =
    resultat.angleRefracteRad === null
      ? centreX
      : centreX + longueurIncident * Math.sin(resultat.angleRefracteRad);
  const finRefracteY =
    resultat.angleRefracteRad === null
      ? interfaceY
      : interfaceY + longueurIncident * Math.cos(resultat.angleRefracteRad);
  const lignesVerticales = useMemo(
    () => Array.from({ length: 7 }, (_, index) => (index / 6) * largeur),
    [largeur]
  );

  return (
    <View style={[styles.graph, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={themeActif.mediumA} height={interfaceY} width={largeur} x={0} y={0} />
        <Rect fill={themeActif.mediumB} height={hauteur - interfaceY} width={largeur} x={0} y={interfaceY} />
        {lignesVerticales.map((x, index) => (
          <Line key={`grille-${index}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={x} x2={x} y1={0} y2={hauteur} />
        ))}

        <Line stroke={themeActif.border} strokeWidth={2} x1={0} x2={largeur} y1={interfaceY} y2={interfaceY} />
        <Line
          stroke={themeActif.mutedInk}
          strokeDasharray="6 6"
          strokeOpacity={0.7}
          strokeWidth={1.2}
          x1={centreX}
          x2={centreX}
          y1={interfaceY - 112}
          y2={interfaceY + 112}
        />

        <Line stroke={themeActif.incident} strokeLinecap="round" strokeWidth={3} x1={departIncidentX} x2={centreX} y1={departIncidentY} y2={interfaceY} />
        <Path d={cheminPointeFleche(centreX, interfaceY, Math.atan2(interfaceY - departIncidentY, centreX - departIncidentX))} stroke={themeActif.incident} strokeLinecap="round" strokeWidth={2} />

        <Line stroke={themeActif.reflected} strokeLinecap="round" strokeWidth={2.6} x1={centreX} x2={finReflechiX} y1={interfaceY} y2={finReflechiY} />
        <Path d={cheminPointeFleche(finReflechiX, finReflechiY, Math.atan2(finReflechiY - interfaceY, finReflechiX - centreX))} stroke={themeActif.reflected} strokeLinecap="round" strokeWidth={1.8} />

        {resultat.angleRefracteRad !== null ? (
          <>
            <Line stroke={themeActif.refracted} strokeLinecap="round" strokeWidth={3} x1={centreX} x2={finRefracteX} y1={interfaceY} y2={finRefracteY} />
            <Path d={cheminPointeFleche(finRefracteX, finRefracteY, Math.atan2(finRefracteY - interfaceY, finRefracteX - centreX))} stroke={themeActif.refracted} strokeLinecap="round" strokeWidth={2} />
          </>
        ) : (
          <SvgText fill={themeActif.reflected} fontSize="13" fontWeight="900" textAnchor="middle" x={centreX} y={interfaceY + 44}>
            Reflexion totale interne
          </SvgText>
        )}

        <SvgText fill={themeActif.mutedInk} fontSize="12" fontWeight="800" x={12} y={24}>
          n1 = {formaterNombre(n1, 2)}
        </SvgText>
        <SvgText fill={themeActif.mutedInk} fontSize="12" fontWeight="800" x={12} y={interfaceY + 24}>
          n2 = {formaterNombre(n2, 2)}
        </SvgText>
      </Svg>

      <View pointerEvents="none" style={styles.legendeDansGraphique}>
        <View style={styles.legendRow}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.incident }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Incident
          </TexteTheme>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.reflected }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Reflechi
          </TexteTheme>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.refracted }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Refracte
          </TexteTheme>
        </View>
      </View>
    </View>
  );
}

export function SimulationOptiqueRefraction() {
  const [n1, definirN1] = useState(1);
  const [n2, definirN2] = useState(1.5);
  const [angleIncident, definirAngleIncident] = useState(30);
  const defilementY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const resultat = useMemo(() => calculerSnell(n1, n2, angleIncident), [angleIncident, n1, n2]);

  const remplissageHorizontal = width >= 1200 ? 12 : 16;
  const largeurContenu = width - remplissageHorizontal * 2;
  const affichageLarge = width >= 980;
  const affichageCompact = width < 560;
  const largeurGraphique = affichageLarge ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const hauteurGraphique = affichageLarge
    ? borner(Math.round(largeurGraphique * 0.58), 420, 620)
    : borner(Math.round(largeurGraphique * 0.74), 320, 500);
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
          <EnteteEcranSimulation titre="Optique et refraction" domaine="physique" />
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
            <GraphiqueOptiqueRefraction
              hauteur={hauteurGraphique}
              largeur={largeurGraphique}
              n1={n1}
              n2={n2}
              resultat={resultat}
            />

            <View style={[styles.sidebar, { paddingRight: affichageLarge ? 44 : 0, width: largeurPanneau }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="n1 sin(theta1) = n2 sin(theta2)"
                  mathematiques={'n_1\\sin(\\theta_1)=n_2\\sin(\\theta_2)'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Indice n1" max={2.5} min={1} onChange={definirN1} precision={2} step={0.05} value={n1} />
                <CurseurNumerique label="Indice n2" max={2.5} min={1} onChange={definirN2} precision={2} step={0.05} value={n2} />
                <CurseurNumerique label="Angle incident" max={89} min={1} onChange={definirAngleIncident} step={1} unit="°" value={angleIncident} />
              </View>

              <View style={styles.statsBloc}>
                <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Angle réfracté
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {resultat.reflexionTotale ? '—' : `${formaterNombre(resultat.angleRefracteDegres, 1)}°`}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Angle critique
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {resultat.angleCritique === null ? 'Aucun' : `${formaterNombre(resultat.angleCritique, 1)}°`}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    État
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {resultat.etat}
                  </TexteTheme>
                </View>
              </View>

                <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                  <View style={styles.statCard}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Angle réfléchi
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                      {formaterNombre(resultat.angleReflechiDegres, 1)}°
                    </TexteTheme>
                  </View>
                  <View style={styles.statCard}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Déviation
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                      {resultat.deviationDegres === null ? '—' : `${formaterNombre(resultat.deviationDegres, 1)}°`}
                    </TexteTheme>
                  </View>
                  <View style={styles.statCard}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Direction
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                      {resultat.directionDeviation}
                    </TexteTheme>
                  </View>
                </View>

                <View style={styles.statCardWide}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Vitesse de la lumière
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    v₁ = {formaterVitesseScientifique(resultat.vitesse1)}
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    v₂ = {formaterVitesseScientifique(resultat.vitesse2)}
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statHint}>
                    {resultat.ralentissement.valeur === null
                      ? resultat.ralentissement.label
                      : `${resultat.ralentissement.label} : ${formaterNombre(resultat.ralentissement.valeur, 1)}%`}
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'La lumiere change de direction quand elle traverse deux milieux d indices differents.',
          'Si elle passe d un milieu plus refringent vers un milieu moins refringent avec un angle trop grand, elle peut etre totalement reflechie.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Quand n1 est plus grand que n2, augmente l angle incident pour observer la reflexion totale interne."
        eyebrow="Definition"
        title="Qu est ce que la refraction ?"
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
  legendeDansGraphique: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    bottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    left: 12,
    maxWidth: '92%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
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
  statsGrid: {
    gap: 12,
    width: '100%',
  },
  statsBloc: {
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
  statCardWide: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 7,
    justifyContent: 'center',
    minHeight: 124,
    paddingHorizontal: 12,
    paddingVertical: 16,
    width: '100%',
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
  statHint: {
    color: themeActif.mutedInk,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendLine: {
    borderRadius: 999,
    height: 3,
    width: 26,
  },
  legendText: {
    color: themeActif.mutedInk,
    fontSize: 11,
    lineHeight: 14,
  },
});
