import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { TexteTheme } from '@/components/texte-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type ProprietesEnteteEcranSimulation = {
  domaine: string;
  titre: string;
};

export const HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION = 58;
export const HAUTEUR_BARRE_ENTETE_SIMULATION = 74;
export const HAUTEUR_TOTALE_ENTETE_SIMULATION =
  HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION + HAUTEUR_BARRE_ENTETE_SIMULATION;
export const ESPACE_CONTENU_ENTETE_SIMULATION = 44;

function obtenirHrefSection(domaine: string): Href {
  return (domaine === 'mathematiques'
    ? '/(tabs)/mathematiques'
    : domaine === 'physique'
      ? '/(tabs)/physique'
      : '/(tabs)/programmation-java') as Href;
}

export function EnteteEcranSimulation({ title, type }: ProprietesEnteteEcranSimulation) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const closeSimulation = () => {
    router.replace(obtenirHrefSection(type));
  };

  return (
    <View style={styles.headerShell}>
      <View style={[styles.topShade, { backgroundColor: themeActif.surface, borderBottomColor: themeActif.border }]} />
      <View style={[styles.header, { backgroundColor: themeActif.background, borderBottomColor: themeActif.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftGroup}>
          <Pressable onPress={closeSimulation} style={[styles.backButton, { backgroundColor: themeActif.panel, borderColor: themeActif.border }]}>
            <MaterialCommunityIcons color={themeActif.ink} name="arrow-left" size={20} />
          </Pressable>
          <View style={styles.titleGroup}>
            <Pressable onPress={() => router.replace('/(tabs)/accueil' as Href)} style={styles.logoButton}>
              <Image
                contentFit="contain"
                source={require('@/assets/images/evidexe-logo.png')}
                style={styles.logo}
              />
            </Pressable>
            <TexteTheme darkColor={themeActif.text} lightColor={themeActif.text} style={[styles.title, { color: themeActif.text }]}>
              {title}
            </TexteTheme>
          </View>
          </View>
          <Pressable onPress={() => router.replace('/(tabs)/profil' as Href)} style={[styles.profileButton, { backgroundColor: themeActif.panel, borderColor: themeActif.border }]}>
            <MaterialCommunityIcons color={themeActif.ink} name="account-circle-outline" size={20} />
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
    backgroundColor: '#DDD7C8',
    borderBottomColor: '#243B53',
    borderBottomWidth: 1.5,
    minHeight: HAUTEUR_OMBRE_HAUT_ENTETE_SIMULATION,
    width: '100%',
  },
  entete: {
    alignItems: 'flex-start',
    backgroundColor: '#EAE3D2',
    borderBottomColor: '#243B53',
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
    justifyContent: 'space-between',
    width: '100%',
  },
  groupeGauche: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'flex-start',
  },
  groupeTitre: {
    alignItems: 'flex-start',
    gap: 8,
  },
  boutonRetour: {
    alignItems: 'center',
    backgroundColor: '#F5F1E6',
    borderColor: '#243B53',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  boutonProfil: {
    alignItems: 'center',
    backgroundColor: '#F5F1E6',
    borderColor: '#243B53',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  titre: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  logo: {
    height: 44,
    width: 120,
  },
  boutonLogo: {
    alignSelf: 'flex-start',
  },
});

