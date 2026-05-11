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

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
      return () => {
        isMounted = false;
        retirerEcouteurParametres();
        window.removeEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
      };
    }

    return () => {
      isMounted = false;
      retirerEcouteurParametres();
    };
  }, []);

  return schemaCouleur;
}
