/**
 * Version web du hook de thème.
 *
 * Elle utilise le même stockage que la version native, mais écoute directement
 * l'événement navigateur déclenché quand les paramètres changent.
 */
import { useEffect, useState } from 'react';

import { donneesLocales } from '@/db/donnees-principales';

export function useSchemaCouleur() {
  const [schemaCouleur, setSchemaCouleur] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    let isMounted = true;

    function rafraichirSchemaCouleur() {
      void donneesLocales.init().then(() => {
        if (isMounted) {
          setSchemaCouleur(donneesLocales.obtenirParametres().darkMode ? 'dark' : 'light');
        }
      });
    }

    rafraichirSchemaCouleur();
    const retirerEcouteurParametres = donneesLocales.ajouterEcouteurParametres(rafraichirSchemaCouleur);
    window.addEventListener('evidex_settings_changed', rafraichirSchemaCouleur);

    return () => {
      isMounted = false;
      retirerEcouteurParametres();
      window.removeEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
    };
  }, []);

  return schemaCouleur;
}
