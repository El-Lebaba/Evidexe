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

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  projectile: '#D8A94A',
  projectileDeep: '#9A7432',
  surface: '#F3F1E7',
  trajectory: '#7CCFBF',
  velocityX: '#7CCFBF',
  velocityY: '#D97B6C',
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

function formaterNombre(value: number, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : '--';
}

function obtenirValeursProjectile(speed: number, angleDeg: number, gravity: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const vx = speed * Math.cos(angleRad);
  const vy0 = speed * Math.sin(angleRad);
  const flightTime = gravity > 0 ? (2 * vy0) / gravity : 0;
  const range = vx * flightTime;
  const maxHeight = gravity > 0 ? (vy0 * vy0) / (2 * gravity) : 0;

  return {
    angleRad,
    flightTime,
    maxHeight,
    range,
    vx,
    vy0,
  };
}

function creerCheminTrajectoire({
  flightTime,
  gravity,
  groundY,
  steps = 96,
  vx,
  vy0,
  xScale,
  yScale,
}: {
  flightTime: number;
  gravity: number;
  groundY: number;
  steps?: number;
  vx: number;
  vy0: number;
  xScale: number;
  yScale: number;
}) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const time = (index / steps) * flightTime;
    const x = vx * time * xScale;
    const height = vy0 * time - 0.5 * gravity * time * time;
    const y = groundY - height * yScale;

    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
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

function GraphiqueProjectile({
  elapsed,
  graphHeight,
  graphWidth,
  isLaunched,
  values,
  gravity,
}: {
  elapsed: number;
  graphHeight: number;
  graphWidth: number;
  gravity: number;
  isLaunched: boolean;
  values: ReturnType<typeof obtenirValeursProjectile>;
}) {
  const groundY = graphHeight - 42;
  const xScale = graphWidth / Math.max(values.range * 1.16, 12);
  const yScale = (groundY - 26) / Math.max(values.maxHeight * 1.35, 5);
  const trajectoryD = useMemo(
    () =>
      creerCheminTrajectoire({
        flightTime: values.flightTime,
        gravity,
        groundY,
        vx: values.vx,
        vy0: values.vy0,
        xScale,
        yScale,
      }),
    [gravity, groundY, values.flightTime, values.vx, values.vy0, xScale, yScale]
  );
  const horizontalGrid = useMemo(
    () => Array.from({ length: 8 }, (_, index) => (index / 7) * groundY),
    [groundY]
  );
  const verticalGrid = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index / 8) * graphWidth),
    [graphWidth]
  );

  const activeTime = borner(elapsed, 0, values.flightTime);
  const currentX = values.vx * activeTime;
  const currentHeight = values.vy0 * activeTime - 0.5 * gravity * activeTime * activeTime;
  const currentYVelocity = values.vy0 - gravity * activeTime;
  const projectileX = currentX * xScale;
  const projectileY = groundY - currentHeight * yScale;
  const showProjectile = isLaunched || elapsed > 0;
  const vectorScale = borner(graphWidth / 260, 1.1, 2.2);

  return (
    <View style={[styles.graph, { height: graphHeight, width: graphWidth }]}>
      <Svg height={graphHeight} width={graphWidth}>
        <Defs>
          <RadialGradient cx="35%" cy="32%" id="projectileDot" r="72%">
            <Stop offset="0%" stopColor="#F8E6B8" />
            <Stop offset="54%" stopColor={themeActif.projectile} />
            <Stop offset="100%" stopColor={themeActif.projectileDeep} />
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
        {verticalGrid.map((x, index) => (
          <Line
            key={`grid-v-${index}`}
            stroke={themeActif.gridSoft}
            strokeWidth={1}
            x1={x}
            x2={x}
            y1={0}
            y2={groundY}
          />
        ))}

        <Path
          d={trajectoryD}
          fill="none"
          stroke={themeActif.trajectory}
          strokeDasharray="7 6"
          strokeOpacity={0.75}
          strokeWidth={2.25}
        />
        <Rect fill="rgba(183, 199, 176, 0.38)" height={graphHeight - groundY} width={graphWidth} x={0} y={groundY} />
        <Line stroke={themeActif.grid} strokeWidth={2} x1={0} x2={graphWidth} y1={groundY} y2={groundY} />

        {showProjectile ? (
          <>
            <Line
              stroke={themeActif.velocityX}
              strokeLinecap="round"
              strokeWidth={2.5}
              x1={projectileX}
              x2={projectileX + values.vx * vectorScale}
              y1={projectileY}
              y2={projectileY}
            />
            <Line
              stroke={themeActif.velocityY}
              strokeLinecap="round"
              strokeWidth={2.5}
              x1={projectileX}
              x2={projectileX}
              y1={projectileY}
              y2={projectileY - currentYVelocity * vectorScale}
            />
            <Circle cx={projectileX} cy={projectileY} fill="rgba(216, 169, 74, 0.22)" r={18} />
            <Circle cx={projectileX} cy={projectileY} fill="url(#projectileDot)" r={8} stroke={themeActif.surface} strokeOpacity={0.7} strokeWidth={1.3} />
          </>
        ) : (
          <Circle cx={0} cy={groundY} fill="url(#projectileDot)" r={8} stroke={themeActif.surface} strokeOpacity={0.7} strokeWidth={1.3} />
        )}

        <SvgText fill={themeActif.ink} fontSize="11" fontWeight="800" textAnchor="start" x={12} y={22}>
          portee {formaterNombre(values.range)} m
        </SvgText>
        <SvgText fill={themeActif.mutedInk} fontSize="11" fontWeight="800" textAnchor="start" x={12} y={38}>
          hauteur max {formaterNombre(values.maxHeight)} m
        </SvgText>
      </Svg>
    </View>
  );
}

export function SimulationMouvementProjectile() {
  const isFocused = useIsFocused();
  const [speed, setSpeed] = useState(20);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.8);
  const [isLaunched, setIsLaunched] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const values = useMemo(() => obtenirValeursProjectile(speed, angle, gravity), [angle, gravity, speed]);

  useEffect(() => {
    setElapsed(0);
    setIsLaunched(false);
    setIsPaused(false);
  }, [angle, gravity, speed]);

  utiliserIntervalleSimulation(isFocused && isLaunched && !isPaused, () => {
    setElapsed((current) => {
      const nextElapsed = current + 0.096;

      if (nextElapsed >= values.flightTime) {
        setIsLaunched(false);
        setIsPaused(false);
        return values.flightTime;
      }

      return nextElapsed;
    });
  }, 32);

  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.62), 440, 660)
    : borner(Math.round(graphWidth * 0.74), 340, 520);
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;
  const currentTime = borner(elapsed, 0, values.flightTime);
  const currentYVelocity = values.vy0 - gravity * currentTime;
  const currentSpeed = Math.sqrt(values.vx * values.vx + currentYVelocity * currentYVelocity);

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
          <EnteteEcranSimulation titre="Mouvement projectile" domaine="physique" />
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
            <GraphiqueProjectile
              elapsed={elapsed}
              graphHeight={graphHeight}
              graphWidth={graphWidth}
              gravity={gravity}
              isLaunched={isLaunched}
              values={values}
            />

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="R = v0^2 sin(2 theta) / g"
                  mathematiques={'R=\\frac{v_0^2\\sin(2\\theta)}{g}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique label="Vitesse initiale" max={50} min={5} onChange={setSpeed} step={1} unit="m/s" value={speed} />
                <CurseurNumerique label="Angle de tir" max={85} min={5} onChange={setAngle} step={1} unit="Â°" value={angle} />
                <CurseurNumerique label="Gravite" max={25} min={1} onChange={setGravity} precision={1} step={0.1} unit="m/s^2" value={gravity} />
                <Pressable
                  onPress={() => {
                    setElapsed(0);
                    setIsPaused(false);
                    setIsLaunched(true);
                  }}
                  style={styles.launchButton}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.launchText}>
                    Lancer le projectile
                  </TexteTheme>
                </Pressable>
                <Pressable
                  disabled={!isLaunched && elapsed <= 0}
                  onPress={() => setIsPaused((current) => !current)}
                  style={[styles.pauseButton, !isLaunched && elapsed <= 0 ? styles.pauseButtonDisabled : undefined]}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.launchText}>
                    {isPaused ? 'Reprendre' : 'Pause'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Portee
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback={`${formaterNombre(values.range)} m`} mathematiques={`${formaterNombre(values.range)}\\ \\text{m}`} centered size="sm" />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Hauteur max
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback={`${formaterNombre(values.maxHeight)} m`} mathematiques={`${formaterNombre(values.maxHeight)}\\ \\text{m}`} centered size="sm" />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Temps vol
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule fallback={`${formaterNombre(values.flightTime, 2)} s`} mathematiques={`${formaterNombre(values.flightTime, 2)}\\ \\text{s}`} centered size="sm" />
                  </View>
                </View>
              </View>

              <View style={styles.velocityCard}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.infoLabel}>
                  Vitesse actuelle
                  </TexteTheme>
                  <View style={styles.velocityRows}>
                    <View style={styles.velocityRow}>
                      <TexteTheme lightColor={themeActif.ink} style={styles.velocityText}>
                        vx = {formaterNombre(values.vx, 2)} m/s
                      </TexteTheme>
                  </View>
                  <View style={styles.velocityRow}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.velocityText}>
                      vy = {formaterNombre(currentYVelocity, 2)} m/s
                    </TexteTheme>
                  </View>
                  <View style={styles.velocityRow}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.velocityText}>
                      |v| = {formaterNombre(currentSpeed, 2)} m/s
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
          'Un projectile suit une trajectoire parabolique quand on neglige la resistance de l air.',
          'La vitesse horizontale reste constante, tandis que la vitesse verticale diminue sous l effet de la gravite.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="A 45 deg, la portee est maximale si le projectile revient a la meme hauteur."
        eyebrow="Definition"
        title="Qu est ce qu un mouvement projectile ?"
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
  launchButton: {
    alignItems: 'center',
    backgroundColor: themeActif.accent,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 46,
  },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
  },
  pauseButtonDisabled: {
    opacity: 0.45,
  },
  launchText: {
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
  velocityCard: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
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
  velocityRows: {
    gap: 7,
  },
  velocityRow: {
    alignItems: 'center',
    minHeight: 30,
    width: '100%',
  },
  velocityText: {
    color: themeActif.ink,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'center',
  },
});

