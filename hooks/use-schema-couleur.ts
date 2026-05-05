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

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
      return () => window.removeEventListener('evidex_settings_changed', rafraichirSchemaCouleur);
    }
  }, []);

  return schemaCouleur;
}
