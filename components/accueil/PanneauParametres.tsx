import { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { obtenirThemeApplication, ThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';

export type ParametresApplication = {
  darkMode: boolean;
  language: string;
  notifications: boolean;
  fpsCounterEnabled: boolean;
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
  const [slideValue] = useState(() => new Animated.Value(-1));
  const themeActif = obtenirThemeApplication(localSettings.darkMode);

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

  function applySettings(nextSettings: ParametresApplication) {
    setLocalSettings(nextSettings);
    donneesLocales.enregistrerParametres(nextSettings);
    onSave(nextSettings);
  }

  return (
    <Modal transparent visible={open} animationType="none">
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={styles.closeZone} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: themeActif.surface,
              borderRightColor: `${themeActif.border}40`,
              transform: [
                {
                  translateX: slideValue.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [-360, 0],
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
            <Text style={[styles.sectionTitle, { color: themeActif.muted }]}>Apparence</Text>
            <ToggleRow
              icon={localSettings.darkMode ? 'dark-mode' : 'light-mode'}
              label="Mode sombre"
              description="Change le themeActif de l'interface"
              themeActif={themeActif}
              value={localSettings.darkMode}
              onValueChange={(darkMode) =>
                applySettings({ ...localSettings, darkMode })
              }
            />

            <Text style={[styles.sectionTitle, { color: themeActif.muted }]}>DevTools</Text>
            <ToggleRow
              icon="speed"
              label="Compteur FPS"
              description="Active ou coupe totalement la mesure FPS"
              themeActif={themeActif}
              value={localSettings.fpsCounterEnabled}
              onValueChange={(fpsCounterEnabled) =>
                applySettings({ ...localSettings, fpsCounterEnabled })
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
  description: string;
  themeActif: ThemeApplication;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({
  icon,
  label,
  description,
  themeActif,
  value,
  onValueChange,
}: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <MaterialIcons name={icon} size={20} color={themeActif.muted} />

      <View style={styles.toggleTextBox}>
        <Text style={[styles.toggleLabel, { color: themeActif.text }]}>{label}</Text>
        <Text style={[styles.toggleDescription, { color: themeActif.muted }]}>
          {description}
        </Text>
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
  closeZone: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: '#F3F1E7',
    borderRightColor: '#243B5340',
    borderRightWidth: 1,
    bottom: 0,
    left: 0,
    maxWidth: 360,
    position: 'absolute',
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
  toggleDescription: {
    color: '#6E7F73',
    fontSize: 12,
    marginTop: 2,
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
