import { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, type Href, usePathname } from 'expo-router';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { obtenirThemeApplication, ThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { InfosUtilisateur } from '@/db/donnees-principales';

export type ParametresApplication = {
  darkMode: boolean;
  language: string;
  notifications: boolean;
};

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  settings: ParametresApplication;
  onSave: (settings: ParametresApplication) => void;
};

export default function PanneauParametres({
  open,
  onClose,
  settings,
  onSave,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [user, setUser] = useState<InfosUtilisateur>({ xp: 0, level: 1 });
  const [slideValue] = useState(() => new Animated.Value(-1));
  const pathname = usePathname();
  const themeActif = obtenirThemeApplication(localSettings.darkMode);
  const profileLocked = pathname.includes('/profil');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    Animated.timing(slideValue, {
      duration: open ? 240 : 180,
      toValue: open ? 0 : -1,
      useNativeDriver: true,
    }).start();
  }, [open, slideValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    void donneesLocales.init().then(() => {
      if (isMounted) {
        setUser(donneesLocales.obtenirUtilisateur());
      }
    });

    return () => {
      isMounted = false;
    };
  }, [open]);

  function applySettings(nextSettings: ParametresApplication) {
    setLocalSettings(nextSettings);
    donneesLocales.enregistrerParametres(nextSettings);
    onSave(nextSettings);
  }

  function openProfile() {
    if (profileLocked) {
      return;
    }

    onClose();
    router.push('/(tabs)/profil' as Href);
  }

  return (
    <Modal transparent visible={open} animationType="none">
      <View style={[styles.overlay, styles.pointerEventsBoxNone]}>
        <Pressable style={styles.closeZone} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: themeActif.surface,
              borderLeftColor: `${themeActif.border}40`,
              transform: [
                {
                  translateX: slideValue.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [360, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: `${themeActif.border}20` }]}>
            <Text style={[styles.title, { color: themeActif.text }]}>Parametres</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <MaterialIcons name="close" size={24} color={themeActif.muted} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Pressable
              disabled={profileLocked}
              onPress={openProfile}
              style={[
                styles.profileCardButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.blue}75`,
                },
                profileLocked && styles.profileCardLocked,
              ]}>
              <View style={[styles.profileAvatar, { backgroundColor: themeActif.blue }]}>
                {user.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.profileAvatarImage} />
                ) : (
                  <MaterialIcons name="person" size={31} color="white" />
                )}
              </View>

              <View style={styles.profileCardTextBox}>
                <Text numberOfLines={1} style={[styles.profileName, { color: themeActif.text }]}>
                  {user.name ?? 'Utilisateur'}
                </Text>
                <View style={styles.profileMetaRow}>
                  <View style={[styles.profileLevelBadge, { backgroundColor: `${themeActif.blue}22`, borderColor: `${themeActif.blue}80` }]}>
                    <Text style={[styles.profileLevelText, { color: themeActif.blue }]}>Niveau {user.level}</Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.profileXpText, { color: themeActif.muted }]}>
                    {user.xp} XP
                  </Text>
                </View>
              </View>

              <MaterialIcons
                name={profileLocked ? 'lock' : 'chevron-right'}
                size={24}
                color={profileLocked ? themeActif.muted : themeActif.blue}
              />
            </Pressable>

            <Text style={[styles.sectionTitle, { color: themeActif.muted }]}>Apparence</Text>
            <ToggleRow
              icon={localSettings.darkMode ? 'dark-mode' : 'light-mode'}
              label="Mode sombre"
              themeActif={themeActif}
              value={localSettings.darkMode}
              onValueChange={(darkMode) =>
                applySettings({ ...localSettings, darkMode })
              }
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type ToggleRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  themeActif: ThemeApplication;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({
  icon,
  label,
  themeActif,
  value,
  onValueChange,
}: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <MaterialIcons name={icon} size={20} color={themeActif.muted} />

      <View style={styles.toggleTextBox}>
        <Text style={[styles.toggleLabel, { color: themeActif.text }]}>{label}</Text>
      </View>

      <Pressable
        onPress={() => onValueChange(!value)}
        style={[
          styles.toggleSlider,
          {
            backgroundColor: themeActif.surface,
            borderColor: themeActif.border,
          },
        ]}
      >
        {value && <View style={[styles.toggleFill, { backgroundColor: themeActif.grid }]} />}
        <View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: themeActif.text,
              borderColor: themeActif.panel,
            },
            value ? styles.toggleThumbOn : styles.toggleThumbOff,
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  pointerEventsBoxNone: {
    pointerEvents: 'box-none' as any,
  },
  closeZone: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: '#F3F1E7',
    borderLeftColor: '#243B5340',
    borderLeftWidth: 1,
    borderBottomLeftRadius: 22,
    borderTopLeftRadius: 22,
    bottom: 0,
    maxWidth: 360,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '86%',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#243B5320',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  title: {
    color: '#243B53',
    fontSize: 20,
    fontWeight: '900',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    gap: 12,
    padding: 18,
  },
  sectionTitle: {
    color: '#6E7F73',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  profileCardButton: {
    alignItems: 'center',
    borderColor: '#7EA6E070',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 13,
    minHeight: 96,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  profileCardLocked: {
    opacity: 0.48,
  },
  profileAvatar: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 60,
  },
  profileAvatarImage: {
    height: '100%',
    width: '100%',
  },
  profileCardTextBox: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  profileName: {
    color: '#243B53',
    fontSize: 18,
    fontWeight: '900',
  },
  profileMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileLevelBadge: {
    borderColor: '#7EA6E080',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  profileLevelText: {
    color: '#7EA6E0',
    fontSize: 12,
    fontWeight: '900',
  },
  profileXpText: {
    color: '#6E7F73',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  toggleTextBox: {
    flex: 1,
  },
  toggleLabel: {
    color: '#243B53',
    fontSize: 14,
    fontWeight: '800',
  },
  toggleSlider: {
    backgroundColor: '#F3F1E7',
    borderColor: '#243B53',
    borderRadius: 999,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 60,
  },
  toggleFill: {
    backgroundColor: '#B7C7B0',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  toggleThumb: {
    backgroundColor: '#243B53',
    borderColor: '#DDE4D5',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    position: 'absolute',
    width: 18,
  },
  toggleThumbOff: {
    left: 6,
  },
  toggleThumbOn: {
    right: 6,
  },
});
