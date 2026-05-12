/**
 * Panneau résumé des succès.
 *
 * Il affiche les objectifs principaux dans le profil sans refaire le calcul
 * des succès, qui reste dans `donneesLocales`.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { donneesLocales } from '@/db/donnees-principales';
import type { InfosUtilisateur } from '@/db/donnees-principales';
import ListeSucces from '@/components/profil/ListeSucces';
import { obtenirThemeApplication } from '@/constantes/theme';

type PanneauSuccesProps = {
  darkMode?: boolean;
  user: InfosUtilisateur;
};

export default function PanneauSucces({ darkMode = false, user }: PanneauSuccesProps) {
  const themeActif = obtenirThemeApplication(darkMode);
  const successes = donneesLocales.obtenirSuccesProgression();
  const completedSuccesses = successes.filter((success) => success.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeActif.text }]}>Succes</Text>
          <Text style={[styles.subtitle, { color: themeActif.muted }]}>
            {completedSuccesses}/{successes.length} termines
          </Text>
        </View>
        <View style={[styles.trophyBadge, { backgroundColor: `${themeActif.yellow}24` }]}>
          <MaterialIcons name="emoji-events" size={22} color={themeActif.yellow} />
        </View>
      </View>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: themeActif.panel,
            borderColor: `${themeActif.border}30`,
          },
        ]}>
        <View>
          <Text style={[styles.summaryLabel, { color: themeActif.muted }]}>Niveau actuel</Text>
          <Text style={[styles.summaryNumber, { color: themeActif.text }]}>{user.level}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={[styles.summaryStat, { color: themeActif.yellow }]}>{user.xp} XP</Text>
          <Text style={[styles.summarySubStat, { color: themeActif.muted }]}>
            {completedSuccesses}/{successes.length} succes
          </Text>
        </View>
      </View>

      <ListeSucces successes={successes} themeActif={themeActif} limit={4} />

      <Pressable
        onPress={() => router.push('/(tabs)/succes' as Href)}
        style={[styles.fullPageButton, { backgroundColor: `${themeActif.blue}22`, borderColor: `${themeActif.blue}70` }]}>
        <MaterialIcons name="open-in-new" size={18} color={themeActif.blue} />
        <Text style={[styles.fullPageText, { color: themeActif.blue }]}>Voir tous les succes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  trophyBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  summaryCard: {
    alignItems: 'flex-end',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  summaryNumber: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },
  summaryRight: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  summaryStat: {
    fontSize: 13,
    fontWeight: '900',
  },
  summarySubStat: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  fullPageButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 11,
  },
  fullPageText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
