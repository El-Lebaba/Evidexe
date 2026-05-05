import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
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

type MathFunction = {
  derivativeLatex: string;
  derivativeLabel: string;
  label: string;
  latex: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
};

type Domain = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type Point = {
  x: number;
  y: number;
};

const FUNCTIONS: MathFunction[] = [
  { label: 'x^2', latex: 'x^2', derivativeLabel: '2x', derivativeLatex: '2x', fn: (x) => x * x, dfn: (x) => 2 * x },
  { label: 'x^3', latex: 'x^3', derivativeLabel: '3x^2', derivativeLatex: '3x^2', fn: (x) => x * x * x, dfn: (x) => 3 * x * x },
  { label: 'sin(x)', latex: '\\sin(x)', derivativeLabel: 'cos(x)', derivativeLatex: '\\cos(x)', fn: (x) => Math.sin(x), dfn: (x) => Math.cos(x) },
  { label: 'e^x', latex: 'e^x', derivativeLabel: 'e^x', derivativeLatex: 'e^x', fn: (x) => Math.exp(x), dfn: (x) => Math.exp(x) },
  { label: 'ln(x)', latex: '\\ln(x)', derivativeLabel: '1/x', derivativeLatex: '\\frac{1}{x}', fn: (x) => (x > 0 ? Math.log(x) : NaN), dfn: (x) => (x > 0 ? 1 / x : NaN) },
  { label: 'cos(x)', latex: '\\cos(x)', derivativeLabel: '-sin(x)', derivativeLatex: '-\\sin(x)', fn: (x) => Math.cos(x), dfn: (x) => -Math.sin(x) },
];

const DOMAIN: Domain = { xMin: -5, xMax: 5, yMin: -4, yMax: 4 };
const TRACK_MIN = -4;
const TRACK_MAX = 4;
const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const themeActif = {
  background: "#E9ECE4",
  panel: "#DDE4D5",
  surface: "#F3F1E7",
  border: "#243B53",

  ink: "#243B53",
  mutedInk: "#6E7F73",

  // accent: "#AAB58A", temp
  // accentSoft: "#D8CBB4", temp

  grid: "#B7C7B0",
  gridSoft: "rgba(167, 184, 158, 0.35)",

  function: "#7CCFBF",
  derivative: "#7EA6E0",
  tangent: "#D8A94A",
  point: "#D97B6C"
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

function formaterNombre(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : '--';
}

function obtenirPointEcran(x: number, y: number, width: number, height: number, domain: Domain): Point {
  return {
    x: ((x - domain.xMin) / (domain.xMax - domain.xMin)) * width,
    y: height - ((y - domain.yMin) / (domain.yMax - domain.yMin)) * height,
  };
}

function echantillonnerFonction(
  fn: (x: number) => number,
  width: number,
  height: number,
  domain: Domain,
  steps = 100
) {
  const paths: Point[][] = [];
  let currentPath: Point[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const x = domain.xMin + (index / steps) * (domain.xMax - domain.xMin);
    const y = fn(x);
    const isVisible = Number.isFinite(y) && y >= domain.yMin && y <= domain.yMax;

    if (isVisible) {
      currentPath.push(obtenirPointEcran(x, y, width, height, domain));
    } else if (currentPath.length > 0) {
      paths.push(currentPath);
      currentPath = [];
    }
  }

  if (currentPath.length > 0) {
    paths.push(currentPath);
  }

  return paths;
}

function creerDonneesChemin(path: Point[]) {
  return path
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function TraceChemin({ paths, color, thickness, dashed = false }: {
  paths: Point[][];
  color: string;
  thickness: number;
  dashed?: boolean;
}) {
  return paths.map((path, index) => (
    <Path
      d={creerDonneesChemin(path)}
      fill="none"
      key={index}
      stroke={color}
      strokeDasharray={dashed ? '8 6' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={thickness}
    />
  ));
}

function GraphiqueDerivee({
  activeFunction,
  graphHeight,
  graphWidth,
  x0,
}: {
  activeFunction: MathFunction;
  graphHeight: number;
  graphWidth: number;
  x0: number;
}) {
  const functionPaths = useMemo(
    () => echantillonnerFonction(activeFunction.fn, graphWidth, graphHeight, DOMAIN),
    [activeFunction, graphHeight, graphWidth]
  );
  const derivativePaths = useMemo(
    () => echantillonnerFonction(activeFunction.dfn, graphWidth, graphHeight, DOMAIN),
    [activeFunction, graphHeight, graphWidth]
  );

  const y0 = activeFunction.fn(x0);
  const slope = activeFunction.dfn(x0);
  const point = Number.isFinite(y0) ? obtenirPointEcran(x0, y0, graphWidth, graphHeight, DOMAIN) : null;
  const tangentPaths = useMemo(
    () =>
      Number.isFinite(y0) && Number.isFinite(slope)
        ? echantillonnerFonction((x) => y0 + slope * (x - x0), graphWidth, graphHeight, DOMAIN, 40)
        : [],
    [graphHeight, graphWidth, slope, x0, y0]
  );
  const horizontalGrid = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index / 8) * graphHeight),
    [graphHeight]
  );
  const verticalGrid = useMemo(
    () => Array.from({ length: 11 }, (_, index) => (index / 10) * graphWidth),
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
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={0} x2={graphWidth} y1={graphHeight / 2} y2={graphHeight / 2} />
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={graphWidth / 2} x2={graphWidth / 2} y1={0} y2={graphHeight} />

        <TraceChemin color={themeActif.derivative} dashed paths={derivativePaths} thickness={2.25} />
        <TraceChemin color={themeActif.function} paths={functionPaths} thickness={3.25} />
        <TraceChemin color={themeActif.tangent} paths={tangentPaths} thickness={3} />

        {point ? (
          <Circle cx={point.x} cy={point.y} fill={themeActif.point} r={6} stroke={themeActif.panel} strokeWidth={2} />
        ) : null}
      </Svg>

      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.function }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            f(x)
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, styles.legendDashed, { backgroundColor: themeActif.derivative }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            {"f'(x)"}
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.tangent }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Tangente
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Point x0
          </TexteTheme>
        </View>
      </View>

      {point ? (
        <View style={[styles.slopePill, { left: borner(point.x + 10, 8, graphWidth - 112), top: borner(point.y - 34, 8, graphHeight - 34) }]}>
            <TexteTheme lightColor={themeActif.ink} style={styles.slopeText}>
              Pente  {formaterNombre(slope)}
            </TexteTheme>
          </View>
      ) : null}
    </View>
  );
}

function CurseurX({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [typedValue, setTypedValue] = useState(value.toFixed(2));

  useEffect(() => {
    setTypedValue(value.toFixed(2));
  }, [value]);

  const commitTypedValue = () => {
    const normalizedValue = typedValue.replace(',', '.').trim();
    const nextValue = Number(normalizedValue);

    if (!Number.isFinite(nextValue)) {
      setTypedValue(value.toFixed(2));
      return;
    }

    const clampedValue = borner(Number(nextValue.toFixed(2)), TRACK_MIN, TRACK_MAX);
    onChange(clampedValue);
    setTypedValue(clampedValue.toFixed(2));
  };

  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    const width = event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const nextValue = TRACK_MIN + (position / measuredWidth) * (TRACK_MAX - TRACK_MIN);
      onChange(Number(nextValue.toFixed(2)));
    });

    return width;
  }, [onChange]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: setFromEvent,
        onPanResponderMove: setFromEvent,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [setFromEvent]
  );

  const percent = ((value - TRACK_MIN) / (TRACK_MAX - TRACK_MIN)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          Valeur X
        </TexteTheme>
        <TextInput
          inputMode="decimal"
          keyboardType="numeric"
          onBlur={commitTypedValue}
          onChangeText={setTypedValue}
          onSubmitEditing={commitTypedValue}
          selectTextOnFocus
          style={styles.sliderValueInput}
          value={typedValue}
        />
      </View>
      <View {...panResponder.panHandlers} style={[styles.sliderTrack, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderThumb, WEB_SLIDER_INTERACTION_STYLE, { left: `${percent}%` }]} />
      </View>
      <View style={styles.stepperRow}>
        <Pressable onPress={() => onChange(borner(Number((value - 0.1).toFixed(2)), TRACK_MIN, TRACK_MAX))} style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            -0.1
          </TexteTheme>
        </Pressable>
        <Pressable onPress={() => onChange(borner(Number((value + 0.1).toFixed(2)), TRACK_MIN, TRACK_MAX))} style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            +0.1
          </TexteTheme>
        </Pressable>
      </View>
    </View>
  );
}

export function SimulationDerivees() {
  const [functionIndex, setFunctionIndex] = useState(0);
  const [x0, setX0] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.82), 540, 820)
    : borner(Math.round(graphWidth * 0.82), 400, 580);
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;
  const activeFunction = FUNCTIONS[functionIndex];
  const y0 = activeFunction.fn(x0);
  const slope = activeFunction.dfn(x0);
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
          <EnteteEcranSimulation titre="Derivees" domaine="mathematiques"/>
        </Animated.View>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.workspace,
              {
                width: contentWidth,
                alignItems: isWide ? 'center' : 'stretch',
                flexDirection: isWide ? 'row' : 'column',
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                minHeight: isWide ? graphHeight + 40 : undefined,
              },
            ]}>
            <GraphiqueDerivee activeFunction={activeFunction} graphHeight={graphHeight} graphWidth={graphWidth} x0={x0} />

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback={"f'(x) = lim h->0 (f(x+h) - f(x)) / h"}
                  mathematiques={"f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}"}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <View style={styles.controlHeader}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
                    Fonction
                  </TexteTheme>
                  <View style={styles.activeFormulaWrap}>
                    <RenduFormule fallback={activeFunction.label} mathematiques={activeFunction.latex} size="sm" />
                  </View>
                </View>
                <View style={styles.functionGrid}>
                  {FUNCTIONS.map((mathFunction, index) => {
                    const isActive = functionIndex === index;

                    return (
                      <Pressable
                        key={mathFunction.label}
                        onPress={() => setFunctionIndex(index)}
                        style={[styles.functionButton, isActive ? styles.functionButtonActive : undefined]}>
                        <View style={styles.functionButtonFormula}>
                          <RenduFormule
                            fallback={mathFunction.label}
                            mathematiques={mathFunction.latex}
                            centered
                            size="sm"
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.derivativeFormulaCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.derivativeFormulaLabel}>
                    {'Fonction d\u00e9riv\u00e9e'}
                  </TexteTheme>
                  <RenduFormule fallback={`f(x) = ${activeFunction.label}`} mathematiques={`f(x)=${activeFunction.latex}`} />
                  <RenduFormule fallback={`f'(x) = ${activeFunction.derivativeLabel}`} mathematiques={`f'(x)=${activeFunction.derivativeLatex}`} />
                </View>
              </View>

              <View style={styles.panel}>
                <CurseurX onChange={setX0} value={x0} />
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback="f(x0)" mathematiques="f(x_0)" centered size="sm" />
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(y0)}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback="f'(x0)" mathematiques="f'(x_0)" centered size="sm" />
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(slope)}
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "La dÃ©rivÃ©e d'une fonction mesure la rapidit\u00e9 avec laquelle une fonction varie en un point pr\u00e9cis.",
          "Sur le graphique, elle correspond \u00e0 la pente de la tangente au point x0. Si la pente est positive, la courbe monte. Si elle est n\u00e9gative, la courbe descend. Si elle vaut 0, la courbe est localement plate.",
        ]}
        exampleLabel="Lecture rapide"
        exampleText={'f(x0) donne la hauteur du point sur la courbe, et f\u2019(x0) donne sa pente \u00e0 cet endroit.'}
        eyebrow="D\u00e9finition"
        title={'Qu\u2019est-ce qu\u2019une d\u00e9riv\u00e9e ?'}
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
  slopePill: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
  },
  slopeText: {
    color: themeActif.ink,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
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
    maxWidth: 280,
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
  legendDashed: {
    opacity: 0.7,
    width: 18,
  },
  legendDot: {
    backgroundColor: themeActif.point,
    borderRadius: 5,
    height: 10,
    width: 10,
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
  controlHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: themeActif.mutedInk,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  valueLabel: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  activeFormulaWrap: {
    minWidth: 72,
  },
  functionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  functionButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexBasis: '30%',
    flexGrow: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  functionButtonActive: {
    backgroundColor: themeActif.function,
    borderColor: themeActif.function,
  },
  functionButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  functionButtonFormula: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    width: '100%',
  },
  derivativeFormulaCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  derivativeFormulaLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  derivativeFormulaValue: {
    color: themeActif.ink,
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  sliderBlock: {
    gap: 16,
  },
  sliderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderValueInput: {
    color: themeActif.ink,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 58,
    padding: 0,
    textAlign: 'right',
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
  stepperRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  stepText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
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
  statLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  statFormulaWrap: {
    minHeight: 24,
    width: '100%',
  },
  statValue: {
    color: themeActif.ink,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
});

