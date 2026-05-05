import React, { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';

const CouleursBase = obtenirThemeApplication(false);

type InfosUtilisateur = {
  xp?: number;
  level?: number;
};

type ProprietesBarreSuperieure = {
  darkMode?: boolean;
  onSettingsClick: () => void;
  user?: InfosUtilisateur;
};

export default function BarreSuperieure({ darkMode = false, onSettingsClick, user }: ProprietesBarreSuperieure) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Couleurs = obtenirThemeApplication(darkMode);

  function openSettings() {
    setMenuOpen(false);
    onSettingsClick();
  }

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: Couleurs.background,
          borderBottomColor: `${Couleurs.border}40`,
        },
      ]}
    >
      <View style={styles.content}>
        <Pressable onPress={openSettings} style={styles.iconButton}>
          <MaterialIcons name="settings" size={23} color={Couleurs.muted} />
        </Pressable>

        <View style={styles.nav}>
          <Link href={'/(tabs)/accueil' as Href} asChild>
            <Pressable style={styles.logoButton}>
              <Image
                resizeMode="contain"
                source={require('@/assets/images/evidexe-logo.png')}
                style={styles.logoImage}
              />
            </Pressable>
          </Link>
        </View>

        <View style={styles.profileArea}>
          <Pressable
            onPress={() => setMenuOpen(!menuOpen)}
            style={styles.profileButton}
          >
            <View style={[styles.avatar, { backgroundColor: Couleurs.blue }]}>
              <MaterialIcons name="person" size={20} color="white" />
            </View>
            <MaterialIcons
              name={menuOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={18}
              color={Couleurs.muted}
            />
          </Pressable>

          {menuOpen && (
            <View
              style={[
                styles.menu,
                {
                  backgroundColor: Couleurs.background,
                  borderColor: `${Couleurs.border}40`,
                },
              ]}
            >
              <Text style={[styles.smallText, { color: Couleurs.muted }]}>Connecte en tant que</Text>
              <Text style={[styles.name, { color: Couleurs.text }]}>Utilisateur</Text>
              <Text style={[styles.level, { color: Couleurs.blue }]}>
                Niveau {user?.level ?? 1} - {user?.xp ?? 0} XP
              </Text>

              <View style={[styles.line, { backgroundColor: `${Couleurs.border}20` }]} />

              <Pressable onPress={openSettings} style={styles.menuItem}>
                <MaterialIcons name="settings" size={18} color={Couleurs.text} />
                <Text style={[styles.menuText, { color: Couleurs.text }]}>Parametres</Text>
              </Pressable>

            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F3F1E7',
    borderBottomColor: '#243B5340',
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 100,
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  nav: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    flexShrink: 1,
  },
  logo: {
    color: CouleursBase.text,
    fontSize: 24,
    fontWeight: '900',
  },
  logoAccent: {
    color: CouleursBase.blue,
  },
  logoButton: {
    alignItems: 'center',
    height: 66,
    justifyContent: 'center',
    maxWidth: 190,
    width: 190,
  },
  logoImage: {
    height: 60,
    width: '100%',
  },
  profileArea: {
    position: 'relative',
  },
  profileButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: CouleursBase.blue,
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  menu: {
    backgroundColor: CouleursBase.background,
    borderColor: '#243B5340',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    position: 'absolute',
    right: 0,
    top: 50,
    width: 210,
    zIndex: 20,
  },
  smallText: {
    color: CouleursBase.muted,
    fontSize: 12,
  },
  name: {
    color: CouleursBase.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  level: {
    color: CouleursBase.blue,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  line: {
    backgroundColor: '#243B5320',
    height: 1,
    marginVertical: 10,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  menuText: {
    color: CouleursBase.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

