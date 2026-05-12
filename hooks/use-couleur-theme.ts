/**
 * Sélectionne une couleur selon le thème actif.
 *
 * Un composant peut fournir une couleur claire/sombre précise. Sinon, on prend
 * la couleur du thème global.
 */
import { Couleurs } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

export function useCouleurTheme(
  props: { light?: string; dark?: string },
  nomCouleur: keyof typeof Couleurs.light & keyof typeof Couleurs.dark
) {
  const themeActif = useSchemaCouleur() ?? 'light';
  const couleurDepuisProprietes = props[themeActif];

  if (couleurDepuisProprietes) {
    return couleurDepuisProprietes;
  } else {
    return Couleurs[themeActif][nomCouleur];
  }
}
