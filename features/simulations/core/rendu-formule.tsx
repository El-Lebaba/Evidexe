/**
 * Rendu de secours pour les formules.
 *
 * Ce fichier est utilisé quand la plateforme ne prend pas la version web ou
 * native spécialisée. Il affiche une formule simplifiée en texte monospace.
 */
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import { formaterFormulePourAffichage } from '@/features/simulations/core/formater-formule';

type ProprietesRenduFormule = {
  fallback: string;
  mathematiques: string;
  centered?: boolean;
  darkColor?: string;
  lightColor?: string;
  mathViewMobile?: boolean;
  numberOfLines?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
};

const FONT_SIZE = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 36,
  xxl: 44,
} as const;

function ComposantRenduFormule({
  fallback,
  centered = false,
  darkColor = '#FFFFFF',
  lightColor = '#000000',
  numberOfLines,
  size = 'md',
}: ProprietesRenduFormule) {
  const displayFormula = useMemo(() => formaterFormulePourAffichage(fallback), [fallback]);

  return (
    <TexteTheme
      darkColor={darkColor}
      lightColor={lightColor}
      style={[
        styles.fallback,
        centered ? styles.centered : undefined,
        { fontSize: FONT_SIZE[size], lineHeight: FONT_SIZE[size] + 6 },
      ]}
      numberOfLines={numberOfLines}>
      {displayFormula}
    </TexteTheme>
  );
}

export const RenduFormule = memo(ComposantRenduFormule);

const styles = StyleSheet.create({
  fallback: {
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  centered: {
    textAlign: 'center',
    width: '100%',
  },
});
