import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import { formaterFormulePourAffichage } from '@/features/simulations/core/formater-formule';

type ProprietesRenduFormule = {
  fallback: string;
  mathematiques: string;
  centered?: boolean;
  mathViewMobile?: boolean;
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
  size = 'md',
}: ProprietesRenduFormule) {
  const displayFormula = useMemo(() => formaterFormulePourAffichage(fallback), [fallback]);

  return (
    <TexteTheme
      lightColor="#000000"
      style={[
        styles.fallback,
        centered ? styles.centered : undefined,
        { fontSize: FONT_SIZE[size], lineHeight: FONT_SIZE[size] + 6 },
      ]}>
      {displayFormula}
    </TexteTheme>
  );
}

export const RenduFormule = memo(ComposantRenduFormule);

const styles = StyleSheet.create({
  fallback: {
    color: '#000000',
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  centered: {
    textAlign: 'center',
    width: '100%',
  },
});
