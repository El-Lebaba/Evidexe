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
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type OngletChaine = 'caracteres' | 'methodes' | 'constructeur';
type OperationActive = 'lecture' | 'methode' | 'mutation' | null;

type TraceOperation = {
  id: number;
  texte: string;
};

type MethodeChaine = {
  appel: string;
  resultat: string | number;
};

type OperationConstructeur = {
  operation: string;
  resultat: string;
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

type ThemeSimulationChaines = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationChaines = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const TEXTE_INITIAL = 'École Java';
const LONGUEUR_MAXIMALE = 18;
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

function normaliserTexte(texte: string) {
  return texte.slice(0, LONGUEUR_MAXIMALE);
}

function echapperChaine(texte: string) {
  return texte.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function remplacerPremierE(texte: string) {
  return texte.replace(/[eéèêëEÉÈÊË]/, 'E');
}

function trouverPremierE(texte: string) {
  const resultat = /[eéèêëEÉÈÊË]/.exec(texte);
  return resultat?.index ?? -1;
}

function contientE(texte: string) {
  return /[eéèêëEÉÈÊË]/.test(texte);
}

function CurseurChaine({
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

  const amplitude = Math.max(maximum - minimum, 1);
  const pourcentage = ((valeur - minimum) / amplitude) * 100;

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

function BoutonOnglet({
  actif,
  children,
  onPress,
}: {
  actif: boolean;
  children: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.boutonOnglet,
        actif ? styles.boutonOngletActif : null,
        pressed || hovered ? styles.boutonAppuye : null,
      ]}>
      <TexteTheme lightColor={actif ? themeActif.activeInk : themeActif.ink} style={styles.texteBoutonOnglet}>
        {children}
      </TexteTheme>
    </Pressable>
  );
}

function CelluleCaractere({
  caractere,
  estActive,
  index,
}: {
  caractere: string;
  estActive: boolean;
  index: number;
}) {
  const code = caractere.charCodeAt(0);
  const couleurBordure = estActive ? themeActif.bounds : themeActif.approximationStroke;
  const couleurFond = estActive ? themeActif.boundsSoft : themeActif.surface;

  return (
    <View style={[styles.celluleCaractere, { backgroundColor: couleurFond, borderColor: couleurBordure }]}>
      <View style={styles.enteteCellule}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.indexCellule}>
          [{index}]
        </TexteTheme>
      </View>
      <View style={styles.corpsCaractere}>
        <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurCaractere}>
          {caractere === ' ' ? '␠' : caractere}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.codeCaractere}>
          U+{code.toString(16).toUpperCase().padStart(4, '0')}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.bounds} style={styles.codeDecimal}>
          {code}
        </TexteTheme>
      </View>
    </View>
  );
}

function LigneMethode({ methode, onPress }: { methode: MethodeChaine; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ hovered, pressed }) => [styles.ligneMethode, pressed || hovered ? styles.boutonAppuye : null]}>
      <TexteTheme lightColor={themeActif.bounds} numberOfLines={1} style={styles.texteMethode}>
        {methode.appel}
      </TexteTheme>
      <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.resultatMethode}>
        {String(methode.resultat)}
      </TexteTheme>
    </Pressable>
  );
}

function LigneConstructeur({ operation }: { operation: OperationConstructeur }) {
  return (
    <View style={styles.ligneConstructeur}>
      <TexteTheme lightColor={themeActif.bounds} numberOfLines={1} style={styles.texteMethode}>
        {operation.operation}
      </TexteTheme>
      <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.resultatMethode}>
        {operation.resultat}
      </TexteTheme>
    </View>
  );
}

export function SimulationChainesCaracteres() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const prochainIdTrace = useRef(1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [texte, definirTexte] = useState(TEXTE_INITIAL);
  const [ongletActif, definirOngletActif] = useState<OngletChaine>('caracteres');
  const [indexCible, definirIndexCible] = useState(0);
  const [indiceActif, definirIndiceActif] = useState<number | null>(null);
  const [operationActive, definirOperationActive] = useState<OperationActive>(null);
  const [traces, definirTraces] = useState<TraceOperation[]>([]);

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const caracteres = useMemo(() => texte.split(''), [texte]);
  const indexMaximum = Math.max(caracteres.length - 1, 0);
  const indexBorne = borner(indexCible, 0, indexMaximum);
  const texteEchappe = echapperChaine(texte);
  const sousChaineFin = Math.min(texte.length, Math.max(2, indexBorne + 2));
  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  const methodes = useMemo<MethodeChaine[]>(
    () => [
      { appel: `s.length()`, resultat: texte.length },
      { appel: `s.charAt(${indexBorne})`, resultat: `"${caracteres[indexBorne] ?? ''}"` },
      { appel: `s.toUpperCase()`, resultat: `"${texte.toUpperCase()}"` },
      { appel: `s.toLowerCase()`, resultat: `"${texte.toLowerCase()}"` },
      { appel: `s.trim()`, resultat: `"${texte.trim()}"` },
      { appel: `s.contains("e")`, resultat: contientE(texte) ? 'true' : 'false' },
      { appel: `s.indexOf("e")`, resultat: trouverPremierE(texte) },
      { appel: `s.replace("e", "E")`, resultat: `"${remplacerPremierE(texte)}"` },
      { appel: `s.substring(${Math.min(indexBorne, sousChaineFin)}, ${sousChaineFin})`, resultat: `"${texte.substring(Math.min(indexBorne, sousChaineFin), sousChaineFin)}"` },
      { appel: `s.toCharArray()`, resultat: `[${caracteres.map((caractere) => `'${caractere === ' ' ? ' ' : caractere}'`).join(', ')}]` },
    ],
    [caracteres, indexBorne, sousChaineFin, texte]
  );

  const operationsConstructeur = useMemo<OperationConstructeur[]>(() => {
    const apresAppend = `${texte}!`;
    const apresInsertion = `«${apresAppend}`;
    const apresRenversement = apresInsertion.split('').reverse().join('');

    return [
      { operation: `StringBuilder sb = new StringBuilder("${texteEchappe}")`, resultat: texte },
      { operation: `sb.append("!")`, resultat: apresAppend },
      { operation: `sb.insert(0, "«")`, resultat: apresInsertion },
      { operation: `sb.reverse()`, resultat: apresRenversement },
      { operation: `sb.toString()`, resultat: `"${echapperChaine(apresRenversement)}"` },
    ];
  }, [texte, texteEchappe]);

  const definirSurbrillance = useCallback((operation: OperationActive, index: number | null = null) => {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
    }

    definirOperationActive(operation);
    definirIndiceActif(index);
    minuteurRef.current = setTimeout(() => {
      definirOperationActive(null);
      definirIndiceActif(null);
    }, DUREE_SURBRILLANCE);
  }, []);

  const ajouterTrace = useCallback((texteTrace: string) => {
    definirTraces((tracesCourantes) => [
      ...tracesCourantes.slice(-4),
      { id: prochainIdTrace.current++, texte: texteTrace },
    ]);
  }, []);

  const changerTexte = useCallback((prochainTexte: string) => {
    const texteNormalise = normaliserTexte(prochainTexte);
    definirTexte(texteNormalise);
    definirIndexCible((indexCourant) => borner(indexCourant, 0, Math.max(texteNormalise.length - 1, 0)));
  }, []);

  const lireCaractere = useCallback(() => {
    if (caracteres.length === 0) {
      ajouterTrace('charAt(index) : impossible, la chaîne est vide');
      return;
    }

    definirOngletActif('caracteres');
    definirSurbrillance('lecture', indexBorne);
    ajouterTrace(`s.charAt(${indexBorne}) -> "${caracteres[indexBorne]}" : accès au caractère UTF-16`);
  }, [ajouterTrace, caracteres, definirSurbrillance, indexBorne]);

  const executerMethode = useCallback((methode: MethodeChaine) => {
    definirOngletActif('methodes');
    definirSurbrillance('methode', indexBorne);
    ajouterTrace(`${methode.appel} -> ${methode.resultat} : String reste immuable`);
  }, [ajouterTrace, definirSurbrillance, indexBorne]);

  const montrerConstructeur = useCallback(() => {
    definirOngletActif('constructeur');
    definirSurbrillance('mutation');
    ajouterTrace('StringBuilder modifie le même tampon au lieu de créer une nouvelle String à chaque étape');
  }, [ajouterTrace, definirSurbrillance]);

  const reinitialiser = useCallback(() => {
    changerTexte(TEXTE_INITIAL);
    definirOngletActif('caracteres');
    definirIndexCible(0);
    definirIndiceActif(null);
    definirOperationActive(null);
    definirTraces([]);
  }, [changerTexte]);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Chaînes et caractères" domaine="programmation-java" />
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
                  Chaînes et caractères
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Une String est immuable : chaque transformation produit une nouvelle chaîne. Les caractères sont représentés par des unités UTF-16.
                </TexteTheme>
              </View>

              <View style={styles.cadreMemoire}>
                <View style={styles.enteteMemoire}>
                  <View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
                      Représentation
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.valeurMemoire}>
                      String s = "{texteEchappe}";
                    </TexteTheme>
                  </View>
                  <TexteTheme lightColor={themeActif.bounds} style={styles.indicationIndex}>
                    {texte.length} caractère(s)
                  </TexteTheme>
                </View>

                {ongletActif === 'caracteres' ? (
                  <View style={styles.grilleCaracteres}>
                    {caracteres.length > 0 ? (
                      caracteres.map((caractere, index) => (
                        <CelluleCaractere
                          caractere={caractere}
                          estActive={indiceActif === index}
                          index={index}
                          key={`${index}-${caractere}`}
                        />
                      ))
                    ) : (
                      <View style={styles.zoneVide}>
                        <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteJournalVide}>
                          Chaîne vide
                        </TexteTheme>
                      </View>
                    )}
                  </View>
                ) : null}

                {ongletActif === 'methodes' ? (
                  <View style={styles.listeMethodes}>
                    {methodes.map((methode) => (
                      <LigneMethode key={methode.appel} methode={methode} onPress={() => executerMethode(methode)} />
                    ))}
                  </View>
                ) : null}

                {ongletActif === 'constructeur' ? (
                  <View style={styles.listeMethodes}>
                    <View style={styles.noteConstructeur}>
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteNote}>
                        StringBuilder est mutable : il garde un tampon modifiable, utile dans les boucles.
                      </TexteTheme>
                    </View>
                    {operationsConstructeur.map((operation) => (
                      <LigneConstructeur key={operation.operation} operation={operation} />
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Longueur" valeur={texte.length} />
                <CarteStatistique etiquette="Immutabilité" valeur="nouvelle String" />
                <CarteStatistique etiquette="StringBuilder" valeur="O(n) en boucle" />
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.contenuCode}>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteCode}>{`String s = "${texteEchappe}";`}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'s.charAt(0);          // lit un caractère'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'s.toUpperCase();      // crée une nouvelle String'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'StringBuilder sb = new StringBuilder();'}</TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>{'sb.append(i);         // évite la concaténation répétée'}</TexteTheme>
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
                  Texte
                </TexteTheme>
                <TextInput
                  maxLength={LONGUEUR_MAXIMALE}
                  onChangeText={changerTexte}
                  placeholder="Saisir une chaîne"
                  placeholderTextColor={themeActif.mutedInk}
                  selectionColor={themeActif.bounds}
                  style={styles.champTexte}
                  value={texte}
                />
                <CurseurChaine
                  etiquette="Index"
                  maximum={indexMaximum}
                  minimum={0}
                  modifierValeur={definirIndexCible}
                  pas={1}
                  valeur={indexBorne}
                />
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Vue
                </TexteTheme>
                <View style={styles.rangeeOnglets}>
                  <BoutonOnglet actif={ongletActif === 'caracteres'} onPress={() => definirOngletActif('caracteres')}>
                    Caractères
                  </BoutonOnglet>
                  <BoutonOnglet actif={ongletActif === 'methodes'} onPress={() => definirOngletActif('methodes')}>
                    Méthodes
                  </BoutonOnglet>
                  <BoutonOnglet actif={ongletActif === 'constructeur'} onPress={() => definirOngletActif('constructeur')}>
                    Builder
                  </BoutonOnglet>
                </View>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Opérations
                </TexteTheme>
                <BoutonOperation accent={themeActif.bounds} desactive={caracteres.length === 0} icone="flash-outline" onPress={lireCaractere}>
                  charAt(index)
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationStroke} icone="format-list-numbered" onPress={() => executerMethode(methodes[0])}>
                  length()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.accent} icone="sort" onPress={() => executerMethode(methodes[2])}>
                  toUpperCase()
                </BoutonOperation>
                <BoutonOperation accent={themeActif.approximationNegativeStroke} icone="database-outline" onPress={montrerConstructeur}>
                  StringBuilder
                </BoutonOperation>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  État
                </TexteTheme>
                <View style={styles.rangeeEtat}>
                  <MaterialCommunityIcons color={operationActive ? themeActif.bounds : themeActif.mutedInk} name={operationActive ? 'pulse' : 'alphabetical-variant'} size={18} />
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
          "Une String Java est immuable : modifier son contenu revient à créer un nouvel objet.",
          "StringBuilder est mutable. Il est préférable lorsque le programme ajoute souvent du texte, surtout dans une boucle.",
        ]}
        delayMs={5000}
        exampleLabel="À retenir"
        exampleText="s += i dans une boucle peut devenir O(n²), alors que StringBuilder.append(i) garde un coût linéaire."
        eyebrow="Définition"
        title="Qu'est-ce qu'une String ?"
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
    boutonOnglet: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    boutonOngletActif: {
      backgroundColor: themeActif.activeButton,
      borderColor: themeActif.activeButton,
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
    celluleCaractere: {
      borderRadius: 8,
      borderWidth: 1.5,
      minHeight: 112,
      minWidth: 88,
      overflow: 'hidden',
      width: '22%',
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
    codeCaractere: {
      color: themeActif.mutedInk,
      fontFamily: 'monospace',
      fontSize: 10,
      lineHeight: 13,
      marginTop: 4,
    },
    codeDecimal: {
      color: themeActif.bounds,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '900',
      lineHeight: 13,
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
      gap: 5,
      minWidth: '100%',
    },
    corpsCaractere: {
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
    grilleCaracteres: {
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
    ligneConstructeur: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    ligneMethode: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    listeMethodes: {
      gap: 8,
    },
    noteConstructeur: {
      backgroundColor: themeActif.approximation,
      borderColor: themeActif.approximationStroke,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
    rangeeOnglets: {
      flexDirection: 'row',
      gap: 8,
    },
    remplissageCurseur: {
      backgroundColor: themeActif.grid,
      borderRadius: 999,
      height: '100%',
    },
    resultatMethode: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
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
    texteBoutonOnglet: {
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
      textAlign: 'center',
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
    texteMethode: {
      color: themeActif.bounds,
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
    },
    texteNote: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '800',
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
    valeurCaractere: {
      color: themeActif.ink,
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 27,
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
      fontFamily: 'monospace',
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 20,
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
    zoneVide: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      justifyContent: 'center',
      minHeight: 120,
      width: '100%',
    },
  });
}
