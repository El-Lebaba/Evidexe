import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemesSimulationEcrans, obtenirThemesSimulationEcransInitial } from '@/constantes/theme';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type OperationActive = 'ajout' | 'insertion' | 'lecture' | 'retrait' | null;
type TraceOperation = {
  id: number;
  texte: string;
};

type ThemeSimulationArrayList = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationArrayList = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const ELEMENTS_INITIAUX = ['Pomme', 'Banane', 'Cerise', 'Datte'];
const LIMITE_ELEMENTS = 16;

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function calculerCapacite(taille: number) {
  return Math.max(8, 2 ** Math.ceil(Math.log2(taille + 1)));
}

function normaliserValeur(texte: string) {
  return texte.trim().slice(0, 12);
}

function CarteStatistique({ etiquette, valeur }: { etiquette: string; valeur: string | number }) {
  return (
    <View style={styles.carteStatistique}>
      <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
        {etiquette}
      </TexteTheme>
      <TexteTheme lightColor={themeActif.ink} style={styles.valeurStatistique}>
        {valeur}
      </TexteTheme>
    </View>
  );
}

function BoutonOperation({
  accent,
  children,
  desactive = false,
  icone,
  onPress,
}: {
  accent?: string;
  children: string;
  desactive?: boolean;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={desactive}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.boutonOperation,
        { borderColor: accent ?? themeActif.border },
        desactive ? styles.boutonDesactive : null,
        pressed || hovered ? styles.boutonAppuye : null,
      ]}>
      <MaterialCommunityIcons color={accent ?? themeActif.ink} name={icone} size={18} />
      <TexteTheme lightColor={themeActif.ink} style={styles.texteBoutonOperation}>
        {children}
      </TexteTheme>
    </Pressable>
  );
}

function CelluleArrayList({
  estActive,
  estVide,
  index,
  onLire,
  onRetirer,
  valeur,
}: {
  estActive: boolean;
  estVide?: boolean;
  index: number;
  onLire?: () => void;
  onRetirer?: () => void;
  valeur?: string;
}) {
  const couleurBordure = estActive ? themeActif.bounds : estVide ? themeActif.gridSoft : themeActif.approximationStroke;
  const couleurFond = estActive ? themeActif.boundsSoft : estVide ? 'transparent' : themeActif.surface;

  return (
    <View
      style={[
        styles.cellule,
        {
          backgroundColor: couleurFond,
          borderColor: couleurBordure,
          opacity: estVide ? 0.58 : 1,
        },
      ]}>
      <View style={[styles.enteteCellule, { backgroundColor: estVide ? 'transparent' : themeActif.panel }]}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexCellule}>
          [{index}]
        </TexteTheme>
      </View>
      <View style={styles.corpsCellule}>
        <TexteTheme
          lightColor={estVide ? themeActif.mutedInk : themeActif.ink}
          numberOfLines={1}
          style={[styles.valeurCellule, estVide ? styles.valeurVide : null]}>
          {estVide ? 'null' : valeur}
        </TexteTheme>
        {!estVide ? (
          <View style={styles.actionsCellule}>
            <Pressable onPress={onLire} style={styles.boutonIconeCellule}>
              <MaterialCommunityIcons color={themeActif.bounds} name="flash-outline" size={15} />
            </Pressable>
            <Pressable onPress={onRetirer} style={styles.boutonIconeCellule}>
              <MaterialCommunityIcons color={themeActif.approximationNegativeStroke} name="trash-can-outline" size={15} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function SimulationArrayList() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const prochainIdTrace = useRef(1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [elements, definirElements] = useState(ELEMENTS_INITIAUX);
  const [valeurSaisie, definirValeurSaisie] = useState('');
  const [indexSaisi, definirIndexSaisi] = useState('0');
  const [operationActive, definirOperationActive] = useState<OperationActive>(null);
  const [indicesActifs, definirIndicesActifs] = useState<number[]>([]);
  const [traces, definirTraces] = useState<TraceOperation[]>([]);

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const capacite = useMemo(() => calculerCapacite(elements.length), [elements.length]);
  const tauxOccupation = elements.length / capacite;
  const emplacementsVides = useMemo(
    () => Array.from({ length: Math.max(0, capacite - elements.length) }, (_, index) => elements.length + index),
    [capacite, elements.length]
  );
  const indexNumerique = borner(Number.parseInt(indexSaisi, 10) || 0, 0, Math.max(elements.length, 0));
  const prochaineInsertionAgrandit = elements.length >= capacite;
  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  const definirSurbrillance = useCallback((operation: OperationActive, indices: number[]) => {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
    }

    definirOperationActive(operation);
    definirIndicesActifs(indices);
    minuteurRef.current = setTimeout(() => {
      definirOperationActive(null);
      definirIndicesActifs([]);
    }, 760);
  }, []);

  const ajouterTrace = useCallback((texte: string) => {
    definirTraces((tracesCourantes) => [
      ...tracesCourantes.slice(-4),
      { id: prochainIdTrace.current++, texte },
    ]);
  }, []);

  const ajouterFin = useCallback(() => {
    const valeur = normaliserValeur(valeurSaisie);

    if (!valeur || elements.length >= LIMITE_ELEMENTS) {
      return;
    }

    const nouvelleTaille = elements.length + 1;
    const capaciteAvant = capacite;
    definirElements((elementsCourants) => [...elementsCourants, valeur]);
    definirValeurSaisie('');
    definirSurbrillance('ajout', [elements.length]);
    ajouterTrace(
      `add("${valeur}") : O(1) amorti${nouvelleTaille > capaciteAvant ? `, capacité doublée à ${calculerCapacite(nouvelleTaille)}` : ''}`
    );
  }, [ajouterTrace, capacite, definirSurbrillance, elements.length, valeurSaisie]);

  const insererAIndice = useCallback(() => {
    const valeur = normaliserValeur(valeurSaisie);
    const indexInsertion = borner(Number.parseInt(indexSaisi, 10) || 0, 0, elements.length);

    if (!valeur || elements.length >= LIMITE_ELEMENTS) {
      return;
    }

    definirElements((elementsCourants) => {
      const prochaineListe = [...elementsCourants];
      prochaineListe.splice(indexInsertion, 0, valeur);
      return prochaineListe;
    });
    definirValeurSaisie('');
    definirSurbrillance(
      'insertion',
      Array.from({ length: elements.length - indexInsertion + 1 }, (_, index) => indexInsertion + index)
    );
    ajouterTrace(`add(${indexInsertion}, "${valeur}") : O(n), ${elements.length - indexInsertion} décalage(s) vers la droite`);
  }, [ajouterTrace, definirSurbrillance, elements.length, indexSaisi, valeurSaisie]);

  const retirerAIndice = useCallback(
    (indexRetrait: number) => {
      const valeur = elements[indexRetrait];

      if (valeur === undefined) {
        return;
      }

      definirElements((elementsCourants) => elementsCourants.filter((_, index) => index !== indexRetrait));
      definirSurbrillance(
        'retrait',
        Array.from({ length: Math.max(1, elements.length - indexRetrait) }, (_, index) => indexRetrait + index)
      );
      ajouterTrace(`remove(${indexRetrait}) -> "${valeur}" : O(n), ${Math.max(0, elements.length - indexRetrait - 1)} décalage(s)`);
    },
    [ajouterTrace, definirSurbrillance, elements]
  );

  const lireAIndice = useCallback(
    (indexLecture: number) => {
      const valeur = elements[indexLecture];

      if (valeur === undefined) {
        return;
      }

      definirSurbrillance('lecture', [indexLecture]);
      ajouterTrace(`get(${indexLecture}) -> "${valeur}" : O(1), accès direct par index`);
    },
    [ajouterTrace, definirSurbrillance, elements]
  );

  const lireIndexSaisi = useCallback(() => {
    lireAIndice(borner(Number.parseInt(indexSaisi, 10) || 0, 0, Math.max(elements.length - 1, 0)));
  }, [elements.length, indexSaisi, lireAIndice]);

  const reinitialiser = useCallback(() => {
    definirElements(ELEMENTS_INITIAUX);
    definirValeurSaisie('');
    definirIndexSaisi('0');
    definirTraces([]);
    definirSurbrillance(null, []);
  }, [definirSurbrillance]);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="ArrayList" domaine="programmation-java" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.zoneTravail, { flexDirection: estLarge ? 'row' : 'column', width: largeurZoneTravail }]}>
            <View style={[styles.colonneSimulation, { width: largeurSimulation }]}>
              <View style={styles.blocTitre}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.surtitre}>
                  Structure de données
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.titre}>
                  ArrayList
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Tableau dynamique : accès direct rapide, insertion et retrait plus coûteux au milieu.
                </TexteTheme>
              </View>

              <View style={styles.cadreMemoire}>
                <View style={styles.enteteMemoire}>
                  <View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
                      Occupation
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.valeurOccupation}>
                      {elements.length} / {capacite}
                    </TexteTheme>
                  </View>
                  <TexteTheme
                    lightColor={tauxOccupation >= 0.75 ? themeActif.bounds : themeActif.mutedInk}
                    style={styles.indicationCapacite}>
                    {prochaineInsertionAgrandit ? 'Prochain ajout : redimensionnement' : 'Capacité disponible'}
                  </TexteTheme>
                </View>
                <View style={styles.pisteCapacite}>
                  <View
                    style={[
                      styles.remplissageCapacite,
                      {
                        backgroundColor: tauxOccupation >= 0.75 ? themeActif.bounds : themeActif.approximationStroke,
                        width: `${tauxOccupation * 100}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.grilleCellules}>
                  {elements.map((element, index) => (
                    <CelluleArrayList
                      estActive={indicesActifs.includes(index)}
                      index={index}
                      key={`${index}-${element}`}
                      onLire={() => lireAIndice(index)}
                      onRetirer={() => retirerAIndice(index)}
                      valeur={element}
                    />
                  ))}
                  {emplacementsVides.map((index) => (
                    <CelluleArrayList estActive={false} estVide index={index} key={`vide-${index}`} />
                  ))}
                </View>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Lecture" valeur="O(1)" />
                <CarteStatistique etiquette="Ajout fin" valeur="O(1) amorti" />
                <CarteStatistique etiquette="Milieu" valeur="O(n)" />
              </View>

              <View style={styles.carteCode}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteCode}>{'ArrayList<String> liste = new ArrayList<>();'}</TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.add("item");        // O(1) amorti'}</TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.add(0, "item");     // O(n), décale à droite'}</TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.get(2);             // O(1), index direct'}</TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.remove(1);          // O(n), décale à gauche'}</TexteTheme>
              </View>

              <View style={styles.journal}>
                {traces.length > 0 ? (
                  traces.map((trace) => (
                    <TexteTheme key={trace.id} lightColor={themeActif.ink} style={styles.texteJournal}>
                      {`-> ${trace.texte}`}
                    </TexteTheme>
                  ))
                ) : (
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteJournalVide}>
                    Les opérations apparaîtront ici.
                  </TexteTheme>
                )}
              </View>
            </View>

            <View style={[styles.barreLaterale, { width: largeurPanneau }]}>
              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Valeur
                </TexteTheme>
                <TextInput
                  maxLength={12}
                  onChangeText={definirValeurSaisie}
                  placeholder="Nouvel élément"
                  placeholderTextColor={themeActif.mutedInk}
                  selectionColor={themeActif.bounds}
                  style={styles.champTexte}
                  value={valeurSaisie}
                />
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={definirIndexSaisi}
                  placeholder="Index"
                  placeholderTextColor={themeActif.mutedInk}
                  selectionColor={themeActif.bounds}
                  style={styles.champTexte}
                  value={indexSaisi}
                />
                <View style={styles.indicateurIndex}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteIndicateurIndex}>
                    Index ciblé
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.ink} style={styles.valeurIndex}>
                    {indexNumerique}
                  </TexteTheme>
                </View>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Opérations
                </TexteTheme>
                <BoutonOperation
                  accent={themeActif.approximationStroke}
                  desactive={!normaliserValeur(valeurSaisie) || elements.length >= LIMITE_ELEMENTS}
                  icone="plus"
                  onPress={ajouterFin}>
                  add(valeur)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.bounds}
                  desactive={!normaliserValeur(valeurSaisie) || elements.length >= LIMITE_ELEMENTS}
                  icone="table-row-plus-after"
                  onPress={insererAIndice}>
                  add(index, valeur)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.accent}
                  desactive={elements.length === 0}
                  icone="flash-outline"
                  onPress={lireIndexSaisi}>
                  get(index)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.approximationNegativeStroke}
                  desactive={elements.length === 0}
                  icone="trash-can-outline"
                  onPress={() => retirerAIndice(borner(Number.parseInt(indexSaisi, 10) || 0, 0, Math.max(elements.length - 1, 0)))}>
                  remove(index)
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  État
                </TexteTheme>
                <View style={styles.rangeeEtat}>
                  <MaterialCommunityIcons
                    color={operationActive ? themeActif.bounds : themeActif.mutedInk}
                    name={operationActive ? 'pulse' : 'database-outline'}
                    size={20}
                  />
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteEtat}>
                    {operationActive ? `Opération : ${operationActive}` : 'Aucune opération active'}
                  </TexteTheme>
                </View>
                <BoutonOperation icone="restart" onPress={reinitialiser}>
                  Réinitialiser
                </BoutonOperation>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Une ArrayList garde ses éléments dans un tableau interne. Quand ce tableau est plein, elle crée un tableau plus grand puis copie les valeurs.",
          "Lire avec get(index) est rapide, car l'index pointe directement vers une case. Insérer ou retirer au milieu demande de décaler les éléments voisins.",
        ]}
        delayMs={5000}
        exampleLabel="Lecture rapide"
        exampleText="add à la fin est généralement O(1), mais add au milieu et remove au milieu sont O(n)."
        eyebrow="Définition"
        title="Qu'est-ce qu'une ArrayList ?"
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    actionsCellule: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 6,
    },
    barreLaterale: {
      gap: 16,
    },
    blocTitre: {
      gap: 6,
    },
    boutonAppuye: {
      transform: [{ translateY: 1 }],
    },
    boutonDesactive: {
      opacity: 0.45,
    },
    boutonIconeCellule: {
      alignItems: 'center',
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      height: 28,
      justifyContent: 'center',
      width: 28,
    },
    boutonOperation: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 9,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cadreMemoire: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 14,
      padding: 16,
      width: '100%',
    },
    carteCode: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    carteStatistique: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minHeight: 66,
      minWidth: 132,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cellule: {
      borderRadius: 8,
      borderWidth: 1.5,
      minHeight: 92,
      minWidth: 92,
      overflow: 'hidden',
      width: '23%',
    },
    champTexte: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      color: themeActif.ink,
      fontSize: 15,
      fontWeight: '700',
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    colonneSimulation: {
      gap: 16,
    },
    conteneur: {
      backgroundColor: couleurArrierePlan,
      flex: 1,
    },
    contenu: {
      alignItems: 'center',
      flexGrow: 1,
      paddingBottom: 28,
      paddingHorizontal: 12,
      paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
    },
    corpsCellule: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 9,
    },
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 650,
    },
    enteteCellule: {
      alignItems: 'center',
      borderBottomColor: themeActif.border,
      borderBottomWidth: 1,
      minHeight: 28,
      justifyContent: 'center',
    },
    enteteMemoire: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    etiquetteStatistique: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 14,
      textTransform: 'uppercase',
    },
    grilleCellules: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      width: '100%',
    },
    grilleStatistiques: {
      gap: 10,
    },
    indicationCapacite: {
      color: themeActif.mutedInk,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
      textAlign: 'right',
    },
    indexCellule: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 14,
    },
    indicateurIndex: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 44,
      paddingHorizontal: 12,
    },
    journal: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 5,
      minHeight: 92,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    panneau: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 12,
      padding: 16,
      width: '100%',
    },
    pisteCapacite: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 999,
      borderWidth: 1,
      height: 14,
      overflow: 'hidden',
    },
    rangeeEtat: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      minHeight: 44,
      paddingHorizontal: 12,
    },
    remplissageCapacite: {
      borderRadius: 999,
      height: '100%',
    },
    superpositionEntete: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 10,
    },
    surtitre: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    texteBoutonOperation: {
      color: themeActif.ink,
      flex: 1,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
    },
    texteCode: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 18,
    },
    texteEtat: {
      color: themeActif.ink,
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 18,
    },
    texteIndicateurIndex: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    texteJournal: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 17,
    },
    texteJournalVide: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 18,
    },
    titre: {
      color: themeActif.ink,
      fontSize: 34,
      fontWeight: '900',
      lineHeight: 40,
    },
    titrePanneau: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    valeurCellule: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      maxWidth: '100%',
      textAlign: 'center',
    },
    valeurIndex: {
      color: themeActif.ink,
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 23,
    },
    valeurOccupation: {
      color: themeActif.ink,
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 23,
      marginTop: 2,
    },
    valeurStatistique: {
      color: themeActif.ink,
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 22,
      marginTop: 5,
    },
    valeurVide: {
      fontFamily: 'monospace',
      fontSize: 12,
    },
    zoneSecurisee: {
      backgroundColor: couleurArrierePlan,
      flex: 1,
    },
    zoneTravail: {
      gap: 20,
    },
  });
}
