import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type PercentString = `${number}%`;

type ProprietesSymbolesMathematiquesFlottants = {
  isActive?: boolean;
  showGlow?: boolean;
  style?: StyleProp<ViewStyle>;
};

const palette = obtenirThemeApplication(false);

const reserveSymboles = [
  '+',
  '-',
  '=',
  'x',
  'y',
  '∰',
  '%',
  '∭',
  '∮',
  'Σ',
  '∋',
  '⊾',
  '∞',
  'π',
  '∛',
  '∜',
  '≋',
  '>',
  '<',
  '1/2',
];

const nombreSymboles = 26;

function versPourcentage(value: number): PercentString {
  return `${value}%`;
}

function creerGraineSymbole(index: number) {
  const bandeHorizontale = (index * 37) % 84;
  const bandeVerticale = (index * 19) % 72;

  return {
    delay: (index * 140) % 1800,
    driftX: -20 + ((index * 11) % 40),
    driftY: -26 - ((index * 13) % 34),
    duration: 3600 + ((index * 233) % 2600),
    left: versPourcentage(8 + bandeHorizontale),
    rotate: -8 + ((index * 5) % 16),
    size: 16 + ((index * 7) % 18),
    symbol: reserveSymboles[index % reserveSymboles.length],
    top: versPourcentage(10 + bandeVerticale),
  };
}

export function SymbolesMathematiquesFlottants({ isActive = true, showGlow = true, style }: ProprietesSymbolesMathematiquesFlottants) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const glowColor = modeSombre ? 'rgba(145, 164, 142, 0.22)' : 'rgba(184, 199, 177, 0.42)';
  const symbolColor = modeSombre ? themeActif.muted : '#19191F';
  const grainesSymboles = useMemo(
    () => Array.from({ length: nombreSymboles }, (_, index) => creerGraineSymbole(index)),
    []
  );
  const valeursFlottement = useRef(grainesSymboles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isActive) {
      valeursFlottement.forEach((value) => value.stopAnimation());
      return;
    }

    const animationsFlottement = valeursFlottement.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(grainesSymboles[index].delay),
          Animated.timing(value, {
            duration: grainesSymboles[index].duration,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            duration: 0,
            toValue: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animationsFlottement.forEach((animation) => animation.start());

    return () => {
      animationsFlottement.forEach((animation) => animation.stop());
    };
  }, [valeursFlottement, isActive, grainesSymboles]);

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { backgroundColor: themeActif.background }, style]}>
      {showGlow ? <View style={[styles.glow, { backgroundColor: glowColor }]} /> : null}

      {grainesSymboles.map((item, index) => {
        const valeurAnimee = valeursFlottement[index];

        return (
          <Animated.Text
            key={`${item.symbol}-${index}`}
            style={[
              styles.mathSymbol,
              {
                color: symbolColor,
                fontSize: item.size,
                left: item.left,
                opacity: valeurAnimee.interpolate({
                  inputRange: [0, 0.18, 0.75, 1],
                  outputRange: [0, 0.18, 0.22, 0],
                }),
                top: item.top,
                transform: [
                  {
                    translateX: valeurAnimee.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, item.driftX, item.driftX / 2],
                    }),
                  },
                  {
                    translateY: valeurAnimee.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [16, item.driftY, item.driftY - 16],
                    }),
                  },
                  {
                    rotate: valeurAnimee.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['0deg', `${item.rotate}deg`, '0deg'],
                    }),
                  },
                ],
              },
            ]}>
            {item.symbol}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.background,
    overflow: 'hidden',
  },
  glow: {
    backgroundColor: 'rgba(184, 199, 177, 0.42)',
    borderRadius: 220,
    height: 440,
    left: '50%',
    marginLeft: -220,
    marginTop: -220,
    position: 'absolute',
    top: '50%',
    width: 440,
  },
  mathSymbol: {
    color: palette.text,
    fontWeight: '700',
    position: 'absolute',
  },
});
