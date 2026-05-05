import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';

const Couleurs = obtenirThemeApplication(false);

export type InfosUtilisateur = {
  xp: number;
  level: number;
};

type Succes = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

type XPPanelProps = {
  darkMode?: boolean;
  user: InfosUtilisateur;
  onUserUpdate: (user?: InfosUtilisateur) => void;
};

const xpPerLevel = 100;

export default function PanneauXP({ darkMode = false, user }: XPPanelProps) {
  const themeActif = obtenirThemeApplication(darkMode);
  const achievements: Succes[] = donneesLocales.obtenirSucces();
  const completedAchievements = achievements.filter((item) => item.completed);
  const xpInLevel = user.xp % xpPerLevel;
  const progress = `${xpInLevel}%` as `${number}%`;

  function openAchievements() {
    router.push('/achievements' as never);
  }

  return (
    <View style={styles.container}>
      {/* Main XP title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeActif.text }]}>XP et niveau</Text>
        <MaterialIcons name="bolt" size={21} color={themeActif.yellow} />
      </View>

      {/* Big level card */}
      <View style={[styles.levelCard, { backgroundColor: themeActif.hero }]}>
        <Text style={styles.levelLabel}>Niveau actuel</Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelNumber}>{user.level}</Text>
          <MaterialIcons name="star" size={28} color={themeActif.yellow} />
        </View>
        <Text style={styles.totalXp}>{user.xp} XP total</Text>
      </View>

      {/* Progress toward the next level */}
      <View style={styles.progressBlock}>
        <View style={styles.progressTop}>
          <Text style={[styles.smallText, { color: themeActif.muted }]}>Progression niveau {user.level + 1}</Text>
          <Text style={[styles.smallText, { color: themeActif.muted }]}>
            {xpInLevel}/{xpPerLevel} XP
          </Text>
        </View>

        <View
          style={[
            styles.sliderTrack,
            { backgroundColor: themeActif.panel, borderColor: themeActif.border },
          ]}
        >
          <View style={[styles.sliderFill, { backgroundColor: themeActif.grid, width: progress }]} />
          <View
            style={[
              styles.sliderThumb,
              {
                backgroundColor: themeActif.text,
                borderColor: themeActif.panel,
                left: progress,
              },
            ]}
          />
        </View>

        <Text style={[styles.remainingText, { color: themeActif.muted }]}>
          encore {xpPerLevel - xpInLevel} XP pour le niveau {user.level + 1}
        </Text>
      </View>

      {/* Succes preview */}
      <View style={styles.achievements}>
        <View style={styles.achievementHeader}>
          <Text style={[styles.sectionTitle, { color: themeActif.muted }]}>Achievements</Text>
          <Text style={[styles.smallText, { color: themeActif.muted }]}>
            {completedAchievements.length}/{achievements.length}
          </Text>
        </View>

        {achievements.slice(0, 4).map((Succes) => (
          <View
            key={Succes.id}
            style={[
              styles.achievementRow,
              {
                backgroundColor: themeActif.panel,
                borderColor: `${themeActif.border}20`,
              },
              Succes.completed && styles.achievementDone,
              Succes.completed && {
                backgroundColor: `${themeActif.yellow}22`,
                borderColor: `${themeActif.yellow}70`,
              },
            ]}
          >
            <MaterialIcons
              name="emoji-events"
              size={18}
              color={Succes.completed ? themeActif.yellow : themeActif.muted}
            />
            <Text
              style={[
                styles.achievementText,
                { color: themeActif.muted },
                Succes.completed && styles.achievementTextDone,
                Succes.completed && { color: themeActif.text },
              ]}
            >
              {Succes.title}
            </Text>
            {Succes.completed && (
              <MaterialIcons name="check" size={18} color={themeActif.yellow} />
            )}
          </View>
        ))}

        <Pressable
          onPress={openAchievements}
          style={[
            styles.moreButton,
            {
              backgroundColor: `${themeActif.blue}22`,
              borderColor: `${themeActif.blue}70`,
            },
          ]}
        >
          <MaterialIcons name="trending-up" size={18} color={themeActif.blue} />
          <Text style={[styles.moreText, { color: themeActif.blue }]}>Voir tous les achievements</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: Couleurs.text,
    fontSize: 17,
    fontWeight: '900',
  },
  levelCard: {
    backgroundColor: Couleurs.text,
    borderRadius: 10,
    padding: 18,
  },
  levelLabel: {
    color: '#FFFFFFAA',
    fontSize: 12,
    fontWeight: '700',
  },
  levelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  levelNumber: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
  },
  totalXp: {
    color: '#FFFFFFAA',
    fontSize: 12,
  },
  progressBlock: {
    gap: 7,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallText: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  sliderTrack: {
    backgroundColor: Couleurs.panel,
    borderColor: Couleurs.border,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderFill: {
    backgroundColor: Couleurs.grid,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  sliderThumb: {
    backgroundColor: Couleurs.text,
    borderColor: Couleurs.panel,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    marginLeft: -9,
    position: 'absolute',
    width: 18,
  },
  remainingText: {
    color: Couleurs.muted,
    fontSize: 11,
    textAlign: 'right',
  },
  xpButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  xpButton: {
    alignItems: 'center',
    borderColor: '#D8A94A80',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 8,
  },
  xpButtonText: {
    color: Couleurs.yellow,
    fontSize: 12,
    fontWeight: '900',
  },
  achievements: {
    gap: 8,
  },
  achievementHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  achievementRow: {
    alignItems: 'center',
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5320',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    opacity: 0.65,
    padding: 10,
  },
  achievementDone: {
    backgroundColor: '#D8A94A22',
    borderColor: '#D8A94A70',
    opacity: 1,
  },
  achievementText: {
    color: Couleurs.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  achievementTextDone: {
    color: Couleurs.text,
  },
  moreButton: {
    alignItems: 'center',
    backgroundColor: '#7EA6E022',
    borderColor: '#7EA6E070',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 11,
  },
  moreText: {
    color: Couleurs.blue,
    fontSize: 12,
    fontWeight: '900',
  },
});
