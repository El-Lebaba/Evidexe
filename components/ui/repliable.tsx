/**
 * Bloc repliable.
 *
 * C'est un petit composant utilitaire pour cacher/montrer un contenu sans
 * refaire la même logique d'état dans plusieurs écrans.
 */
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { SymboleIcone } from '@/components/ui/symbole-icone';
import { Couleurs } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

export function Repliable({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const themeActif = useSchemaCouleur() ?? 'light';

  return (
    <VueTheme>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <SymboleIcone
          name="chevron.right"
          size={18}
          weight="medium"
          color={themeActif === 'light' ? Couleurs.light.icon : Couleurs.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <TexteTheme type="defaultSemiBold">{title}</TexteTheme>
      </TouchableOpacity>
      {isOpen && <VueTheme style={styles.content}>{children}</VueTheme>}
    </VueTheme>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
