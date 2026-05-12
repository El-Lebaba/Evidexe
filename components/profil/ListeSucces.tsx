/**
 * Liste visuelle des succès.
 *
 * Le composant reçoit déjà les succès calculés. Il s'occupe surtout de la
 * présentation des rangs et de la progression.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { CATALOGUE_SIMULATIONS } from '@/features/simulations/catalogue-simulations';
import { COURS_PAR_MATIERE } from '@/data/cours';
import type { RangSucces, SuccesProgression } from '@/db/donnees-principales';

const rankColors: Record<RangSucces, string> = {
  Gris: '#8B949E',
  Bronze: '#B67845',
  Fer: '#9AA4AE',
  Or: '#D8A94A',
  Diamant: '#7EA6E0',
};

type ThemeSucces = {
  panel: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
};

type ListeSuccesProps = {
  successes: SuccesProgression[];
  themeActif: ThemeSucces;
  limit?: number;
};

function availableCourseCount(subject?: SuccesProgression['subject']) {
  if (!subject || subject === 'programmation-java') {
    return 0;
  }

  return COURS_PAR_MATIERE[subject]?.length ?? 0;
}

function availableSimulationCount(subject?: SuccesProgression['subject']) {
  if (!subject || subject === 'java') {
    return 0;
  }

  return CATALOGUE_SIMULATIONS[subject]?.filter((simulation) => simulation.statut !== 'ferme').length ?? 0;
}

export default function ListeSucces({ successes, themeActif, limit }: ListeSuccesProps) {
  const visibleSuccesses = limit ? successes.slice(0, limit) : successes;

  return (
    <View style={styles.list}>
      {visibleSuccesses.map((success) => {
        const displayTarget = success.category === 'course' ? success.target : 5;
        const progressValue = Math.min(success.progress, displayTarget);
        const progressPercent = displayTarget > 0 ? Math.min(100, Math.round((progressValue / displayTarget) * 100)) : 0;
        const rankColor = rankColors[success.rang];
        const courseCount = availableCourseCount(success.subject);
        const simulationCount = availableSimulationCount(success.subject);
        const showCourseWarning = success.category === 'course' && success.target > courseCount;
        const showSimulationWarning = success.category === 'simulation' && displayTarget > simulationCount;

        return (
          <View
            key={success.id}
            style={[
              styles.card,
              {
                backgroundColor: themeActif.surface,
                borderColor: success.completed ? `${rankColor}90` : `${themeActif.border}25`,
              },
            ]}>
            <View style={styles.cardTop}>
              <View style={[styles.rankCircle, { backgroundColor: rankColor }]}>
                <MaterialIcons
                  name={success.completed ? 'military-tech' : 'lock-outline'}
                  size={18}
                  color="white"
                />
              </View>

              <View style={styles.textBlock}>
                <Text numberOfLines={1} style={[styles.title, { color: themeActif.text }]}>
                  {success.title}
                </Text>
                <Text numberOfLines={1} style={[styles.description, { color: themeActif.muted }]}>
                  {success.description}
                </Text>
              </View>

              <View style={styles.rankBlock}>
                <Text style={[styles.rankText, { color: rankColor }]}>{success.rang}</Text>
                <Text style={[styles.progressText, { color: themeActif.muted }]}>
                  {progressValue} / {displayTarget}
                </Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: themeActif.panel }]}>
              <View style={[styles.progressFill, { backgroundColor: rankColor, width: `${progressPercent}%` }]} />
            </View>

            {showCourseWarning || showSimulationWarning ? (
              <Text style={[styles.warningText, { color: themeActif.muted }]}>Plus de cours a venir</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    width: '100%',
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    minHeight: 104,
    padding: 12,
    width: '100%',
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rankCircle: {
    alignItems: 'center',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
  },
  description: {
    fontSize: 11,
    fontWeight: '700',
  },
  rankBlock: {
    alignItems: 'flex-end',
    minWidth: 62,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  progressTrack: {
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
