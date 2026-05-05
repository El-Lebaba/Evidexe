import { useEffect, useState } from 'react';

import { donneesLocales } from '@/db/donnees-principales';

export function useSchemaCouleur() {
  const [schemaCouleur, setSchemaCouleur] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    function rafraichirSchemaCouleur() {
      donneesLocales.init();
      setSchemaCouleur(donneesLocales.obtenirParametres().darkMode ? 'dark' : 'light');
    }

    rafraichirSchemaCouleur();
    window.addEventListener('evidex_settings_changed', rafraichirSchemaCouleur);

    return () => window.removeEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
  }, []);

  return schemaCouleur;
}
