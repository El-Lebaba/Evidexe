/**
 * Écran générique de section.
 *
 * Il sert de fallback simple: titre, description et mise en page centrée.
 */
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { CONTENU_SECTION, CleSection } from '@/features/sections/contenu-section';

type SectionScreenProps = {
  section: CleSection;
};

export function EcranSection({ section }: SectionScreenProps) {
  const content = CONTENU_SECTION[section];

  return (
    <SafeAreaView style={styles.safeArea}>
      <VueTheme style={styles.container}>
        <TexteTheme type="title">{content.title}</TexteTheme>
        <TexteTheme style={styles.description}>{content.description}</TexteTheme>
      </VueTheme>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  description: {
    maxWidth: 420,
    textAlign: 'center',
  },
});
