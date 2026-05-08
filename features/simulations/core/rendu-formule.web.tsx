import katex from 'katex';
import { memo, useEffect, useMemo } from 'react';

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

function ComposantRenduFormule({
  fallback,
  mathematiques,
  centered = false,
  darkColor = '#FFFFFF',
  lightColor = '#243B53',
}: ProprietesRenduFormule) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const couleurFormule = modeSombre ? darkColor : lightColor;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const stylesheetId = 'katex-cdn-stylesheet';
    if (document.getElementById(stylesheetId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = stylesheetId;
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.css';
    document.head.appendChild(link);
  }, []);

  const markup = useMemo(
    () =>
      katex.renderToString(mathematiques || fallback, {
        displayMode: false,
        output: 'html',
        throwOnError: false,
      }),
    [fallback, mathematiques]
  );

  return (
    <div
      style={{
        alignItems: centered ? 'center' : 'flex-start',
        color: couleurFormule,
        display: 'flex',
        minHeight: 28,
        justifyContent: centered ? 'center' : 'flex-start',
        width: '100%',
      }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

export const RenduFormule = memo(ComposantRenduFormule);
