/**
 * Simulation Java de liste chaînée.
 *
 * La liste est représentée par un tableau de noeuds `{ id, valeur }`, mais le
 * dessin ajoute des flèches pour représenter les références `next`. Les ajouts
 * en tête/queue et les retraits changent l'ordre des noeuds sans montrer une
 * mémoire réelle complète.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
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
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type NoeudListe = {
  id: number;
  valeur: string;
};

type OperationActive = 'ajout-tete' | 'ajout-queue' | 'lecture' | 'retrait' | null;

type TraceOperation = {
  id: number;
  texte: string;
};

type ProprietesCurseur = {
  etiquette: string;
  maximum: number;
  minimum: number;
  modifierValeur: (valeur: number) => void;
  pas: number;
  suffixe?: string;
  valeur: number;
};

type ThemeSimulationListeChainee = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationListeChainee = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const VALEURS_REINITIALISATION = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const LIMITE_NOEUDS = 10;

const WEB_SLIDER_INTERACTION_STYLE =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirAuPas(valeur: number, pas: number) {
  return Math.round(valeur / pas) * pas;
}

function normaliserValeur(texte: string) {
  return texte.trim().slice(0, 12);
}

function obtenirLibelleOperation(operation: OperationActive) {
  switch (operation) {
    case 'ajout-tete':
      return 'ajout en tête';
    case 'ajout-queue':
      return 'ajout en queue';
    case 'lecture':
      return 'lecture';
    case 'retrait':
      return 'retrait';
    default:
      return 'aucune';
  }
}

function creerNoeudsDepart(nombreNoeuds: number, prochainId: { current: number }) {
  return VALEURS_REINITIALISATION.slice(0, nombreNoeuds).map((valeur) => ({
    id: prochainId.current++,
    valeur,
  }));
}

function CurseurListe({
  etiquette,
  maximum,
  minimum,
  modifierValeur,
  pas,
  suffixe = '',
  valeur,
}: ProprietesCurseur) {
  const definirDepuisEvenement = useCallback((event: GestureResponderEvent) => {
    event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, positionPageX) => {
      const position = borner(event.nativeEvent.pageX - positionPageX, 0, largeurMesuree);
      const valeurBrute = minimum + (position / largeurMesuree) * (maximum - minimum);
      const prochaineValeur = borner(arrondirAuPas(valeurBrute, pas), minimum, maximum);

      modifierValeur(Number(prochaineValeur.toFixed(0)));
    });
  }, [maximum, minimum, modifierValeur, pas]);

  const repondeurPanoramique = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: definirDepuisEvenement,
        onPanResponderMove: definirDepuisEvenement,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
      }),
    [definirDepuisEvenement]
  );

  const pourcentage = ((valeur - minimum) / (maximum - minimum)) * 100;

  return (
    <View style={styles.blocCurseur}>
      <View style={styles.enteteCurseur}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquettePanneau}>
          {etiquette}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.ink} style={styles.valeurCurseur}>
          {valeur}
          {suffixe}
        </TexteTheme>
      </View>
      <View {...repondeurPanoramique.panHandlers} style={[styles.pisteCurseur, WEB_SLIDER_INTERACTION_STYLE]}>
        <View style={[styles.remplissageCurseur, { width: `${pourcentage}%` }]} />
        <View style={[styles.poigneeCurseur, WEB_SLIDER_INTERACTION_STYLE, { left: `${pourcentage}%` }]} />
      </View>
    </View>
  );
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

function NoeudVisuel({
  estActif,
  estFin,
  estParcouru,
  index,
  noeud,
  onLire,
  onRetirer,
}: {
  estActif: boolean;
  estFin: boolean;
  estParcouru: boolean;
  index: number;
  noeud: NoeudListe;
  onLire: () => void;
  onRetirer: () => void;
}) {
  const couleurBordure = estActif ? themeActif.bounds : estParcouru ? themeActif.approximationStroke : themeActif.border;
  const couleurFond = estActif ? themeActif.boundsSoft : estParcouru ? themeActif.approximation : themeActif.surface;

  return (
    <View style={styles.groupeNoeud}>
      <View style={[styles.noeud, { backgroundColor: couleurFond, borderColor: couleurBordure }]}>
        <View style={styles.enteteNoeud}>
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexNoeud}>
            nœud {index}
          </TexteTheme>
        </View>
        <View style={styles.corpsNoeud}>
          <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurNoeud}>
            {noeud.valeur}
          </TexteTheme>
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteChamp}>
            donnée
          </TexteTheme>
        </View>
        <View style={styles.pointeurNoeud}>
          <TexteTheme lightColor={estFin ? themeActif.approximationNegativeStroke : themeActif.bounds} style={styles.textePointeur}>
            {estFin ? 'suivant = null' : 'suivant'}
          </TexteTheme>
          <View style={styles.actionsNoeud}>
            <Pressable onPress={onLire} style={styles.boutonIconeNoeud}>
              <MaterialCommunityIcons color={themeActif.bounds} name="flash-outline" size={15} />
            </Pressable>
            <Pressable onPress={onRetirer} style={styles.boutonIconeNoeud}>
              <MaterialCommunityIcons color={themeActif.approximationNegativeStroke} name="trash-can-outline" size={15} />
            </Pressable>
          </View>
        </View>
      </View>
      {!estFin ? (
        <View style={styles.lienNoeud}>
          <View style={styles.segmentLien} />
          <MaterialCommunityIcons color={themeActif.bounds} name="arrow-right" size={24} />
        </View>
      ) : null}
    </View>
  );
}

export function SimulationListeChainee() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const prochainIdNoeud = useRef(1);
  const prochainIdTrace = useRef(1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nombreDepart, definirNombreDepart] = useState(3);
  const [dureeSurbrillance, definirDureeSurbrillance] = useState(760);
  const [noeuds, definirNoeuds] = useState<NoeudListe[]>(() => creerNoeudsDepart(3, prochainIdNoeud));
  const [valeurSaisie, definirValeurSaisie] = useState('');
  const [indexSaisi, definirIndexSaisi] = useState('0');
  const [operationActive, definirOperationActive] = useState<OperationActive>(null);
  const [indicesParcourus, definirIndicesParcourus] = useState<number[]>([]);
  const [indicesActifs, definirIndicesActifs] = useState<number[]>([]);
  const [traces, definirTraces] = useState<TraceOperation[]>([]);

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const valeurNormalisee = normaliserValeur(valeurSaisie);
  const indexMaximum = Math.max(noeuds.length - 1, 0);
  const indexNumerique = borner(Number.parseInt(indexSaisi, 10) || 0, 0, indexMaximum);
  const tete = noeuds[0]?.valeur ?? 'null';
  const queue = noeuds[noeuds.length - 1]?.valeur ?? 'null';
  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  useEffect(
    () => () => {
      if (minuteurRef.current) {
        clearTimeout(minuteurRef.current);
      }
    },
    []
  );

  const definirSurbrillance = useCallback((operation: OperationActive, indicesVisites: number[], indicesCibles: number[] = []) => {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
    }

    definirOperationActive(operation);
    definirIndicesParcourus(indicesVisites);
    definirIndicesActifs(indicesCibles);
    minuteurRef.current = setTimeout(() => {
      definirOperationActive(null);
      definirIndicesParcourus([]);
      definirIndicesActifs([]);
    }, dureeSurbrillance);
  }, [dureeSurbrillance]);

  const ajouterTrace = useCallback((texte: string) => {
    definirTraces((tracesCourantes) => [
      ...tracesCourantes.slice(-4),
      { id: prochainIdTrace.current++, texte },
    ]);
  }, []);

  const ajouterTete = useCallback(() => {
    if (!valeurNormalisee || noeuds.length >= LIMITE_NOEUDS) {
      return;
    }

    const nouveauNoeud = { id: prochainIdNoeud.current++, valeur: valeurNormalisee };
    definirNoeuds((noeudsCourants) => [nouveauNoeud, ...noeudsCourants]);
    definirValeurSaisie('');
    definirSurbrillance('ajout-tete', [0], [0]);
    ajouterTrace(`addFirst("${valeurNormalisee}") : O(1), la tête pointe vers le nouveau nœud`);
  }, [ajouterTrace, definirSurbrillance, noeuds.length, valeurNormalisee]);

  const ajouterQueue = useCallback(() => {
    if (!valeurNormalisee || noeuds.length >= LIMITE_NOEUDS) {
      return;
    }

    const indexAjout = noeuds.length;
    const nouveauNoeud = { id: prochainIdNoeud.current++, valeur: valeurNormalisee };
    definirNoeuds((noeudsCourants) => [...noeudsCourants, nouveauNoeud]);
    definirValeurSaisie('');
    definirSurbrillance('ajout-queue', [Math.max(0, indexAjout - 1), indexAjout], [indexAjout]);
    ajouterTrace(`addLast("${valeurNormalisee}") : O(1), Java garde une référence vers la queue`);
  }, [ajouterTrace, definirSurbrillance, noeuds.length, valeurNormalisee]);

  const retirerTete = useCallback(() => {
    const valeur = noeuds[0]?.valeur;

    if (valeur === undefined) {
      return;
    }

    definirNoeuds((noeudsCourants) => noeudsCourants.slice(1));
    definirSurbrillance('retrait', [0], [0]);
    ajouterTrace(`removeFirst() -> "${valeur}" : O(1), la tête avance au nœud suivant`);
  }, [ajouterTrace, definirSurbrillance, noeuds]);

  const retirerQueue = useCallback(() => {
    const valeur = noeuds[noeuds.length - 1]?.valeur;

    if (valeur === undefined) {
      return;
    }

    definirNoeuds((noeudsCourants) => noeudsCourants.slice(0, -1));
    definirSurbrillance('retrait', [Math.max(0, noeuds.length - 2), noeuds.length - 1], [noeuds.length - 1]);
    ajouterTrace(`removeLast() -> "${valeur}" : O(1), la queue recule au nœud précédent`);
  }, [ajouterTrace, definirSurbrillance, noeuds]);

  const retirerIndex = useCallback(
    (indexRetrait: number) => {
      const valeur = noeuds[indexRetrait]?.valeur;

      if (valeur === undefined) {
        return;
      }

      definirNoeuds((noeudsCourants) => noeudsCourants.filter((_, index) => index !== indexRetrait));
      definirSurbrillance(
        'retrait',
        Array.from({ length: indexRetrait + 1 }, (_, index) => index),
        [indexRetrait]
      );
      ajouterTrace(`remove(${indexRetrait}) -> "${valeur}" : O(n), parcours depuis la tête`);
    },
    [ajouterTrace, definirSurbrillance, noeuds]
  );

  const lireIndex = useCallback(
    (indexLecture: number) => {
      const valeur = noeuds[indexLecture]?.valeur;

      if (valeur === undefined) {
        return;
      }

      definirSurbrillance(
        'lecture',
        Array.from({ length: indexLecture + 1 }, (_, index) => index),
        [indexLecture]
      );
      ajouterTrace(
        `Chemin de lecture\n${Array.from({ length: indexLecture + 1 }, (_, index) => `index ${index}`).join(' -> ')} -> "${valeur}"\n(O(n))`
      );
    },
    [ajouterTrace, definirSurbrillance, noeuds]
  );

  const reinitialiser = useCallback(() => {
    definirNoeuds(creerNoeudsDepart(nombreDepart, prochainIdNoeud));
    definirValeurSaisie('');
    definirIndexSaisi('0');
    definirTraces([]);
    definirSurbrillance(null, [], []);
  }, [definirSurbrillance, nombreDepart]);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Liste chaînée" domaine="programmation-java" />
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
                  Liste chaînée
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Chaque nœud garde une donnée et un lien vers le suivant. Les extrémités sont rapides, le milieu demande un parcours.
                </TexteTheme>
              </View>

              <View style={styles.cadreListe}>
                <View style={styles.enteteListe}>
                  <View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
                      Références
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.valeurReferences}>
                      tête : {tete} · queue : {queue}
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.indicationParcours}>
                    {operationActive ? `Opération : ${obtenirLibelleOperation(operationActive)}` : `${noeuds.length} nœud(s) liés`}
                  </TexteTheme>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defilementListe}>
                  <View style={styles.rangeeListe}>
                    <View style={styles.marqueurTete}>
                      <TexteTheme lightColor={themeActif.bounds} style={styles.texteMarqueur}>
                        TÊTE
                      </TexteTheme>
                      <MaterialCommunityIcons color={themeActif.bounds} name="arrow-right" size={20} />
                    </View>
                    {noeuds.length > 0 ? (
                      noeuds.map((noeud, index) => (
                        <NoeudVisuel
                          estActif={indicesActifs.includes(index)}
                          estFin={index === noeuds.length - 1}
                          estParcouru={indicesParcourus.includes(index)}
                          index={index}
                          key={noeud.id}
                          noeud={noeud}
                          onLire={() => lireIndex(index)}
                          onRetirer={() => retirerIndex(index)}
                        />
                      ))
                    ) : (
                      <View style={styles.listeVide}>
                        <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteListeVide}>
                          Liste vide : tête = null
                        </TexteTheme>
                      </View>
                    )}
                    {noeuds.length > 0 ? (
                      <View style={styles.marqueurNull}>
                        <MaterialCommunityIcons color={themeActif.approximationNegativeStroke} name="arrow-right" size={20} />
                        <TexteTheme lightColor={themeActif.approximationNegativeStroke} style={styles.texteMarqueur}>
                          null
                        </TexteTheme>
                      </View>
                    ) : null}
                  </View>
                </ScrollView>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Début" valeur="O(1)" />
                <CarteStatistique etiquette="Fin" valeur="O(1)" />
                <CarteStatistique etiquette="Lecture milieu" valeur="O(n)" />
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.contenuCode}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteCode}>{'LinkedList<String> liste = new LinkedList<>();'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.addFirst("A");   // O(1), ajoute en tête'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.addLast("B");    // O(1), ajoute en queue'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.get(2);          // O(n), parcourt les nœuds'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'liste.remove(1);       // O(n), relie autour du nœud'}</TexteTheme>
                  </View>
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
                  Valeur et index
                </TexteTheme>
                <TextInput
                  maxLength={12}
                  onChangeText={definirValeurSaisie}
                  onSubmitEditing={ajouterQueue}
                  placeholder="Nouveau nœud"
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
                  accent={themeActif.bounds}
                  desactive={!valeurNormalisee || noeuds.length >= LIMITE_NOEUDS}
                  icone="plus"
                  onPress={ajouterTete}>
                  addFirst(valeur)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.approximationStroke}
                  desactive={!valeurNormalisee || noeuds.length >= LIMITE_NOEUDS}
                  icone="plus"
                  onPress={ajouterQueue}>
                  addLast(valeur)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.accent}
                  desactive={noeuds.length === 0}
                  icone="flash-outline"
                  onPress={() => lireIndex(indexNumerique)}>
                  get(index)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.approximationNegativeStroke}
                  desactive={noeuds.length === 0}
                  icone="trash-can-outline"
                  onPress={() => retirerIndex(indexNumerique)}>
                  remove(index)
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.bounds}
                  desactive={noeuds.length === 0}
                  icone="arrow-left"
                  onPress={retirerTete}>
                  removeFirst()
                </BoutonOperation>
                <BoutonOperation
                  accent={themeActif.approximationNegativeStroke}
                  desactive={noeuds.length === 0}
                  icone="arrow-right"
                  onPress={retirerQueue}>
                  removeLast()
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Réglages
                </TexteTheme>
                <CurseurListe
                  etiquette="Nœuds au départ"
                  maximum={8}
                  minimum={0}
                  modifierValeur={definirNombreDepart}
                  pas={1}
                  valeur={nombreDepart}
                />
                <CurseurListe
                  etiquette="Surbrillance"
                  maximum={1200}
                  minimum={200}
                  modifierValeur={definirDureeSurbrillance}
                  pas={100}
                  suffixe=" ms"
                  valeur={dureeSurbrillance}
                />
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
          "Une liste chaînée est composée de nœuds. Chaque nœud contient une valeur et au moins une référence vers le nœud suivant.",
          "Contrairement à une ArrayList, elle ne donne pas d'accès direct par index : pour atteindre l'élément 4, il faut avancer de lien en lien depuis la tête.",
        ]}
        delayMs={5000}
        exampleLabel="À retenir"
        exampleText="addFirst et addLast sont rapides avec les références tête/queue. get(index) et remove(index) demandent un parcours en O(n)."
        eyebrow="Définition"
        title="Qu'est-ce qu'une liste chaînée ?"
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    actionsNoeud: {
      flexDirection: 'row',
      gap: 6,
    },
    barreLaterale: {
      gap: 16,
    },
    barreLateraleAligneeAnimation: {
      marginTop: 104,
    },
    blocCurseur: {
      gap: 12,
    },
    blocTitre: {
      gap: 6,
    },
    boutonAppuye: {
      transform: [{ translateY: -1 }],
    },
    boutonDesactive: {
      opacity: 0.45,
    },
    boutonIconeNoeud: {
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
      borderWidth: 1.5,
      flexDirection: 'row',
      gap: 9,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cadreListe: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 14,
      minHeight: 236,
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
    contenuCode: {
      gap: 5,
      minWidth: '100%',
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
      paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + 12,
    },
    corpsNoeud: {
      alignItems: 'center',
      gap: 3,
      minHeight: 70,
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    defilementListe: {
      width: '100%',
    },
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 650,
    },
    enteteCurseur: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteListe: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteNoeud: {
      alignItems: 'center',
      backgroundColor: themeActif.panel,
      borderBottomColor: themeActif.border,
      borderBottomWidth: 1,
      justifyContent: 'center',
      minHeight: 28,
    },
    etiquetteChamp: {
      color: themeActif.mutedInk,
      fontSize: 10,
      fontWeight: '800',
      lineHeight: 13,
      textTransform: 'uppercase',
    },
    etiquettePanneau: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0,
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
    groupeNoeud: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    indicationParcours: {
      color: themeActif.mutedInk,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
      textAlign: 'right',
    },
    indexNoeud: {
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
    lienNoeud: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: 4,
      width: 46,
    },
    listeVide: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      justifyContent: 'center',
      minHeight: 130,
      minWidth: 220,
      paddingHorizontal: 18,
    },
    marqueurNull: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
      marginLeft: 2,
      minHeight: 130,
    },
    marqueurTete: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
      minHeight: 130,
    },
    noeud: {
      borderRadius: 8,
      borderWidth: 1.5,
      minHeight: 130,
      overflow: 'hidden',
      width: 118,
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
    pisteCurseur: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 999,
      borderWidth: 1.5,
      height: 16,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    poigneeCurseur: {
      backgroundColor: themeActif.ink,
      borderColor: themeActif.panel,
      borderRadius: 10,
      height: 20,
      marginLeft: -10,
      position: 'absolute',
      width: 20,
    },
    pointeurNoeud: {
      alignItems: 'center',
      borderTopColor: themeActif.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 42,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    rangeeListe: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 142,
      paddingVertical: 4,
    },
    remplissageCurseur: {
      backgroundColor: themeActif.grid,
      borderRadius: 999,
      height: '100%',
    },
    segmentLien: {
      backgroundColor: themeActif.bounds,
      height: 2,
      width: 20,
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
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'center',
    },
    texteCode: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
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
    texteListeVide: {
      color: themeActif.mutedInk,
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 20,
      textAlign: 'center',
    },
    texteMarqueur: {
      color: themeActif.bounds,
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
    },
    textePointeur: {
      color: themeActif.bounds,
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: '800',
      lineHeight: 14,
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
    valeurCurseur: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'right',
    },
    valeurIndex: {
      color: themeActif.ink,
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 23,
    },
    valeurNoeud: {
      color: themeActif.ink,
      fontSize: 15,
      fontWeight: '900',
      lineHeight: 19,
      maxWidth: '100%',
      textAlign: 'center',
    },
    valeurReferences: {
      color: themeActif.ink,
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 22,
      marginTop: 2,
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
  });
}
