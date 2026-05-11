import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
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

type OperationActive = 'lecture' | 'ecriture' | 'tri' | 'remplissage' | 'copie' | null;

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

type ThemeSimulationTableaux = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationTableaux = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const VALEURS_INITIALES = [10, 42, 7, 88, 23, 55, 0, 0];
const CAPACITE_MINIMALE = 4;
const CAPACITE_MAXIMALE = 12;
const DUREE_SURBRILLANCE = 760;

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

function convertirNombre(texte: string) {
  const nombre = Number.parseInt(texte, 10);

  if (Number.isNaN(nombre)) {
    return 0;
  }

  return borner(nombre, -99, 999);
}

function ajusterCapacite(valeurs: number[], capacite: number) {
  if (valeurs.length === capacite) {
    return valeurs;
  }

  if (valeurs.length > capacite) {
    return valeurs.slice(0, capacite);
  }

  return [...valeurs, ...Array.from({ length: capacite - valeurs.length }, () => 0)];
}

function CurseurTableau({
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

function CelluleTableau({
  estActive,
  estTriee,
  index,
  operationActive,
  valeur,
}: {
  estActive: boolean;
  estTriee: boolean;
  index: number;
  operationActive: OperationActive;
  valeur: number;
}) {
  const couleurBordure = estActive
    ? themeActif.bounds
    : estTriee
      ? themeActif.accent
      : themeActif.approximationStroke;
  const couleurFond = estActive
    ? themeActif.boundsSoft
    : estTriee
      ? themeActif.approximation
      : themeActif.surface;
  const adresse = `0x${(0x1000 + index * 4).toString(16).toUpperCase()}`;

  return (
    <View style={[styles.cellule, { backgroundColor: couleurFond, borderColor: couleurBordure }]}>
      <View style={styles.enteteCellule}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexCellule}>
          [{index}]
        </TexteTheme>
      </View>
      <View style={styles.corpsCellule}>
        <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurCellule}>
          {valeur}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.adresseCellule}>
          {adresse}
        </TexteTheme>
      </View>
      {estActive ? (
        <TexteTheme lightColor={themeActif.bounds} style={styles.etiquetteOperationCellule}>
          {operationActive ?? 'accès'}
        </TexteTheme>
      ) : null}
    </View>
  );
}

export function SimulationTableaux() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const prochainIdTrace = useRef(1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [capacite, definirCapacite] = useState(VALEURS_INITIALES.length);
  const [valeurs, definirValeurs] = useState(VALEURS_INITIALES);
  const [valeurSaisie, definirValeurSaisie] = useState('99');
  const [indexCible, definirIndexCible] = useState(2);
  const [indicesActifs, definirIndicesActifs] = useState<number[]>([]);
  const [operationActive, definirOperationActive] = useState<OperationActive>(null);
  const [indicesTries, definirIndicesTries] = useState<number[]>([]);
  const [traces, definirTraces] = useState<TraceOperation[]>([]);

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const indexBorne = borner(indexCible, 0, capacite - 1);
  const valeurNumerique = convertirNombre(valeurSaisie);
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
    }, DUREE_SURBRILLANCE);
  }, []);

  const ajouterTrace = useCallback((texte: string) => {
    definirTraces((tracesCourantes) => [
      ...tracesCourantes.slice(-4),
      { id: prochainIdTrace.current++, texte },
    ]);
  }, []);

  const changerCapacite = useCallback((prochaineCapacite: number) => {
    definirCapacite(prochaineCapacite);
    definirIndexCible((indexCourant) => borner(indexCourant, 0, prochaineCapacite - 1));
    definirValeurs((valeursCourantes) => ajusterCapacite(valeursCourantes, prochaineCapacite));
    definirIndicesTries([]);
    ajouterTrace(`new int[${prochaineCapacite}] : taille fixe, cases contiguës`);
  }, [ajouterTrace]);

  const ecrireValeur = useCallback(() => {
    definirValeurs((valeursCourantes) => {
      const prochainTableau = [...valeursCourantes];
      prochainTableau[indexBorne] = valeurNumerique;
      return prochainTableau;
    });
    definirIndicesTries([]);
    definirSurbrillance('ecriture', [indexBorne]);
    ajouterTrace(`tableau[${indexBorne}] = ${valeurNumerique} : écriture directe (O(1))`);
  }, [ajouterTrace, definirSurbrillance, indexBorne, valeurNumerique]);

  const lireValeur = useCallback(() => {
    definirSurbrillance('lecture', [indexBorne]);
    ajouterTrace(`tableau[${indexBorne}] -> ${valeurs[indexBorne]} : lecture directe (O(1))`);
  }, [ajouterTrace, definirSurbrillance, indexBorne, valeurs]);

  const trierTableau = useCallback(() => {
    definirValeurs((valeursCourantes) => [...valeursCourantes].sort((a, b) => a - b));
    const tousLesIndices = Array.from({ length: capacite }, (_, index) => index);
    definirIndicesTries(tousLesIndices);
    definirSurbrillance('tri', tousLesIndices);
    ajouterTrace(`Arrays.sort(tableau) : tri en O(n log n) sur ${capacite} case(s)`);
  }, [ajouterTrace, capacite, definirSurbrillance]);

  const remplirTableau = useCallback(() => {
    definirValeurs(Array.from({ length: capacite }, () => valeurNumerique));
    const tousLesIndices = Array.from({ length: capacite }, (_, index) => index);
    definirIndicesTries([]);
    definirSurbrillance('remplissage', tousLesIndices);
    ajouterTrace(`Arrays.fill(tableau, ${valeurNumerique}) : parcourt toutes les cases (O(n))`);
  }, [ajouterTrace, capacite, definirSurbrillance, valeurNumerique]);

  const copierTableau = useCallback(() => {
    const tousLesIndices = Array.from({ length: capacite }, (_, index) => index);
    definirSurbrillance('copie', tousLesIndices);
    ajouterTrace(`Arrays.copyOf(tableau, ${capacite}) : crée une copie indépendante (O(n))`);
  }, [ajouterTrace, capacite, definirSurbrillance]);

  const reinitialiser = useCallback(() => {
    definirCapacite(VALEURS_INITIALES.length);
    definirValeurs(VALEURS_INITIALES);
    definirValeurSaisie('99');
    definirIndexCible(2);
    definirIndicesActifs([]);
    definirIndicesTries([]);
    definirOperationActive(null);
    definirTraces([]);
  }, []);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Tableaux" domaine="programmation-java" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], {
            useNativeDriver: Platform.OS !== 'web',
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
                  Tableaux
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Taille fixe, cases contiguës et accès direct par index. C&#39;est rapide pour lire ou écrire, moins flexible pour redimensionner.
                </TexteTheme>
              </View>

              <View style={styles.cadreMemoire}>
                <View style={styles.enteteMemoire}>
                  <View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
                      Mémoire contiguë
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.valeurMemoire}>
                      int[{capacite}] · 4 octets par case
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.bounds} style={styles.indicationIndex}>
                    index ciblé : {indexBorne}
                  </TexteTheme>
                </View>

                <View style={styles.grilleCellules}>
                  {valeurs.map((valeur, index) => (
                    <CelluleTableau
                      estActive={indicesActifs.includes(index)}
                      estTriee={indicesTries.includes(index)}
                      index={index}
                      key={`case-${index}`}
                      operationActive={operationActive}
                      valeur={valeur}
                    />
                  ))}
                </View>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Lecture index" valeur="O(1)" />
                <CarteStatistique etiquette="Écriture index" valeur="O(1)" />
                <CarteStatistique etiquette="Tri" valeur="O(n log n)" />
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.contenuCode}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteCode}>{'int[] tableau = new int[8];'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'tableau[2] = 99;             // O(1), écriture directe'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'int x = tableau[2];          // O(1), lecture directe'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'Arrays.fill(tableau, 0);     // O(n)'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'Arrays.sort(tableau);        // O(n log n)'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'int[] copie = Arrays.copyOf(tableau, tableau.length);'}</TexteTheme>
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
                  Réglages
                </TexteTheme>
                <CurseurTableau
                  etiquette="Cases"
                  maximum={CAPACITE_MAXIMALE}
                  minimum={CAPACITE_MINIMALE}
                  modifierValeur={changerCapacite}
                  pas={1}
                  valeur={capacite}
                />
                <CurseurTableau
                  etiquette="Index"
                  maximum={Math.max(capacite - 1, 0)}
                  minimum={0}
                  modifierValeur={definirIndexCible}
                  pas={1}
                  valeur={indexBorne}
                />
                <TextInput
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={definirValeurSaisie}
                  placeholder="Valeur"
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
                <BoutonOperation accent={themeActif.bounds} icone="flash-outline" onPress={lireValeur}>
                  lire tableau[index]
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationStroke} icone="table-edit" onPress={ecrireValeur}>
                  écrire valeur
                </BoutonOperation>
                <BoutonOperation accent={themeActif.accent} icone="sort" onPress={trierTableau}>
                  Arrays.sort()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationStroke} icone="format-list-numbered" onPress={remplirTableau}>
                  Arrays.fill()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.bounds} icone="content-copy" onPress={copierTableau}>
                  Arrays.copyOf()
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  État
                </TexteTheme>
                <View style={styles.rangeeEtat}>
                  <MaterialCommunityIcons color={operationActive ? themeActif.bounds : themeActif.mutedInk} name={operationActive ? 'pulse' : 'table'} size={18} />
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
          "Un tableau Java a une taille fixe. Une fois créé, tableau.length ne change pas.",
          "Chaque index mène directement à une case, donc lire et écrire tableau[i] se font en O(1). Les opérations qui parcourent toutes les cases coûtent O(n).",
        ]}
        delayMs={5000}
        exampleLabel="À retenir"
        exampleText="Pour changer la taille, Java doit créer un nouveau tableau et copier les valeurs."
        eyebrow="Définition"
        title="Qu'est-ce qu'un tableau ?"
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    adresseCellule: {
      color: themeActif.mutedInk,
      fontFamily: 'monospace',
      fontSize: 10,
      lineHeight: 13,
      marginTop: 4,
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
    cellule: {
      borderRadius: 8,
      borderWidth: 1.5,
      minHeight: 104,
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
      paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + 12,
    },
    contenuCode: {
      gap: 5,
      minWidth: '100%',
    },
    corpsCellule: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 10,
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
      backgroundColor: themeActif.panel,
      borderBottomColor: themeActif.border,
      borderBottomWidth: 1,
      justifyContent: 'center',
      minHeight: 28,
    },
    enteteCurseur: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteMemoire: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    etiquetteOperationCellule: {
      color: themeActif.bounds,
      fontSize: 10,
      fontWeight: '900',
      lineHeight: 13,
      paddingBottom: 7,
      textAlign: 'center',
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
    grilleCellules: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      width: '100%',
    },
    grilleStatistiques: {
      gap: 10,
    },
    indexCellule: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 14,
    },
    indicationIndex: {
      color: themeActif.bounds,
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
      textAlign: 'right',
      textTransform: 'uppercase',
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
    remplissageCurseur: {
      backgroundColor: themeActif.grid,
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
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 25,
      maxWidth: '100%',
      textAlign: 'center',
    },
    valeurCurseur: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'right',
    },
    valeurMemoire: {
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
    zoneSecurisee: {
      backgroundColor: couleurArrierePlan,
      flex: 1,
    },
    zoneTravail: {
      gap: 20,
    },
  });
}
