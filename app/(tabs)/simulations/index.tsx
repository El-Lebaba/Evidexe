import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obtenirThemeApplication } from '@/constantes/theme';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

const palette = obtenirThemeApplication(false);

const sections = [
  {
    key: 'mathematiques',
    title: 'Math',
    icon: 'functions',
    color: palette.blue,
    href: '/(tabs)/mathematiques' as const,
  },
  {
    key: 'physique',
    title: 'Physique',
    icon: 'science',
    color: palette.yellow,
    href: '/(tabs)/physique' as const,
  },
  {
    key: 'java',
    title: 'Java',
    icon: 'code',
    color: palette.red,
    href: '/(tabs)/programmation-java' as const,
  },
];

export default function SimulationsHubScreen() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const themeActif = obtenirThemeApplication(modeSombre);
  const sectionColors = [themeActif.blue, themeActif.yellow, themeActif.red];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeActif.background }]}>
      <View style={[styles.page, { backgroundColor: themeActif.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={themeActif.text} />
          <Text style={[styles.backText, { color: themeActif.text }]}>Retour</Text>
        </Pressable>

        <Text style={[styles.eyebrow, { color: themeActif.green }]}>Simulations</Text>
        <Text style={[styles.title, { color: themeActif.text }]}>Choisis une section temporaire</Text>
        <Text style={[styles.copy, { color: themeActif.muted }]}>
          Cette page sert de point de passage pour l&apos;instant. Chaque bouton ouvre la section
          correspondante.
        </Text>

        <View style={styles.buttonStack}>
          {sections.map((section, index) => {
            const sectionColor = sectionColors[index % sectionColors.length];

            return (
            <Pressable
              key={section.key}
              onPress={() => router.push(section.href as Href)}
              style={({ pressed }) => [
                styles.sectionButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: sectionColor,
                },
                pressed && styles.sectionButtonPressed,
              ]}>
              <View style={[styles.sectionIcon, { backgroundColor: sectionColor }]}>
                <MaterialIcons name={section.icon as never} size={24} color={themeActif.ink} />
              </View>
              <Text style={[styles.sectionTitle, { color: themeActif.ink }]}>{section.title}</Text>
              <MaterialIcons name="chevron-right" size={26} color={themeActif.muted} />
            </Pressable>
          )})}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  page: {
    backgroundColor: palette.background,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 26,
    paddingVertical: 8,
  },
  backText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  eyebrow: {
    color: palette.green,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: 8,
    maxWidth: 300,
  },
  copy: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 340,
  },
  buttonStack: {
    gap: 14,
    marginTop: 28,
  },
  sectionButton: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 14,
    minHeight: 86,
    paddingHorizontal: 18,
  },
  sectionButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  sectionTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
  },
});

