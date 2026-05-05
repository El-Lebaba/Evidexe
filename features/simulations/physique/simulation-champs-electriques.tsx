import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
  EnteteEcranSimulation,
} from '@/features/simulations/core/entete-ecran-simulation';

type ChargeNormalisee = {
  q: number;
  x: number;
  y: number;
};

type ConfigurationCharges = {
  charges: ChargeNormalisee[];
  description: string;
  label: string;
};

type VecteurChamp = {
  angle: number;
  longueur: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

type PointGraphique = {
  x: number;
  y: number;
};

const CercleAnime = Animated.createAnimatedComponent(Circle);

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const CONSTANTE_COULOMB = 8.9875517923e9;
const CHARGE_REFERENCE = 1e-9;
const DISTANCE_REFERENCE_METRES = 0.08;
const DISTANCE_REFERENCE_PIXELS = 80;
const DISTANCE_MINIMALE_METRES = 0.005;

const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  chargeNegative: '#3F8D83',
  chargePositive: '#D97B6C',
  champFaible: '#5FAFA7',
  champFort: '#2F7E8D',
  champMoyen: '#3F8D83',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  surface: '#F3F1E7',
};

const CONFIGURATIONS: ConfigurationCharges[] = [
  {
    charges: [
      { x: 0.35, y: 0.5, q: 1 },
      { x: 0.65, y: 0.5, q: -1 },
    ],
    description: 'Une charge positive et une charge negative.',
    label: 'Dipole',
  },
  {
    charges: [
      { x: 0.35, y: 0.5, q: 1 },
      { x: 0.65, y: 0.5, q: 1 },
    ],
    description: 'Deux charges positives qui repoussent le champ vers l exterieur.',
    label: 'Deux +',
  },
  {
    charges: [
      { x: 0.3, y: 0.3, q: 1 },
      { x: 0.7, y: 0.3, q: -1 },
      { x: 0.5, y: 0.7, q: 1 },
    ],
    description: 'Trois charges avec superposition des contributions.',
    label: 'Triangle',
  },
  {
    charges: [{ x: 0.5, y: 0.5, q: 1 }],
    description: 'Une seule charge positive, source du champ electrique.',
    label: 'Charge +',
  },
];

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function formaterNombre(valeur: number, chiffres = 2) {
  if (!Number.isFinite(valeur)) {
    return '--';
  }

  const arrondi = Number(valeur.toFixed(chiffres));
  return Object.is(arrondi, -0) ? (0).toFixed(chiffres) : arrondi.toFixed(chiffres);
}

function cheminPointeFleche(x: number, y: number, angle: number) {
  const taille = 5.5;
  const gaucheX = x - taille * Math.cos(angle - 0.45);
  const gaucheY = y - taille * Math.sin(angle - 0.45);
  const droiteX = x - taille * Math.cos(angle + 0.45);
  const droiteY = y - taille * Math.sin(angle + 0.45);

  return `M ${x.toFixed(2)} ${y.toFixed(2)} L ${gaucheX.toFixed(2)} ${gaucheY.toFixed(2)} M ${x.toFixed(2)} ${y.toFixed(2)} L ${droiteX.toFixed(2)} ${droiteY.toFixed(2)}`;
}

function calculerCharges(charges: ChargeNormalisee[], largeur: number, hauteur: number) {
  return charges.map((charge) => ({
    q: charge.q,
    x: charge.x * largeur,
    y: charge.y * hauteur,
  }));
}

function calculerChampElectriqueAuPoint(
  charges: ReturnType<typeof calculerCharges>,
  pointX: number,
  pointY: number
) {
  const metresParPixel = DISTANCE_REFERENCE_METRES / DISTANCE_REFERENCE_PIXELS;
  let totalEx = 0;
  let totalEy = 0;

  charges.forEach((charge) => {
    const dxPixels = pointX - charge.x;
    const dyPixels = pointY - charge.y;
    const dx = dxPixels * metresParPixel;
    const dy = dyPixels * metresParPixel;
    const distanceCarree = dx * dx + dy * dy;
    const distance = Math.max(Math.sqrt(distanceCarree), DISTANCE_MINIMALE_METRES);
    const intensite = (CONSTANTE_COULOMB * charge.q * CHARGE_REFERENCE) / (distance * distance);

    totalEx += (intensite * dx) / distance;
    totalEy += (intensite * dy) / distance;
  });

  return {
    angleDegres: (Math.atan2(totalEy, totalEx) * 180) / Math.PI,
    ex: totalEx,
    ey: totalEy,
    norme: Math.sqrt(totalEx * totalEx + totalEy * totalEy),
  };
}

function obtenirPositionMetres(point: PointGraphique | null) {
  if (!point) {
    return null;
  }

  const metresParPixel = DISTANCE_REFERENCE_METRES / DISTANCE_REFERENCE_PIXELS;

  return {
    x: point.x * metresParPixel,
    y: point.y * metresParPixel,
  };
}

function calculerVecteursChamp(charges: ReturnType<typeof calculerCharges>, largeur: number, hauteur: number) {
  const pas = largeur < 430 ? 44 : 52;
  const vecteurs: VecteurChamp[] = [];

  for (let x = pas; x < largeur; x += pas) {
    for (let y = pas; y < hauteur; y += pas) {
      if (charges.some((charge) => {
        const dx = x - charge.x;
        const dy = y - charge.y;
        return dx * dx + dy * dy < 180;
      })) {
        continue;
      }

      const champ = calculerChampElectriqueAuPoint(charges, x, y);

      if (champ.norme < 0.00001) {
        continue;
      }

      const nx = champ.ex / champ.norme;
      const ny = champ.ey / champ.norme;
      const longueur = borner(champ.norme * 0.13, 7, 16);
      const x1 = x - (nx * longueur) / 2;
      const y1 = y - (ny * longueur) / 2;
      const x2 = x + (nx * longueur) / 2;
      const y2 = y + (ny * longueur) / 2;

      vecteurs.push({
        angle: Math.atan2(ny, nx),
        longueur,
        x1,
        x2,
        y1,
        y2,
      });
    }
  }

  return vecteurs;
}

function GraphiqueChampsElectriques({
  chargesNormalisees,
  hauteur,
  largeur,
  onSelectionPoint,
  pointSelectionne,
  progressionFlux,
}: {
  chargesNormalisees: ChargeNormalisee[];
  hauteur: number;
  largeur: number;
  onSelectionPoint: (point: PointGraphique) => void;
  pointSelectionne: PointGraphique | null;
  progressionFlux: Animated.Value;
}) {
  const charges = useMemo(() => calculerCharges(chargesNormalisees, largeur, hauteur), [chargesNormalisees, hauteur, largeur]);
  const vecteurs = useMemo(() => calculerVecteursChamp(charges, largeur, hauteur), [charges, hauteur, largeur]);
  const lignesHorizontales = useMemo(
    () => Array.from({ length: 6 }, (_, index) => 32 + index * ((hauteur - 64) / 5)),
    [hauteur]
  );
  const coucheVecteurs = useMemo(
    () =>
      vecteurs.map((vecteur, index) => {
        const couleur =
          vecteur.longueur > 13
            ? themeActif.champFort
            : vecteur.longueur > 10
              ? themeActif.champMoyen
              : themeActif.champFaible;

        return (
          <G key={`vecteur-${index}`}>
            <Line
              stroke={couleur}
              strokeLinecap="round"
              strokeOpacity={0.86}
              strokeWidth={1.6}
              x1={vecteur.x1}
              x2={vecteur.x2}
              y1={vecteur.y1}
              y2={vecteur.y2}
            />
            <Path
              d={cheminPointeFleche(vecteur.x2, vecteur.y2, vecteur.angle)}
              stroke={couleur}
              strokeLinecap="round"
              strokeOpacity={0.92}
              strokeWidth={1.45}
            />
          </G>
        );
      }),
    [vecteurs]
  );
  const coucheFlux = useMemo(
    () =>
      vecteurs
        .filter((_vecteur, index) => index % 2 === 0)
        .map((vecteur, index) => {
          const couleur =
            vecteur.longueur > 13
              ? themeActif.champFort
              : vecteur.longueur > 10
                ? themeActif.champMoyen
                : themeActif.champFaible;
          const cx = progressionFlux.interpolate({
            inputRange: [0, 1],
            outputRange: [vecteur.x1, vecteur.x2],
          });
          const cy = progressionFlux.interpolate({
            inputRange: [0, 1],
            outputRange: [vecteur.y1, vecteur.y2],
          });
          const opacity = progressionFlux.interpolate({
            inputRange: [0, 0.18, 0.82, 1],
            outputRange: [0, 0.78, 0.78, 0],
          });

          return (
            <CercleAnime
              key={`flux-${index}`}
              cx={cx as any}
              cy={cy as any}
              fill={couleur}
              opacity={opacity as any}
              r={2.4}
            />
          );
        }),
    [progressionFlux, vecteurs]
  );

  return (
    <View
      onStartShouldSetResponder={() => true}
      onResponderGrant={(event) => {
        onSelectionPoint({
          x: borner(event.nativeEvent.locationX, 0, largeur),
          y: borner(event.nativeEvent.locationY, 0, hauteur),
        });
      }}
      style={[styles.graph, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={themeActif.panel} height={hauteur} width={largeur} x={0} y={0} />
        {lignesHorizontales.map((y) => (
          <Line key={`ligne-${y}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={0} x2={largeur} y1={y} y2={y} />
        ))}

        {coucheVecteurs}
        {coucheFlux}

        {charges.map((charge, index) => {
          const positive = charge.q > 0;
          const couleur = positive ? themeActif.chargePositive : themeActif.chargeNegative;

          return (
            <G key={`charge-${index}`}>
              <Circle cx={charge.x} cy={charge.y} fill={couleur} opacity={0.18} r={20} />
              <Circle cx={charge.x} cy={charge.y} fill={couleur} r={13} stroke={themeActif.border} strokeWidth={1.4} />
              <SvgText
                fill={themeActif.surface}
                fontSize="18"
                fontWeight="900"
                pointerEvents="none"
                textAnchor="middle"
                x={charge.x}
                y={charge.y + 6}>
                {positive ? '+' : '-'}
              </SvgText>
            </G>
          );
        })}

        {pointSelectionne ? (
          <G>
            <Circle
              cx={pointSelectionne.x}
              cy={pointSelectionne.y}
              fill="rgba(216, 169, 74, 0.18)"
              r={12}
              stroke={themeActif.accent}
              strokeWidth={1.4}
            />
            <Line
              stroke={themeActif.accent}
              strokeLinecap="round"
              strokeWidth={1.6}
              x1={pointSelectionne.x - 6}
              x2={pointSelectionne.x + 6}
              y1={pointSelectionne.y}
              y2={pointSelectionne.y}
            />
            <Line
              stroke={themeActif.accent}
              strokeLinecap="round"
              strokeWidth={1.6}
              x1={pointSelectionne.x}
              x2={pointSelectionne.x}
              y1={pointSelectionne.y - 6}
              y2={pointSelectionne.y + 6}
            />
          </G>
        ) : null}
      </Svg>

      <View pointerEvents="none" style={styles.legendeDansGraphique}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: themeActif.chargePositive }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Positive
          </TexteTheme>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: themeActif.chargeNegative }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Negative
          </TexteTheme>
        </View>
      </View>
    </View>
  );
}

export function SimulationChampsElectriques() {
  const estFocalise = useIsFocused();
  const [indexConfiguration, definirIndexConfiguration] = useState(0);
  const [pointSelectionne, definirPointSelectionne] = useState<PointGraphique | null>(null);
  const progressionFlux = useRef(new Animated.Value(0)).current;
  const defilementY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const configurationActive = CONFIGURATIONS[indexConfiguration];

  const remplissageHorizontal = width >= 1200 ? 12 : 16;
  const largeurContenu = width - remplissageHorizontal * 2;
  const affichageLarge = width >= 980;
  const affichageCompact = width < 560;
  const largeurGraphique = affichageLarge ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const hauteurGraphique = affichageLarge
    ? borner(Math.round(largeurGraphique * 0.58), 420, 620)
    : borner(Math.round(largeurGraphique * 0.74), 320, 500);
  const largeurPanneau = affichageLarge ? largeurContenu - largeurGraphique - 28 : largeurContenu;
  const chargesGraphique = useMemo(
    () => calculerCharges(configurationActive.charges, largeurGraphique, hauteurGraphique),
    [configurationActive.charges, hauteurGraphique, largeurGraphique]
  );
  const champCentre = useMemo(
    () => calculerChampElectriqueAuPoint(chargesGraphique, largeurGraphique / 2, hauteurGraphique / 2),
    [chargesGraphique, hauteurGraphique, largeurGraphique]
  );
  const champPointSelectionne = useMemo(
    () =>
      pointSelectionne
        ? calculerChampElectriqueAuPoint(chargesGraphique, pointSelectionne.x, pointSelectionne.y)
        : null,
    [chargesGraphique, pointSelectionne]
  );
  const positionSelectionnee = useMemo(() => obtenirPositionMetres(pointSelectionne), [pointSelectionne]);
  const nombreChargesPositives = configurationActive.charges.filter((charge) => charge.q > 0).length;
  const nombreChargesNegatives = configurationActive.charges.length - nombreChargesPositives;

  useEffect(() => {
    if (!estFocalise) {
      progressionFlux.stopAnimation();
      return;
    }

    const animationFlux = Animated.loop(
      Animated.timing(progressionFlux, {
        duration: 1350,
        toValue: 1,
        useNativeDriver: false,
      })
    );

    progressionFlux.setValue(0);
    animationFlux.start();

    return () => {
      animationFlux.stop();
    };
  }, [estFocalise, progressionFlux]);

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
          <EnteteEcranSimulation titre="Champs electriques" domaine="physique" />
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
            <GraphiqueChampsElectriques
              chargesNormalisees={configurationActive.charges}
              hauteur={hauteurGraphique}
              largeur={largeurGraphique}
              onSelectionPoint={definirPointSelectionne}
              pointSelectionne={pointSelectionne}
              progressionFlux={progressionFlux}
            />

            <View style={[styles.sidebar, { paddingRight: affichageLarge ? 44 : 0, width: largeurPanneau }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="E = k |q| / r^2"
                  mathematiques={'E=\\frac{k|q|}{r^2}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
                  Configuration des charges
                </TexteTheme>
                <View style={styles.presetsGrid}>
                  {CONFIGURATIONS.map((configuration, index) => {
                    const actif = index === indexConfiguration;

                    return (
                      <Pressable
                        key={configuration.label}
                        onPress={() => definirIndexConfiguration(index)}
                        style={({ pressed, hovered }) => [
                          styles.presetButton,
                          actif ? styles.presetButtonActive : null,
                          pressed || hovered ? styles.presetButtonPressed : null,
                        ]}>
                        <TexteTheme lightColor={themeActif.ink} style={styles.presetButtonText}>
                          {configuration.label}
                        </TexteTheme>
                      </Pressable>
                    );
                  })}
                </View>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.descriptionConfiguration}>
                  {configurationActive.description}
                </TexteTheme>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Charges positives
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {nombreChargesPositives}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Charges negatives
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {nombreChargesNegatives}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Champ total au centre
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(champCentre.norme, 2)} N/C
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Champ total au point sélectionné
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {champPointSelectionne ? `${formaterNombre(champPointSelectionne.norme, 2)} N/C` : '— N/C'}
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statHint}>
                    {champPointSelectionne
                      ? `Direction : ${formaterNombre(champPointSelectionne.angleDegres, 1)}°`
                      : 'Sélectionne un point'}
                  </TexteTheme>
                  {positionSelectionnee ? (
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statHint}>
                      x = {formaterNombre(positionSelectionnee.x, 3)} m, y = {formaterNombre(positionSelectionnee.y, 3)} m
                    </TexteTheme>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Une charge electrique cree un champ qui agit sur les autres charges.',
          'Le champ sort des charges positives et pointe vers les charges negatives.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Une charge test positive suivrait le sens des fleches affichees dans le graphe."
        eyebrow="Definition"
        title="Qu est ce qu un champ electrique ?"
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
    gap: 14,
    padding: 16,
    width: '100%',
  },
  label: {
    color: themeActif.mutedInk,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexGrow: 1,
    minHeight: 42,
    minWidth: 92,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  presetButtonActive: {
    backgroundColor: themeActif.accent,
  },
  presetButtonPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  presetButtonText: {
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
    textAlign: 'center',
  },
  descriptionConfiguration: {
    color: themeActif.mutedInk,
    fontSize: 13,
    lineHeight: 19,
  },
  statsGrid: {
    flexWrap: 'wrap',
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
    minWidth: 150,
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
  statHint: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  legendText: {
    color: themeActif.mutedInk,
    fontSize: 11,
    lineHeight: 14,
  },
});
