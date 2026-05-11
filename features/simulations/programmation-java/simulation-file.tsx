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

type ThemeSimulationFile = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationFile = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const ELEMENTS_INITIAUX = ['Tâche A', 'Tâche B', 'Tâche C'];
const LIMITE_ELEMENTS = 12;

function normaliserValeur(texte: string) {
  return texte.trim().slice(0, 14);
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

function ElementFile({
  estArriere,
  estAvant,
  estSurbrillant,
  index,
  valeur,
}: {
  estArriere: boolean;
  estAvant: boolean;
  estSurbrillant: boolean;
  index: number;
  valeur: string;
}) {
  const couleurBordure = estSurbrillant ? themeActif.bounds : estAvant ? themeActif.approximationNegativeStroke : estArriere ? themeActif.approximationStroke : themeActif.border;
  const couleurFond = estSurbrillant ? themeActif.boundsSoft : estAvant ? themeActif.approximationNegative : estArriere ? themeActif.approximation : themeActif.surface;

  return (
    <View style={[styles.elementFile, { backgroundColor: couleurFond, borderColor: couleurBordure }]}>
      <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexElement}>
        [{index}]
      </TexteTheme>
      <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurElement}>
        {valeur}
      </TexteTheme>
      <TexteTheme lightColor={themeActif.mutedInk} style={styles.roleElement}>
        {estAvant ? 'avant' : estArriere ? 'arrière' : 'en attente'}
      </TexteTheme>
    </View>
  );
}

export function SimulationFile() {
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

  const ajouterEnFile = useCallback(() => {
    const valeur = normaliserValeur(valeurSaisie);

    if (!valeur || elements.length >= LIMITE_ELEMENTS) {
      return;
    }

    definirElements((elementsCourants) => [...elementsCourants, valeur]);
    definirValeurSaisie('');
    definirSurbrillance('ajout');
    ajouterTrace(`offer("${valeur}") : ajouté à l'arrière\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements.length, valeurSaisie]);

  const retirerDeFile = useCallback(() => {
    if (elements.length === 0) {
      return;
    }

    const valeur = elements[0];
    definirElements((elementsCourants) => elementsCourants.slice(1));
    definirSurbrillance('retrait');
    ajouterTrace(`poll() -> "${valeur}" : retiré à l'avant\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements]);

  const lireAvant = useCallback(() => {
    if (elements.length === 0) {
      return;
    }

    definirSurbrillance('lecture');
    ajouterTrace(`peek() -> "${elements[0]}" : lecture de l'avant\n(O(1))`);
  }, [ajouterTrace, definirSurbrillance, elements]);

  const reinitialiser = useCallback(() => {
    definirElements(ELEMENTS_INITIAUX);
    definirValeurSaisie('');
    definirTraces([]);
    definirSurbrillance(null);
  }, [definirSurbrillance]);

  return (
    <SafeAreaView edges={[]} style={styles.zoneSecurisee}>
      <VueTheme lightColor={themeActif.background} style={styles.conteneur}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="File - FIFO" domaine="programmation-java" />
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
                  File - FIFO
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Premier entré, premier sorti : on ajoute à l&#39;arrière et on retire à l&#39;avant.
                </TexteTheme>
              </View>

              <View style={styles.cadreMemoire}>
                <View style={styles.enteteMemoire}>
                  <TexteTheme lightColor={themeActif.approximationNegativeStroke} style={styles.etiquetteCote}>
                    Avant : poll()
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.approximationStroke} style={styles.etiquetteCote}>
                    offer() : arrière
                  </TexteTheme>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.rangeeElements}>
                  {elements.length > 0 ? (
                    elements.map((element, index) => (
                      <ElementFile
                        key={`${element}-${index}`}
                        estArriere={index === elements.length - 1}
                        estAvant={index === 0}
                        estSurbrillant={
                          (operationActive === 'ajout' && index === elements.length - 1) ||
                          ((operationActive === 'lecture' || operationActive === 'retrait') && index === 0)
                        }
                        index={index}
                        valeur={element}
                      />
                    ))
                  ) : (
                    <View style={styles.zoneVide}>
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteJournalVide}>
                        File vide
                      </TexteTheme>
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Ajout arrière" valeur="O(1)" />
                <CarteStatistique etiquette="Retrait avant" valeur="O(1)" />
                <CarteStatistique etiquette="Lecture avant" valeur="O(1)" />
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.contenuCode}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>
                    {'Queue<String> file = new ArrayDeque<>();\nfile.offer("élément");  // ajoute à l’arrière\nfile.poll();             // retire à l’avant\nfile.peek();             // lit l’avant sans retirer\nfile.size();             // nombre d’éléments'}
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
                  maxLength={14}
                  onChangeText={definirValeurSaisie}
                  onSubmitEditing={ajouterEnFile}
                  placeholder="Nouvelle tâche"
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
                  onPress={ajouterEnFile}>
                  offer(valeur)
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationNegativeStroke} desactive={elements.length === 0} icone="tray-arrow-up" onPress={retirerDeFile}>
                  poll()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.bounds} desactive={elements.length === 0} icone="eye-outline" onPress={lireAvant}>
                  peek()
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  État
                </TexteTheme>
                <View style={styles.rangeeEtat}>
                  <MaterialCommunityIcons color={themeActif.bounds} name="format-list-numbered" size={18} />
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
          "Une file respecte l'ordre FIFO : le premier élément ajouté est le premier retiré.",
          "En Java, on utilise souvent Queue avec ArrayDeque pour obtenir offer, poll et peek en temps constant.",
        ]}
        exampleLabel="Lecture rapide"
        exampleText="L'avant est le prochain élément servi; l'arrière reçoit les nouveaux éléments."
        eyebrow="Définition"
        title="Qu'est-ce qu'une file ?"
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
    cadreMemoire: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 14,
      minHeight: 150,
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
    elementFile: {
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 5,
      justifyContent: 'center',
      minHeight: 88,
      minWidth: 116,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    enteteMemoire: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
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
    rangeeElements: {
      alignItems: 'stretch',
      gap: 10,
      minWidth: '100%',
      paddingVertical: 2,
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
      color: themeActif.mutedInk,
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
      justifyContent: 'center',
      minHeight: 88,
      width: '100%',
    },
  });
}
