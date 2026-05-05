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
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

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
const CENTIMETERS_PER_METER = 100;
const themeActif = {
  accent: '#D8A94A',
  background: '#E9ECE4',
  border: '#243B53',
  force: '#D97B6C',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  object: '#7CCFBF',
  objectDeep: '#3F8D83',
  orbit: '#7DC9BE',
  panel: '#DDE4D5',
  surface: '#F3F1E7',
  velocity: '#7CCFBF',
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

function cheminPointeFleche(tipX: number, tipY: number, directionX: number, directionY: number) {
  const length = Math.sqrt(directionX * directionX + directionY * directionY) || 1;
  const ux = directionX / length;
  const uy = directionY / length;
  const px = -uy;
  const py = ux;
  const size = 8;

  const leftX = tipX - ux * size + px * size * 0.55;
  const leftY = tipY - uy * size + py * size * 0.55;
  const rightX = tipX - ux * size - px * size * 0.55;
  const rightY = tipY - uy * size - py * size * 0.55;

  return `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${leftX.toFixed(2)} ${leftY.toFixed(2)} L ${rightX.toFixed(2)} ${rightY.toFixed(2)} Z`;
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

function GraphiqueMouvementCirculaire({
  elapsed,
  graphHeight,
  graphWidth,
  omega,
  radiusCm,
}: {
  elapsed: number;
  graphHeight: number;
  graphWidth: number;
  omega: number;
  radiusCm: number;
}) {
  const centerX = graphWidth / 2;
  const centerY = graphHeight / 2;
  const maxOrbitRadius = Math.min(graphWidth, graphHeight) * 0.35;
  const orbitRadius = borner((radiusCm / 120) * maxOrbitRadius, 38, maxOrbitRadius);
  const theta = omega * elapsed;
  const px = centerX + orbitRadius * Math.cos(theta);
  const py = centerY + orbitRadius * Math.sin(theta);
  const tangentX = -Math.sin(theta);
  const tangentY = Math.cos(theta);
  const inwardX = centerX - px;
  const inwardY = centerY - py;
  const inwardLength = Math.sqrt(inwardX * inwardX + inwardY * inwardY) || 1;
  const velocityLength = borner(omega * 18, 20, 92);
  const forceLength = borner(30 + omega * 5, 28, 74);
  const velocityTipX = px + tangentX * velocityLength;
  const velocityTipY = py + tangentY * velocityLength;
  const forceTipX = px + (inwardX / inwardLength) * forceLength;
  const forceTipY = py + (inwardY / inwardLength) * forceLength;
  const horizontalGrid = useMemo(
    () => Array.from({ length: 7 }, (_, index) => 32 + index * ((graphHeight - 64) / 6)),
    [graphHeight]
  );

  return (
    <View style={styles.graph}>
      <Svg height={graphHeight} width={graphWidth}>
        <Rect fill={themeActif.panel} height={graphHeight} rx={8} width={graphWidth} x={0} y={0} />
        {horizontalGrid.map((y) => (
          <Line key={`grid-${y}`} stroke={themeActif.gridSoft} strokeWidth={1} x1={0} x2={graphWidth} y1={y} y2={y} />
        ))}

        <Circle
          cx={centerX}
          cy={centerY}
          fill="none"
          r={orbitRadius}
          stroke={themeActif.border}
          strokeDasharray="6 6"
          strokeOpacity={0.55}
          strokeWidth={1.5}
        />
        <Circle cx={centerX} cy={centerY} fill={themeActif.accent} r={6} stroke={themeActif.border} strokeWidth={1} />

        <Line stroke={themeActif.orbit} strokeOpacity={0.72} strokeWidth={2} x1={centerX} x2={px} y1={centerY} y2={py} />

        <Line stroke={themeActif.force} strokeLinecap="round" strokeWidth={3} x1={px} x2={forceTipX} y1={py} y2={forceTipY} />
        <Path d={cheminPointeFleche(forceTipX, forceTipY, forceTipX - px, forceTipY - py)} fill={themeActif.force} />

        <Line stroke={themeActif.velocity} strokeLinecap="round" strokeWidth={3} x1={px} x2={velocityTipX} y1={py} y2={velocityTipY} />
        <Path d={cheminPointeFleche(velocityTipX, velocityTipY, velocityTipX - px, velocityTipY - py)} fill={themeActif.velocity} />

        <Circle cx={px} cy={py} fill={themeActif.object} r={11} stroke={themeActif.border} strokeWidth={1.5} />

      </Svg>
      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.force }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            Fc centripete
          </TexteTheme>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: themeActif.velocity }]} />
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.legendText}>
            v tangentielle
          </TexteTheme>
        </View>
      </View>
    </View>
  );
}

export function SimulationMouvementCirculaire() {
  const isFocused = useIsFocused();
  const [omega, setOmega] = useState(2);
  const [radiusCm, setRadiusCm] = useState(80);
  const [mass, setMass] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const radiusMeters = radiusCm / CENTIMETERS_PER_METER;
  const velocity = omega * radiusMeters;
  const centripetalForce = mass * omega * omega * radiusMeters;
  const centripetalAcceleration = omega * omega * radiusMeters;
  const period = omega > 0 ? (2 * Math.PI) / omega : null;

  useEffect(() => {
    setElapsed(0);
  }, [omega, radiusCm]);

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
          <EnteteEcranSimulation titre="Mouvement circulaire" domaine="physique" />
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
            <GraphiqueMouvementCirculaire
              elapsed={elapsed}
              graphHeight={graphHeight}
              graphWidth={graphWidth}
              omega={omega}
              radiusCm={radiusCm}
            />

            <View style={[styles.sidebar, { paddingRight: isWide ? 44 : 0, width: sideWidth }]}>
              <View style={styles.formulaCard}>
                <RenduFormule
                  centered
                  fallback="Fc = m omega^2 r, v = omega r"
                  mathematiques={'F_c=m\\omega^2r,\\quad v=\\omega r'}
                  size="md"
                />
              </View>

              <View style={styles.panel}>
                <CurseurNumerique
                  label="Vitesse angulaire"
                  max={6}
                  min={0.5}
                  onChange={setOmega}
                  precision={1}
                  step={0.1}
                  unit="rad/s"
                  value={omega}
                />
                <CurseurNumerique label="Rayon" max={120} min={30} onChange={setRadiusCm} step={5} unit="cm" value={radiusCm} />
                <CurseurNumerique label="Masse" max={5} min={0.1} onChange={setMass} precision={1} step={0.1} unit="kg" value={mass} />

                <Pressable onPress={() => setIsPaused((current) => !current)} style={({ pressed, hovered }) => [
                  styles.actionButton,
                  isPaused ? styles.actionButtonActive : null,
                  pressed || hovered ? styles.actionButtonPressed : null,
                ]}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.actionButtonText}>
                    {isPaused ? 'Reprendre' : 'Pause'}
                  </TexteTheme>
                </Pressable>
              </View>

              <View style={[styles.statsGrid, isCompact ? styles.statsGridCompact : null]}>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Force centripete
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule
                      fallback={`Fc = ${formaterNombre(centripetalForce, 2)} N`}
                      mathematiques={`F_c=${formaterNombreMath(centripetalForce, 2)}\\ \\text{N}`}
                      size="sm"
                    />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Vitesse
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule
                      fallback={`v = ${formaterNombre(velocity, 2)} m/s`}
                      mathematiques={`v=${formaterNombreMath(velocity, 2)}\\ \\text{m/s}`}
                      size="sm"
                    />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Periode
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule
                      fallback={`T = ${period === null ? 'N/A' : `${formaterNombre(period, 2)} s`}`}
                      mathematiques={`T=${period === null ? '\\text{N/A}' : `${formaterNombreMath(period, 2)}\\ \\text{s}`}`}
                      size="sm"
                    />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.statLabel}>
                    Acceleration
                  </TexteTheme>
                  <View style={styles.statFormulaWrap}>
                    <RenduFormule
                      fallback={`ac = ${formaterNombre(centripetalAcceleration, 2)} m/s2`}
                      mathematiques={`a_c=${formaterNombreMath(centripetalAcceleration, 2)}\\ \\text{m/s}^2`}
                      size="sm"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        <InfobulleDefinition
          body={[
            'Dans un mouvement circulaire uniforme, la vitesse est tangentielle a la trajectoire.',
            'La force centripete pointe toujours vers le centre et change la direction de la vitesse.',
          ]}
          exampleLabel="Lecture rapide"
          exampleText="Augmente omega ou le rayon pour augmenter la vitesse et la force centripete."
          eyebrow="Mecanique"
          title="Pourquoi une force vers le centre ?"
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
    maxWidth: 230,
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsGridCompact: {
    flexDirection: 'column',
  },
  statCard: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minHeight: 88,
    width: '48%',
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
    minHeight: 38,
    width: '100%',
  },
});

