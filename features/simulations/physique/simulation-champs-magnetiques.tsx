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
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

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

type FilConducteur = {
  courant: number;
  x: number;
  y: number;
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

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const MU_ZERO = 4 * Math.PI * 1e-7;
const DISTANCE_REFERENCE_METRES = 0.08;
const DISTANCE_REFERENCE_PIXELS = 80;
const DISTANCE_MINIMALE_METRES = 0.005;

const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  champ: '#7CCFBF',
  courantEntrant: '#D97B6C',
  courantSortant: '#7CCFBF',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  champFort: '#2F7E8D',
  champMoyen: '#3F8D83',
  champFaible: '#5FAFA7',
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

function calculerFils(nombreFils: number, courant: number, largeur: number, hauteur: number) {
  const rayonDisposition = Math.min(largeur, hauteur) * 0.23;
  const centreX = largeur / 2;
  const centreY = hauteur / 2;

  return Array.from({ length: nombreFils }, (_, index) => {
    const angle = (index / nombreFils) * Math.PI * 2 - Math.PI / 2;

    return {
      courant: courant * (index % 2 === 0 ? 1 : -1),
      x: centreX + rayonDisposition * Math.cos(angle),
      y: centreY + rayonDisposition * Math.sin(angle),
    };
  });
}

function calculerVecteursChamp(fils: FilConducteur[], largeur: number, hauteur: number, afficherChamp: boolean) {
  if (!afficherChamp) {
    return [];
  }

  const pas = largeur < 430 ? 44 : 52;
  const vecteurs: VecteurChamp[] = [];

  for (let x = pas; x < largeur; x += pas) {
    for (let y = pas; y < hauteur; y += pas) {
      let bx = 0;
      let by = 0;

      fils.forEach((fil) => {
        const dx = x - fil.x;
        const dy = y - fil.y;
        const rayonCarre = dx * dx + dy * dy;

        if (rayonCarre < 150) {
          return;
        }

        const intensite = fil.courant / rayonCarre;
        bx += -dy * intensite;
        by += dx * intensite;
      });

      const norme = Math.sqrt(bx * bx + by * by);

      if (norme < 0.0001) {
        continue;
      }

      const nx = bx / norme;
      const ny = by / norme;
      const longueur = borner(norme * 390, 7, 16);
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

function calculerChampTotalAuPoint(fils: FilConducteur[], point: PointGraphique | null) {
  if (!point) {
    return null;
  }

  const metresParPixel = DISTANCE_REFERENCE_METRES / DISTANCE_REFERENCE_PIXELS;
  let totalBx = 0;
  let totalBy = 0;

  fils.forEach((fil) => {
    const dxPixels = point.x - fil.x;
    const dyPixels = point.y - fil.y;
    const dx = dxPixels * metresParPixel;
    const dy = dyPixels * metresParPixel;
    const distanceCarree = dx * dx + dy * dy;
    const distance = Math.max(Math.sqrt(distanceCarree), DISTANCE_MINIMALE_METRES);
    const champ = (MU_ZERO * Math.abs(fil.courant)) / (2 * Math.PI * distance);

    if (fil.courant > 0) {
      totalBx += (-champ * dy) / distance;
      totalBy += (champ * dx) / distance;
      return;
    }

    totalBx += (champ * dy) / distance;
    totalBy += (-champ * dx) / distance;
  });

  const norme = Math.sqrt(totalBx * totalBx + totalBy * totalBy);
  const angleDegres = (Math.atan2(totalBy, totalBx) * 180) / Math.PI;

  return {
    angleDegres,
    microteslas: norme * 1000000,
  };
}

function GraphiqueChampsMagnetiques({
  afficherChamp,
  courant,
  hauteur,
  largeur,
  nombreFils,
  onSelectionPoint,
  pointSelectionne,
}: {
  afficherChamp: boolean;
  courant: number;
  hauteur: number;
  largeur: number;
  nombreFils: number;
  onSelectionPoint: (point: PointGraphique) => void;
  pointSelectionne: PointGraphique | null;
}) {
  const fils = useMemo(() => calculerFils(nombreFils, courant, largeur, hauteur), [courant, hauteur, largeur, nombreFils]);
  const vecteurs = useMemo(() => calculerVecteursChamp(fils, largeur, hauteur, afficherChamp), [afficherChamp, fils, hauteur, largeur]);
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

        {fils.map((fil, index) => {
          const sortant = fil.courant > 0;
          const couleur = sortant ? themeActif.courantSortant : themeActif.courantEntrant;

          return (
            <G key={`fil-${index}`}>
              <Circle cx={fil.x} cy={fil.y} fill={couleur} opacity={0.18} r={18} />
              <Circle cx={fil.x} cy={fil.y} fill={couleur} r={12} stroke={themeActif.border} strokeWidth={1.4} />
              {sortant ? (
                <Circle cx={fil.x} cy={fil.y} fill={themeActif.surface} r={3.2} />
              ) : (
                <>
                  <Line stroke={themeActif.surface} strokeLinecap="round" strokeWidth={2.6} x1={fil.x - 4.4} x2={fil.x + 4.4} y1={fil.y - 4.4} y2={fil.y + 4.4} />
                  <Line stroke={themeActif.surface} strokeLinecap="round" strokeWidth={2.6} x1={fil.x + 4.4} x2={fil.x - 4.4} y1={fil.y - 4.4} y2={fil.y + 4.4} />
                </>
              )}
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
          <View style={[styles.legendLine, { backgroundColor: themeActif.courantSortant }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Sortant
          </TexteTheme>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: themeActif.courantEntrant }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Entrant
          </TexteTheme>
        </View>
      </View>
    </View>
  );
}

export function SimulationChampsMagnetiques() {
  const [nombreFils, definirNombreFils] = useState(2);
  const [courant, definirCourant] = useState(1);
  const [afficherChamp, definirAfficherChamp] = useState(true);
  const [pointSelectionne, definirPointSelectionne] = useState<PointGraphique | null>(null);
  const defilementY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const remplissageHorizontal = width >= 1200 ? 12 : 16;
  const largeurContenu = width - remplissageHorizontal * 2;
  const affichageLarge = width >= 980;
  const affichageCompact = width < 560;
  const largeurGraphique = affichageLarge ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const hauteurGraphique = affichageLarge
    ? borner(Math.round(largeurGraphique * 0.58), 420, 620)
    : borner(Math.round(largeurGraphique * 0.74), 320, 500);
  const largeurPanneau = affichageLarge ? largeurContenu - largeurGraphique - 28 : largeurContenu;
  const champReference = (MU_ZERO * courant) / (2 * Math.PI * DISTANCE_REFERENCE_METRES);
  const filsGraphique = useMemo(
    () => calculerFils(nombreFils, courant, largeurGraphique, hauteurGraphique),
    [courant, hauteurGraphique, largeurGraphique, nombreFils]
  );
  const champTotalSelectionne = useMemo(
    () => calculerChampTotalAuPoint(filsGraphique, pointSelectionne),
    [filsGraphique, pointSelectionne]
  );

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
          <EnteteEcranSimulation titre="Champs magnetiques" domaine="physique" />
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
            <GraphiqueChampsMagnetiques
              afficherChamp={afficherChamp}
              courant={courant}
              hauteur={hauteurGraphique}
              largeur={largeurGraphique}
              nombreFils={nombreFils}
              onSelectionPoint={definirPointSelectionne}
              pointSelectionne={pointSelectionne}
            />

            <View style={[styles.sidebar, { paddingRight: affichageLarge ? 44 : 0, width: largeurPanneau }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="B = mu0 I / 2 pi r"
                  mathematiques={'B=\\frac{\\mu_0 I}{2\\pi r}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Nombre de fils" max={6} min={1} onChange={definirNombreFils} step={1} value={nombreFils} />
                <CurseurNumerique
                  label="Courant"
                  max={3}
                  min={0.5}
                  onChange={definirCourant}
                  precision={1}
                  step={0.1}
                  unit="A"
                  value={courant}
                />

                <Pressable
                  onPress={() => definirAfficherChamp((valeurCourante) => !valeurCourante)}
                  style={({ pressed, hovered }) => [
                    styles.toggleButton,
                    pressed || hovered ? styles.toggleButtonPressed : null,
                  ]}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.toggleText}>
                    {afficherChamp ? 'Masquer les lignes de champ' : 'Afficher les lignes de champ'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Champ d’un fil à 8 cm
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre(champReference * 1000000, 2)} µT
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Superposition
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {nombreFils} fils
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Champ total au point sélectionné
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {champTotalSelectionne ? `${formaterNombre(champTotalSelectionne.microteslas, 2)} µT` : '— µT'}
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statHint}>
                    {champTotalSelectionne
                      ? `Direction : ${formaterNombre(champTotalSelectionne.angleDegres, 1)}°`
                      : 'Sélectionne un point'}
                  </TexteTheme>
                </View>
              </View>

            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Autour d un fil parcouru par un courant, le champ magnetique forme des cercles.',
          'Le sens du champ depend du sens du courant et les champs de plusieurs fils se superposent.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Un point vert sort de l ecran. Une croix rouge entre dans l ecran."
        eyebrow="Definition"
        title="Qu est ce qu un champ magnetique ?"
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
  toggleButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
  },
  toggleButtonPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  toggleText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
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
  legendLine: {
    borderRadius: 999,
    height: 3,
    width: 26,
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
