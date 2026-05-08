import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import PanneauParametres from '@/components/accueil/PanneauParametres';
import type { ParametresApplication } from '@/components/accueil/PanneauParametres';
import { LogoEvidexe } from '@/components/logo-evidexe';
import { TexteTheme } from '@/components/texte-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type ProprietesEnteteEcranSimulation = {
  domaine: string;
  titre: string;
};

export const HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION = 0;
export const HAUTEUR_BARRE_ENTETE_SIMULATION = 74;
export const HAUTEUR_TOTALE_ENTETE_SIMULATION =
  HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION + HAUTEUR_BARRE_ENTETE_SIMULATION;
export const ESPACE_CONTENU_ENTETE_SIMULATION = 44;
const COULEUR_ARRIERE_PLAN_PAGE_SIMULATION = '#EAE3D2';
const STYLE_BOUTON_CLIQUABLE_WEB =
  Platform.OS === 'web' ? ({ cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none' } as any) : undefined;
const STYLE_VISUEL_NON_CLIQUABLE_WEB = Platform.OS === 'web' ? ({ pointerEvents: 'none' } as any) : undefined;

function obtenirHrefSection(domaine: string): Href {
  return (domaine === 'mathematiques'
    ? '/(tabs)/mathematiques'
    : domaine === 'physique'
      ? '/(tabs)/physique'
      : '/(tabs)/programmation-java') as Href;
}

export function EnteteEcranSimulation({ titre, domaine }: ProprietesEnteteEcranSimulation) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const [menuParametresOuvert, definirMenuParametresOuvert] = useState(false);
  const [parametres, definirParametres] = useState<ParametresApplication>(() => donneesLocales.obtenirParametres());

  function fermerSimulation() {
    router.replace(obtenirHrefSection(domaine));
  }

  function enregistrerParametres(parametresSuivants: ParametresApplication) {
    definirParametres(parametresSuivants);
  }

  return (
    <View style={styles.enveloppeEntete}>
      <PanneauParametres
        open={menuParametresOuvert}
        onClose={() => definirMenuParametresOuvert(false)}
        settings={parametres}
        onSave={enregistrerParametres}
      />
      {HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION > 0 ? (
        <View
          style={[
            styles.ombreHaute,
            { backgroundColor: COULEUR_ARRIERE_PLAN_PAGE_SIMULATION, borderBottomColor: themeActif.border },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.entete,
          { backgroundColor: themeActif.background, borderBottomColor: themeActif.border },
        ]}>
        <View style={styles.rangeeEntete}>
          <View style={styles.groupeGauche}>
            <Pressable
              onPress={fermerSimulation}
              style={[
                styles.boutonRetour,
                { backgroundColor: themeActif.panel, borderColor: themeActif.border },
              ]}>
              <MaterialCommunityIcons color={themeActif.ink} name="arrow-left" size={20} />
            </Pressable>
            <View style={styles.groupeTitre}>
              <Pressable onPress={() => router.replace('/(tabs)/accueil' as Href)} style={styles.boutonLogo}>
                <LogoEvidexe
                  resizeMode="contain"
                  style={styles.logo}
                />
              </Pressable>
              <TexteTheme
                darkColor={themeActif.text}
                lightColor={themeActif.text}
                numberOfLines={1}
                style={[styles.titre, { color: themeActif.text }]}>
                {titre}
              </TexteTheme>
            </View>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => definirMenuParametresOuvert(true)}
            style={[
              styles.boutonProfil,
              STYLE_BOUTON_CLIQUABLE_WEB,
              { backgroundColor: themeActif.panel, borderColor: themeActif.border },
            ]}>
            <View pointerEvents="none" style={[styles.menuIconWrapper, STYLE_VISUEL_NON_CLIQUABLE_WEB]}>
              <View style={[styles.menuIconBar, { backgroundColor: themeActif.ink }]} />
              <View style={[styles.menuIconBar, { backgroundColor: themeActif.ink }]} />
              <View style={[styles.menuIconBar, { backgroundColor: themeActif.ink }]} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  enveloppeEntete: {
    width: '100%',
  },
  ombreHaute: {
    borderBottomWidth: HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION > 0 ? 1.5 : 0,
    minHeight: HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION,
    width: '100%',
  },
  entete: {
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    justifyContent: 'flex-start',
    minHeight: HAUTEUR_BARRE_ENTETE_SIMULATION,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  rangeeEntete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  groupeGauche: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  groupeTitre: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  boutonRetour: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  boutonProfil: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    flexShrink: 0,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    width: 38,
  },
  menuIconWrapper: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    left: 7,
    position: 'absolute',
    top: 7,
    width: 24,
  },
  menuIconBar: {
    borderRadius: 999,
    height: 2,
    marginVertical: 2,
    width: 18,
  },
  titre: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    maxWidth: '100%',
  },
  logo: {
    height: 44,
    width: 120,
  },
  boutonLogo: {
    alignSelf: 'flex-start',
  },
});
