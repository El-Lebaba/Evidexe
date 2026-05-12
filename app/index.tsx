/**
 * Écran d'introduction.
 *
 * Il sert de transition vers l'accueil: logo, ambiance visuelle et animation
 * de départ. La logique importante est surtout l'animation qui évite de lancer
 * deux navigations si l'utilisateur appuie plusieurs fois.
 */
import { Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoEvidexe } from '@/components/logo-evidexe';
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';

const palette = {
  charcoal: '#19191F',
  copper: '#BC8559',
  cream: '#EEF5ED',
  sage: '#B8C7B1',
  slate: '#536165',
};

export default function IntroScreen() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.92)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const curtainTranslateY = useRef(new Animated.Value(-1200)).current;
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const animationtiming = 1150;
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            duration: animationtiming,
            easing: Easing.inOut(Easing.ease),
            toValue: 1.06,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            duration: animationtiming,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            duration: animationtiming,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            duration: animationtiming,
            easing: Easing.inOut(Easing.ease),
            toValue: 0.92,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    heartbeat.start();

    return () => {
      heartbeat.stop();
    };
  }, [opacity, scale]);

  const handleStart = () => {
    if (isLeaving) {
      return;
    }
    setIsLeaving(true);
    const animationtiming = 900;
    Animated.parallel([
      Animated.timing(screenTranslateY, {
        duration: animationtiming,
        easing: Easing.inOut(Easing.cubic),
        toValue: -120,
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        duration: animationtiming,
        easing: Easing.inOut(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(curtainTranslateY, {
        duration: animationtiming,
        easing: Easing.inOut(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/(tabs)/accueil' as Href);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stage}>
        <Animated.View style={[
            styles.container,
            {
              opacity: screenOpacity,
              transform: [{ translateY: screenTranslateY }],
            },
          ]}>
          <SymbolesMathematiquesFlottants/>
          <Pressable onPress={handleStart} style={styles.pressable}>
            <Animated.View
              style={[
                styles.logoShell,
                {
                  opacity,
                  transform: [{ scale }],
                },
              ]}>
              <LogoEvidexe
                resizeMode="contain"
                style={styles.logo}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.curtain,
            styles.noPointerEvents,
            {
              transform: [{ translateY: curtainTranslateY }],
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.cream,
    flex: 1,
  },
  stage: {
    backgroundColor: palette.cream,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: palette.cream,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 390,
    width: '100%',
  },
  logoShell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    height: 190,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    width: '100%',
  },
  logo: {
    height: 138,
    width: '100%',
  },
  curtain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.cream,
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
});

