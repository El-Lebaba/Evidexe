/**
 * Ancien contenu simple de section.
 *
 * Ces valeurs restent utiles si une route doit afficher une page générique,
 * mais les sections principales utilisent maintenant des écrans plus complets.
 */
export type CleSection = 'home' | 'mathematiques' | 'physique' | 'programmation-java';

export type SectionContent = {
  title: string;
  description: string;
};

export const CONTENU_SECTION: Record<CleSection, SectionContent> = {
  home: {
    title: 'Home',
    description: 'Select a section below to start building a simulation space.',
  },
  mathematiques: {
    title: 'Math',
    description: 'This page is ready for your mathematics equations and simulation work.',
  },
  physique: {
    title: 'Physiques',
    description: 'This page is ready for your physique simulations and related experiments.',
  },
  'programmation-java': {
    title: 'Programmation Java',
    description: 'This page is ready for your Java programming simulations and exercises.',
  },
};

