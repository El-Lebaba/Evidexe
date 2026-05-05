import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';

type TaylorFunction = {
  approx: (x: number, order: number) => number;
  convergenceDetail: string;
  convergenceLabel: string;
  fn: (x: number) => number;
  label: string;
  latex: string;
  polynomialLabel: (order: number) => string;
  polynomialLatex: (order: number) => string;
  termLatexLines: (order: number) => string[];
  termLines: (order: number) => string[];
};

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

const DOMAIN: Domain = { xMax: 6, xMin: -6, yMax: 4, yMin: -4 };
const ORDER_MIN = 1;
const ORDER_MAX = 20;
const APPROXIMATION_SAMPLE_X = 10;
const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const themeActif = {
  activeApproximation: '#7EA6E0',
  approximation: 'rgba(126, 166, 224, 0.34)',
  background: '#E9ECE4',
  border: '#243B53',
  function: '#7CCFBF',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  point: '#D97B6C',
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

function factorielle(n: number) {
  let result = 1;

  for (let index = 2; index <= n; index += 1) {
    result *= index;
  }

  return result;
}

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

function etiquettePuissance(power: number) {
  if (power === 0) {
    return '1';
  }

  if (power === 1) {
    return 'x';
  }

  return `x^${power}`;
}

function formaterMantisseScientifique(value: number) {
  return Number(value.toPrecision(3)).toString();
}

function formaterEtiquetteDenominateur(value: number) {
  if (value < 1000) {
    return String(value);
  }

  const exponent = Math.floor(Math.log10(value));
  const mantissa = formaterMantisseScientifique(value / 10 ** exponent);
  return `${mantissa}e${exponent}`;
}

function formaterDenominateurLatex(value: number) {
  if (value < 1000) {
    return String(value);
  }

  const exponent = Math.floor(Math.log10(value));
  const mantissa = formaterMantisseScientifique(value / 10 ** exponent);
  return `${mantissa}\\cdot10^{${exponent}}`;
}

function etiquetteTermeSigne(sign: number, numerator: string, denominator: number) {
  const signLabel = sign < 0 ? '- ' : '+ ';
  return `${signLabel}${numerator}/${formaterEtiquetteDenominateur(denominator)}`;
}

function termeSigneLatex(sign: number, numeratorLatex: string, denominator: number) {
  const signLabel = sign < 0 ? '-' : '+';
  return `${signLabel}\\frac{${numeratorLatex}}{${formaterDenominateurLatex(denominator)}}`;
}

const FUNCTIONS: TaylorFunction[] = [
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 0; k < order; k += 1) {
        sum += ((-1) ** k * x ** (2 * k + 1)) / factorielle(2 * k + 1);
      }

      return sum;
    },
    convergenceDetail: 'Convergente pour tout x',
    convergenceLabel: 'Convergente',
    fn: Math.sin,
    label: 'sin(x)',
    latex: '\\sin(x)',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[0].termLines(order).join(' ')}`.replace('+ -', '- '),
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const sign = k === 0 ? '' : k % 2 === 0 ? '+' : '-';
        segments.push(`${sign}\\frac{x^{${2 * k + 1}}}{${formaterDenominateurLatex(factorielle(2 * k + 1))}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k + 1;
        lines.push(etiquetteTermeSigne(k % 2 === 0 ? 1 : -1, etiquettePuissance(power), factorielle(power)));
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k + 1;
        lines.push(termeSigneLatex(k % 2 === 0 ? 1 : -1, `x^{${power}}`, factorielle(power)));
      }

      return lines;
    },
  },
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 0; k < order; k += 1) {
        sum += ((-1) ** k * x ** (2 * k)) / factorielle(2 * k);
      }

      return sum;
    },
    convergenceDetail: 'Convergente pour tout x',
    convergenceLabel: 'Convergente',
    fn: Math.cos,
    label: 'cos(x)',
    latex: '\\cos(x)',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[1].termLines(order).join(' ')}`.replace('+ -', '- '),
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const sign = k === 0 ? '' : k % 2 === 0 ? '+' : '-';
        segments.push(`${sign}\\frac{x^{${2 * k}}}{${formaterDenominateurLatex(factorielle(2 * k))}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k;
        lines.push(etiquetteTermeSigne(k % 2 === 0 ? 1 : -1, etiquettePuissance(power), factorielle(power)));
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k;
        lines.push(termeSigneLatex(k % 2 === 0 ? 1 : -1, `x^{${power}}`, factorielle(power)));
      }

      return lines;
    },
  },
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 0; k < order; k += 1) {
        sum += x ** k / factorielle(k);
      }

      return sum;
    },
    convergenceDetail: 'Convergente pour tout x',
    convergenceLabel: 'Convergente',
    fn: Math.exp,
    label: 'e^x',
    latex: 'e^x',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[2].termLines(order).join(' ')}`,
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const sign = k === 0 ? '' : '+';
        segments.push(`${sign}\\frac{x^{${k}}}{${formaterDenominateurLatex(factorielle(k))}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        lines.push(etiquetteTermeSigne(1, etiquettePuissance(k), factorielle(k)));
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        lines.push(termeSigneLatex(1, `x^{${k}}`, factorielle(k)));
      }

      return lines;
    },
  },
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 1; k <= order; k += 1) {
        sum += ((-1) ** (k + 1) * x ** k) / k;
      }

      return sum;
    },
    convergenceDetail: 'Convergente si |x| < 1, divergente au dela',
    convergenceLabel: 'Conditionnelle',
    fn: (x) => (x > -1 ? Math.log(1 + x) : NaN),
    label: 'ln(1+x)',
    latex: '\\ln(1+x)',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[3].termLines(order).join(' ')}`.replace('+ -', '- '),
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 1; k <= order; k += 1) {
        const sign = k === 1 ? '' : k % 2 === 1 ? '+' : '-';
        segments.push(`${sign}\\frac{x^{${k}}}{${k}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 1; k <= order; k += 1) {
        lines.push(etiquetteTermeSigne(k % 2 === 1 ? 1 : -1, etiquettePuissance(k), k));
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 1; k <= order; k += 1) {
        const sign = k % 2 === 1 ? 1 : -1;
        lines.push(sign < 0 ? `-\\frac{x^{${k}}}{${k}}` : `+\\frac{x^{${k}}}{${k}}`);
      }

      return lines;
    },
  },
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 0; k < order; k += 1) {
        sum += x ** k;
      }

      return sum;
    },
    convergenceDetail: 'Convergente si |x| < 1, divergente si |x| >= 1',
    convergenceLabel: 'Conditionnelle',
    fn: (x) => (x !== 1 ? 1 / (1 - x) : NaN),
    label: '1/(1-x)',
    latex: '\\frac{1}{1-x}',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[4].termLines(order).join(' ')}`,
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 0; k < order; k += 1) {
        segments.push(`${k === 0 ? '' : '+'}x^{${k}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        lines.push(`+ ${etiquettePuissance(k)}`);
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        lines.push(`+x^{${k}}`);
      }

      return lines;
    },
  },
  {
    approx: (x, order) => {
      let sum = 0;

      for (let k = 0; k < order; k += 1) {
        sum += ((-1) ** k * x ** (2 * k + 1)) / (2 * k + 1);
      }

      return sum;
    },
    convergenceDetail: 'Convergente si |x| <= 1, divergente si |x| > 1',
    convergenceLabel: 'Conditionnelle',
    fn: Math.atan,
    label: 'arctan(x)',
    latex: '\\arctan(x)',
    polynomialLabel: (order) => `P_${order}(x) = ${FUNCTIONS[5].termLines(order).join(' ')}`.replace('+ -', '- '),
    polynomialLatex: (order) => {
      const segments: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k + 1;
        const sign = k === 0 ? '' : k % 2 === 0 ? '+' : '-';
        segments.push(`${sign}\\frac{x^{${power}}}{${power}}`);
      }

      return `P_${order}(x)=${segments.join('')}`;
    },
    termLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k + 1;
        lines.push(etiquetteTermeSigne(k % 2 === 0 ? 1 : -1, etiquettePuissance(power), power));
      }

      return lines;
    },
    termLatexLines: (order) => {
      const lines: string[] = [];

      for (let k = 0; k < order; k += 1) {
        const power = 2 * k + 1;
        lines.push(termeSigneLatex(k % 2 === 0 ? 1 : -1, `x^{${power}}`, power));
      }

      return lines;
    },
  },
];

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
  dashed = false,
  paths,
  thickness,
}: {
  color: string;
  dashed?: boolean;
  paths: Point[][];
  thickness: number;
}) {
  return paths.map((path, index) => (
    <Path
      d={creerDonneesChemin(path)}
      fill="none"
      key={`${color}-${index}`}
      stroke={color}
      strokeDasharray={dashed ? '8 6' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={thickness}
    />
  ));
}

function GraphiqueTaylor({
  activeFunction,
  graphHeight,
  graphWidth,
  order,
}: {
  activeFunction: TaylorFunction;
  graphHeight: number;
  graphWidth: number;
  order: number;
}) {
  const functionPaths = useMemo(
    () => echantillonnerFonction(activeFunction.fn, graphWidth, graphHeight, DOMAIN),
    [activeFunction, graphHeight, graphWidth]
  );

  const approximationLayers = useMemo(
    () =>
      Array.from({ length: order }, (_, index) => {
        const currentOrder = index + 1;
        const opacity = currentOrder === order ? 1 : 0.18 + (currentOrder / order) * 0.35;

        return {
          color:
            currentOrder === order
              ? themeActif.activeApproximation
              : `rgba(126, 166, 224, ${opacity.toFixed(2)})`,
          order: currentOrder,
          paths: echantillonnerFonction(
            (x) => activeFunction.approx(x, currentOrder),
            graphWidth,
            graphHeight,
            DOMAIN
          ),
          thickness: currentOrder === order ? 3.25 : 1.2,
        };
      }),
    [activeFunction, graphHeight, graphWidth, order]
  );
  const horizontalGrid = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index / 8) * graphHeight),
    [graphHeight]
  );
  const verticalGrid = useMemo(
    () => Array.from({ length: 13 }, (_, index) => (index / 12) * graphWidth),
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
        <Line
          stroke={themeActif.grid}
          strokeWidth={1.5}
          x1={graphWidth / 2}
          x2={graphWidth / 2}
          y1={0}
          y2={graphHeight}
        />

        {approximationLayers.map((layer) => (
          <TraceChemin
            color={layer.color}
            key={`approx-${layer.order}`}
            paths={layer.paths}
            thickness={layer.thickness}
          />
        ))}
        <TraceChemin color={themeActif.function} paths={functionPaths} thickness={3.25} />
      </Svg>

      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.function }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            f(x)
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.activeApproximation }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Pn(x)
          </TexteTheme>
        </View>
      </View>

      <View style={styles.orderPill}>
        <TexteTheme lightColor={themeActif.ink} style={styles.orderText}>
          Ordre n = {order}
        </TexteTheme>
      </View>
    </View>
  );
}

function CurseurTermes({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  const [typedValue, setTypedValue] = useState(String(value));

  useEffect(() => {
    setTypedValue(String(value));
  }, [value]);

  const commitTypedValue = () => {
    const nextValue = Number(typedValue.trim());

    if (!Number.isFinite(nextValue)) {
      setTypedValue(String(value));
      return;
    }

    const resolvedValue = borner(Math.round(nextValue), ORDER_MIN, ORDER_MAX);
    onChange(resolvedValue);
    setTypedValue(String(resolvedValue));
  };

  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const ratio = measuredWidth === 0 ? 0 : position / measuredWidth;
      const nextValue = borner(
        Math.round(ORDER_MIN + ratio * (ORDER_MAX - ORDER_MIN)),
        ORDER_MIN,
        ORDER_MAX
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

  const percent = ((value - ORDER_MIN) / (ORDER_MAX - ORDER_MIN || 1)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          Nombre de termes
        </TexteTheme>
        <TextInput
          inputMode="numeric"
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
          onPress={() => onChange(borner(value - 1, ORDER_MIN, ORDER_MAX))}
          style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            -1
          </TexteTheme>
        </Pressable>
        <Pressable
          onPress={() => onChange(borner(value + 1, ORDER_MIN, ORDER_MAX))}
          style={styles.stepButton}>
          <TexteTheme lightColor={themeActif.ink} style={styles.stepText}>
            +1
          </TexteTheme>
        </Pressable>
      </View>
    </View>
  );
}

export function SimulationSerieTaylor() {
  const [functionIndex, setFunctionIndex] = useState(0);
  const [order, setOrder] = useState(4);
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
  const approximationAtSample = activeFunction.approx(APPROXIMATION_SAMPLE_X, order);
  const functionAtSample = activeFunction.fn(APPROXIMATION_SAMPLE_X);
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
          <EnteteEcranSimulation titre="Serie de Taylor" domaine="mathematiques" />
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
              <GraphiqueTaylor
                activeFunction={activeFunction}
                graphHeight={graphHeight}
                graphWidth={graphWidth}
                order={order}
              />
            </View>

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback={'f(x) = somme f^(n)(0) / n! * x^n'}
                  mathematiques={'f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(0)}{n!}x^n'}
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
                    Approximation active
                  </TexteTheme>
                  <View style={styles.baseFormulaWrap}>
                    <RenduFormule
                      fallback={`f(x) = ${activeFunction.label}`}
                      mathematiques={`f(x)=${activeFunction.latex}`}
                    />
                  </View>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.approximationFormulaWrap}
                    contentContainerStyle={styles.approximationFormulaContent}>
                    {activeFunction.termLines(order).map((term, index) => (
                      <View key={`${term}-${index}`} style={styles.approximationTermRow}>
                        <TexteTheme lightColor="#000000" style={styles.approximationTermText}>
                          {term}
                        </TexteTheme>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.convergenceCard}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.convergenceTitle}>
                      {activeFunction.convergenceLabel}
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.convergenceText}>
                      {activeFunction.convergenceDetail}
                    </TexteTheme>
                  </View>
                </View>
              </View>

              <View style={styles.panel}>
                <CurseurTermes onChange={setOrder} value={order} />
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Approximation en x = 10
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(approximationAtSample)}
                  </TexteTheme>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                      Valeur reelle en x = 10
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                    {formaterNombre(functionAtSample)}
                  </TexteTheme>
                </View>
              </View>

            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Une serie de Taylor approxime une fonction par un polynome construit a partir de ses derivees en un point de reference.",
          "Quand on ajoute des termes, le polynome colle mieux a la courbe originale autour du centre de developpement, puis sur une zone de plus en plus large.",
        ]}
        exampleLabel="Lecture rapide"
        exampleText="La courbe verte est la vraie fonction, et la courbe bleue montre le polynome de Taylor actif."
        eyebrow="Definition"
        title="Qu est ce qu une serie de Taylor ?"
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
  orderPill: {
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
  orderText: {
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
  valueLabel: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  activeFormulaWrap: {
    minWidth: 72,
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
    flexBasis: '31%',
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
  derivativeFormulaCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 8,
    height: 320,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  derivativeFormulaLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  baseFormulaWrap: {
    minHeight: 40,
    width: '100%',
  },
  approximationFormulaWrap: {
    flexGrow: 0,
    height: 220,
    width: '100%',
  },
  approximationFormulaContent: {
    gap: 10,
    paddingBottom: 4,
  },
  approximationTermRow: {
    minHeight: 30,
    width: '100%',
  },
  approximationTermText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  convergenceCard: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  convergenceTitle: {
    color: themeActif.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  convergenceText: {
    color: themeActif.mutedInk,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
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
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
});

