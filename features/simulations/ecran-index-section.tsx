import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoEvidexe } from '@/components/logo-evidexe';
import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import { SymbolesMathematiquesFlottants } from '@/features/simulations/core/symboles-mathematiques-flottants';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';
import {
  CATALOGUE_SIMULATIONS,
  EntreeSimulation,
  SectionSimulation,
} from '@/features/simulations/catalogue-simulations';

type ProprietesEcranIndexSection = {
  section: SectionSimulation;
  title: string;
};

type FiltreTableauBord = string;
const TAILLE_PAGE = 10;

const THEME_MATHS = {
  background: '#EEF5ED',
  card: '#F3F1E7',
  cardAlt: '#E3E5D2',
  cardSoft: '#DDE4D5',
  chip: 'rgba(168, 181, 154, 0.34)',
  chipActive: 'rgba(168, 181, 154, 0.72)',
  coral: '#AAB18E',
  coralSoft: 'rgba(217, 123, 108, 0.24)',
  gold: '#8D9771',
  mint: '#C0D6C2',
  blue: '#A8B59A',
  ink: '#243B53',
  mutedInk: '#6E7F73',
  line: '#B7C7B0',
  sage: '#A8B59A',
};

const CONFIG_TABLEAU_BORD: Record<
  'mathematiques' | 'physique' | 'programmation-java',
  {
    categoryLabels: Record<string, string>;
    filters: { label: string; value: FiltreTableauBord }[];
    subtitle: string;
    title: string;
  }
  >={
  mathematiques: {
    categoryLabels: {
      'a-venir': 'A venir',
      analyse: 'Analyse',
      calcul: 'Calcul',
      'equations diff': 'Eq diff',
      fonctions: 'Fonctions',
      geometrie: 'Geometrie',
      approximations: 'Approximations',
      riemann: 'Riemann',
      signaux: 'Signaux',
      series: 'Series',
      trigonometrie: 'Trigonometrie',
      visualisation: 'Visualisation',
      vecteurs: 'Vecteurs',
      aires: 'Aires',
      derivees: 'Derivees',
      comportement: 'Comportement',
      convergence: 'Convergence',
    },
    filters: [
      { label: 'Actifs', value: 'pret' },
      { label: 'Calcul', value: 'calcul' },
      { label: 'Analyse', value: 'analyse' },
      { label: 'Fonctions', value: 'fonctions' },
      { label: 'Series', value: 'series' },
      { label: 'Signaux', value: 'signaux' },
      { label: 'Eq diff', value: 'equations diff' },
      { label: 'Geometrie', value: 'geometrie' },
      { label: 'Vecteurs', value: 'vecteurs' },
      { label: 'Visualisation', value: 'visualisation' },
      { label: 'A venir', value: 'bientot' },
    ],
    subtitle: 'Explore tes simulations dans une interface plus claire, plus douce et pensee pour reviser efficacement.',
    title: 'Simulation de Math',
  },
  physique: {
    categoryLabels: {
      'a-venir': 'A venir',
      electricite: 'Electricite',
      energie: 'Energie',
      mecanique: 'Mecanique',
      ondes: 'Ondes',
    },
    filters: [
      { label: 'Actifs', value: 'pret' },
      { label: 'Mecanique', value: 'mecanique' },
      { label: 'Ondes', value: 'ondes' },
      { label: 'Electricite', value: 'electricite' },
      { label: 'Energie', value: 'energie' },
      { label: 'A venir', value: 'bientot' },
    ],
    subtitle: 'Retrouve tes simulations de physique dans le meme espace organise, lisible et facile a parcourir.',
    title: 'Simulation de Physique',
  },
  'programmation-java': {
    categoryLabels: {
      'a-venir': 'A venir',
      'fonctionnalites-java': 'Fonctionnalites',
      'structures-donnees': 'Structures',
      tri: 'Tri',
    },
    filters: [
      { label: 'Tri', value: 'tri' },
      { label: 'Structures', value: 'structures-donnees' },
      { label: 'Fonctionnalites', value: 'fonctionnalites-java' },
    ],
    subtitle: 'Explore les algorithmes, les structures de donnees et les fonctionnalites Java dans un espace organise.',
    title: 'Simulation Java',
  },
};

const GROUPES_JAVA = [
  {
    icone: 'sort',
    titre: 'Tri',
    valeur: 'tri',
  },
  {
    icone: 'database-outline',
    titre: 'Structures de donnees',
    valeur: 'structures-donnees',
  },
  {
    icone: 'language-java',
    titre: 'Fonctionnalites Java',
    valeur: 'fonctionnalites-java',
  },
];

function obtenirDispositionCartesMaths(largeurEcran: number) {
  const largeurConteneur = Math.min(largeurEcran, 980);
  const largeurInterieure = largeurConteneur - 40;
  const deuxColonnes = largeurInterieure >= 760;
  const espaceGrille = 22;
  const espaceRangees = 34;

  return {
    largeurConteneur,
    espaceGrille,
    deuxColonnes,
    espaceRangees,
  };
}

function decouperEntrees<T>(elements: T[], tailleSegment: number) {
  const rangees: T[][] = [];

  for (let index = 0; index < elements.length; index += tailleSegment) {
    rangees.push(elements.slice(index, index + tailleSegment));
  }

  return rangees;
}

function correspondFiltreTableauBord(entree: EntreeSimulation, filtre: FiltreTableauBord) {
  if (filtre === 'pret' || filtre === 'bientot') {
    return entree.statut === filtre;
  }

  return entree.tags?.includes(filtre) ?? false;
}

function obtenirEtiquetteStatut(statut: EntreeSimulation['statut']) {
  if (statut === 'ferme') {
    return 'Verrouille';
  }

  if (statut === 'pret') {
    return 'Disponible';
  }

  return 'Bientot';
}

function obtenirStyleStatut(statut: EntreeSimulation['statut']) {
  if (statut === 'ferme') {
    return styles.statutFerme;
  }

  if (statut === 'pret') {
    return styles.statutPret;
  }

  return styles.statutBientot;
}

function EcranSectionTableauBord({
  configuration,
  entrees,
  section,
}: {
  configuration: (typeof CONFIG_TABLEAU_BORD)[SectionSimulation];
  entrees: EntreeSimulation[];
  section: SectionSimulation;
}) {
  const { width: largeur } = useWindowDimensions();
  const estFocalise = useIsFocused();
  const schemaCouleur = useSchemaCouleur();
  const themeApplication = obtenirThemeApplication(schemaCouleur === 'dark');
  const [requete, definirRequete] = useState('');
  const [filtresActifs, definirFiltresActifs] = useState<FiltreTableauBord[]>([]);
  const [menuFiltresOuvert, definirMenuFiltresOuvert] = useState(false);
  const [pageActive, definirPageActive] = useState(0);

  const requeteNormalisee = requete.trim().toLowerCase();
  const { largeurConteneur, espaceGrille, deuxColonnes, espaceRangees } = obtenirDispositionCartesMaths(largeur);

  const entreesFiltrees = useMemo(
    () =>
      entrees.filter((entree) => {
        const texteRecherchable = `${entree.title} ${entree.description ?? ''}`.toLowerCase();

        const correspondAuxFiltres =
          filtresActifs.length === 0 || filtresActifs.some((filtre) => correspondFiltreTableauBord(entree, filtre));

        return correspondAuxFiltres && texteRecherchable.includes(requeteNormalisee);
      }),
    [filtresActifs, entrees, requeteNormalisee]
  );
  const afficherGroupesJava = section === 'programmation-java';
  const nombrePages = afficherGroupesJava ? 1 : Math.max(1, Math.ceil(entreesFiltrees.length / TAILLE_PAGE));
  const entreesPage = useMemo(
    () =>
      afficherGroupesJava
        ? entreesFiltrees
        : entreesFiltrees.slice(pageActive * TAILLE_PAGE, (pageActive + 1) * TAILLE_PAGE),
    [afficherGroupesJava, pageActive, entreesFiltrees]
  );
  const rangeesCartes = useMemo(
    () => decouperEntrees(entreesPage, deuxColonnes ? 2 : 1),
    [deuxColonnes, entreesPage]
  );
  const groupesJava = useMemo(
    () =>
      GROUPES_JAVA.map((groupe) => ({
        ...groupe,
        entrees: entreesFiltrees.filter((entree) => entree.groupe === groupe.valeur),
      })).filter((groupe) => groupe.entrees.length > 0),
    [entreesFiltrees]
  );

  useEffect(() => {
    definirPageActive(0);
  }, [filtresActifs, requeteNormalisee]);

  useEffect(() => {
    if (pageActive >= nombrePages) {
      definirPageActive(Math.max(0, nombrePages - 1));
    }
  }, [pageActive, nombrePages]);

  const basculerFiltre = (filtre: FiltreTableauBord) => {
    definirFiltresActifs((filtresCourants) =>
      filtresCourants.includes(filtre)
        ? filtresCourants.filter((filtreCourant) => filtreCourant !== filtre)
        : [...filtresCourants, filtre]
    );
  };

  const choisirDivisionJava = (division: FiltreTableauBord) => {
    definirFiltresActifs((filtresCourants) => (filtresCourants.includes(division) ? [] : [division]));
  };

  const compterSimulationsDivisionJava = (division: string) =>
    entrees.filter((entree) => {
      const texteRecherchable = `${entree.title} ${entree.description ?? ''}`.toLowerCase();

      return entree.groupe === division && texteRecherchable.includes(requeteNormalisee);
    }).length;

  const rendreCarteSimulation = (entree: EntreeSimulation) => {
    const estFermee = entree.statut === 'ferme';

    return (
      <View key={entree.href} style={styles.cardSlot}>
        <Pressable
          disabled={estFermee}
          onPress={() => {
            if (!estFermee) {
              router.push(entree.href as Href);
            }
          }}
          style={({ pressed, hovered }) => [
            styles.mathCard,
            afficherGroupesJava ? styles.carteJava : null,
            estFermee ? styles.mathCardClosed : null,
            !estFermee && (pressed || hovered) ? styles.mathCardPressed : null,
          ]}>
          <View style={styles.mathCardTop}>
            <View style={styles.iconShell}>
              <MaterialCommunityIcons
                color={THEME_MATHS.coral}
                name={(entree.icon ?? 'book-open-variant') as keyof typeof MaterialCommunityIcons.glyphMap}
                size={22}
              />
            </View>

            <View style={styles.cardStatusRow}>
              <View
                style={[
                  styles.statusBadge,
                  obtenirStyleStatut(entree.statut),
                ]}>
                <TexteTheme
                  lightColor="#243B53"
                  style={styles.statusText}>
                  {obtenirEtiquetteStatut(entree.statut)}
                </TexteTheme>
              </View>
            </View>
          </View>

          <TexteTheme lightColor={THEME_MATHS.ink} style={styles.cardTitle}>
            {entree.title}
          </TexteTheme>

          <TexteTheme
            lightColor={THEME_MATHS.mutedInk}
            numberOfLines={3}
            style={[styles.cardDescription, afficherGroupesJava ? styles.descriptionCarteJava : null]}>
            {entree.description ?? 'Simulation interactive a ouvrir depuis cette fiche.'}
          </TexteTheme>

          {!afficherGroupesJava ? (
            <View style={styles.cardFooter}>
              <View style={styles.categoryRow}>
                {(entree.tags?.length ? entree.tags : ['a-venir']).slice(0, 3).map((tag) => (
                  <View key={`${entree.href}-${tag}`} style={styles.categoryBadge}>
                    <TexteTheme lightColor={THEME_MATHS.ink} style={styles.categoryText}>
                      {configuration.categoryLabels[tag] ?? tag}
                    </TexteTheme>
                  </View>
                ))}
              </View>

              <MaterialCommunityIcons color={THEME_MATHS.coral} name="arrow-right" size={20} />
            </View>
          ) : null}
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeApplication.background }]}>
      <VueTheme lightColor={themeApplication.background} darkColor={themeApplication.background} style={styles.mathSafeArea}>
        <SymbolesMathematiquesFlottants
          isActive={estFocalise}
          showGlow={false}
          style={[styles.pageBackground, { backgroundColor: themeApplication.background }]}
        />

        <ScrollView contentContainerStyle={styles.mathScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mathContainer}>
            <View
              style={[
                styles.mathHero,
                {
                  backgroundColor: themeApplication.surface,
                  borderColor: themeApplication.grid,
                },
              ]}>
              <Pressable onPress={() => router.push('/(tabs)/accueil' as Href)} style={styles.heroLogoButton}>
                <LogoEvidexe
                  resizeMode="contain"
                  style={styles.heroLogo}
                />
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/profil' as Href)}
                style={[
                  styles.heroProfileButton,
                  schemaCouleur === 'dark' ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
                ]}>
                <MaterialCommunityIcons color="#243B53" name="account-circle-outline" size={18} />
                <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.heroProfileText}>
                  Profil
                </TexteTheme>
              </Pressable>

              <TexteTheme
                lightColor={schemaCouleur === 'dark' ? themeApplication.text : THEME_MATHS.ink}
                style={styles.heroTitle}>
                {configuration.title}
              </TexteTheme>

              <TexteTheme
                lightColor={schemaCouleur === 'dark' ? themeApplication.muted : THEME_MATHS.mutedInk}
                style={styles.heroSubtitle}>
                {configuration.subtitle}
              </TexteTheme>

              <View
                style={[
                  styles.searchShell,
                  schemaCouleur === 'dark' ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
                ]}>
                <MaterialCommunityIcons color={THEME_MATHS.mutedInk} name="magnify" size={18} />
                <TextInput
                  onChangeText={definirRequete}
                  placeholder="Rechercher une simulation"
                  placeholderTextColor={THEME_MATHS.mutedInk}
                  selectionColor={THEME_MATHS.coral}
                  style={[styles.searchInput, schemaCouleur === 'dark' ? { color: themeApplication.ink } : null]}
                  value={requete}
                />
              </View>

              {!afficherGroupesJava ? (
              <View style={styles.filterWrap}>
                <Pressable
                  onPress={() => definirMenuFiltresOuvert((currentValue) => !currentValue)}
                  style={({ pressed, hovered }) => [
                    styles.filterButton,
                    schemaCouleur === 'dark' ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
                    menuFiltresOuvert ? styles.filterButtonOpen : null,
                    pressed || hovered ? styles.filterChipPressed : null,
                  ]}>
                  <View style={styles.filterButtonContent}>
                    <MaterialCommunityIcons color="#243B53" name="filter-variant" size={18} />
                    <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.filterButtonText}>
                      Filtre
                    </TexteTheme>
                    {filtresActifs.length > 0 ? (
                      <View style={styles.filterCountBadge}>
                        <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.filterCountText}>
                          {filtresActifs.length}
                        </TexteTheme>
                      </View>
                    ) : null}
                  </View>
                  <MaterialCommunityIcons
                    color="#243B53"
                    name={menuFiltresOuvert ? 'chevron-up' : 'chevron-down'}
                    size={18}
                  />
                </Pressable>

                {menuFiltresOuvert ? (
                  <View
                    style={[
                      styles.filterDropdown,
                      schemaCouleur === 'dark' ? { backgroundColor: themeApplication.panel, borderColor: themeApplication.border } : null,
                    ]}>
                    <View style={styles.filterOptionGrid}>
                      {configuration.filters.map((filtre) => {
                        const isActive = filtresActifs.includes(filtre.value);

                        return (
                          <Pressable
                            key={filtre.value}
                            onPress={() => basculerFiltre(filtre.value)}
                            style={({ pressed, hovered }) => [
                            styles.filterOption,
                            schemaCouleur === 'dark' ? { backgroundColor: '#FFFFFF', borderColor: themeApplication.border } : null,
                              isActive ? styles.filterOptionActive : null,
                              pressed || hovered ? styles.filterChipPressed : null,
                            ]}>
                            <View style={[styles.filterCheck, isActive ? styles.filterCheckActive : null]}>
                              {isActive ? <MaterialCommunityIcons color="#243B53" name="check" size={14} /> : null}
                            </View>
                            <TexteTheme
                              darkColor={isActive ? '#243B53' : '#5A6A58'}
                              lightColor={isActive ? '#243B53' : '#5A6A58'}
                              style={[styles.filterOptionText, isActive ? styles.filterOptionTextActive : null]}>
                              {filtre.label}
                            </TexteTheme>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </View>
              ) : null}
            </View>

            <View style={[styles.contentColumn, { width: largeurConteneur - 40 }]}>
              <View style={styles.sectionHeader}>
                <View>
                  <TexteTheme lightColor={THEME_MATHS.card} style={styles.sectionTitle}>
                    Bibliotheque de simulations
                  </TexteTheme>
                  <TexteTheme lightColor={THEME_MATHS.cardSoft} style={styles.sectionSubtitle}>
                    {entreesFiltrees.length} simulation{entreesFiltrees.length > 1 ? 's' : ''} visible{entreesFiltrees.length > 1 ? 's' : ''}
                  </TexteTheme>
                </View>

                {afficherGroupesJava ? (
                  <View style={styles.rangeeDivisionsJava}>
                    {GROUPES_JAVA.map((division) => {
                      const estActive = filtresActifs.includes(division.valeur);
                      const nombreSimulations = compterSimulationsDivisionJava(division.valeur);

                      return (
                        <Pressable
                          key={division.valeur}
                          onPress={() => choisirDivisionJava(division.valeur)}
                          style={({ pressed, hovered }) => [
                            styles.pastilleDivisionJava,
                            estActive ? styles.pastilleDivisionJavaActive : null,
                            pressed || hovered ? styles.filterChipPressed : null,
                          ]}>
                          <TexteTheme
                            darkColor={estActive ? '#243B53' : '#5A6A58'}
                            lightColor={estActive ? '#243B53' : '#5A6A58'}
                            style={styles.textePastilleDivisionJava}>
                            {division.titre}
                          </TexteTheme>
                          <View style={styles.compteurDivisionJava}>
                            <TexteTheme darkColor="#243B53" lightColor="#243B53" style={styles.texteCompteurDivisionJava}>
                              {nombreSimulations}
                            </TexteTheme>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : nombrePages > 1 ? (
                  <View style={styles.paginationRow}>
                    {Array.from({ length: nombrePages }, (_, index) => {
                      const isActive = index === pageActive;

                      return (
                        <Pressable
                          key={`page-${index + 1}`}
                          onPress={() => definirPageActive(index)}
                          style={({ pressed, hovered }) => [
                            styles.paginationChip,
                            schemaCouleur === 'dark' ? { backgroundColor: themeApplication.surface, borderColor: themeApplication.border } : null,
                            isActive ? styles.paginationChipActive : null,
                            pressed || hovered ? styles.filterChipPressed : null,
                          ]}>
                          <TexteTheme
                            darkColor={isActive ? '#243B53' : '#5A6A58'}
                            lightColor={isActive ? '#243B53' : '#5A6A58'}
                            style={styles.paginationChipText}>
                            Page {index + 1}
                          </TexteTheme>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>

              {entreesFiltrees.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons color={THEME_MATHS.blue} name="file-search-outline" size={28} />
                  <TexteTheme lightColor={THEME_MATHS.card} style={styles.emptyTitle}>
                    Aucun resultat
                  </TexteTheme>
                  <TexteTheme lightColor={THEME_MATHS.cardSoft} style={styles.emptyDescription}>
                    Essaie un autre mot-cle ou change le filtre.
                  </TexteTheme>
                </View>
              ) : (
                afficherGroupesJava ? (
                  <View style={styles.groupesJava}>
                    {groupesJava.map((groupe) => {
                      const rangeesGroupe = decouperEntrees(groupe.entrees, deuxColonnes ? 2 : 1);

                      return (
                        <View key={groupe.valeur} style={styles.groupeJava}>
                          <View style={styles.enteteGroupeJava}>
                            <View style={styles.iconShell}>
                              <MaterialCommunityIcons
                                color={THEME_MATHS.coral}
                                name={groupe.icone as keyof typeof MaterialCommunityIcons.glyphMap}
                                size={22}
                              />
                            </View>
                            <View style={styles.texteGroupeJava}>
                              <TexteTheme
                                lightColor={schemaCouleur === 'dark' ? themeApplication.text : THEME_MATHS.card}
                                style={styles.titreGroupeJava}>
                                {groupe.titre}
                              </TexteTheme>
                              <TexteTheme
                                lightColor={schemaCouleur === 'dark' ? themeApplication.muted : THEME_MATHS.cardSoft}
                                style={styles.sectionSubtitle}>
                                {groupe.entrees.length} simulation{groupe.entrees.length > 1 ? 's' : ''}
                              </TexteTheme>
                            </View>
                          </View>
                          <View style={[styles.cardGrid, { rowGap: espaceRangees }]}>
                            {rangeesGroupe.map((rangee, indexRangee) => (
                              <View
                                key={`${groupe.valeur}-${indexRangee}`}
                                style={[
                                  styles.cardRow,
                                  { columnGap: espaceGrille },
                                  !deuxColonnes ? styles.cardRowSingle : null,
                                ]}>
                                {rangee.map((entree) => rendreCarteSimulation(entree))}
                                {deuxColonnes && rangee.length === 1 ? <View style={styles.cardSlot} /> : null}
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={[styles.cardGrid, { rowGap: espaceRangees }]}>
                    {rangeesCartes.map((rangee, indexRangee) => (
                      <View
                        key={`rangee-${indexRangee}`}
                        style={[
                          styles.cardRow,
                          { columnGap: espaceGrille },
                          !deuxColonnes ? styles.cardRowSingle : null,
                        ]}>
                        {rangee.map((entree) => rendreCarteSimulation(entree))}
                        {deuxColonnes && rangee.length === 1 ? <View style={styles.cardSlot} /> : null}
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          </View>
        </ScrollView>
      </VueTheme>
    </SafeAreaView>
  );
}

function rendreEcranDefaut(title: string, entrees: EntreeSimulation[], section: SectionSimulation) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <VueTheme style={styles.container}>
        <TexteTheme type="title">{title}</TexteTheme>
        <TexteTheme style={styles.description}>Choisis une simulation.</TexteTheme>

        <ScrollView contentContainerStyle={styles.listContent} style={styles.list}>
          {entrees.length === 0 ? (
            <TexteTheme style={styles.description}>Aucune simulation pour l&#39;instant.</TexteTheme>
          ) : (
            entrees.map((entree) => (
              <Pressable
                disabled={entree.statut === 'ferme'}
                onPress={() => {
                  if (entree.statut !== 'ferme') {
                    donneesLocales.enregistrerClicSimulation(section, entree.href);
                    router.push(entree.href as Href);
                  }
                }}
                key={entree.href}
                style={[styles.card, entree.statut === 'ferme' ? styles.cardClosed : null]}>
                <TexteTheme type="defaultSemiBold">{entree.title}</TexteTheme>
              </Pressable>
            ))
          )}
        </ScrollView>
      </VueTheme>
    </SafeAreaView>
  );
}

export function EcranIndexSection({ section, title }: ProprietesEcranIndexSection) {
  const entrees = CATALOGUE_SIMULATIONS[section];

  if (section === 'mathematiques' || section === 'physique' || section === 'programmation-java') {
    return <EcranSectionTableauBord configuration={CONFIG_TABLEAU_BORD[section]} entrees={entrees} section={section} />;
  }

  return rendreEcranDefaut(title, entrees, section);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  description: {
    maxWidth: 460,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(188, 133, 89, 0.28)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardClosed: {
    opacity: 0.72,
  },
  mathSafeArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  pageBackground: {
    backgroundColor: '#EEF5ED',
    opacity: 1,
  },
  mathScrollContent: {
    paddingBottom: 36,
  },
  mathContainer: {
    alignSelf: 'center',
    gap: 22,
    maxWidth: 980,
    paddingHorizontal: 20,
    paddingTop: 14,
    width: '100%',
  },
  contentColumn: {
    gap: 18,
    width: '100%',
  },
  mathHero: {
    backgroundColor: '#F3F1E7',
    borderColor: '#A8B59A',
    borderRadius: 26,
    borderWidth: 2,
    gap: 14,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 24,
    position: 'relative',
    shadowColor: '#243B53',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    zIndex: 0,
  },
  heroLogoButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  heroLogo: {
    height: 42,
    width: 132,
  },
  heroProfileButton: {
    alignItems: 'center',
    backgroundColor: '#DDE4D5',
    borderColor: '#A8B59A',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    right: 22,
    top: 24,
    zIndex: 2,
  },
  heroProfileText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  heroTitle: {
    color: '#243B53',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  heroSubtitle: {
    color: '#4E6254',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  searchShell: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#AAB18E',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: '#243B53',
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterWrap: {
    alignSelf: 'flex-start',
    gap: 10,
    width: '100%',
  },
  filterButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F1E7',
    borderColor: '#A8B59A',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    minWidth: 136,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterButtonOpen: {
    borderColor: '#243B53',
  },
  filterButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  filterButtonText: {
    color: '#243B53',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  filterCountBadge: {
    alignItems: 'center',
    backgroundColor: '#DDE4D5',
    borderColor: '#A8B59A',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterCountText: {
    color: '#243B53',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  filterDropdown: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F1E7',
    borderColor: '#A8B59A',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: '#243B53',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: '100%',
  },
  filterOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#B7C7B0',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    minWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterOptionActive: {
    backgroundColor: '#DDE4D5',
    borderColor: '#243B53',
  },
  filterCheck: {
    alignItems: 'center',
    backgroundColor: '#F3F1E7',
    borderColor: '#A8B59A',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  filterCheckActive: {
    backgroundColor: '#AAB18E',
    borderColor: '#243B53',
  },
  filterOptionText: {
    color: '#5A6A58',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  filterOptionTextActive: {
    color: '#243B53',
    fontWeight: '800',
  },
  filterChipPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  sectionHeader: {
    alignItems: 'flex-start',
    gap: 6,
  },
  sectionTitle: {
    color: '#243B53',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  sectionSubtitle: {
    color: '#5C6F5E',
    fontSize: 14,
    lineHeight: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  paginationChip: {
    alignItems: 'center',
    backgroundColor: THEME_MATHS.chip,
    borderColor: 'rgba(36,59,83,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paginationChipActive: {
    backgroundColor: THEME_MATHS.chipActive,
    borderColor: '#243B53',
  },
  paginationChipText: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  rangeeDivisionsJava: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  pastilleDivisionJava: {
    alignItems: 'center',
    backgroundColor: THEME_MATHS.chip,
    borderColor: 'rgba(36,59,83,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pastilleDivisionJavaActive: {
    backgroundColor: THEME_MATHS.chipActive,
    borderColor: '#243B53',
  },
  textePastilleDivisionJava: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  compteurDivisionJava: {
    alignItems: 'center',
    backgroundColor: '#EEF5ED',
    borderColor: '#A8B59A',
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  texteCompteurDivisionJava: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  cardGrid: {
    gap: 0,
    width: '100%',
  },
  groupesJava: {
    gap: 34,
    width: '100%',
  },
  groupeJava: {
    gap: 16,
    width: '100%',
  },
  enteteGroupeJava: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  texteGroupeJava: {
    flex: 1,
    gap: 4,
  },
  titreGroupeJava: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
  },
  cardRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  cardRowSingle: {
    justifyContent: 'center',
  },
  cardSlot: {
    flex: 1,
  },
  mathCard: {
    backgroundColor: '#F3F1E7',
    borderColor: '#A8B59A',
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 14,
    height: 246,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#243B53',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  carteJava: {
    gap: 10,
    height: 190,
    paddingVertical: 16,
  },
  mathCardPressed: {
    borderColor: '#8D9771',
    transform: [{ translateY: 2 }],
  },
  mathCardClosed: {
    opacity: 0.72,
  },
  mathCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconShell: {
    alignItems: 'center',
    backgroundColor: '#DDE4D5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A8B59A',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardStatusRow: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 10,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statutPret: {
    backgroundColor: '#C0D6C2',
  },
  statutBientot: {
    backgroundColor: '#E3E5D2',
  },
  statutFerme: {
    backgroundColor: '#F2B36D',
  },
  statusText: {
    color: '#243B53',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  cardTitle: {
    color: '#243B53',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  cardDescription: {
    color: '#243B53',
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  descriptionCarteJava: {
    flex: 0,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  categoryRow: {
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: 6,
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: '#DDE4D5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A8B59A',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: '#243B53',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});

