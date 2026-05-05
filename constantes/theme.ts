import { Platform } from 'react-native';

const couleurTeinteClaire = '#BC8559';
const couleurTeinteSombre = '#E8E0C9';

export const Couleurs = {
  light: {
    text: '#19191F',
    background: '#F5F1E6',
    tint: couleurTeinteClaire,
    icon: '#728070',
    tabIconDefault: '#728070',
    tabIconSelected: couleurTeinteClaire,
  },
  dark: {
    text: '#F3F0E6',
    background: '#1B2420',
    tint: '#E0B146',
    icon: '#B7C5B8',
    tabIconDefault: '#B7C5B8',
    tabIconSelected: '#E0B146',
  },
};

export const themesApplication = {
  light: {
    name: 'Evodex Light',
    background: '#E9ECE4',
    surface: '#F3F1E7',
    panel: '#DDE4D5',
    border: '#243B53',
    text: '#243B53',
    ink: '#243B53',
    muted: '#6E7F73',
    soft: '#F3F1E7',
    card: '#F3F1E7',
    cardDark: '#DDE4D5',
    cardText: '#243B53',
    blue: '#7EA6E0',
    green: '#7CCFBF',
    yellow: '#D8A94A',
    orange: '#BC8559',
    red: '#D97B6C',
    grid: '#B7C7B0',
    hero: '#243B53',
  },
  dark: {
    name: 'Evodex Dark',
    background: '#1B2420',
    surface: '#243029',
    panel: '#F3F0E6',
    border: '#91A48E',
    text: '#F3F0E6',
    ink: '#1E344D',
    muted: '#B7C5B8',
    soft: '#243029',
    card: '#F3F0E6',
    cardDark: '#2C3A33',
    cardText: '#1E344D',
    blue: '#7CA6E6',
    green: '#78CDBB',
    yellow: '#E0B146',
    orange: '#C4895B',
    red: '#D97B6C',
    grid: '#91A48E',
    hero: '#1B2420',
  },
} as const;

export type ThemeApplication = Record<keyof typeof themesApplication.light, string>;

export function obtenirThemeApplication(darkMode = false): ThemeApplication {
  return darkMode ? themesApplication.dark : themesApplication.light;
}

export const Polices = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
