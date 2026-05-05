import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

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

type PendulumState = {
  angle: number;
  angularVelocity: number;
  trail: { x: number; y: number }[];
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  bob: '#7CCFBF',
  bobDeep: '#3F8D83',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  kinetic: '#7CCFBF',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  potential: '#D8A94A',
  pull: '#D97B6C',
  surface: '#F3F1E7',
  trail: '#7DC9BE',
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

function arrondirAuPas(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formaterNombre(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '--';
}

function polaireVersPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.sin(angle),
    y: cy + radius * Math.cos(angle),
  };
}

function cheminArc(cx: number, cy: number, radius: number, angle: number) {
  const start = polaireVersPoint(cx, cy, radius, 0);
  const end = polaireVersPoint(cx, cy, radius, angle);
  const sweepFlag = angle >= 0 ? 0 : 1;

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function cheminTrace(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
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
  const setFromEvent = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, measuredWidth, _height, pageX) => {
      const position = borner(event.nativeEvent.pageX - pageX, 0, measuredWidth);
      const rawValue = min + (position / measuredWidth) * (max - min);
      const nextValue = borner(arrondirAuPas(rawValue, step), min, max);

      onChange(Number(nextValue.toFixed(precision)));
    });
  }, [max, min, onChange, precision, step]);

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

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.label}>
          {label}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.ink} style={styles.sliderValueText}>
          {value.toFixed(precision)} {unit}
        </TexteTheme>
      </View>
      <View {...panResponder.panHandlers} style={[styles.sliderTrack, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderThumb, WEB_SLIDER_INTERACTION_STYLE, { left: `${percent}%` }]} />
      </View>
    </View>
  );
}

function GraphiquePendule({
  angle,
  graphHeight,
  graphWidth,
  lengthCm,
  trail,
}: {
  angle: number;
  graphHeight: number;
  graphWidth: number;
  lengthCm: number;
  trail: { x: number; y: number }[];
}) {
  const pivotX = graphWidth / 2;
  const pivotY = 52;
  const visualLength = borner((lengthCm / 250) * graphHeight * 0.66, 90, graphHeight * 0.7);
  const bob = polaireVersPoint(pivotX, pivotY, visualLength, angle);
  const bobRadius = 18;
  const angleDeg = (angle * 180) / Math.PI;
  const trailD = trail.length > 1 ? cheminTrace(trail) : '';
  const horizontalGrid = useMemo(
    () => Array.from({ length: 8 }, (_, index) => (index / 7) * graphHeight),
    [graphHeight]
  );

  return (
    <View style={[styles.graph, { height: graphHeight, width: graphWidth }]}>
      <Svg height={graphHeight} width={graphWidth}>
        <Defs>
          <RadialGradient cx="35%" cy="32%" id="pendulumBob" r="72%">
            <Stop offset="0%" stopColor="#DDF8EF" />
            <Stop offset="52%" stopColor={themeActif.bob} />
            <Stop offset="100%" stopColor={themeActif.bobDeep} />
          </RadialGradient>
        </Defs>

        <Rect fill={themeActif.panel} height={graphHeight} width={graphWidth} x={0} y={0} />
        {horizontalGrid.map((y, index) => (
          <Line
            key={`grid-h-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1}
            x1={0}
            x2={graphWidth}
            y1={y}
            y2={y}
          />
        ))}

        <Line stroke={themeActif.grid} strokeDasharray="5 5" strokeWidth={1.3} x1={pivotX} x2={pivotX} y1={pivotY} y2={graphHeight - 36} />
        {trailD ? <Path d={trailD} fill="none" stroke={themeActif.trail} strokeOpacity={0.55} strokeWidth={3} /> : null}

        {Math.abs(angle) > 0.02 ? (
          <Path d={cheminArc(pivotX, pivotY, 38, angle)} fill="none" stroke={themeActif.pull} strokeOpacity={0.85} strokeWidth={2} />
        ) : null}

        <Line stroke={themeActif.border} strokeLinecap="round" strokeWidth={3} x1={pivotX} x2={bob.x} y1={pivotY} y2={bob.y} />
        <Circle cx={pivotX} cy={pivotY} fill={themeActif.border} r={7} />
        <Circle cx={pivotX} cy={pivotY} fill={themeActif.surface} r={3} />
        <Circle cx={bob.x} cy={bob.y} fill="rgba(124, 207, 191, 0.22)" r={bobRadius + 12} />
        <Circle cx={bob.x} cy={bob.y} fill="url(#pendulumBob)" r={bobRadius} stroke={themeActif.surface} strokeOpacity={0.55} strokeWidth={1.5} />

        <SvgText fill={themeActif.ink} fontSize="12" fontWeight="800" textAnchor="middle" x={pivotX} y={pivotY + 54}>
          {formaterNombre(angleDeg, 1)}Â°
        </SvgText>
      </Svg>
    </View>
  );
}

export function SimulationPendule() {
  const isFocused = useIsFocused();
  const [lengthCm, setLengthCm] = useState(150);
  const [gravity, setGravity] = useState(9.8);
  const [damping, setDamping] = useState(0.995);
  const [initialAngle, setInitialAngle] = useState(45);
  const [isRunning, setIsRunning] = useState(true);
  const [, setFrame] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const graphMetricsRef = useRef({ graphHeight: 0, graphWidth: 0 });
  const stateRef = useRef<PendulumState>({
    angle: (45 * Math.PI) / 180,
    angularVelocity: 0,
    trail: [],
  });

  useEffect(() => {
    stateRef.current = {
      angle: (initialAngle * Math.PI) / 180,
      angularVelocity: 0,
      trail: [],
    };
    setFrame((current) => current + 1);
  }, [initialAngle, lengthCm, gravity]);

  utiliserIntervalleSimulation(isFocused && isRunning, () => {
    const state = stateRef.current;
    const lengthM = lengthCm / 100;
    const dt = 0.032;
    const angularAcceleration = -(gravity / lengthM) * Math.sin(state.angle);

    state.angularVelocity = (state.angularVelocity + angularAcceleration * dt) * Math.pow(damping, dt / 0.016);
    state.angle += state.angularVelocity * dt;

    const { graphHeight, graphWidth } = graphMetricsRef.current;
    if (graphHeight > 0 && graphWidth > 0) {
      const visualLength = borner((lengthCm / 250) * graphHeight * 0.66, 90, graphHeight * 0.7);
      state.trail.push(polaireVersPoint(graphWidth / 2, 52, visualLength, state.angle));
      if (state.trail.length > 56) {
        state.trail.shift();
      }
    }

    setFrame((current) => current + 1);
  }, 32);

  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.64), 460, 680)
    : borner(Math.round(graphWidth * 0.82), 360, 540);
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;
  graphMetricsRef.current = { graphHeight, graphWidth };
  const state = stateRef.current;
  const lengthM = lengthCm / 100;
  const period = 2 * Math.PI * Math.sqrt(lengthM / gravity);
  const kineticEnergy = 0.5 * Math.pow(lengthM * state.angularVelocity, 2);
  const potentialEnergy = gravity * lengthM * (1 - Math.cos(state.angle));
  const totalEnergy = kineticEnergy + potentialEnergy || 1;
  const kineticPercent = borner((kineticEnergy / totalEnergy) * 100, 0, 100);
  const potentialPercent = 100 - kineticPercent;

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
          <EnteteEcranSimulation titre="Pendule" domaine="physique" />
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
            <GraphiquePendule
              angle={state.angle}
              graphHeight={graphHeight}
              graphWidth={graphWidth}
              lengthCm={lengthCm}
              trail={state.trail}
            />

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="T = 2pi sqrt(L / g)"
                  mathematiques={'T=2\\pi\\sqrt{\\frac{L}{g}}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Longueur" max={250} min={50} onChange={setLengthCm} step={1} unit="cm" value={lengthCm} />
                <CurseurNumerique label="Gravite" max={25} min={1} onChange={setGravity} precision={1} step={0.1} unit="m/s^2" value={gravity} />
                <CurseurNumerique label="Amortissement" max={1} min={0.95} onChange={setDamping} precision={3} step={0.001} value={damping} />
                <CurseurNumerique label="Angle initial" max={80} min={10} onChange={setInitialAngle} step={1} unit="Â°" value={initialAngle} />
                <Pressable onPress={() => setIsRunning((current) => !current)} style={styles.toggleButton}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.toggleText}>
                    {isRunning ? 'Pause' : 'Reprendre'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Cycle complet
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback={`${formaterNombre(period)} s`} mathematiques={`${formaterNombre(period)}\\ \\text{s}`} centered size="sm" />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Vitesse ang.
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                      {formaterNombre(Math.abs(state.angularVelocity))} rad/s
                    </TexteTheme>
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Angle
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.statValueSmall}>
                    {formaterNombre((state.angle * 180) / Math.PI, 1)}Â°
                  </TexteTheme>
                </View>
              </View>

              <View style={styles.energyCard}>
                <View style={styles.energyHeader}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.infoLabel}>
                    Echange d energie
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.energyReadout}>
                    {formaterNombre(kineticPercent, 0)}% / {formaterNombre(potentialPercent, 0)}%
                  </TexteTheme>
                </View>
                <View style={styles.energyBar}>
                  <View style={[styles.kineticFill, { width: `${kineticPercent}%` }]} />
                  <View style={[styles.potentialFill, { width: `${potentialPercent}%` }]} />
                </View>
                <View style={styles.energyLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: themeActif.kinetic }]} />
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
                      Cinetique
                    </TexteTheme>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: themeActif.potential }]} />
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
                      Potentielle
                    </TexteTheme>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>

      <InfobulleDefinition
        body={[
          'Un pendule convertit continuellement energie potentielle et energie cinetique pendant son mouvement.',
          'Pour de petits angles, sa periode depend surtout de la longueur L et de la gravite g, pas de la masse.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Allonger le pendule augmente la periode. Augmenter g rend les oscillations plus rapides."
        eyebrow="Definition"
        title="Qu est ce qu un pendule simple ?"
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
  toggleButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
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
  statFormulaWrap: {
    minHeight: 34,
    width: '100%',
  },
  statValueSmall: {
    color: themeActif.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  energyCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  energyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  energyReadout: {
    color: themeActif.ink,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  energyBar: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 16,
    overflow: 'hidden',
  },
  kineticFill: {
    backgroundColor: themeActif.kinetic,
    height: '100%',
  },
  potentialFill: {
    backgroundColor: themeActif.potential,
    height: '100%',
  },
  energyLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
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

