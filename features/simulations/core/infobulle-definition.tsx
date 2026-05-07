import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemesSimulationEcrans, obtenirThemesSimulationEcransInitial } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type DefinitionPopoverProps = {
  body: string[];
  exampleLabel: string;
  exampleText: string;
  eyebrow: string;
  title: string;
  delayMs?: number;
};

let themeActif = obtenirThemesSimulationEcransInitial().infobulleDefinition;

export function InfobulleDefinition({
  body,
  exampleLabel,
  exampleText,
  eyebrow,
  title,
  delayMs = 5000,
}: DefinitionPopoverProps) {
  const modeSombre = useSchemaCouleur() === 'dark';
  themeActif = obtenirThemesSimulationEcrans(modeSombre).infobulleDefinition;
  styles = creerStyles();
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const { width } = useWindowDimensions();

  const progress = useRef(new Animated.Value(0)).current;
  const fabEntrance = useRef(new Animated.Value(0)).current;
  const fabShake = useRef(new Animated.Value(0)).current;

  const sheetWidth = Math.min(width - 24, 360);
  const sheetHeight = 360;
  const fabSize = 58;

  useEffect(() => {
    Animated.timing(progress, {
      duration: visible ? 260 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [progress, visible]);

  useEffect(() => {
    if (!isFocused || hintDismissed) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setFabVisible(true);
      Animated.timing(fabEntrance, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [delayMs, fabEntrance, hintDismissed, isFocused]);

  useEffect(() => {
    if (!isFocused || !fabVisible || hintDismissed || visible) {
      fabShake.stopAnimation();
      fabShake.setValue(0);
      return;
    }

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabShake, {
          duration: 70,
          easing: Easing.inOut(Easing.ease),
          toValue: -1,
          useNativeDriver: true,
        }),
        Animated.timing(fabShake, {
          duration: 70,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(fabShake, {
          duration: 70,
          easing: Easing.inOut(Easing.ease),
          toValue: -0.75,
          useNativeDriver: true,
        }),
        Animated.timing(fabShake, {
          duration: 70,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.75,
          useNativeDriver: true,
        }),
        Animated.timing(fabShake, {
          duration: 90,
          easing: Easing.out(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ])
    );

    shakeLoop.start();

    return () => {
      shakeLoop.stop();
      fabShake.setValue(0);
    };
  }, [fabShake, fabVisible, hintDismissed, isFocused, visible]);

  const openDefinition = () => {
    setHintDismissed(true);
    setVisible(true);
  };

  const backdropStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const sheetStyle = {
    opacity: progress,
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
    ],
  };

  const animatedFabStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [sheetWidth - fabSize - 18, 18],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [sheetHeight - fabSize - 26, 18],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.92],
        }),
      },
    ],
  };

  const fabPromptStyle = {
    opacity: fabEntrance,
    transform: [
      {
        translateX: fabEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [72, 0],
        }),
      },
      {
        translateY: fabShake.interpolate({
          inputRange: [-1, 1],
          outputRange: [-1.5, 1.5],
        }),
      },
      {
        rotate: fabShake.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-5deg', '5deg'],
        }),
      },
    ],
  };

  return (
    <>
      {fabVisible && !visible ? (
        <Animated.View style={[styles.fabWrap, fabPromptStyle]}>
          <Pressable onPress={openDefinition} style={styles.fab}>
            <TexteTheme lightColor={themeActif.ink} style={styles.fabText}>
              ?
            </TexteTheme>
          </Pressable>
        </Animated.View>
      ) : null}

      <Modal animationType="none" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable onPress={() => setVisible(false)} style={styles.backdropTap} />
          <Animated.View style={[styles.sheetWrap, { width: sheetWidth }, sheetStyle]}>
            <VueTheme lightColor={themeActif.panel} style={styles.sheet}>
              <Animated.View style={[styles.fabInSheet, animatedFabStyle]}>
                <Pressable onPress={() => setVisible(false)} style={styles.fabInner}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.fabText}>
                    ?
                  </TexteTheme>
                </Pressable>
              </Animated.View>

              <TexteTheme lightColor={themeActif.mutedInk} style={styles.eyebrow}>
                {eyebrow}
              </TexteTheme>
              <TexteTheme lightColor={themeActif.ink} style={styles.sheetTitle}>
                {title}
              </TexteTheme>

              {body.map((paragraph) => (
                <TexteTheme key={paragraph} lightColor={themeActif.ink} style={styles.body}>
                  {paragraph}
                </TexteTheme>
              ))}

              <View style={styles.example}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.exampleLabel}>
                  {exampleLabel}
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.exampleText}>
                  {exampleText}
                </TexteTheme>
              </View>
            </VueTheme>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
  fabWrap: {
    bottom: 20,
    position: 'absolute',
    right: 20,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 4,
    height: 58,
    justifyContent: 'center',
    shadowColor: themeActif.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    width: 58,
  },
  fabText: {
    color: themeActif.ink,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  backdrop: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(36, 59, 83, 0.18)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 92,
    paddingHorizontal: 16,
  },
  backdropTap: {
    flex: 1,
    width: '100%',
  },
  sheetWrap: {
    alignSelf: 'flex-end',
  },
  sheet: {
    backgroundColor: themeActif.panel,
    borderColor: themeActif.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    minHeight: 360,
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 74,
    width: '100%',
  },
  fabInSheet: {
    height: 58,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 58,
    zIndex: 2,
  },
  fabInner: {
    alignItems: 'center',
    backgroundColor: themeActif.surface,
    borderColor: themeActif.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  eyebrow: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    color: themeActif.ink,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  body: {
    color: themeActif.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  example: {
    backgroundColor: themeActif.surface,
    borderColor: themeActif.grid,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  exampleLabel: {
    color: themeActif.mutedInk,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  exampleText: {
    color: themeActif.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  });
}
