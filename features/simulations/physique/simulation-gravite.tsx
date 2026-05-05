import { useIsFocused } from '@react-navigation/native';
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
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

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
  integer?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  scale?: 'linear' | 'power';
  step: number;
  unit: string;
  value: number;
};

type RangePreset = 'distance' | 'mass';

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const CONSTANTE_GRAVITATIONNELLE = 6.67430e-11;
const GRAVITE_TERRESTRE = 9.81;

const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  bodyA: '#7CCFBF',
  bodyADeep: '#3F8D83',
  bodyASoft: 'rgba(124, 207, 191, 0.22)',
  bodyB: '#D8A94A',
  bodyBDeep: '#9A7432',
  bodyBSoft: 'rgba(216, 169, 74, 0.2)',
  border: '#243B53',
  field: '#7DC9BE',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  pull: '#D97B6C',
  surface: '#F3F1E7',
};

const WEB_SLIDER_INTERACTION_STYLE =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

function borner(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculerForceGravitationnelle(masse1Kg: number, masse2Kg: number, distanceMetres: number) {
  if (distanceMetres <= 0) {
    return 0;
  }

  return (CONSTANTE_GRAVITATIONNELLE * masse1Kg * masse2Kg) / (distanceMetres * distanceMetres);
}

function arrondirAuPas(value: number, step: number) {
  return Math.round(value / step) * step;
}

function obtenirPasAdaptatif(value: number, preset: RangePreset) {
  if (preset === 'distance') {
    if (value < 100) {
      return 5;
    }

    if (value < 1000) {
      return 25;
    }

    return 100;
  }

  if (value < 100) {
    return 5;
  }

  if (value < 1000) {
    return 25;
  }

  if (value < 10000) {
    return 100;
  }

  return 1000;
}

function valeurDepuisPourcentageCurseur(percent: number, min: number, max: number, scale: ProprietesCurseurNumerique['scale']) {
  if (scale !== 'power') {
    return min + percent * (max - min);
  }

  return min + Math.pow(percent, 3.2) * (max - min);
}

function pourcentageCurseurDepuisValeur(value: number, min: number, max: number, scale: ProprietesCurseurNumerique['scale']) {
  const linearPercent = borner((value - min) / (max - min), 0, 1);

  if (scale !== 'power') {
    return linearPercent * 100;
  }

  return Math.pow(linearPercent, 1 / 3.2) * 100;
}

function formaterValeurCompacte(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  }

  if (value >= 10000) {
    return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`;
  }

  return value.toFixed(0);
}

function formaterForceNewtonsLatex(force: number) {
  if (!Number.isFinite(force)) {
    return '--';
  }

  if (force !== 0 && Math.abs(force) < 0.001) {
    const [mantissa, exponent] = force.toExponential(2).split('e');

    return `${mantissa}\\times10^{${Number(exponent)}}\\ \\text{N}`;
  }

  return `${force.toFixed(3)}\\ \\text{N}`;
}

function formaterNombreScientifiqueLatex(value: number) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) {
    const [mantissa, exponent] = value.toExponential(2).split('e');

    return `${mantissa}\\times10^{${Number(exponent)}}`;
  }

  return value.toFixed(3);
}

function formaterNombreScientifique(value: number) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) {
    return value.toExponential(2).replace('e', ' x 10^');
  }

  return value.toFixed(1);
}

function formaterScientifiqueCompact(value: number) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) {
    const [mantissa, exponent] = value.toExponential(2).split('e');

    return `${mantissa}e${Number(exponent)}`;
  }

  return value.toFixed(3);
}

function formaterRatioPoidsCorps(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return 'N/A';
  }

  if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) {
    const [mantissa, exponent] = value.toExponential(2).split('e');

    return `${mantissa} x 10^${Number(exponent)} x poids`;
  }

  return `${value.toFixed(3)} x poids`;
}

function formaterRatioPoidsCorpsLatex(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return '\\text{N/A}';
  }

  if (value !== 0 && (Math.abs(value) >= 10000 || Math.abs(value) < 0.001)) {
    const [mantissa, exponent] = value.toExponential(2).split('e');

    return `${mantissa}\\times10^{${Number(exponent)}}\\times\\text{ poids}`;
  }

  return `${value.toFixed(3)}\\times\\text{ poids}`;
}

function decrireForce(force: number) {
  if (force >= 1) {
    return 'Tres forte';
  }

  if (force >= 1e-3) {
    return 'Forte';
  }

  if (force >= 1e-7) {
    return 'Visible';
  }

  if (force >= 1e-11) {
    return 'Tres faible';
  }

  return 'Minuscule';
}

function CurseurNumerique({
  integer = false,
  label,
  max,
  min,
  onChange,
  scale = 'linear',
  step,
  unit,
  value,
}: ProprietesCurseurNumerique) {
  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const rawValue = valeurDepuisPourcentageCurseur(position / measuredWidth, min, max, scale);
      const adaptiveStep = scale === 'power' ? obtenirPasAdaptatif(rawValue, unit === 'm' ? 'distance' : 'mass') : step;
      const nextValue = borner(arrondirAuPas(rawValue, adaptiveStep), min, max);
      onChange(integer ? Math.round(nextValue) : Number(nextValue.toFixed(1)));
    });
  }, [integer, max, min, onChange, scale, step, unit]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: setFromEvent,
        onPanResponderMove: setFromEvent,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
      }),
    [setFromEvent]
  );

  const percent = pourcentageCurseurDepuisValeur(value, min, max, scale);
  const displayValue = integer ? value.toFixed(0) : value.toFixed(1);

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          {label}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.ink} style={styles.sliderValueText}>
          {scale === 'power' ? formaterValeurCompacte(value) : displayValue} {unit}
        </TexteTheme>
      </View>
      <View {...panResponder.panHandlers} style={[styles.sliderTrack, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderThumb, WEB_SLIDER_INTERACTION_STYLE, { left: `${percent}%` }]} />
      </View>
    </View>
  );
}

function GraphiqueGravite({
  distance,
  graphHeight,
  graphWidth,
  mass1,
  mass2,
  phase,
  visualForce,
}: {
  distance: number;
  graphHeight: number;
  graphWidth: number;
  mass1: number;
  mass2: number;
  phase: number;
  visualForce: number;
}) {
  const centerY = graphHeight / 2;
  const centerX = graphWidth / 2;
  const distancePercent = Math.log(distance / 5) / Math.log(10000 / 5);
  const visualDistance = borner(96 + distancePercent * graphWidth * 0.46, 96, graphWidth * 0.68);
  const x1 = centerX - visualDistance / 2;
  const x2 = centerX + visualDistance / 2;
  const r1 = 18 + Math.log10(mass1 / 5 + 1) * 11;
  const r2 = 18 + Math.log10(mass2 / 5 + 1) * 11;
  const arrowLength = borner(14 + visualForce * 42, 14, 56);

  const fieldLines = useMemo(() => {
    const count = borner(Math.round(visualForce * 12) + 9, 9, 21);

    return Array.from({ length: count }, (_, index) => {
      const ratio = count === 1 ? 0 : index / (count - 1);
      const offset = (ratio - 0.5) * 2;
      const wave = Math.sin(phase * 1.7 + index * 0.65) * 5;
      const startX = x1 + r1 * (0.7 + Math.abs(offset) * 0.1);
      const startY = centerY + offset * r1 * 0.82 + wave;
      const endX = x2 - r2 * (0.7 + Math.abs(offset) * 0.1);
      const endY = centerY - offset * r2 * 0.82 - wave;
      const pinchY = centerY + Math.sin(phase + index) * 7;

      return {
        d: `M ${startX.toFixed(2)} ${startY.toFixed(2)} Q ${centerX.toFixed(2)} ${pinchY.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`,
        opacity: 0.2 + (1 - Math.abs(offset)) * 0.34,
      };
    });
  }, [centerX, centerY, phase, r1, r2, visualForce, x1, x2]);

  return (
    <View style={[styles.graph, { height: graphHeight, width: graphWidth }]}>
      <Svg height={graphHeight} width={graphWidth}>
        <Defs>
          <RadialGradient cx="38%" cy="34%" id="bodyA" r="70%">
            <Stop offset="0%" stopColor="#DDF8EF" />
            <Stop offset="48%" stopColor={themeActif.bodyA} />
            <Stop offset="100%" stopColor={themeActif.bodyADeep} />
          </RadialGradient>
          <RadialGradient cx="38%" cy="34%" id="bodyB" r="70%">
            <Stop offset="0%" stopColor="#FFE9B2" />
            <Stop offset="50%" stopColor={themeActif.bodyB} />
            <Stop offset="100%" stopColor={themeActif.bodyBDeep} />
          </RadialGradient>
        </Defs>

        <Rect fill={themeActif.panel} height={graphHeight} width={graphWidth} x={0} y={0} />

        {Array.from({ length: 8 }, (_, index) => (
          <Line
            key={`grid-h-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1}
            x1={0}
            x2={graphWidth}
            y1={(index / 7) * graphHeight}
            y2={(index / 7) * graphHeight}
          />
        ))}

        {fieldLines.map((line, index) => (
          <Path
            d={line.d}
            fill="none"
            key={`field-${index}`}
            stroke={themeActif.field}
            strokeOpacity={line.opacity}
            strokeWidth={1.25}
          />
        ))}

        <Line
          stroke={themeActif.grid}
          strokeDasharray="5 5"
          strokeOpacity={0.9}
          strokeWidth={1.5}
          x1={x1}
          x2={x2}
          y1={graphHeight - 42}
          y2={graphHeight - 42}
        />
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={x1} x2={x1} y1={graphHeight - 48} y2={graphHeight - 36} />
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={x2} x2={x2} y1={graphHeight - 48} y2={graphHeight - 36} />

        <Line
          stroke={themeActif.pull}
          strokeLinecap="round"
          strokeWidth={3}
          x1={x1 + r1 + 8}
          x2={x1 + r1 + 8 + arrowLength}
          y1={centerY}
          y2={centerY}
        />
        <Path
          d={`M ${x1 + r1 + 8 + arrowLength} ${centerY} l -9 -7 m 9 7 l -9 7`}
          fill="none"
          stroke={themeActif.pull}
          strokeLinecap="round"
          strokeWidth={3}
        />
        <Line
          stroke={themeActif.pull}
          strokeLinecap="round"
          strokeWidth={3}
          x1={x2 - r2 - 8}
          x2={x2 - r2 - 8 - arrowLength}
          y1={centerY}
          y2={centerY}
        />
        <Path
          d={`M ${x2 - r2 - 8 - arrowLength} ${centerY} l 9 -7 m -9 7 l 9 7`}
          fill="none"
          stroke={themeActif.pull}
          strokeLinecap="round"
          strokeWidth={3}
        />

        <Circle cx={x1} cy={centerY} fill={themeActif.bodyASoft} r={r1 + 20} />
        <Circle cx={x1} cy={centerY} fill={themeActif.bodyASoft} r={r1 + 12} />
        <Circle cx={x2} cy={centerY} fill={themeActif.bodyBSoft} r={r2 + 20} />
        <Circle cx={x2} cy={centerY} fill={themeActif.bodyBSoft} r={r2 + 12} />
        <Circle cx={x1} cy={centerY} fill="url(#bodyA)" r={r1} stroke={themeActif.surface} strokeOpacity={0.45} strokeWidth={1.5} />
        <Circle cx={x2} cy={centerY} fill="url(#bodyB)" r={r2} stroke={themeActif.surface} strokeOpacity={0.45} strokeWidth={1.5} />

        <SvgText fill={themeActif.ink} fontSize="12" fontWeight="700" textAnchor="middle" x={x1} y={centerY + r1 + 24}>
          m1 = {formaterValeurCompacte(mass1)} kg
        </SvgText>
        <SvgText fill={themeActif.ink} fontSize="12" fontWeight="700" textAnchor="middle" x={x2} y={centerY + r2 + 24}>
          m2 = {formaterValeurCompacte(mass2)} kg
        </SvgText>
        <SvgText fill={themeActif.mutedInk} fontSize="12" fontWeight="700" textAnchor="middle" x={centerX} y={graphHeight - 20}>
          d = {formaterValeurCompacte(distance)} m
        </SvgText>
      </Svg>

      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.field }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Champ
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.pull }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Force
          </TexteTheme>
        </View>
      </View>
    </View>
  );
}

export function SimulationGravite() {
  const isFocused = useIsFocused();
  const [mass1, setMass1] = useState(50);
  const [mass2, setMass2] = useState(30);
  const [distance, setDistance] = useState(150);
  const [phase, setPhase] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  utiliserIntervalleSimulation(isFocused, () => {
    setPhase((current) => current + 0.035);
  }, 40);

  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.62), 460, 680)
    : borner(Math.round(graphWidth * 0.74), 340, 500);
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;
  const force = calculerForceGravitationnelle(mass1, mass2, distance);
  const acceleration1 = force / mass1;
  const acceleration2 = force / mass2;
  const earthWeight1 = mass1 * GRAVITE_TERRESTRE;
  const earthWeightRatio = earthWeight1 > 0 && Number.isFinite(force) ? force / earthWeight1 : null;
  const visualForce = force > 0 ? borner((Math.log10(force) + 12) / 12, 0, 1) : 0;

  const headerTranslateY = scrollY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 120],
    outputRange: [0, -HAUTEUR_TOTALE_ENTETE_SIMULATION],
  });
  const headerOpacity = scrollY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <VueTheme lightColor={themeActif.background} style={styles.container}>
        <Animated.View
          style={[
            styles.headerOverlay,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}>
          <EnteteEcranSimulation titre="Gravite" domaine="physique" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.workspace,
              {
                alignItems: isWide ? 'center' : 'stretch',
                flexDirection: isWide ? 'row' : 'column',
                minHeight: isWide ? graphHeight + 40 : undefined,
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                width: contentWidth,
              },
            ]}>
            <GraphiqueGravite
              distance={distance}
              graphHeight={graphHeight}
              graphWidth={graphWidth}
              mass1={mass1}
              mass2={mass2}
              phase={phase}
              visualForce={visualForce}
            />

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="F = (G * m1 * m2) / d^2"
                  mathematiques={'F=\\frac{G\\,m_1m_2}{d^2}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique
                  integer
                  label="Masse 1"
                  max={1000000}
                  min={5}
                  onChange={setMass1}
                  scale="power"
                  step={1}
                  unit="kg"
                  value={mass1}
                />
                <CurseurNumerique
                  integer
                  label="Masse 2"
                  max={1000000}
                  min={5}
                  onChange={setMass2}
                  scale="power"
                  step={1}
                  unit="kg"
                  value={mass2}
                />
                <CurseurNumerique
                  integer
                  label="Distance"
                  max={10000}
                  min={5}
                  onChange={setDistance}
                  scale="power"
                  step={1}
                  unit="m"
                  value={distance}
                />
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={[styles.statCard, isCompact ? undefined : styles.statCardSlim]}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force
                  </TexteTheme>
                  <View style={styles.statValueFormulaWrap}>
                    <RenduFormule
                      fallback={formaterNombreScientifique(force) + ' N'}
                      mathematiques={formaterForceNewtonsLatex(force)}
                      centered
                      size="sm"
                    />
                  </View>
                </View>
                <View style={[styles.statCard, isCompact ? undefined : styles.statCardWide]}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Accel. grav.
                  </TexteTheme>
                  <View style={styles.accelerationRows}>
                    <View style={styles.accelerationFormulaLine}>
                      <RenduFormule
                        fallback={`a1 = ${formaterScientifiqueCompact(acceleration1)}`}
                        mathematiques={`a_1=${formaterNombreScientifiqueLatex(acceleration1)}`}
                        centered
                        size="sm"
                      />
                    </View>
                    <View style={styles.accelerationFormulaLine}>
                      <RenduFormule
                        fallback={`a2 = ${formaterScientifiqueCompact(acceleration2)}`}
                        mathematiques={`a_2=${formaterNombreScientifiqueLatex(acceleration2)}`}
                        centered
                        size="sm"
                      />
                    </View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.accelerationUnit}>
                      m/s^2
                    </TexteTheme>
                  </View>
                </View>
                <View style={[styles.statCard, isCompact ? undefined : styles.statCardSlim]}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Etat
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {decrireForce(force)}
                  </TexteTheme>
                </View>
              </View>

              <View style={styles.comparisonCard}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.infoLabel}>
                  Compare au poids terrestre
                </TexteTheme>
                <View style={styles.earthWeightFormulaWrap}>
                  <RenduFormule
                    fallback={formaterRatioPoidsCorps(earthWeightRatio).replace('body weight', 'poids')}
                    mathematiques={formaterRatioPoidsCorpsLatex(earthWeightRatio)}
                    centered
                    size="sm"
                  />
                </View>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.earthWeightSubtext}>
                  Force / poids terrestre de la masse 1
                </TexteTheme>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'La gravitation universelle dit que deux objets avec une masse s attirent toujours.',
          'La force est proportionnelle au produit des masses et inversement proportionnelle au carre de la distance.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Si tu doubles une masse, la force double. Si tu doubles la distance, la force devient quatre fois plus petite."
        eyebrow="Definition"
        title="Qu est ce que la gravitation ?"
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
  graphLegend: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    bottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    left: 12,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
  },
  legendItem: {
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
  panel: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 18,
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
  sliderBlock: {
    gap: 12,
  },
  sliderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderValueText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  sliderTrack: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderFill: {
    backgroundColor: themeActif.accent,
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  sliderThumb: {
    backgroundColor: themeActif.ink,
    borderColor: themeActif.surface,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: -10,
    position: 'absolute',
    width: 20,
  },
  infoLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
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
    gap: 6,
    justifyContent: 'center',
    minHeight: 108,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  statCardSlim: {
    flex: 0.82,
  },
  statCardWide: {
    flex: 1.55,
  },
  statLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statFormulaWrap: {
    minHeight: 30,
    width: '100%',
  },
  statValueFormulaWrap: {
    minHeight: 36,
    width: '100%',
  },
  accelerationRows: {
    gap: 4,
    width: '100%',
  },
  accelerationFormulaLine: {
    minHeight: 30,
    width: '100%',
  },
  accelerationUnit: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'right',
    width: '100%',
  },
  statValue: {
    color: themeActif.ink,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
    textAlign: 'center',
  },
  statValueSmall: {
    color: themeActif.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  earthWeightFormulaWrap: {
    minHeight: 34,
    width: '100%',
  },
  earthWeightSubtext: {
    color: themeActif.mutedInk,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  comparisonText: {
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});


