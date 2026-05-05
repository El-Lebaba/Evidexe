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
import Svg, { Line, Path, Polygon, Rect } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';

type IntegralFunction = {
  exact: (a: number, b: number) => number;
  fn: (x: number) => number;
  integralLabel: string;
  integralLatex: string;
  label: string;
  latex: string;
};

type MethodKey = 'left' | 'right' | 'midpoint' | 'trapezoid';
type IntegralKind = 'definite' | 'indefinite';
type ViewMode = 'integral' | 'riemann';

type Domain = {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
};

type Point = {
  x: number;
  y: number;
};

type TrapezoidSegment = {
  fill: string;
  points: string;
  stroke: string;
};

type GraphShape =
  | {
      kind: 'rect';
      rect: {
        fill: string;
        height: number;
        stroke: string;
        width: number;
        x: number;
        y: number;
      };
    }
  | {
      kind: 'segments';
      segments: TrapezoidSegment[];
    }
  | {
      kind: 'polygon';
      fill: string;
      points: string;
      stroke: string;
    };

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';

const WEB_SLIDER_INTERACTION_STYLE =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

const FUNCTIONS: IntegralFunction[] = [
  {
    exact: (a, b) => (b ** 2 - a ** 2) / 2,
    fn: (x) => x,
    integralLabel: 'x^2 / 2',
    integralLatex: '\\frac{x^2}{2}',
    label: 'x',
    latex: 'x',
  },
  {
    exact: (a, b) => (b ** 3 - a ** 3) / 3,
    fn: (x) => x * x,
    integralLabel: 'x^3 / 3',
    integralLatex: '\\frac{x^3}{3}',
    label: 'x^2',
    latex: 'x^2',
  },
  {
    exact: (a, b) => -Math.cos(b) + Math.cos(a),
    fn: (x) => Math.sin(x),
    integralLabel: '-cos(x)',
    integralLatex: '-\\cos(x)',
    label: 'sin(x)',
    latex: '\\sin(x)',
  },
  {
    exact: (a, b) => (b ** 4 / 4 - b ** 2 / 2) - (a ** 4 / 4 - a ** 2 / 2),
    fn: (x) => x * x * x - x,
    integralLabel: 'x^4 / 4 - x^2 / 2',
    integralLatex: '\\frac{x^4}{4}-\\frac{x^2}{2}',
    label: 'x^3 - x',
    latex: 'x^3-x',
  },
  {
    exact: (a, b) => (Math.exp(b) - Math.exp(a)) / 3,
    fn: (x) => Math.exp(x) / 3,
    integralLabel: 'e^x / 3',
    integralLatex: '\\frac{e^x}{3}',
    label: 'e^x / 3',
    latex: '\\frac{e^x}{3}',
  },
  {
    exact: (a, b) => Math.sin(b) - Math.sin(a),
    fn: (x) => Math.cos(x),
    integralLabel: 'sin(x)',
    integralLatex: '\\sin(x)',
    label: 'cos(x)',
    latex: '\\cos(x)',
  },
];

const METHODS: { key: MethodKey; label: string }[] = [
  { key: 'left', label: 'Gauche' },
  { key: 'right', label: 'Droite' },
  { key: 'midpoint', label: 'Milieu' },
  { key: 'trapezoid', label: 'Trapeze' },
];

const DOMAIN: Domain = { xMax: 4, xMin: -4, yMax: 5, yMin: -3 };
const BOUND_GAP = 0.1;
const themeActif = {
  accent: '#D97B6C',
  approximation: 'rgba(124, 207, 191, 0.26)',
  approximationStroke: '#7EA6E0',
  approximationNegative: 'rgba(217, 123, 108, 0.24)',
  approximationNegativeStroke: '#D97B6C',
  background: '#E9ECE4',
  border: '#243B53',
  bounds: '#D8A94A',
  function: '#7CCFBF',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  surface: '#F3F1E7',
};

function borner(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
  steps = 220
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

function TraceChemin({
  color,
  paths,
  thickness,
}: {
  color: string;
  paths: Point[][];
  thickness: number;
}) {
  return paths.map((path, index) => (
    <Path
      d={creerDonneesChemin(path)}
      fill="none"
      key={index}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={thickness}
    />
  ));
}

function evaluerEchantillon(method: MethodKey, xi: number, dx: number) {
  if (method === 'left') {
    return xi;
  }

  if (method === 'right') {
    return xi + dx;
  }

  return xi + dx / 2;
}

function calculerApproximation(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  method: MethodKey
) {
  const dx = (b - a) / n;
  let total = 0;

  for (let index = 0; index < n; index += 1) {
    const xi = a + index * dx;

    if (method === 'trapezoid') {
      const yLeft = fn(xi);
      const yRight = fn(xi + dx);

      if (yLeft === 0 || yRight === 0 || yLeft * yRight >= 0) {
        total += ((Math.abs(yLeft) + Math.abs(yRight)) / 2) * dx;
        continue;
      }

      const splitRatio = Math.abs(yLeft) / (Math.abs(yLeft) + Math.abs(yRight));
      const leftWidth = dx * splitRatio;
      const rightWidth = dx - leftWidth;

      total += (Math.abs(yLeft) * leftWidth) / 2;
      total += (Math.abs(yRight) * rightWidth) / 2;
      continue;
    }

    total += Math.abs(fn(evaluerEchantillon(method, xi, dx))) * dx;
  }

  return total;
}

function calculerAireReference(fn: (x: number) => number, a: number, b: number, steps = 3200) {
  const dx = (b - a) / steps;
  let total = 0;

  for (let index = 0; index < steps; index += 1) {
    const xLeft = a + index * dx;
    const xRight = xLeft + dx;
    const yLeft = Math.abs(fn(xLeft));
    const yRight = Math.abs(fn(xRight));

    total += ((yLeft + yRight) / 2) * dx;
  }

  return total;
}

function GraphiqueIntegrale({
  a,
  activeFunction,
  b,
  graphHeight,
  graphWidth,
  integralKind,
  method,
  n,
  viewMode,
}: {
  a: number;
  activeFunction: IntegralFunction;
  b: number;
  graphHeight: number;
  graphWidth: number;
  integralKind: IntegralKind;
  method: MethodKey;
  n: number;
  viewMode: ViewMode;
}) {
  const functionPaths = useMemo(
    () => echantillonnerFonction(activeFunction.fn, graphWidth, graphHeight, DOMAIN),
    [activeFunction, graphHeight, graphWidth]
  );

  const origin = obtenirPointEcran(0, 0, graphWidth, graphHeight, DOMAIN);
  const boundA = obtenirPointEcran(a, 0, graphWidth, graphHeight, DOMAIN);
  const boundB = obtenirPointEcran(b, 0, graphWidth, graphHeight, DOMAIN);

  const shapes = useMemo(() => {
    const dx = (b - a) / n;

    return Array.from({ length: n }, (_, index): GraphShape => {
      const xLeft = a + index * dx;
      const xRight = xLeft + dx;
      const baseLeft = obtenirPointEcran(xLeft, 0, graphWidth, graphHeight, DOMAIN);
      const baseRight = obtenirPointEcran(xRight, 0, graphWidth, graphHeight, DOMAIN);

      if (method === 'trapezoid') {
        const yLeft = activeFunction.fn(xLeft);
        const yRight = activeFunction.fn(xRight);
        const topLeft = obtenirPointEcran(xLeft, yLeft, graphWidth, graphHeight, DOMAIN);
        const topRight = obtenirPointEcran(xRight, yRight, graphWidth, graphHeight, DOMAIN);
        const sameSign = yLeft === 0 || yRight === 0 || yLeft * yRight > 0;

        if (sameSign) {
          return {
            kind: 'polygon',
            fill: yLeft >= 0 || yRight >= 0 ? themeActif.approximation : themeActif.approximationNegative,
            points: [
              `${baseLeft.x},${baseLeft.y}`,
              `${topLeft.x},${topLeft.y}`,
              `${topRight.x},${topRight.y}`,
              `${baseRight.x},${baseRight.y}`,
            ].join(' '),
            stroke: yLeft >= 0 || yRight >= 0 ? themeActif.approximationStroke : themeActif.approximationNegativeStroke,
          };
        }

        const zeroX = xLeft + ((0 - yLeft) * (xRight - xLeft)) / (yRight - yLeft);
        const zeroPoint = obtenirPointEcran(zeroX, 0, graphWidth, graphHeight, DOMAIN);

        return {
          kind: 'segments',
          segments: yLeft > 0
            ? [
                {
                  fill: themeActif.approximation,
                  points: [
                    `${baseLeft.x},${baseLeft.y}`,
                    `${topLeft.x},${topLeft.y}`,
                    `${zeroPoint.x},${zeroPoint.y}`,
                  ].join(' '),
                  stroke: themeActif.approximationStroke,
                },
                {
                  fill: themeActif.approximationNegative,
                  points: [
                    `${zeroPoint.x},${zeroPoint.y}`,
                    `${topRight.x},${topRight.y}`,
                    `${baseRight.x},${baseRight.y}`,
                  ].join(' '),
                  stroke: themeActif.approximationNegativeStroke,
                },
              ]
            : [
                {
                  fill: themeActif.approximationNegative,
                  points: [
                    `${baseLeft.x},${baseLeft.y}`,
                    `${topLeft.x},${topLeft.y}`,
                    `${zeroPoint.x},${zeroPoint.y}`,
                  ].join(' '),
                  stroke: themeActif.approximationNegativeStroke,
                },
                {
                  fill: themeActif.approximation,
                  points: [
                    `${zeroPoint.x},${zeroPoint.y}`,
                    `${topRight.x},${topRight.y}`,
                    `${baseRight.x},${baseRight.y}`,
                  ].join(' '),
                  stroke: themeActif.approximationStroke,
                },
              ],
        };
      }

      const xEval = evaluerEchantillon(method, xLeft, dx);
      const y = activeFunction.fn(xEval);
      const topY = obtenirPointEcran(xLeft, y, graphWidth, graphHeight, DOMAIN).y;
      const rectY = y >= 0 ? topY : baseLeft.y;
      const rectHeight = Math.abs(baseLeft.y - topY);

      return {
        kind: 'rect',
        rect: {
          fill: y >= 0 ? themeActif.approximation : themeActif.approximationNegative,
          height: rectHeight,
          stroke: y >= 0 ? themeActif.approximationStroke : themeActif.approximationNegativeStroke,
          width: baseRight.x - baseLeft.x,
          x: baseLeft.x,
          y: rectY,
            },
      };
    });
  }, [a, activeFunction, b, graphHeight, graphWidth, method, n]);

  const integralAreaPolygons = useMemo(() => {
    const steps = 320;
    const rangeStart = integralKind === 'indefinite' ? DOMAIN.xMin : a;
    const rangeEnd = integralKind === 'indefinite' ? DOMAIN.xMax : b;
    const xValues = Array.from({ length: steps + 1 }, (_, index) => rangeStart + (index / steps) * (rangeEnd - rangeStart));
    const positivePoints: string[] = [];
    const negativePoints: string[] = [];

    const startBase = obtenirPointEcran(rangeStart, 0, graphWidth, graphHeight, DOMAIN);
    positivePoints.push(`${startBase.x},${startBase.y}`);
    negativePoints.push(`${startBase.x},${startBase.y}`);

    xValues.forEach((x) => {
      const y = activeFunction.fn(x);
      const positivePoint = obtenirPointEcran(x, Math.max(y, 0), graphWidth, graphHeight, DOMAIN);
      const negativePoint = obtenirPointEcran(x, Math.min(y, 0), graphWidth, graphHeight, DOMAIN);
      positivePoints.push(`${positivePoint.x},${positivePoint.y}`);
      negativePoints.push(`${negativePoint.x},${negativePoint.y}`);
    });

    const endBase = obtenirPointEcran(rangeEnd, 0, graphWidth, graphHeight, DOMAIN);
    positivePoints.push(`${endBase.x},${endBase.y}`);
    negativePoints.push(`${endBase.x},${endBase.y}`);

    return {
      negative: negativePoints.join(' '),
      positive: positivePoints.join(' '),
    };
  }, [a, activeFunction, b, graphHeight, graphWidth, integralKind]);
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

        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={0} x2={graphWidth} y1={origin.y} y2={origin.y} />
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={origin.x} x2={origin.x} y1={0} y2={graphHeight} />

        {viewMode === 'integral' ? (
          <>
            <Polygon
              fill={themeActif.approximation}
              points={integralAreaPolygons.positive}
              stroke={themeActif.approximationStroke}
              strokeWidth={1.2}
            />
            <Polygon
              fill={themeActif.approximationNegative}
              points={integralAreaPolygons.negative}
              stroke={themeActif.approximationNegativeStroke}
              strokeWidth={1.2}
            />
          </>
        ) : (
          shapes.map((shape, index) =>
            shape.kind === 'rect'
              ? (
                  <Rect
                    fill={shape.rect.fill}
                    height={shape.rect.height}
                    key={index}
                    stroke={shape.rect.stroke}
                    strokeWidth={1}
                    width={shape.rect.width}
                    x={shape.rect.x}
                    y={shape.rect.y}
                  />
                )
              : shape.kind === 'segments'
                ? shape.segments.map((segment: TrapezoidSegment, segmentIndex: number) => (
                    <Polygon
                      fill={segment.fill}
                      key={`${index}-${segmentIndex}`}
                      points={segment.points}
                      stroke={segment.stroke}
                      strokeWidth={1.2}
                    />
                  ))
                : (
                    <Polygon
                      fill={shape.fill}
                      key={index}
                      points={shape.points}
                      stroke={shape.stroke}
                      strokeWidth={1.2}
                    />
                  )
          )
        )}

        <TraceChemin color={themeActif.function} paths={functionPaths} thickness={3.25} />

        {viewMode === 'riemann' || integralKind === 'definite' ? (
          <>
            <Line stroke={themeActif.bounds} strokeDasharray="6 6" strokeWidth={2} x1={boundA.x} x2={boundA.x} y1={0} y2={graphHeight} />
            <Line stroke={themeActif.bounds} strokeDasharray="6 6" strokeWidth={2} x1={boundB.x} x2={boundB.x} y1={0} y2={graphHeight} />
          </>
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
          <View style={[styles.legendSwatch, { backgroundColor: themeActif.approximationStroke }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            {viewMode === 'integral' ? 'Aire' : 'Somme'}
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.bounds }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Bornes
          </TexteTheme>
        </View>
      </View>

      {viewMode === 'riemann' || integralKind === 'definite' ? (
        <>
          <View style={[styles.boundPill, { left: borner(boundA.x - 18, 8, graphWidth - 38) }]}>
            <TexteTheme lightColor={themeActif.ink} style={styles.boundText}>
              a
            </TexteTheme>
          </View>
          <View style={[styles.boundPill, { left: borner(boundB.x - 18, 8, graphWidth - 38) }]}>
            <TexteTheme lightColor={themeActif.ink} style={styles.boundText}>
              b
            </TexteTheme>
          </View>
        </>
      ) : null}
    </View>
  );
}

function CurseurNumerique({
  displayMax,
  displayMin,
  integer = false,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  displayMax?: number;
  displayMin?: number;
  integer?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  const [typedValue, setTypedValue] = useState(integer ? String(Math.round(value)) : value.toFixed(2));

  useEffect(() => {
    setTypedValue(integer ? String(Math.round(value)) : value.toFixed(2));
  }, [integer, value]);

  const normalizeValue = useCallback((nextValue: number) => {
    const clampedValue = borner(nextValue, min, max);
    return integer ? Math.round(clampedValue) : Number(clampedValue.toFixed(2));
  }, [integer, max, min]);

  const visualMin = displayMin ?? min;
  const visualMax = displayMax ?? max;

  const commitTypedValue = () => {
    const normalized = typedValue.replace(',', '.').trim();
    const nextValue = Number(normalized);

    if (!Number.isFinite(nextValue)) {
      setTypedValue(integer ? String(Math.round(value)) : value.toFixed(2));
      return;
    }

    const resolvedValue = normalizeValue(nextValue);
    onChange(resolvedValue);
    setTypedValue(integer ? String(Math.round(resolvedValue)) : resolvedValue.toFixed(2));
  };

  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const ratio = measuredWidth === 0 ? 0 : position / measuredWidth;
      const rawValue = visualMin + ratio * (visualMax - visualMin);
      const snappedValue = normalizeValue(Math.round(rawValue / step) * step);
      onChange(snappedValue);
    });
  }, [normalizeValue, onChange, step, visualMax, visualMin]);

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

  const percent = ((value - visualMin) / (visualMax - visualMin || 1)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          {label}
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
    </View>
  );
}

export function SimulationIntegrales() {
  const [functionIndex, setFunctionIndex] = useState(0);
  const [a, setA] = useState(-2);
  const [b, setB] = useState(2);
  const [integralKind, setIntegralKind] = useState<IntegralKind>('definite');
  const [n, setN] = useState(10);
  const [method, setMethod] = useState<MethodKey>('midpoint');
  const [viewMode, setViewMode] = useState<ViewMode>('riemann');
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
  const exact = calculerAireReference(activeFunction.fn, a, b);
  const approximation = calculerApproximation(activeFunction.fn, a, b, n, method);
  const error = Math.abs(approximation - exact);
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
  const handleSetA = (nextA: number) => {
    setA(borner(nextA, DOMAIN.xMin, b - BOUND_GAP));
  };
  const handleSetB = (nextB: number) => {
    setB(borner(nextB, a + BOUND_GAP, DOMAIN.xMax));
  };

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
          <EnteteEcranSimulation titre="Integrales" domaine="mathematiques"/>
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
                alignItems: isWide ? 'center' : 'stretch',
                flexDirection: isWide ? 'row' : 'column',
                minHeight: isWide ? graphHeight + 40 : undefined,
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                width: contentWidth,
              },
            ]}>
            <View style={[styles.graphColumn, { width: graphWidth }]}>
              <View style={styles.panel}>
                <View style={styles.modeGrid}>
                  <Pressable
                    onPress={() => setViewMode('integral')}
                    style={[styles.modeButton, viewMode === 'integral' ? styles.functionButtonActive : undefined]}>
                    <TexteTheme lightColor="#000000" style={styles.methodText}>
                      Integrale
                    </TexteTheme>
                  </Pressable>
                  <Pressable
                    onPress={() => setViewMode('riemann')}
                    style={[styles.modeButton, viewMode === 'riemann' ? styles.functionButtonActive : undefined]}>
                    <TexteTheme lightColor="#000000" style={styles.methodText}>
                      Somme de Riemann
                    </TexteTheme>
                  </Pressable>
                </View>
              </View>

            <GraphiqueIntegrale
              a={a}
              activeFunction={activeFunction}
              b={b}
              graphHeight={graphHeight}
              graphWidth={graphWidth}
              integralKind={integralKind}
              method={method}
              n={n}
              viewMode={viewMode}
            />
            </View>

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback={'âˆ«[a,b] f(x) dx = lim n->inf Î£ f(x_i)Î”x'}
                  mathematiques={'\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum f(x_i)\\Delta x'}
                  size="md"
                />
              </View>

              {viewMode === 'integral' ? (
                <View style={styles.typeCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.errorLabel}>
                    Type d integrale
                  </TexteTheme>
                  <View style={styles.modeGrid}>
                    <Pressable
                      onPress={() => setIntegralKind('definite')}
                      style={[styles.modeButton, integralKind === 'definite' ? styles.functionButtonActive : undefined]}>
                      <TexteTheme lightColor="#000000" style={styles.methodText}>
                        Definie
                      </TexteTheme>
                    </Pressable>
                    <Pressable
                      onPress={() => setIntegralKind('indefinite')}
                      style={[styles.modeButton, integralKind === 'indefinite' ? styles.functionButtonActive : undefined]}>
                      <TexteTheme lightColor="#000000" style={styles.methodText}>
                        Indefinie
                      </TexteTheme>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <View style={styles.panel}>
                <View style={styles.controlHeader}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
                    Fonction
                  </TexteTheme>
                  <View style={styles.activeFormulaWrap}>
                    <RenduFormule fallback={activeFunction.label} mathematiques={activeFunction.latex} size="sm" />
                  </View>
                </View>

                <View style={styles.functionGridFour}>
                  {FUNCTIONS.map((entry, index) => {
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

                <View style={styles.derivativeFormulaCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.derivativeFormulaLabel}>
                    Primitive
                  </TexteTheme>
                  <RenduFormule fallback={`f(x) = ${activeFunction.label}`} mathematiques={`f(x)=${activeFunction.latex}`} />
                  <RenduFormule fallback={`F(x) = ${activeFunction.integralLabel}`} mathematiques={`F(x)=${activeFunction.integralLatex}`} />
                </View>
              </View>

              {viewMode === 'riemann' ? (
                <View style={styles.panel}>
                  <View style={styles.controlHeader}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
                      Methode
                    </TexteTheme>
                  </View>
                  <View style={styles.methodGrid}>
                    {METHODS.map((entry) => {
                      const isActive = method === entry.key;

                      return (
                        <Pressable
                          key={entry.key}
                          onPress={() => setMethod(entry.key)}
                          style={[styles.methodButton, isActive ? styles.methodButtonActive : undefined]}>
                          <TexteTheme lightColor="#000000" style={styles.methodText}>
                            {entry.label}
                          </TexteTheme>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {viewMode === 'riemann' || integralKind === 'definite' ? (
                <View style={styles.panel}>
                  {viewMode === 'riemann' || integralKind === 'definite' ? (
                    <>
                      <CurseurNumerique
                        displayMax={DOMAIN.xMax}
                        displayMin={DOMAIN.xMin}
                        label="Borne a"
                        max={b - BOUND_GAP}
                        min={DOMAIN.xMin}
                        onChange={handleSetA}
                        step={0.1}
                        value={a}
                      />
                      <CurseurNumerique
                        displayMax={DOMAIN.xMax}
                        displayMin={DOMAIN.xMin}
                        label="Borne b"
                        max={DOMAIN.xMax}
                        min={a + BOUND_GAP}
                        onChange={handleSetB}
                        step={0.1}
                        value={b}
                      />
                    </>
                  ) : null}
                  {viewMode === 'riemann' ? (
                    <CurseurNumerique integer label="Rectangles n" max={100} min={1} onChange={setN} step={1} value={n} />
                  ) : null}
                </View>
              ) : null}

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                {viewMode === 'riemann' ? (
                  <View style={styles.statCard}>
                    <View style={styles.statFormulaWrap}>
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.statCaption}>
                        Somme de Riemann
                      </TexteTheme>
                    </View>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                      {approximation.toFixed(4)}
                    </TexteTheme>
                  </View>
                ) : null}
                {!(viewMode === 'integral' && integralKind === 'indefinite') ? (
                  <View style={styles.statCard}>
                    <View style={styles.statFormulaWrap}>
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.statCaption}>
                        Valeur
                      </TexteTheme>
                    </View>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                      {exact.toFixed(4)}
                    </TexteTheme>
                  </View>
                ) : null}
              </View>

              {viewMode === 'riemann' ? (
                <View style={styles.errorCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.errorLabel}>
                    Erreur
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.errorValue}>
                    {error.toFixed(5)}
                  </TexteTheme>
                </View>
              ) : null}
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          'Une integrale definie mesure l aire nette sous une courbe entre deux bornes a et b.',
          'La somme de Riemann approche cette aire avec des rectangles ou des trapezes. Quand n augmente, l approximation se rapproche de la valeur exacte.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText={'La somme de Riemann donne une approximation, tandis que la valeur exacte vient de la primitive.'}
        eyebrow="Definition"
        title="Qu est-ce qu une integrale ?"
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
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  graph: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
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
    maxWidth: 260,
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
  legendSwatch: {
    borderRadius: 4,
    height: 10,
    width: 10,
  },
  legendText: {
    color: themeActif.mutedInk,
    fontSize: 11,
    lineHeight: 14,
  },
  boundPill: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    bottom: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    width: 24,
  },
  boundText: {
    color: themeActif.ink,
    fontSize: 12,
    fontWeight: '800',
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
  functionGridFour: {
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
    height: 48,
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
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  methodButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    flexBasis: '47%',
    flexGrow: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  methodButtonActive: {
    backgroundColor: themeActif.approximation,
    borderColor: themeActif.approximationStroke,
  },
  methodText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
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
  sliderBlock: {
    gap: 14,
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
    minWidth: 64,
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
  statCaption: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statValue: {
    color: themeActif.ink,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  typeCard: {
    alignItems: 'center',
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  errorLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  errorValue: {
    color: themeActif.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
});

