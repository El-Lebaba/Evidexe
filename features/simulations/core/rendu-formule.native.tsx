import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { TexteTheme } from '@/components/texte-theme';
import { formaterFormulePourAffichage } from '@/features/simulations/core/formater-formule';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type ProprietesRenduFormule = {
  fallback: string;
  mathematiques: string;
  centered?: boolean;
  darkColor?: string;
  lightColor?: string;
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

const WEBVIEW_HEIGHT = {
  sm: 38,
  md: 48,
  lg: 54,
  xl: 72,
  xxl: 88,
} as const;

function creerDocumentMathJax(formule: string, couleur: string) {
  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <script>
      window.MathJax = {
        tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] },
        svg: { fontCache: 'none' },
        startup: { typeset: false }
      };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
    <style>
      html, body {
        align-items: center;
        background: rgba(0, 0, 0, 0);
        color: ${couleur};
        display: flex;
        height: 100%;
        justify-content: center;
        margin: 0;
        overflow: hidden;
        padding: 0;
        width: 100%;
      }

      #formula {
        color: ${couleur};
        font-size: 18px;
        font-weight: 700;
        max-width: 100%;
        text-align: center;
      }

      mjx-container,
      mjx-container svg {
        color: ${couleur} !important;
      }

      mjx-container svg path,
      mjx-container svg use {
        fill: ${couleur} !important;
        stroke: ${couleur} !important;
      }
    </style>
  </head>
  <body>
    <div id="formula"></div>
    <script>
      document.getElementById('formula').textContent = '$' + ${JSON.stringify(formule)} + '$';
      MathJax.startup.promise.then(function () { MathJax.typesetPromise(); });
    </script>
  </body>
</html>`;
}

function ComposantRenduFormule({
  fallback,
  mathematiques,
  centered = false,
  darkColor = '#FFFFFF',
  lightColor = '#243B53',
  mathViewMobile = false,
  size = 'md',
}: ProprietesRenduFormule) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const couleurFormule = modeSombre ? darkColor : lightColor;
  const displayFormula = useMemo(() => formaterFormulePourAffichage(fallback), [fallback]);
  const documentMathJax = useMemo(
    () => creerDocumentMathJax(mathematiques || fallback, couleurFormule),
    [couleurFormule, fallback, mathematiques]
  );
  const texteFallback = (
    <TexteTheme
      darkColor={darkColor}
      lightColor={lightColor}
      style={[
        styles.fallback,
        centered ? styles.centered : undefined,
        { color: couleurFormule },
        { fontSize: FONT_SIZE[size], lineHeight: FONT_SIZE[size] + 6 },
      ]}>
      {displayFormula}
    </TexteTheme>
  );

  return (
    <View style={[styles.wrap, centered ? styles.centered : undefined]}>
      {mathViewMobile ? (
        <WebView
          androidLayerType="software"
          containerStyle={styles.mathViewContainer}
          javaScriptEnabled
          opaque={false}
          originWhitelist={['*']}
          scrollEnabled={false}
          source={{ html: documentMathJax }}
          style={[styles.mathView, { height: WEBVIEW_HEIGHT[size] }]}
        />
      ) : (
        texteFallback
      )}
    </View>
  );
}

export const RenduFormule = memo(ComposantRenduFormule);

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    minHeight: 32,
    width: '100%',
  },
  centered: {
    alignItems: 'center',
    textAlign: 'center',
  },
  fallback: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  mathView: {
    backgroundColor: 'transparent',
    minHeight: 48,
    width: '100%',
  },
  mathViewContainer: {
    backgroundColor: 'transparent',
    width: '100%',
  },
});
