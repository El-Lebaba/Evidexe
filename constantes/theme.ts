import { Appearance, Platform } from 'react-native';

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
    background: '#121A17',
    surface: '#1B2621',
    panel: '#22312A',
    border: '#50685C',
    text: '#F2EFE6',
    ink: '#F2EFE6',
    muted: '#AEBCAF',
    soft: '#18231F',
    card: '#1B2621',
    cardDark: '#22312A',
    cardText: '#F2EFE6',
    blue: '#8CB8F0',
    green: '#83D9C8',
    yellow: '#E7BD59',
    orange: '#D39A6B',
    red: '#E18476',
    grid: '#607568',
    hero: '#121A17',
  },
} as const;

export type ThemeApplication = Record<keyof typeof themesApplication.light, string>;

export function obtenirThemeApplication(darkMode = false): ThemeApplication {
  return darkMode ? themesApplication.dark : themesApplication.light;
}

const themeSimulationCommunClair = {
  activeInk: '#000000',
  background: '#E9ECE4',
  border: '#243B53',
  grid: '#B7C7B0',
  gridSoft: 'rgba(167, 184, 158, 0.35)',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  pageBackground: '#EAE3D2',
  panel: '#DDE4D5',
  surface: '#F3F1E7',
};

const themeSimulationCommunSombre = {
  activeInk: '#000000',
  background: '#121A17',
  border: '#50685C',
  grid: '#607568',
  gridSoft: 'rgba(174, 188, 175, 0.18)',
  ink: '#F2EFE6',
  mutedInk: '#AEBCAF',
  pageBackground: '#121A17',
  panel: '#22312A',
  surface: '#1B2621',
};

export const themesSimulation = {
  light: {
    common: themeSimulationCommunClair,
    math: {
      selected: '#D8A94A',
      function: '#7CCFBF',
      secondary: '#7EA6E0',
      warning: '#D8A94A',
      point: '#D97B6C',
      neutral: '#AAB18E',
      fieldStrong: '#4E7FC4',
      fieldWeakGreen: '#7F9B63',
      fieldWeakBlue: '#78A0D4',
      softBlue: 'rgba(126, 166, 224, 0.34)',
      softGreen: 'rgba(124, 207, 191, 0.26)',
      softRed: 'rgba(217, 123, 108, 0.24)',
      softYellow: 'rgba(216, 169, 74, 0.2)',
      glowYellow: 'rgba(216, 169, 74, 0.28)',
      phasorCircle: 'rgba(36, 59, 83, 0.34)',
    },
    physics: {
      accent: '#D8A94A',
      primary: '#7CCFBF',
      primaryAlt: '#7DC9BE',
      primaryDeep: '#3F8D83',
      primaryStrong: '#2F7E8D',
      primaryMedium: '#3F8D83',
      primaryWeak: '#5FAFA7',
      red: '#D97B6C',
      yellow: '#D8A94A',
      yellowDeep: '#9A7432',
      softPrimary: 'rgba(124, 207, 191, 0.22)',
      softYellow: 'rgba(216, 169, 74, 0.2)',
      mediumA: 'rgba(124, 207, 191, 0.16)',
      mediumB: 'rgba(216, 169, 74, 0.15)',
    },
    programming: {
      accent: '#D8A94A',
      active: '#D8A94A',
      primary: '#7CCFBF',
      secondary: '#7EA6E0',
      danger: '#D97B6C',
      softActive: 'rgba(216, 169, 74, 0.2)',
      softPrimary: 'rgba(124, 207, 191, 0.26)',
      softDanger: 'rgba(217, 123, 108, 0.24)',
    },
  },
  dark: {
    common: themeSimulationCommunSombre,
    math: {
      selected: '#D8A94A',
      function: '#83D9C8',
      secondary: '#8CB8F0',
      warning: '#D8A94A',
      point: '#E18476',
      neutral: '#9FB19D',
      fieldStrong: '#8CB8F0',
      fieldWeakGreen: '#91B977',
      fieldWeakBlue: '#789DD3',
      softBlue: 'rgba(140, 184, 240, 0.26)',
      softGreen: 'rgba(131, 217, 200, 0.22)',
      softRed: 'rgba(225, 132, 118, 0.22)',
      softYellow: 'rgba(231, 189, 89, 0.18)',
      glowYellow: 'rgba(231, 189, 89, 0.24)',
      phasorCircle: 'rgba(242, 239, 230, 0.22)',
    },
    physics: {
      accent: '#D8A94A',
      primary: '#83D9C8',
      primaryAlt: '#83D9C8',
      primaryDeep: '#4EA194',
      primaryStrong: '#63A9C4',
      primaryMedium: '#5FB4A8',
      primaryWeak: '#88C9BE',
      red: '#E18476',
      yellow: '#D8A94A',
      yellowDeep: '#B48D3E',
      softPrimary: 'rgba(131, 217, 200, 0.18)',
      softYellow: 'rgba(231, 189, 89, 0.18)',
      mediumA: 'rgba(131, 217, 200, 0.14)',
      mediumB: 'rgba(231, 189, 89, 0.13)',
    },
    programming: {
      accent: '#E7BD59',
      active: '#E7BD59',
      primary: '#83D9C8',
      secondary: '#8CB8F0',
      danger: '#E18476',
      softActive: 'rgba(231, 189, 89, 0.18)',
      softPrimary: 'rgba(131, 217, 200, 0.22)',
      softDanger: 'rgba(225, 132, 118, 0.22)',
    },
  },
} as const;

export function obtenirThemeSimulation(darkMode = false) {
  return darkMode ? themesSimulation.dark : themesSimulation.light;
}

function creerThemesSimulationEcrans(theme: {
  common: Record<keyof typeof themesSimulation.light.common, string>;
  math: Record<keyof typeof themesSimulation.light.math, string>;
  programming: Record<keyof typeof themesSimulation.light.programming, string>;
  physics: Record<keyof typeof themesSimulation.light.physics, string>;
}) {
  const { common, math, physics, programming } = theme;

  return {
    infobulleDefinition: {
      border: common.grid,
      grid: common.grid,
      ink: common.ink,
      mutedInk: common.mutedInk,
      panel: common.panel,
      surface: common.surface,
    },
    champDePentes: {
      ...common,
      activeButton: math.selected,
      fieldStrong: math.fieldStrong,
      fieldWeak: math.fieldWeakGreen,
      point: math.point,
      solution: math.warning,
    },
    champVectoriel: {
      ...common,
      accent: math.warning,
      accentSoft: math.softYellow,
      activeButton: math.selected,
      fieldStrong: math.fieldStrong,
      fieldWeak: math.fieldWeakBlue,
      glow: math.glowYellow,
    },
    derivees: {
      ...common,
      derivative: math.secondary,
      function: math.function,
      point: math.point,
      tangent: math.warning,
    },
    fourier: {
      ...common,
      approximation: math.function,
      component1: math.secondary,
      component2: math.warning,
      component3: math.point,
      component4: math.neutral,
      component5: common.mutedInk,
      phasorCircle: math.phasorCircle,
    },
    integrales: {
      ...common,
      accent: math.point,
      approximation: math.softGreen,
      approximationNegative: math.softRed,
      approximationNegativeStroke: math.point,
      approximationStroke: math.secondary,
      bounds: math.warning,
      function: math.function,
    },
    limites: {
      ...common,
      function: math.function,
      hole: math.neutral,
      limit: math.warning,
      marker: math.point,
    },
    serieTaylor: {
      ...common,
      activeApproximation: math.warning,
      approximation: math.softBlue,
      function: math.function,
      point: math.point,
    },
    series: {
      accent: math.warning,
      accentDoux: math.softYellow,
      arrierePlan: common.background,
      bordure: common.border,
      courbe: math.function,
      courbeDouce: math.softGreen,
      grille: common.grid,
      grilleDouce: common.gridSoft,
      encre: common.ink,
      limite: math.secondary,
      encreAttenue: common.mutedInk,
      negatif: math.point,
      panneau: common.panel,
      surface: common.surface,
    },
    champsElectriques: {
      ...common,
      accent: physics.accent,
      champFaible: physics.primaryWeak,
      champFort: physics.primaryStrong,
      champMoyen: physics.primaryMedium,
      chargeNegative: physics.primaryDeep,
      chargePositive: physics.red,
    },
    champsMagnetiques: {
      ...common,
      accent: physics.accent,
      champ: physics.primary,
      champFaible: physics.primaryWeak,
      champFort: physics.primaryStrong,
      champMoyen: physics.primaryMedium,
      courantEntrant: physics.red,
      courantSortant: physics.primary,
    },
    frottement: {
      ...common,
      accent: physics.accent,
      applied: physics.primary,
      block: physics.yellow,
      blockDeep: physics.yellowDeep,
      friction: physics.red,
      ground: common.grid,
    },
    gravite: {
      ...common,
      accent: physics.accent,
      bodyA: physics.primary,
      bodyADeep: physics.primaryDeep,
      bodyASoft: physics.softPrimary,
      bodyB: physics.yellow,
      bodyBDeep: physics.yellowDeep,
      bodyBSoft: physics.softYellow,
      field: physics.primaryAlt,
      pull: physics.red,
    },
    mecaniqueOrbitale: {
      ...common,
      accent: physics.accent,
      orbit: physics.primary,
      planet: physics.primary,
      planetDeep: physics.primaryDeep,
      star: physics.yellow,
      starDeep: physics.yellowDeep,
      sweep: physics.red,
    },
    mouvementCirculaire: {
      ...common,
      accent: physics.accent,
      force: physics.red,
      object: physics.primary,
      objectDeep: physics.primaryDeep,
      orbit: physics.primaryAlt,
      velocity: physics.primary,
    },
    mouvementProjectile: {
      ...common,
      accent: physics.accent,
      projectile: physics.yellow,
      projectileDeep: physics.yellowDeep,
      trajectory: physics.primary,
      velocityX: physics.primary,
      velocityY: physics.red,
    },
    optiqueRefraction: {
      ...common,
      accent: physics.accent,
      incident: physics.yellow,
      mediumA: physics.mediumA,
      mediumB: physics.mediumB,
      refracted: physics.primary,
      reflected: physics.red,
    },
    pendule: {
      ...common,
      accent: physics.accent,
      bob: physics.primary,
      bobDeep: physics.primaryDeep,
      kinetic: physics.primary,
      potential: physics.yellow,
      pull: physics.red,
      trail: physics.primaryAlt,
    },
    ressortLoiHooke: {
      ...common,
      accent: physics.accent,
      kinetic: physics.primary,
      mass: physics.primary,
      massDeep: physics.primaryDeep,
      potential: physics.yellow,
      spring: physics.primaryAlt,
    },
    programmationJava: {
      ...common,
      accent: programming.accent,
      approximation: programming.softPrimary,
      approximationNegative: programming.softDanger,
      approximationNegativeStroke: programming.danger,
      background: common.pageBackground,
      approximationStroke: programming.secondary,
      activeButton: programming.active,
      boundsSoft: programming.softActive,
      bounds: programming.active,
      function: programming.primary,
    },
  };
}

export const themesSimulationEcrans = {
  light: creerThemesSimulationEcrans(themesSimulation.light),
  dark: creerThemesSimulationEcrans(themesSimulation.dark),
} as const;

export function obtenirThemesSimulationEcrans(darkMode = false) {
  return darkMode ? themesSimulationEcrans.dark : themesSimulationEcrans.light;
}

export function obtenirThemesSimulationEcransInitial() {
  return obtenirThemesSimulationEcrans(Appearance.getColorScheme() === 'dark');
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
