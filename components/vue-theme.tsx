/**
 * Vue qui suit le thème.
 *
 * Elle applique une couleur de fond selon le thème actif, avec possibilité de
 * forcer une couleur claire ou sombre.
 */
import { View, type ViewProps } from 'react-native';

import { useCouleurTheme } from '@/hooks/use-couleur-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function VueTheme({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useCouleurTheme({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
