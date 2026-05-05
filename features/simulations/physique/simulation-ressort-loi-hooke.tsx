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
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

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
  secondaryText?: string;
  step: number;
  unit?: string;
  value: number;
  valueText?: string;
};

type SpringPhysics = {
  dampingRatio: number | null;
  gamma: number;
  isOscillating: boolean;
  omegaD: number;
  omega0: number;
  period: number | null;
};

const SIMULATION_PAGE_BACKGROUND = '#EAE3D2';
const PIXELS_PER_METER = 100;
const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  kinetic: '#7CCFBF',
  mass: '#7CCFBF',
  massDeep: '#3F8D83',
  mutedInk: '#6E7F73',
  panel: '#DDE4D5',
  potential: '#D8A94A',
  spring: '#7DC9BE',
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

function arrondirAuPas(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formaterNombre(value: number, digits = 2) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? (0).toFixed(digits) : rounded.toFixed(digits);
}

function formaterNombreMath(value: number, digits = 2) {
  if (!Number.isFinite(value)) {
    return '\\text{N/A}';
  }

  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? (0).toFixed(digits) : rounded.toFixed(digits);
}

function obtenirPhysiqueRessort(springConstant: number, mass: number, dampingCoefficient: number): SpringPhysics {
  if (mass <= 0 || springConstant <= 0) {
    return {
      dampingRatio: null,
      gamma: 0,
      isOscillating: false,
      omegaD: 0,
      omega0: 0,
      period: null,
    };
  }

  const safeDamping = Math.max(0, dampingCoefficient);
  const omega0 = Math.sqrt(springConstant / mass);
  const gamma = safeDamping / (2 * mass);
  const omegaDSquared = omega0 * omega0 - gamma * gamma;
  const omegaD = Math.sqrt(Math.max(0, omegaDSquared));
  const isOscillating = omegaDSquared > 1e-8;

  return {
    dampingRatio: safeDamping / (2 * Math.sqrt(springConstant * mass)),
    gamma,
    isOscillating,
    omegaD,
    omega0,
    period: isOscillating && omegaD > 0 ? (2 * Math.PI) / omegaD : null,
  };
}

function creerCheminRessort({
  centerX,
  coils,
  springBottom,
  springTop,
}: {
  centerX: number;
  coils: number;
  springBottom: number;
  springTop: number;
}) {
  const steps = coils * 8;
  const amplitude = 17;
  const path = [`M ${centerX.toFixed(2)} ${springTop.toFixed(2)}`];

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const y = springTop + progress * (springBottom - springTop);
    const x = centerX + amplitude * Math.sin(progress * coils * Math.PI * 2);

    path.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  path.push(`L ${centerX.toFixed(2)} ${springBottom.toFixed(2)}`);
  return path.join(' ');
}

function CurseurNumerique({
  label,
  max,
  min,
  onChange,
  precision = 0,
  secondaryText,
  step,
  unit = '',
  value,
  valueText,
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
        <View style={styles.sliderValueGroup}>
          <TexteTheme lightColor={themeActif.ink} style={styles.sliderValueText}>
            {valueText ?? `${value.toFixed(precision)} ${unit}`}
          </TexteTheme>
          {secondaryText ? (
            <TexteTheme lightColor={themeActif.mutedInk} style={styles.sliderSecondaryText}>
              {secondaryText}
            </TexteTheme>
          ) : null}
        </View>
      </View>
      <View {...panResponder.panHandlers} style={[styles.sliderTrack, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderThumb, WEB_SLIDER_INTERACTION_STYLE, { left: `${percent}%` }]} />
      </View>
    </View>
  );
}

function GraphiqueRessort({
  amplitudeMeters,
  elapsed,
  graphHeight,
  graphWidth,
  mass,
  physique,
  springConstant,
}: {
  amplitudeMeters: number;
  elapsed: number;
  graphHeight: number;
  graphWidth: number;
  mass: number;
  physique: SpringPhysics;
  springConstant: number;
}) {
  const centerX = graphWidth / 2;
  const ceilingY = 24;
  const springTop = ceilingY + 12;
  const equilibriumY = graphHeight * 0.48;
  const dampFactor = Math.exp(-physique.gamma * elapsed);
  const phase = physique.omegaD * elapsed;
  // Physical formulas use meters. Pixels only scale the visual displacement.
  const displacementMeters = amplitudeMeters * dampFactor * Math.cos(phase);
  const displacement = displacementMeters * PIXELS_PER_METER;
  const massY = equilibriumY + displacement;
  const massSize = borner(34 + mass * 7, 36, 70);
  const springBottom = massY - massSize / 2;
  const springPath = useMemo(
    () => creerCheminRessort({ centerX, coils: 10, springBottom, springTop }),
    [centerX, springBottom, springTop]
  );
  const horizontalGrid = useMemo(
    () => Array.from({ length: 7 }, (_, index) => 38 + index * ((graphHeight - 74) / 6)),
    [graphHeight]
  );
  const velocityMeters =
    amplitudeMeters * dampFactor * (-physique.gamma * Math.cos(phase) - physique.omegaD * Math.sin(phase));
  const kineticEnergy = 0.5 * mass * velocityMeters * velocityMeters;
  const potentialEnergy = 0.5 * springConstant * displacementMeters * displacementMeters;
  const totalEnergy = kineticEnergy + potentialEnergy + 0.001;
  const kineticRatio = borner(kineticEnergy / totalEnergy, 0, 1);
  const potentialRatio = borner(potentialEnergy / totalEnergy, 0, 1);
  const barWidth = Math.min(168, graphWidth - 36);
  const barX = 18;
  const barY = graphHeight - 34;
  const displacementArrowX = centerX + Math.min(88, graphWidth * 0.24);

  return (
    <View style={styles.graphShell}>
      <Svg height={graphHeight} width={graphWidth}>
        <Defs>
          <LinearGradient id="massGradient" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor={themeActif.mass} stopOpacity="1" />
            <Stop offset="1" stopColor={themeActif.massDeep} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Rect fill={themeActif.panel} height={graphHeight} rx={8} width={graphWidth} x={0} y={0} />

        {horizontalGrid.map((y) => (
          <Line key={`grid-${y}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={0} x2={graphWidth} y1={y} y2={y} />
        ))}

        <Rect fill={themeActif.surface} height={12} rx={4} stroke={themeActif.border} strokeWidth={1} width={118} x={centerX - 59} y={ceilingY} />
        {Array.from({ length: 13 }, (_, index) => {
          const x = centerX - 54 + index * 9;

          return (
            <Line
              key={`ceiling-mark-${index}`}
              stroke={themeActif.mutedInk}
              strokeLinecap="round"
              strokeWidth={1.5}
              x1={x}
              x2={x - 7}
              y1={ceilingY + 14}
              y2={ceilingY + 22}
            />
          );
        })}

        <Path d={springPath} fill="none" stroke={themeActif.spring} strokeLinecap="round" strokeWidth={3} />

        <Line
          stroke={themeActif.grid}
          strokeDasharray="6 5"
          strokeWidth={1.5}
          x1={16}
          x2={graphWidth - 16}
          y1={equilibriumY}
          y2={equilibriumY}
        />
        <SvgText fill={themeActif.mutedInk} fontSize={11} fontWeight="700" x={18} y={equilibriumY - 8}>
          equilibre
        </SvgText>

        {Math.abs(displacement) > 5 ? (
          <>
            <Line
              stroke={themeActif.accent}
              strokeLinecap="round"
              strokeWidth={3}
              x1={displacementArrowX}
              x2={displacementArrowX}
              y1={equilibriumY}
              y2={massY}
            />
            <Line
              stroke={themeActif.accent}
              strokeLinecap="round"
              strokeWidth={3}
              x1={displacementArrowX - 5}
              x2={displacementArrowX}
              y1={massY + (displacement > 0 ? -7 : 7)}
              y2={massY}
            />
            <Line
              stroke={themeActif.accent}
              strokeLinecap="round"
              strokeWidth={3}
              x1={displacementArrowX + 5}
              x2={displacementArrowX}
              y1={massY + (displacement > 0 ? -7 : 7)}
              y2={massY}
            />
            <SvgText fill={themeActif.accent} fontSize={12} fontWeight="800" x={displacementArrowX + 9} y={(equilibriumY + massY) / 2}>
              x={formaterNombre(displacementMeters, 2)} m
            </SvgText>
          </>
        ) : null}

        <Rect
          fill="url(#massGradient)"
          height={massSize}
          rx={8}
          stroke={themeActif.ink}
          strokeWidth={1.5}
          width={massSize}
          x={centerX - massSize / 2}
          y={massY - massSize / 2}
        />
        <Rect fill={themeActif.surface} height={12} rx={4} stroke={themeActif.border} strokeWidth={1} width={barWidth} x={barX} y={barY} />
        <Rect fill={themeActif.kinetic} height={12} rx={4} width={barWidth * kineticRatio} x={barX} y={barY} />
        <Rect
          fill={themeActif.potential}
          height={12}
          rx={4}
          width={barWidth * potentialRatio}
          x={barX + barWidth * kineticRatio}
          y={barY}
        />
        <SvgText fill={themeActif.ink} fontSize={10} fontWeight="800" x={barX} y={barY - 6}>
          Ec
        </SvgText>
        <SvgText fill={themeActif.ink} fontSize={10} fontWeight="800" x={barX + barWidth - 20} y={barY - 6}>
          Ep
        </SvgText>
      </Svg>
    </View>
  );
}

function creerCheminProjection({
  amplitude,
  phase,
  startX,
  width,
  y,
}: {
  amplitude: number;
  phase: number;
  startX: number;
  width: number;
  y: number;
}) {
  const steps = 90;
  const usableWidth = Math.max(1, width - startX - 22);

  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps;
    const x = startX + progress * usableWidth;
    const curveY = y + amplitude * Math.cos(phase + progress * Math.PI * 1.35);

    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${curveY.toFixed(2)}`;
  }).join(' ');
}

function GraphiqueProjectionPhase({
  elapsed,
  graphHeight,
  graphWidth,
  physique,
}: {
  elapsed: number;
  graphHeight: number;
  graphWidth: number;
  physique: SpringPhysics;
}) {
  const dampFactor = Math.exp(-physique.gamma * elapsed);
  const phase = physique.omegaD * elapsed;
  const wheelRadius = Math.min(34, Math.max(24, graphHeight * 0.22));
  const currentRadius = wheelRadius * dampFactor;
  const wheelCenterX = Math.max(70, graphWidth * 0.18);
  const wheelCenterY = graphHeight * 0.46;
  const dotX = wheelCenterX + currentRadius * Math.sin(phase);
  const dotY = wheelCenterY + currentRadius * Math.cos(phase);
  const axisY = wheelCenterY;
  const projectionStartX = Math.max(wheelCenterX + wheelRadius + 52, graphWidth * 0.46);
  const projectionAmplitude = currentRadius;
  const projectionY = dotY;
  const curvePath = useMemo(
    () =>
      creerCheminProjection({
        amplitude: projectionAmplitude,
        phase,
        startX: projectionStartX,
        width: graphWidth,
        y: axisY,
      }),
    [axisY, graphWidth, phase, projectionAmplitude, projectionStartX]
  );

  return (
    <View style={styles.phaseGraph}>
      <Svg height={graphHeight} width={graphWidth}>
        <Rect fill={themeActif.panel} height={graphHeight} rx={8} width={graphWidth} x={0} y={0} />
        <Circle
          cx={wheelCenterX}
          cy={wheelCenterY}
          fill={themeActif.surface}
          r={wheelRadius}
          stroke={themeActif.border}
          strokeOpacity={0.7}
          strokeWidth={1.5}
        />
        <Circle
          cx={wheelCenterX}
          cy={wheelCenterY}
          fill="none"
          r={wheelRadius + 6}
          stroke={themeActif.border}
          strokeOpacity={0.24}
          strokeWidth={1.5}
        />
        <Line stroke={themeActif.grid} strokeDasharray="4 4" strokeWidth={1.5} x1={dotX} x2={dotX} y1={dotY} y2={axisY} />
        <Line stroke={themeActif.grid} strokeDasharray="4 4" strokeWidth={1.5} x1={dotX} x2={projectionStartX} y1={projectionY} y2={projectionY} />
        <Line stroke={themeActif.spring} strokeWidth={2.5} x1={wheelCenterX} x2={dotX} y1={wheelCenterY} y2={dotY} />
        <Circle cx={dotX} cy={dotY} fill={themeActif.mass} r={7} stroke={themeActif.border} strokeWidth={1} />

        <Line stroke={themeActif.grid} strokeDasharray="5 5" strokeWidth={1.5} x1={projectionStartX} x2={projectionStartX} y1={axisY - 34} y2={axisY + 34} />
        <Line stroke={themeActif.grid} strokeWidth={1.5} x1={projectionStartX} x2={graphWidth - 20} y1={axisY} y2={axisY} />
        <Path d={curvePath} fill="none" stroke={themeActif.spring} strokeLinecap="round" strokeWidth={3} />
        <Circle cx={projectionStartX} cy={projectionY} fill={themeActif.mass} r={6} stroke={themeActif.panel} strokeWidth={1.5} />

        <SvgText fill={themeActif.mutedInk} fontSize={10} fontWeight="800" textAnchor="middle" x={wheelCenterX} y={wheelCenterY + wheelRadius + 18}>
          rotation
        </SvgText>
        <SvgText fill={themeActif.mutedInk} fontSize={10} fontWeight="800" textAnchor="middle" x={projectionStartX + 82} y={axisY + 38}>
          projection = position du ressort
        </SvgText>
        <Line stroke={themeActif.mutedInk} strokeWidth={1.5} x1={projectionStartX} x2={projectionStartX} y1={graphHeight - 22} y2={graphHeight - 16} />
        <Line stroke={themeActif.mutedInk} strokeWidth={1.5} x1={graphWidth - 22} x2={graphWidth - 22} y1={graphHeight - 22} y2={graphHeight - 16} />
        <SvgText fill={themeActif.ink} fontSize={11} fontWeight="900" textAnchor="middle" x={projectionStartX} y={graphHeight - 7}>
          0 s
        </SvgText>
        <SvgText fill={themeActif.ink} fontSize={11} fontWeight="900" textAnchor="middle" x={graphWidth - 22} y={graphHeight - 7}>
          1 s
        </SvgText>
      </Svg>
    </View>
  );
}

export function SimulationRessortLoiHooke() {
  const isFocused = useIsFocused();
  const [springConstant, setSpringConstant] = useState(5);
  const [mass, setMass] = useState(1.6);
  const [amplitudePixels, setAmplitudePixels] = useState(60);
  const [damping, setDamping] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  // The slider stores visual pixels for stable drawing, while physique always uses meters.
  const amplitudeMeters = amplitudePixels / PIXELS_PER_METER;
  const physique = useMemo(
    () => obtenirPhysiqueRessort(springConstant, mass, damping),
    [damping, mass, springConstant]
  );
  const dampFactor = Math.exp(-physique.gamma * elapsed);
  const phase = physique.omegaD * elapsed;
  const displacementMeters = amplitudeMeters * dampFactor * Math.cos(phase);
  const forceNewtons = -springConstant * displacementMeters;

  useEffect(() => {
    setElapsed(0);
  }, [amplitudePixels, damping, mass, springConstant]);

  utiliserIntervalleSimulation(isFocused && !isPaused, () => {
    setElapsed((current) => current + 0.032);
  }, 32);

  const horizontalPadding = width >= 1200 ? 12 : 16;
  const contentWidth = width - horizontalPadding * 2;
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.665) : contentWidth;
  const graphHeight = isWide
    ? borner(Math.round(graphWidth * 0.62), 460, 660)
    : borner(Math.round(graphWidth * 0.78), 350, 520);
  const phaseGraphHeight = 168;
  const sideWidth = isWide ? contentWidth - graphWidth - 28 : contentWidth;

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
          <EnteteEcranSimulation titre="Ressort et loi de Hooke" domaine="physique" />
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
                minHeight: isWide ? graphHeight + phaseGraphHeight + 92 : undefined,
                paddingLeft: isWide ? 22 : 0,
                paddingRight: isWide ? 22 : 0,
                width: contentWidth,
              },
            ]}>
            <View style={[styles.graphColumn, { width: graphWidth }]}>
              <GraphiqueRessort
                amplitudeMeters={amplitudeMeters}
                elapsed={elapsed}
                graphHeight={graphHeight}
                graphWidth={graphWidth}
                mass={mass}
                physique={physique}
                springConstant={springConstant}
              />

              <View style={styles.phaseHeader}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.phaseLabel}>
                  Phase / mouvement harmonique
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.phaseSubLabel}>
                  Rotation synchronisee avec la position du ressort
                </TexteTheme>
              </View>

              <GraphiqueProjectionPhase
                elapsed={elapsed}
                graphHeight={phaseGraphHeight}
                graphWidth={graphWidth}
                physique={physique}
              />
            </View>

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="F = -k x, omega0 = sqrt(k / m)"
                  mathematiques={'F=-kx,\\quad \\omega_0=\\sqrt{k/m}'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique
                  label="Constante de ressort k"
                  max={20}
                  min={1}
                  onChange={setSpringConstant}
                  precision={1}
                  step={0.5}
                  unit="N/m"
                  value={springConstant}
                />
                <CurseurNumerique label="Masse m" max={5} min={0.2} onChange={setMass} precision={1} step={0.1} unit="kg" value={mass} />
                <CurseurNumerique
                  label="Amplitude"
                  max={100}
                  min={10}
                  onChange={setAmplitudePixels}
                  secondaryText={`${amplitudePixels.toFixed(0)} px visual`}
                  step={5}
                  value={amplitudePixels}
                  valueText={`${formaterNombre(amplitudeMeters, 2)} m`}
                />
                <CurseurNumerique label="Amortissement b" max={0.5} min={0} onChange={setDamping} precision={2} step={0.01} unit="kg/s" value={damping} />

                <View style={styles.buttonRow}>
                  <Pressable onPress={() => setIsPaused((current) => !current)} style={({ pressed, hovered }) => [
                    styles.actionButton,
                    isPaused ? styles.actionButtonActive : null,
                    pressed || hovered ? styles.actionButtonPressed : null,
                  ]}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.actionButtonText}>
                      {isPaused ? 'Reprendre' : 'Pause'}
                    </TexteTheme>
                  </Pressable>

                  <Pressable onPress={() => setElapsed(0)} style={({ pressed, hovered }) => [
                    styles.actionButton,
                    pressed || hovered ? styles.actionButtonPressed : null,
                  ]}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.actionButtonText}>
                      Relancer
                    </TexteTheme>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.statsGrid, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Deplacement actuel
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                      x = {formaterNombre(displacementMeters, 2)} m
                    </TexteTheme>
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Periode
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule
                      centered
                      fallback={`T = ${physique.period === null ? 'N/A' : `${formaterNombre(physique.period, 3)} s`}`}
                      mathematiques={`T=${physique.period === null ? '\\text{N/A}' : `${formaterNombreMath(physique.period, 3)}\\ \\text{s}`}`}
                      size="sm"
                    />
                  </View>
                  {!physique.isOscillating ? (
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.statSubtext}>
                      Systeme non oscillatoire
                    </TexteTheme>
                  ) : null}
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force de rappel
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <TexteTheme lightColor={themeActif.ink} style={styles.statValue}>
                      F = {formaterNombre(forceNewtons, 2)} N
                    </TexteTheme>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        <InfobulleDefinition
          body={[
            'La loi de Hooke dit que la force de rappel est proportionnelle au deplacement par rapport a l equilibre.',
            'Quand la masse traverse l equilibre, l energie est surtout cinetique. Aux extremites, elle est surtout potentielle.',
          ]}
          exampleLabel="Lecture"
          exampleText="Augmente k pour rendre le ressort plus raide, ou augmente m pour ralentir l oscillation."
          eyebrow="Mecanique"
          title="Ressort et oscillation"
        />
      </VueTheme>
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
  graphColumn: {
    gap: 0,
  },
  graphShell: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  phaseHeader: {
    gap: 3,
    paddingHorizontal: 4,
    paddingTop: 14,
    paddingBottom: 8,
  },
  phaseLabel: {
    color: themeActif.mutedInk,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  phaseSubLabel: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  phaseGraph: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
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
  panel: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 18,
    padding: 16,
    width: '100%',
  },
  sliderBlock: {
    gap: 12,
  },
  sliderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  sliderValueText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'right',
  },
  sliderValueGroup: {
    alignItems: 'flex-end',
    minWidth: 82,
  },
  sliderSecondaryText: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'right',
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
    height: '100%',
  },
  sliderThumb: {
    backgroundColor: themeActif.ink,
    borderColor: themeActif.ink,
    borderRadius: 10,
    height: 20,
    marginLeft: -10,
    position: 'absolute',
    width: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  actionButtonActive: {
    backgroundColor: themeActif.accent,
  },
  actionButtonPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  actionButtonText: {
    color: themeActif.ink,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 132,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  statFormulaWrap: {
    minHeight: 34,
    width: '100%',
  },
  statValue: {
    color: themeActif.ink,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  statSubtext: {
    color: themeActif.mutedInk,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});

