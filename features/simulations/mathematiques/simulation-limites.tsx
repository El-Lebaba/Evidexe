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

type Domain = {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
};

type GraphPoint = {
  x: number;
  y: number;
};

type LimitFunction = {
  domain: Domain;
  fn: (x: number) => number;
  label: string;
  latex: string;
  limitAt: number;
  limitLabel: string;
  limitValue: number;
  limitValueLabel: string;
  note: string;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const APPROACH_MIN = 0.1;
const APPROACH_MAX = 2;
const themeActif = {
  background: '#E9ECE4',
  border: '#243B53',
  function: '#7CCFBF',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  hole: '#AAB18E',
  ink: '#243B53',
  limit: '#D8A94A',
  marker: '#D97B6C',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
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

const LIMIT_FUNCTIONS: LimitFunction[] = [
  {
    domain: { xMax: 8, xMin: -8, yMax: 1.5, yMin: -0.5 },
    fn: (x) => (Math.abs(x) < 1e-10 ? NaN : Math.sin(x) / x),
    label: 'sin(x)/x',
    latex: '\\frac{\\sin(x)}{x}',
    limitAt: 0,
    limitLabel: '0',
    limitValue: 1,
    limitValueLabel: '1',
    note: 'La fonction n est pas definie en 0, mais les deux cotes approchent 1.',
  },
  {
    domain: { xMax: 5, xMin: -3, yMax: 5, yMin: -1 },
    fn: (x) => (Math.abs(x - 1) < 1e-10 ? NaN : (x * x - 1) / (x - 1)),
    label: '(x^2-1)/(x-1)',
    latex: '\\frac{x^2-1}{x-1}',
    limitAt: 1,
    limitLabel: '1',
    limitValue: 2,
    limitValueLabel: '2',
    note: 'La courbe a un trou en x = 1, mais elle se rapproche de 2.',
  },
  {
    domain: { xMax: 20, xMin: 0.5, yMax: 4, yMin: 0 },
    fn: (x) => Math.pow(1 + 1 / x, x),
    label: '(1+1/n)^n',
    latex: '\\left(1+\\frac{1}{n}\\right)^n',
    limitAt: Number.POSITIVE_INFINITY,
    limitLabel: '\\infty',
    limitValue: Math.E,
    limitValueLabel: 'e',
    note: 'Quand n devient tres grand, la suite se rapproche de e.',
  },
  {
    domain: { xMax: 1, xMin: -1, yMax: 1, yMin: -1 },
    fn: (x) => (Math.abs(x) < 1e-10 ? NaN : x * Math.sin(1 / x)),
    label: 'xÂ·sin(1/x)',
    latex: 'x\\sin\\left(\\frac{1}{x}\\right)',
    limitAt: 0,
    limitLabel: '0',
    limitValue: 0,
    limitValueLabel: '0',
    note: 'La fonction oscille, mais son amplitude se resserre vers 0.',
  },
];

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

  return value.toFixed(4);
}

function obtenirPointEcran(x: number, y: number, width: number, height: number, domain: Domain): GraphPoint {
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
  steps = 260
) {
  const paths: GraphPoint[][] = [];
  let currentPath: GraphPoint[] = [];

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

function creerDonneesChemin(path: GraphPoint[]) {
  return path
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function TraceChemin({
  color,
  paths,
  thickness,
}: {
  color: string;
  paths: GraphPoint[][];
  thickness: number;
}) {
  return paths.map((path, index) => (
    <Path
      d={creerDonneesChemin(path)}
      fill="none"
      key={`${color}-${index}`}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={thickness}
    />
  ));
}

function obtenirMarqueursApproche(cfg: LimitFunction, approach: number) {
  if (Number.isFinite(cfg.limitAt)) {
    const offset = borner(0.35 * approach, 0.01, Math.max((cfg.domain.xMax - cfg.domain.xMin) * 0.08, 0.01));
    const leftX = cfg.limitAt - offset;
    const rightX = cfg.limitAt + offset;

    return {
      left: { value: cfg.fn(leftX), x: leftX },
      right: { value: cfg.fn(rightX), x: rightX },
    };
  }

  const sampleX = borner(cfg.domain.xMax - 2.5 * approach, cfg.domain.xMin, cfg.domain.xMax);

  return {
    left: null,
    right: { value: cfg.fn(sampleX), x: sampleX },
  };
}

function GraphiqueLimite({
  activeFunction,
  approach,
  graphHeight,
  graphWidth,
}: {
  activeFunction: LimitFunction;
  approach: number;
  graphHeight: number;
  graphWidth: number;
}) {
  const functionPaths = useMemo(
    () => echantillonnerFonction(activeFunction.fn, graphWidth, graphHeight, activeFunction.domain),
    [activeFunction, graphHeight, graphWidth]
  );

  const markers = useMemo(() => obtenirMarqueursApproche(activeFunction, approach), [activeFunction, approach]);
  const leftMarker =
    markers.left && Number.isFinite(markers.left.value)
      ? {
          point: obtenirPointEcran(markers.left.x, markers.left.value, graphWidth, graphHeight, activeFunction.domain),
          x: markers.left.x,
          y: markers.left.value,
        }
      : null;
  const rightMarker =
    markers.right && Number.isFinite(markers.right.value)
      ? {
          point: obtenirPointEcran(markers.right.x, markers.right.value, graphWidth, graphHeight, activeFunction.domain),
          x: markers.right.x,
          y: markers.right.value,
        }
      : null;

  const limitPoint =
    Number.isFinite(activeFunction.limitAt) && Number.isFinite(activeFunction.limitValue)
      ? obtenirPointEcran(
          activeFunction.limitAt,
          activeFunction.limitValue,
          graphWidth,
          graphHeight,
          activeFunction.domain
        )
      : null;

  const horizontalLimitY = obtenirPointEcran(
    activeFunction.domain.xMin,
    activeFunction.limitValue,
    graphWidth,
    graphHeight,
    activeFunction.domain
  ).y;

  const verticalLimitX = Number.isFinite(activeFunction.limitAt)
    ? obtenirPointEcran(activeFunction.limitAt, activeFunction.domain.yMin, graphWidth, graphHeight, activeFunction.domain).x
    : null;
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

        {activeFunction.domain.yMin <= 0 && activeFunction.domain.yMax >= 0 ? (
          <Line
            stroke={themeActif.grid}
            strokeWidth={1.5}
            x1={0}
            x2={graphWidth}
            y1={obtenirPointEcran(activeFunction.domain.xMin, 0, graphWidth, graphHeight, activeFunction.domain).y}
            y2={obtenirPointEcran(activeFunction.domain.xMax, 0, graphWidth, graphHeight, activeFunction.domain).y}
          />
        ) : null}
        {activeFunction.domain.xMin <= 0 && activeFunction.domain.xMax >= 0 ? (
          <Line
            stroke={themeActif.grid}
            strokeWidth={1.5}
            x1={obtenirPointEcran(0, activeFunction.domain.yMin, graphWidth, graphHeight, activeFunction.domain).x}
            x2={obtenirPointEcran(0, activeFunction.domain.yMax, graphWidth, graphHeight, activeFunction.domain).x}
            y1={0}
            y2={graphHeight}
          />
        ) : null}

        <TraceChemin color={themeActif.function} paths={functionPaths} thickness={3.25} />

        {verticalLimitX !== null ? (
          <Line
            stroke={themeActif.limit}
            strokeDasharray="6 6"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            x1={verticalLimitX}
            x2={verticalLimitX}
            y1={0}
            y2={graphHeight}
          />
        ) : null}

        {!Number.isFinite(activeFunction.limitAt) ? (
          <Line
            stroke={themeActif.hole}
            strokeDasharray="6 6"
            strokeOpacity={0.75}
            strokeWidth={1.5}
            x1={0}
            x2={graphWidth}
            y1={horizontalLimitY}
            y2={horizontalLimitY}
          />
        ) : null}

        {leftMarker ? (
          <>
            <Line
              stroke={themeActif.marker}
              strokeOpacity={0.55}
              strokeWidth={2}
              x1={leftMarker.point.x}
              x2={Math.min(leftMarker.point.x + 24, graphWidth)}
              y1={leftMarker.point.y}
              y2={leftMarker.point.y}
            />
            <Circle cx={leftMarker.point.x} cy={leftMarker.point.y} fill={themeActif.marker} r={6} />
          </>
        ) : null}
        {rightMarker ? (
          <>
            <Line
              stroke={themeActif.marker}
              strokeOpacity={0.55}
              strokeWidth={2}
              x1={rightMarker.point.x}
              x2={Math.max(rightMarker.point.x - 24, 0)}
              y1={rightMarker.point.y}
              y2={rightMarker.point.y}
            />
            <Circle cx={rightMarker.point.x} cy={rightMarker.point.y} fill={themeActif.marker} r={6} />
          </>
        ) : null}

        {limitPoint ? (
          <Circle
            cx={limitPoint.x}
            cy={limitPoint.y}
            fill={themeActif.panel}
            r={7}
            stroke={themeActif.limit}
            strokeWidth={3}
          />
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
          <View style={[styles.legendDot, { backgroundColor: themeActif.marker }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Points d approche
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendRing, { borderColor: themeActif.limit }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Limite
          </TexteTheme>
        </View>
      </View>

      <View style={styles.limitPill}>
        <TexteTheme lightColor={themeActif.ink} style={styles.limitPillText}>
          L = {activeFunction.limitValueLabel}
        </TexteTheme>
      </View>
    </View>
  );
}

function CurseurApproche({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  const [typedValue, setTypedValue] = useState(value.toFixed(2));

  useEffect(() => {
    setTypedValue(value.toFixed(2));
  }, [value]);

  const commitTypedValue = () => {
    const normalized = typedValue.replace(',', '.').trim();
    const nextValue = Number(normalized);

    if (!Number.isFinite(nextValue)) {
      setTypedValue(value.toFixed(2));
      return;
    }

    const resolvedValue = borner(Number(nextValue.toFixed(2)), APPROACH_MIN, APPROACH_MAX);
    onChange(resolvedValue);
    setTypedValue(resolvedValue.toFixed(2));
  };

  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const ratio = measuredWidth === 0 ? 0 : position / measuredWidth;
      const rawValue = APPROACH_MIN + ratio * (APPROACH_MAX - APPROACH_MIN);
      const nextValue = borner(Number(rawValue.toFixed(2)), APPROACH_MIN, APPROACH_MAX);
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

  const percent = ((value - APPROACH_MIN) / (APPROACH_MAX - APPROACH_MIN || 1)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          Zoom de l approche
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
        <Pressable
          onPress={() => onChange(borner(Number((value - 0.1).toFixed(2)), APPROACH_MIN, APPROACH_MAX))}
          style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            -0.1
          </TexteTheme>
        </Pressable>
        <Pressable
          onPress={() => onChange(borner(Number((value + 0.1).toFixed(2)), APPROACH_MIN, APPROACH_MAX))}
          style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            +0.1
          </TexteTheme>
        </Pressable>
      </View>
    </View>
  );
}

export function SimulationLimites() {
  const [functionIndex, setFunctionIndex] = useState(0);
  const [approach, setApproach] = useState(1);
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

  const activeFunction = LIMIT_FUNCTIONS[functionIndex];
  const markers = obtenirMarqueursApproche(activeFunction, approach);
  const leftValue = markers.left && Number.isFinite(markers.left.value) ? markers.left.value : null;
  const rightValue = markers.right && Number.isFinite(markers.right.value) ? markers.right.value : null;
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
          <EnteteEcranSimulation titre="Limites" domaine="mathematiques"/>
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
                alignItems: 'flex-start',
                flexDirection: isWide ? 'row' : 'column',
                minHeight: isWide ? graphHeight + 40 : undefined,
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                width: contentWidth,
              },
            ]}>
            <View style={[styles.graphColumn, { width: graphWidth }]}>
              <GraphiqueLimite
                activeFunction={activeFunction}
                approach={approach}
                graphHeight={graphHeight}
                graphWidth={graphWidth}
              />
            </View>

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule centered fallback={'lim x->c f(x) = L'} mathematiques={'\\lim_{x\\to c}f(x)=L'} size="md" />
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
                  {LIMIT_FUNCTIONS.map((entry, index) => {
                    const isActive = functionIndex === index;

                    return (
                      <Pressable
                        key={entry.label}
                        onPress={() => setFunctionIndex(index)}
                        style={[styles.functionButtonWide, isActive ? styles.functionButtonActive : undefined]}>
                        <View style={styles.functionButtonFormula}>
                          <RenduFormule centered fallback={entry.label} mathematiques={entry.latex} size="sm" />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.limitInfoCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.limitInfoLabel}>
                    Idee cle
                  </TexteTheme>
                  <RenduFormule
                    fallback={`lim x->${activeFunction.limitLabel} f(x) = ${activeFunction.limitValueLabel}`}
                    mathematiques={`\\lim_{x\\to ${activeFunction.limitLabel}}f(x)=${activeFunction.limitValueLabel}`}
                  />
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.limitInfoText}>
                    {activeFunction.note}
                  </TexteTheme>
                </View>
              </View>

              <View style={styles.panel}>
                <CurseurApproche onChange={setApproach} value={approach} />
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      f(x gauche)
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {leftValue === null ? '--' : formaterNombre(leftValue)}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Limite L
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(activeFunction.limitValue)}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      {Number.isFinite(activeFunction.limitAt) ? 'f(x droite)' : 'Valeur approchee'}
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {rightValue === null ? '--' : formaterNombre(rightValue)}
                  </TexteTheme>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Une limite decrit la valeur vers laquelle une fonction se rapproche quand x approche un point donne.",
          "La fonction n a pas besoin d etre definie exactement a ce point. Ce qui compte, c est le comportement des valeurs tout autour.",
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Les points rouges montrent l approche, et le cercle de limite montre la valeur visee."
        eyebrow="Definition"
        title="Qu est ce qu une limite ?"
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
    maxWidth: 250,
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
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  legendRing: {
    backgroundColor: themeActif.panel,
    borderRadius: 6,
    borderWidth: 2.5,
    height: 12,
    width: 12,
  },
  legendText: {
    color: themeActif.mutedInk,
    fontSize: 11,
    lineHeight: 14,
  },
  limitPill: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  limitPillText: {
    color: themeActif.ink,
    fontSize: 11,
    fontWeight: '700',
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
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  activeFormulaWrap: {
    minWidth: 84,
  },
  functionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  functionButtonWide: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  functionButtonActive: {
    backgroundColor: themeActif.function,
    borderColor: themeActif.function,
  },
  functionButtonFormula: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    width: '100%',
  },
  limitInfoCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  limitInfoLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  limitInfoText: {
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
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
});

