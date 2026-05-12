/**
 * Logo Evidexe réutilisable.
 *
 * Centraliser le logo évite de répéter le même `require` et les mêmes réglages
 * d'image dans chaque écran.
 */
import { Image, type ImageProps } from 'react-native';

import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

const logoFonce = require('@/assets/images/evidexe-logo-fonce.png');
const logoClair = require('@/assets/images/evidexe-logo-clair.png');

export function LogoEvidexe(props: Omit<ImageProps, 'source'>) {
  const schemaCouleur = useSchemaCouleur();
  const sourceLogo = schemaCouleur === 'dark' ? logoClair : logoFonce;

  return <Image {...props} source={sourceLogo} />;
}
