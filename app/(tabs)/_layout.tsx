import { Tabs } from 'expo-router';
import React from 'react';

import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

export default function DispositionOnglets() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeApplication = obtenirThemeApplication(modeSombre);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: modeSombre ? themeApplication.surface : undefined,
          borderTopColor: modeSombre ? themeApplication.border : undefined,
          display: 'none',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="accueil/index"
        options={{ title: 'Accueil' }}
      />
      <Tabs.Screen
        name="profil/index"
        options={{ title: 'Profil' }}
      />
      <Tabs.Screen
        name="succes/index"
        options={{ title: 'Succes' }}
      />
      <Tabs.Screen
        name="cours"
        options={{ title: 'Cours' }}
      />
      <Tabs.Screen
        name="mathematiques"
        options={{ title: 'Math' }}
      />
      <Tabs.Screen
        name="physique"
        options={{ title: 'Physiques' }}
      />
      <Tabs.Screen
        name="programmation-java"
        options={{ title: 'Java' }}
      />
      <Tabs.Screen
        name="simulations/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

