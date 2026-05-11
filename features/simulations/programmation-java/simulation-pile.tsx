import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
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

type OperationActive = 'ajout' | 'lecture' | 'retrait' | null;

type TraceOperation = {
  id: number;
  texte: string;
};

type ThemeSimulationPile = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationPile = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const ELEMENTS_INITIAUX = ['main()', 'addition(3, 5)', 'multiplier(2, 4)'];
const LIMITE_ELEMENTS = 10;

function normaliserValeur(texte: string) {
  return texte.trim().slice(0, 16);
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

function ElementPile({
  estSommet,
  estSurbrillant,
  index,
  valeur,
}: {
  estSommet: boolean;
  estSurbrillant: boolean;
  index: number;
  valeur: string;
}) {
  const couleurBordure = estSurbrillant ? themeActif.bounds : estSommet ? themeActif.approximationStroke : themeActif.border;
  const couleurFond = estSurbrillant ? themeActif.boundsSoft : estSommet ? themeActif.approximation : themeActif.surface;

  return (
    <View style={[styles.elementPile, { backgroundColor: couleurFond, borderColor: couleurBordure }]}>
      <View style={styles.rangeeElementPile}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexElement}>
          [{index}]
        </TexteTheme>
        {estSommet ? (
          <TexteTheme lightColor={themeActif.bounds} style={styles.roleElement}>
            sommet
          </TexteTheme>
        ) : null}
      </View>
      <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurElement}>
        {valeur}
      </TexteTheme>
    </View>
  );
}

export function SimulationPile() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const prochainIdTrace = useRef(1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [elements, definirElements] = useState(ELEMENTS_INITIAUX);
  const [valeurSaisie, definirValeurSaisie] = useState('');
  const [operationActive, definirOperationActive] = useState<OperationActive>(null);
  const [traces, definirTraces] = useState<TraceOperation[]>([]);

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const valeurNormalisee = normaliserValeur(valeurSaisie);
  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  const definirSurbrillance = useCallback((operation: OperationActive) => {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
    }

    definirOperationActive(operation);
    minuteurRef.current = setTimeout(() => definirOperationActive(null), 720);
  }, []);

  const ajouterTrace = useCallback((texte: string) => {
    definirTraces((tracesCourantes) => [
      ...tracesCourantes.slice(-4),
      { id: prochainIdTrace.current++, texte },
    ]);
  }, []);

  const empiler = useCallback(() => {
    const valeur = normaliserValeur(valeurSaisie);

    if (!valeur || elements.length >= LIMITE_ELEMENTS) {
      return;
    }

    definirElements((elementsCourants) => [...elementsCourants, valeur]);
    definirValeurSaisie('');
    definirSurbrillance('ajout');
    ajouterTrace(`push("${valeur}") : ajouté au sommet\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements.length, valeurSaisie]);

  const depiler = useCallback(() => {
    if (elements.length === 0) {
      return;
    }

    const valeur = elements[elements.length - 1];
    definirElements((elementsCourants) => elementsCourants.slice(0, -1));
    definirSurbrillance('retrait');
    ajouterTrace(`pop() -> "${valeur}" : sommet retiré\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements]);

  const lireSommet = useCallback(() => {
    if (elements.length === 0) {
      return;
    }

    definirSurbrillance('lecture');
    ajouterTrace(`peek() -> "${elements[elements.length - 1]}" : lecture du sommet\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements]);

  const reinitialiser = useCallback(() => {
    definirElements(ELEMENTS_INITIAUX);
    definirValeurSaisie('');
    definirTraces([]);
    definirSurbrillance(null);
  }, [definirSurbrillance]);

  const elementsDuSommetVersBase = [...elements].reverse();

  return (
    <SafeAreaView edges={[]} style={styles.zoneSecurisee}>
      <VueTheme lightColor={themeActif.background} style={styles.conteneur}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Pile - LIFO" domaine="programmation-java" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.zoneTravail, { flexDirection: estLarge ? 'row' : 'column', width: largeurZoneTravail }]}>
            <View style={[styles.colonneSimulation, { width: largeurSimulation }]}>
              <View style={styles.blocTitre}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.surtitre}>
                  Structure de données
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.titre}>
                  Pile - LIFO
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Dernier entré, premier sorti : les opérations se font uniquement au sommet.
                </TexteTheme>
              </View>

              <View style={styles.cadrePile}>
                <View style={styles.indicationSommet}>
                  <MaterialCommunityIcons color={themeActif.bounds} name="arrow-down-bold" size={18} />
                  <TexteTheme lightColor={themeActif.bounds} style={styles.etiquetteCote}>
                    Sommet : push(), pop(), peek()
                  </TexteTheme>
                </View>
                <View style={styles.pileOuverte}>
                  {elementsDuSommetVersBase.length > 0 ? (
                    elementsDuSommetVersBase.map((element, positionDepuisSommet) => {
                      const indexReel = elements.length - 1 - positionDepuisSommet;

                      return (
                        <ElementPile
                          key={`${element}-${indexReel}`}
                          estSommet={positionDepuisSommet === 0}
                          estSurbrillant={positionDepuisSommet === 0 && operationActive !== null}
                          index={indexReel}
                          valeur={element}
                        />
                      );
                    })
                  ) : (
                    <View style={styles.zoneVide}>
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteJournalVide}>
                        Pile vide
                      </TexteTheme>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Empiler" valeur="O(1)" />
                <CarteStatistique etiquette="Dépiler" valeur="O(1)" />
                <CarteStatistique etiquette="Lire sommet" valeur="O(1)" />
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.contenuCode}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>
                    {'Deque<String> pile = new ArrayDeque<>();\npile.push("appel");     // ajoute au sommet\npile.pop();             // retire le sommet\npile.peek();            // lit le sommet sans retirer\npile.isEmpty();         // vérifie si la pile est vide'}
                  </TexteTheme>
                </ScrollView>
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

            <View style={[styles.barreLaterale, estLarge ? styles.barreLateraleAligneeAnimation : null, { width: largeurPanneau }]}>
              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Valeur
                </TexteTheme>
                <TextInput
                  maxLength={16}
                  onChangeText={definirValeurSaisie}
                  onSubmitEditing={empiler}
                  placeholder="Nouvel appel"
                  placeholderTextColor={themeActif.mutedInk}
                  selectionColor={themeActif.bounds}
                  style={styles.champTexte}
                  value={valeurSaisie}
                />
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Opérations
                </TexteTheme>
                <BoutonOperation
                  accent={themeActif.approximationStroke}
                  desactive={!valeurNormalisee || elements.length >= LIMITE_ELEMENTS}
                  icone="plus"
                  onPress={empiler}>
                  push(valeur)
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationNegativeStroke} desactive={elements.length === 0} icone="tray-arrow-down" onPress={depiler}>
                  pop()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.bounds} desactive={elements.length === 0} icone="eye-outline" onPress={lireSommet}>
                  peek()
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  État
                </TexteTheme>
                <View style={styles.rangeeEtat}>
                  <MaterialCommunityIcons color={themeActif.bounds} name="tray-full" size={18} />
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteEtat}>
                    {elements.length} / {LIMITE_ELEMENTS} élément(s)
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
          "Une pile respecte l'ordre LIFO : le dernier élément ajouté est le premier retiré.",
          "En Java moderne, un Deque avec ArrayDeque remplace souvent Stack pour les opérations push, pop et peek.",
        ]}
        exampleLabel="Lecture rapide"
        exampleText="Le sommet est la seule zone manipulée; la base reste intacte tant que le sommet n'est pas retiré."
        eyebrow="Définition"
        title="Qu'est-ce qu'une pile ?"
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    barreLaterale: {
      gap: 16,
    },
    barreLateraleAligneeAnimation: {
      marginTop: 104,
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
    cadrePile: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 12,
      padding: 16,
      width: '100%',
    },
    carteCode: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
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
    contenuCode: {
      minWidth: '100%',
    },
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 650,
    },
    elementPile: {
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 6,
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    etiquetteCote: {
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    etiquetteStatistique: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 14,
      textTransform: 'uppercase',
    },
    grilleStatistiques: {
      gap: 10,
    },
    indexElement: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 14,
    },
    indicationSommet: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
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
    pileOuverte: {
      borderBottomColor: themeActif.border,
      borderBottomWidth: 2,
      borderLeftColor: themeActif.border,
      borderLeftWidth: 2,
      borderRightColor: themeActif.border,
      borderRightWidth: 2,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      gap: 9,
      minHeight: 250,
      padding: 12,
    },
    rangeeElementPile: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
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
    roleElement: {
      color: themeActif.bounds,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 14,
      textTransform: 'uppercase',
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
    valeurElement: {
      color: themeActif.ink,
      fontSize: 15,
      fontWeight: '900',
      lineHeight: 20,
    },
    valeurStatistique: {
      color: themeActif.ink,
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 22,
      marginTop: 5,
    },
    zoneSecurisee: {
      backgroundColor: couleurArrierePlan,
      flex: 1,
    },
    zoneTravail: {
      gap: 20,
    },
    zoneVide: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      minHeight: 180,
    },
  });
}
