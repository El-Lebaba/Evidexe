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
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { utiliserIntervalleSimulation } from '@/features/simulations/core/utiliser-intervalle-simulation';

type SignalConfig = {
  coeff: (k: number) => number;
  description: string;
  label: string;
  latex: string;
};

type GraphPoint = {
  x: number;
  y: number;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const HARMONIC_MIN = 1;
const HARMONIC_MAX = 30;
const GRAPH_SAMPLE_STEP = Platform.OS === 'web' ? 2 : 5;
const HARMONIC_PATH_LIMIT = Platform.OS === 'web' ? 5 : 3;
const PHASOR_LIMIT = Platform.OS === 'web' ? 8 : 6;
const themeActif = {
  approximation: '#7CCFBF',
  background: '#E9ECE4',
  border: '#243B53',
  component1: '#7EA6E0',
  component2: '#D8A94A',
  component3: '#D97B6C',
  component4: '#AAB18E',
  component5: '#6E7F73',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  phasorCircle: 'rgba(36, 59, 83, 0.34)',
  surface: '#F3F1E7',
};

const COMPONENT_COLORS = [
  themeActif.component1,
  themeActif.component2,
  themeActif.component3,
  themeActif.component4,
  themeActif.component5,
];

const SIGNALS: SignalConfig[] = [
  {
    coeff: (k) => (k % 2 === 0 ? 0 : 4 / (Math.PI * k)),
    description: 'Les harmoniques impaires reconstruisent progressivement une onde carree.',
    label: 'Carree',
    latex: '\\text{carree}',
  },
  {
    coeff: (k) => (k === 0 ? 0 : (2 * (-1) ** (k + 1)) / (Math.PI * k)),
    description: 'Une dent de scie utilise toutes les frequences avec des amplitudes qui decroissent en 1/n.',
    label: 'Dent de scie',
    latex: '\\text{dent de scie}',
  },
  {
    coeff: (k) =>
      k % 2 === 0
        ? 0
        : ((8 / (Math.PI * Math.PI)) * (-1) ** ((k - 1) / 2)) / (k * k),
    description: 'L onde triangle converge plus vite car ses coefficients decroissent en 1/n^2.',
    label: 'Triangle',
    latex: '\\text{triangle}',
  },
];

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

function formaterNombre(value: number) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  const absoluteValue = Math.abs(value);

  if (absoluteValue !== 0 && (absoluteValue >= 1000 || absoluteValue < 0.001)) {
    return value.toExponential(3);
  }

  return value.toFixed(3);
}

function approximationFourier(x: number, n: number, signal: SignalConfig) {
  let sum = 0;

  for (let k = 1; k <= n; k += 1) {
    sum += signal.coeff(k) * Math.sin(k * x);
  }

  return sum;
}

function obtenirPointOnde(px: number, width: number, height: number, phase: number, nTerms: number, signal: SignalConfig) {
  const x = (px / width) * 4 * Math.PI - 2 * Math.PI;
  const shiftedX = x - phase * 0.55;
  const y = approximationFourier(shiftedX, nTerms, signal);
  const scale = height * 0.33;

  return {
    x: px,
    y: height / 2 - y * scale,
  };
}

function creerChemin(points: GraphPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function GraphiqueOndeFourier({
  graphHeight,
  graphWidth,
  nTerms,
  phase,
  showComponents,
  signal,
}: {
  graphHeight: number;
  graphWidth: number;
  nTerms: number;
  phase: number;
  showComponents: boolean;
  signal: SignalConfig;
}) {
  const approximationPath = useMemo(() => {
    const points: GraphPoint[] = [];

    for (let px = 0; px <= graphWidth; px += GRAPH_SAMPLE_STEP) {
      points.push(obtenirPointOnde(px, graphWidth, graphHeight, phase, nTerms, signal));
    }

    return creerChemin(points);
  }, [graphHeight, graphWidth, nTerms, phase, signal]);

  const harmonicPaths = useMemo(() => {
    if (!showComponents) {
      return [];
    }

    return Array.from({ length: Math.min(nTerms, HARMONIC_PATH_LIMIT) }, (_, index) => {
      const harmonic = index + 1;
      const amplitude = signal.coeff(harmonic);
      const points: GraphPoint[] = [];

      for (let px = 0; px <= graphWidth; px += GRAPH_SAMPLE_STEP) {
        const x = (px / graphWidth) * 4 * Math.PI - 2 * Math.PI - phase * 0.55;
        const y = Math.sin(harmonic * x) * amplitude;
        points.push({
          x: px,
          y: graphHeight / 2 - y * (graphHeight * 0.33),
        });
      }

      return {
        color: COMPONENT_COLORS[index % COMPONENT_COLORS.length],
        path: creerChemin(points),
      };
    });
  }, [graphHeight, graphWidth, nTerms, phase, showComponents, signal]);
  const horizontalGrid = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index / 8) * graphHeight),
    [graphHeight]
  );
  const verticalGrid = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index / 8) * graphWidth),
    [graphWidth]
  );

  return (
    <View style={[styles.graph, { height: graphHeight, width: graphWidth }]}>
      <Svg height={graphHeight} width={graphWidth}>
        <Rect fill={themeActif.panel} height={graphHeight} width={graphWidth} x={0} y={0} />

        {horizontalGrid.map((y, index) => (
          <Line
            key={`h-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1}
            x1={0}
            x2={graphWidth}
            y1={y}
            y2={y}
          />
        ))}
        {verticalGrid.map((x, index) => (
          <Line
            key={`v-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1}
            x1={x}
            x2={x}
            y1={0}
            y2={graphHeight}
          />
        ))}

        <Line
          stroke={themeActif.grid}
          strokeWidth={1.5}
          x1={0}
          x2={graphWidth}
          y1={graphHeight / 2}
          y2={graphHeight / 2}
        />

        {harmonicPaths.map((harmonic, index) => (
          <Path
            d={harmonic.path}
            fill="none"
            key={`harmonic-${index}`}
            stroke={harmonic.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.55}
            strokeWidth={1.5}
          />
        ))}

        <Path
          d={approximationPath}
          fill="none"
          stroke={themeActif.approximation}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3.25}
        />
      </Svg>

      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.approximation }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Somme
          </TexteTheme>
        </View>
        {showComponents ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: themeActif.component1 }]} />
            <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
              Harmoniques
            </TexteTheme>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function GraphiquePhaseurs({
  graphHeight,
  graphWidth,
  nTerms,
  phase,
  signal,
}: {
  graphHeight: number;
  graphWidth: number;
  nTerms: number;
  phase: number;
  signal: SignalConfig;
}) {
  const phasorData = useMemo(() => {
    const centerX = graphWidth * 0.22;
    const centerY = graphHeight / 2;
    const scale = Math.min(graphWidth, graphHeight) * 0.16;
    const circles: { cx: number; cy: number; r: number }[] = [];
    const segments: { color: string; x1: number; x2: number; y1: number; y2: number }[] = [];

    let x = centerX;
    let y = centerY;

    for (let harmonic = 1; harmonic <= Math.min(nTerms, PHASOR_LIMIT); harmonic += 1) {
      const amplitude = Math.abs(signal.coeff(harmonic));

      if (amplitude < 0.001) {
        continue;
      }

      const angle = harmonic * phase * 1.4;
      const nextX = x + amplitude * scale * Math.cos(angle);
      const nextY = y - amplitude * scale * Math.sin(angle);

      circles.push({ cx: x, cy: y, r: amplitude * scale });
      segments.push({
        color: COMPONENT_COLORS[(harmonic - 1) % COMPONENT_COLORS.length],
        x1: x,
        x2: nextX,
        y1: y,
        y2: nextY,
      });

      x = nextX;
      y = nextY;
    }

    return {
      circles,
      endX: x,
      endY: y,
      segments,
    };
  }, [graphHeight, graphWidth, nTerms, phase, signal]);

  return (
    <View style={[styles.GraphiquePhaseurs, { height: graphHeight, width: graphWidth }]}>
      <Svg height={graphHeight} width={graphWidth}>
        <Rect fill={themeActif.panel} height={graphHeight} width={graphWidth} x={0} y={0} />

        {phasorData.circles.map((circle, index) => (
          <Circle
            cx={circle.cx}
            cy={circle.cy}
            fill="none"
            key={`circle-${index}`}
            r={circle.r}
            stroke={themeActif.phasorCircle}
            strokeWidth={1}
          />
        ))}

        {phasorData.segments.map((segment, index) => (
          <Line
            key={`segment-${index}`}
            stroke={segment.color}
            strokeWidth={2}
            x1={segment.x1}
            x2={segment.x2}
            y1={segment.y1}
            y2={segment.y2}
          />
        ))}

        <Line
          stroke={themeActif.border}
          strokeDasharray="6 6"
          strokeWidth={1.5}
          x1={phasorData.endX}
          x2={graphWidth - 18}
          y1={phasorData.endY}
          y2={phasorData.endY}
        />
        <Circle cx={phasorData.endX} cy={phasorData.endY} fill={themeActif.approximation} r={5} />
      </Svg>
    </View>
  );
}

function CurseurHarmoniques({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const ratio = measuredWidth === 0 ? 0 : position / measuredWidth;
      const nextValue = borner(
        Math.round(HARMONIC_MIN + ratio * (HARMONIC_MAX - HARMONIC_MIN)),
        HARMONIC_MIN,
        HARMONIC_MAX
      );
      onChange(nextValue);
    });
  }, [onChange]);

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

  const percent = ((value - HARMONIC_MIN) / (HARMONIC_MAX - HARMONIC_MIN || 1)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          Nombre d harmoniques
        </TexteTheme>
      </View>

      <View {...panResponder.panHandlers} style={[styles.sliderTrack, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderThumb, WEB_SLIDER_INTERACTION_STYLE, { left: `${percent}%` }]} />
      </View>

    </View>
  );
}

export function SimulationFourier() {
  const isFocused = useIsFocused();
  const [signalIndex, setSignalIndex] = useState(0);
  const [nTerms, setNTerms] = useState(5);
  const [showComponents, setShowComponents] = useState(true);
  const [phase, setPhase] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  utiliserIntervalleSimulation(isFocused, () => {
    setPhase((current) => current + 0.032);
  }, 32);

  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.82), 540, 820)
    : borner(Math.round(graphWidth * 0.82), 400, 580);
  const phasorHeight = 210;
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;

  const activeSignal = SIGNALS[signalIndex];
  const approximationAtPiOver2 = approximationFourier(Math.PI / 2, nTerms, activeSignal);
  const strongestCoefficient = useMemo(
    () => Math.max(...Array.from({ length: nTerms }, (_, index) => Math.abs(activeSignal.coeff(index + 1)))),
    [activeSignal, nTerms]
  );
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -HAUTEUR_TOTALE_ENTETE_SIMULATION],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0],
    extrapolate: 'clamp',
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
          <EnteteEcranSimulation titre="Fourier" domaine="mathematiques"/>
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
                alignItems: 'flex-start',
                flexDirection: isWide ? 'row' : 'column',
                minHeight: isWide ? graphHeight + 60 : undefined,
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                width: contentWidth,
              },
            ]}>
            <View style={[styles.graphColumn, { width: graphWidth }]}>
              <GraphiqueOndeFourier
                graphHeight={graphHeight}
                graphWidth={graphWidth}
                nTerms={nTerms}
                phase={phase}
                showComponents={showComponents}
                signal={activeSignal}
              />

              <View style={styles.phasorHeader}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.phasorLabel}>
                  Diagramme de phase
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.phasorSubLabel}>
                  Somme tournante des harmoniques
                </TexteTheme>
              </View>

              <GraphiquePhaseurs
                graphHeight={phasorHeight}
                graphWidth={graphWidth}
                nTerms={nTerms}
                phase={phase}
                signal={activeSignal}
              />
            </View>

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback={'f(x) = somme a_n sin(nx) + b_n cos(nx)'}
                  mathematiques={'f(x)=\\sum a_n\\sin(nx)+b_n\\cos(nx)'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <View style={styles.controlHeader}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
                    Signal
                  </TexteTheme>
                </View>

                <View style={styles.signalGrid}>
                  {SIGNALS.map((signal, index) => {
                    const isActive = signalIndex === index;

                    return (
                      <Pressable
                        key={signal.label}
                        onPress={() => setSignalIndex(index)}
                        style={[styles.signalButton, isActive ? styles.signalButtonActive : undefined]}>
                        <TexteTheme lightColor="#000000" style={styles.signalButtonText}>
                          {signal.label}
                        </TexteTheme>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.infoCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.infoLabel}>
                    Lecture
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.infoText}>
                    {activeSignal.description}
                  </TexteTheme>
                </View>
              </View>

              <View style={styles.panel}>
                <CurseurHarmoniques onChange={setNTerms} value={nTerms} />
              </View>

              <View style={styles.panel}>
                <Pressable
                  onPress={() => setShowComponents((current) => !current)}
                  style={[styles.toggleButton, showComponents ? styles.toggleButtonActive : undefined]}>
                  <TexteTheme lightColor="#000000" style={styles.toggleText}>
                    {showComponents ? 'Composantes visibles' : 'Afficher les composantes'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Harmoniques
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {nTerms}
                  </TexteTheme>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Pn(pi/2)
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(approximationAtPiOver2)}
                  </TexteTheme>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Coefficient max
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(strongestCoefficient)}
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Une serie de Fourier reconstruit un signal periodique a partir d une somme d ondes sinusoidales simples.',
          'Chaque harmonique ajoute une frequence supplementaire. Plus on ajoute d harmoniques, plus la forme du signal se rapproche du motif vise.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="La courbe principale montre la somme totale, et le diagramme de phase montre comment les composantes se combinent."
        eyebrow="Definition"
        title="Qu est ce qu une serie de Fourier ?"
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
    alignItems: 'flex-start',
    gap: 20,
  },
  graphColumn: {
    gap: 16,
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
  GraphiquePhaseurs: {
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
  phasorHeader: {
    gap: 2,
  },
  phasorLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  phasorSubLabel: {
    color: themeActif.ink,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
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
  controlHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: themeActif.mutedInk,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  signalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  signalButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexBasis: '31%',
    flexGrow: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  signalButtonActive: {
    backgroundColor: themeActif.approximation,
    borderColor: themeActif.approximation,
  },
  signalButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  infoText: {
    color: themeActif.mutedInk,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  sliderBlock: {
    gap: 16,
  },
  sliderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderTrack: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderFill: {
    backgroundColor: themeActif.grid,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  sliderThumb: {
    backgroundColor: themeActif.ink,
    borderColor: themeActif.panel,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    marginLeft: -9,
    position: 'absolute',
    width: 18,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleButtonActive: {
    backgroundColor: themeActif.component2,
    borderColor: themeActif.component2,
  },
  toggleText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
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
    padding: 18,
  },
  statFormulaWrap: {
    minHeight: 24,
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
  statValue: {
    color: themeActif.ink,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
});

