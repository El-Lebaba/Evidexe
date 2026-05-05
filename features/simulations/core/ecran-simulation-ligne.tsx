import { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type LineSimulationScreenProps = {
  title: string;
  type: string;
};

const themeBase = obtenirThemeApplication(false);

export function EcranSimulationLigne({ title, type}: LineSimulationScreenProps) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const scrollY = useRef(new Animated.Value(0)).current;
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <VueTheme lightColor={themeActif.background} darkColor={themeActif.background} style={[styles.container, { backgroundColor: themeActif.background }]}>
        <Animated.View
          style={[
            styles.headerOverlay,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}>
          <EnteteEcranSimulation title={title} type={type} />
        </Animated.View>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <VueTheme lightColor={themeActif.background} darkColor={themeActif.background} style={styles.content}>
            <TexteTheme lightColor={themeActif.text} darkColor={themeActif.text} style={{ color: themeActif.text }} type="title">{title}</TexteTheme>
          </VueTheme>
        </Animated.ScrollView>
      </VueTheme>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: themeBase.background,
    flex: 1,
  },
  container: {
    backgroundColor: themeBase.background,
    flex: 1,
  },
  headerOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
  },
  content: {
    flex: 1,
    gap: 24,
    minHeight: 600,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
