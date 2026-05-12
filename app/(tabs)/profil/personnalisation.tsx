/**
 * Page de personnalisation du profil.
 *
 * Elle modifie le nom affiché et l'image de profil. L'image est compressée
 * avant sauvegarde pour éviter de mettre une photo trop lourde dans le stockage
 * local.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PanneauParametres from '@/components/accueil/PanneauParametres';
import type { ParametresApplication } from '@/components/accueil/PanneauParametres';
import BarreSuperieure from '@/components/accueil/BarreSuperieure';
import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { InfosUtilisateur } from '@/db/donnees-principales';
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';

const Couleurs = obtenirThemeApplication(false);

export default function PagePersonnalisationProfil() {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<InfosUtilisateur>({ xp: 0, level: 1 });
  const [draftName, setDraftName] = useState('Utilisateur');
  const [draftAvatarUri, setDraftAvatarUri] = useState<string | undefined>();
  const [saveMessage, setSaveMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ParametresApplication>({
    darkMode: false,
    language: 'fr',
    notifications: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function chargerProfil() {
      await donneesLocales.init();

      if (!isMounted) {
        return;
      }

      const loadedUser = donneesLocales.obtenirUtilisateur();
      setUser(loadedUser);
      setDraftName(loadedUser.name ?? 'Utilisateur');
      setDraftAvatarUri(loadedUser.avatarUri);
      setSettings(donneesLocales.obtenirParametres());
    }

    void chargerProfil();

    return () => {
      isMounted = false;
    };
  }, []);

  const themeActif = obtenirThemeApplication(settings.darkMode);
  const contentWidth = Math.min(Math.max(width - 24, 300), 520);

  function enregistrerParametres(nextSettings: ParametresApplication) {
    setSettings(nextSettings);
  }

  /**
   * Choisit une image et la réduit avant de la garder.
   *
   * Le stockage local n'est pas fait pour des images énormes, donc on limite
   * la taille et la qualité avant d'enregistrer l'URI.
   */
  async function choisirAvatar() {
    setSaveMessage('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setSaveMessage("L'acces aux photos est requis pour choisir une image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const largestSide = Math.max(asset.width ?? 0, asset.height ?? 0);
    const avatarSize = 512;
    const resizeActions: ImageManipulator.Action[] = largestSide > avatarSize
      ? [{ resize: { width: avatarSize, height: avatarSize } }]
      : [];
    const processed = await ImageManipulator.manipulateAsync(
      asset.uri,
      resizeActions,
      {
        base64: true,
        compress: 0.78,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    setDraftAvatarUri(processed.base64 ? `data:image/jpeg;base64,${processed.base64}` : processed.uri);
  }

  function supprimerAvatar() {
    setDraftAvatarUri(undefined);
    setSaveMessage('');
  }

  function enregistrerProfil() {
    donneesLocales.enregistrerUtilisateur({
      ...user,
      name: draftName,
      avatarUri: draftAvatarUri,
    });

    const savedUser = donneesLocales.obtenirUtilisateur();
    setUser(savedUser);
    setDraftName(savedUser.name ?? 'Utilisateur');
    setDraftAvatarUri(savedUser.avatarUri);
    setSaveMessage('Infos enregistrees.');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <View style={[styles.page, { backgroundColor: themeActif.background }]}>
        <SymbolesMathematiquesFlottants
          showGlow={!settings.darkMode}
          style={[styles.backgroundSymbols, { backgroundColor: themeActif.background }]}
        />
        <BarreSuperieure
          darkMode={settings.darkMode}
          onSettingsClick={() => setSettingsOpen(true)}
          user={user}
        />
        <PanneauParametres
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={enregistrerParametres}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.panel, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}25`, width: contentWidth }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => router.back()}
                style={[styles.iconButton, { backgroundColor: themeActif.background, borderColor: `${themeActif.border}25` }]}>
                <MaterialIcons name="arrow-back" size={22} color={themeActif.text} />
              </Pressable>
              <View style={styles.titleBlock}>
                <Text style={[styles.title, { color: themeActif.text }]}>Personnalisation du profil</Text>
                <Text style={[styles.subtitle, { color: themeActif.muted }]}>Pseudo et photo de profil</Text>
              </View>
            </View>

            <View style={styles.avatarEditorRow}>
              <View style={[styles.avatarPreview, { backgroundColor: themeActif.blue, borderColor: `${themeActif.border}25` }]}>
                {draftAvatarUri ? (
                  <Image source={{ uri: draftAvatarUri }} style={styles.avatarImage} />
                ) : (
                  <MaterialIcons name="person" size={50} color="white" />
                )}
              </View>

              <View style={styles.avatarActions}>
                <Pressable
                  onPress={choisirAvatar}
                  style={[styles.secondaryButton, { backgroundColor: themeActif.background, borderColor: `${themeActif.blue}70` }]}>
                  <MaterialIcons name="photo-camera" size={18} color={themeActif.blue} />
                  <Text style={[styles.secondaryButtonText, { color: themeActif.text }]}>Choisir une photo</Text>
                </Pressable>
                <Pressable
                  disabled={!draftAvatarUri}
                  onPress={supprimerAvatar}
                  style={[
                    styles.secondaryButton,
                    { backgroundColor: themeActif.background, borderColor: `${themeActif.red}60` },
                    !draftAvatarUri && styles.disabledButton,
                  ]}>
                  <MaterialIcons name="delete-outline" size={18} color={themeActif.red} />
                  <Text style={[styles.secondaryButtonText, { color: themeActif.text }]}>Supprimer</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[styles.inputLabel, { color: themeActif.muted }]}>Pseudo</Text>
              <TextInput
                value={draftName}
                onChangeText={(text) => {
                  setDraftName(text);
                  setSaveMessage('');
                }}
                placeholder="Pseudo"
                placeholderTextColor={themeActif.muted}
                maxLength={32}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: themeActif.background,
                    borderColor: `${themeActif.border}35`,
                    color: themeActif.text,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={enregistrerProfil}
              style={[styles.saveButton, { backgroundColor: themeActif.green }]}>
              <MaterialIcons name="save" size={20} color={themeActif.hero} />
              <Text style={[styles.saveButtonText, { color: themeActif.hero }]}>Enregistrer</Text>
            </Pressable>

            {saveMessage ? (
              <Text style={[styles.saveMessage, { color: themeActif.muted }]}>{saveMessage}</Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Couleurs.background,
    flex: 1,
  },
  page: {
    backgroundColor: Couleurs.background,
    flex: 1,
  },
  backgroundSymbols: {
    opacity: 0.28,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    padding: 16,
    zIndex: 1,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: Couleurs.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarEditorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  avatarPreview: {
    alignItems: 'center',
    borderRadius: 62,
    borderWidth: 2,
    height: 124,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 124,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarActions: {
    flex: 1,
    gap: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.45,
  },
  fieldBlock: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  saveMessage: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
