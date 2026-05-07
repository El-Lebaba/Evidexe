import React, { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, Link, router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { LogoEvidexe } from '@/components/logo-evidexe';
import { obtenirThemeApplication } from '@/constantes/theme';

const CouleursBase = obtenirThemeApplication(false);

type InfosUtilisateur = {
  name?: string;
  avatarUri?: string;
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

  function openProfileCustomization() {
    setMenuOpen(false);
    router.push('/(tabs)/profil/personnalisation' as Href);
  }

  function renderAvatar(size: 'small' | 'large') {
    const avatarStyle = size === 'large' ? styles.menuAvatar : styles.avatar;
    const iconSize = size === 'large' ? 24 : 20;

    return (
      <View style={[avatarStyle, { backgroundColor: Couleurs.blue }]}>
        {user?.avatarUri ? (
          <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
        ) : (
          <MaterialIcons name="person" size={iconSize} color="white" />
        )}
      </View>
    );
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
        <Pressable onPress={openSettings} style={styles.utilityButton}>
          <MaterialIcons name="menu" size={24} color={Couleurs.text} />
        </Pressable>

        <View style={styles.nav}>
          <Link href={'/(tabs)/accueil' as Href} asChild>
            <Pressable style={styles.logoButton}>
              <LogoEvidexe
                resizeMode="contain"
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
            {renderAvatar('small')}
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
              <View style={styles.menuIdentityRow}>
                {renderAvatar('large')}
                <Text style={[styles.name, { color: Couleurs.text }]} numberOfLines={1}>{user?.name ?? 'Utilisateur'}</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: `${Couleurs.blue}18`, borderColor: `${Couleurs.blue}60` }]}>
                  <Text style={[styles.statValue, { color: Couleurs.blue }]}>{user?.level ?? 1}</Text>
                  <Text style={[styles.statLabel, { color: Couleurs.muted }]}>Niveau</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: `${Couleurs.yellow}18`, borderColor: `${Couleurs.yellow}60` }]}>
                  <Text style={[styles.statValue, { color: Couleurs.yellow }]}>{user?.xp ?? 0}</Text>
                  <Text style={[styles.statLabel, { color: Couleurs.muted }]}>XP</Text>
                </View>
              </View>

              <View style={[styles.line, { backgroundColor: `${Couleurs.border}20` }]} />

              <Pressable onPress={openProfileCustomization} style={styles.menuItem}>
                {user?.avatarUri ? (
                  <View style={styles.menuItemAvatar}>
                    <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
                  </View>
                ) : (
                  <MaterialIcons name="manage-accounts" size={18} color={Couleurs.text} />
                )}
                <Text style={[styles.menuText, { color: Couleurs.text }]}>Profile customization</Text>
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
  utilityButton: {
    alignItems: 'center',
    backgroundColor: CouleursBase.panel,
    borderColor: '#243B5355',
    borderRadius: 999,
    borderWidth: 1,
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
    overflow: 'hidden',
    width: 38,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  menuAvatar: {
    alignItems: 'center',
    backgroundColor: CouleursBase.blue,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  menuIdentityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
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
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  level: {
    color: CouleursBase.blue,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
    borderColor: '#7EA6E060',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  statValue: {
    color: CouleursBase.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: CouleursBase.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
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
  menuItemAvatar: {
    borderRadius: 9,
    height: 18,
    overflow: 'hidden',
    width: 18,
  },
  menuText: {
    color: CouleursBase.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

