import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
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

export type TypeTri = 'bulles' | 'selection' | 'insertion' | 'fusion' | 'rapide';
type CasTableau = 'aleatoire' | 'meilleur' | 'pire';

type EtatTri = {
  indicesActifs?: number[];
  valeurs: number[];
  indicesComparaison?: number[];
  termine?: boolean;
  indiceMinimum?: number;
  operation?: boolean;
  indicePivot?: number;
  indicesPivots?: number[];
  plageActive?: [number, number];
  indicesTries?: number[];
  echange?: boolean;
};

type DefinitionTri = {
  etiquetteMeilleurCas: string;
  description: string;
  exempleInfobulle: string;
  genererEtapes: (valeurs: number[]) => Generator<EtatTri>;
  id: TypeTri;
  nuanceInfobulle: string;
  vitesseInitiale: number;
  etiquetteEspace: string;
  titre: string;
  etiquettePireCas: string;
};

type ProprietesCurseur = {
  desactive?: boolean;
  etiquette: string;
  maximum: number;
  minimum: number;
  modifierValeur: (valeur: number) => void;
  pas: number;
  suffixe?: string;
  valeur: number;
};

type ProprietesEcranSimulationTri = {
  type: TypeTri;
};

type ThemeSimulationTri = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationTri = obtenirThemesSimulationEcransInitial().programmationJava;
let COULEUR_ARRIERE_PLAN = themeActif.background;

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

function melanger(valeurs: number[]) {
  const valeursMelangees = [...valeurs];

  for (let index = valeursMelangees.length - 1; index > 0; index -= 1) {
    const indiceEchange = Math.floor(Math.random() * (index + 1));
    [valeursMelangees[index], valeursMelangees[indiceEchange]] = [valeursMelangees[indiceEchange], valeursMelangees[index]];
  }

  return valeursMelangees;
}

function genererCasEquilibreTriRapide(debut: number, fin: number): number[] {
  if (debut > fin) {
    return [];
  }

  const milieu = Math.floor((debut + fin) / 2);

  return [
    ...genererCasEquilibreTriRapide(debut, milieu - 1),
    ...genererCasEquilibreTriRapide(milieu + 1, fin),
    milieu,
  ];
}

function genererTableau(taille: number, casTableau: CasTableau, typeTri: TypeTri) {
  if (casTableau === 'meilleur') {
    if (typeTri === 'rapide') {
      return genererCasEquilibreTriRapide(1, taille);
    }

    return Array.from({ length: taille }, (_, index) => index + 1);
  }

  if (casTableau === 'pire') {
    if (typeTri === 'rapide') {
      return Array.from({ length: taille }, (_, index) => index + 1);
    }

    return Array.from({ length: taille }, (_, index) => taille - index);
  }

  return Array.from({ length: taille }, () => Math.floor(Math.random() * 100) + 1);
}

function* triBulles(valeursDepart: number[]) {
  const valeurs = [...valeursDepart];
  const nombreElements = valeurs.length;

  for (let passage = 0; passage < nombreElements - 1; passage += 1) {
    for (let indiceCourant = 0; indiceCourant < nombreElements - passage - 1; indiceCourant += 1) {
      yield {
        valeurs: [...valeurs],
        indicesComparaison: [indiceCourant, indiceCourant + 1],
        operation: true,
        indicesTries: Array.from({ length: passage }, (_, index) => nombreElements - 1 - index),
      };

      if (valeurs[indiceCourant] > valeurs[indiceCourant + 1]) {
        [valeurs[indiceCourant], valeurs[indiceCourant + 1]] = [valeurs[indiceCourant + 1], valeurs[indiceCourant]];
        yield {
          valeurs: [...valeurs],
          indicesComparaison: [indiceCourant, indiceCourant + 1],
          operation: true,
          indicesTries: Array.from({ length: passage }, (_, index) => nombreElements - 1 - index),
          echange: true,
        };
      }
    }
  }

  yield { valeurs: [...valeurs], indicesComparaison: [], termine: true, indicesTries: Array.from({ length: nombreElements }, (_, index) => index) };
}

function* triSelection(valeursDepart: number[]) {
  const valeurs = [...valeursDepart];
  const nombreElements = valeurs.length;
  const indicesTries: number[] = [];

  for (let indiceDebut = 0; indiceDebut < nombreElements - 1; indiceDebut += 1) {
    let indiceMinimum = indiceDebut;

    for (let indiceRecherche = indiceDebut + 1; indiceRecherche < nombreElements; indiceRecherche += 1) {
      yield {
        valeurs: [...valeurs],
        indicesComparaison: [indiceMinimum, indiceRecherche],
        indiceMinimum,
        operation: true,
        indicesTries: [...indicesTries],
      };

      if (valeurs[indiceRecherche] < valeurs[indiceMinimum]) {
        indiceMinimum = indiceRecherche;
      }
    }

    if (indiceMinimum !== indiceDebut) {
      [valeurs[indiceDebut], valeurs[indiceMinimum]] = [valeurs[indiceMinimum], valeurs[indiceDebut]];
      yield {
        valeurs: [...valeurs],
        indicesComparaison: [],
        indiceMinimum: indiceDebut,
        operation: true,
        indicesTries: [...indicesTries],
        echange: true,
      };
    }

    indicesTries.push(indiceDebut);
  }

  indicesTries.push(nombreElements - 1);
  yield { valeurs: [...valeurs], indicesComparaison: [], termine: true, indiceMinimum: -1, indicesTries };
}

function* triInsertion(valeursDepart: number[]) {
  const valeurs = [...valeursDepart];
  const nombreElements = valeurs.length;

  for (let indiceInsertion = 1; indiceInsertion < nombreElements; indiceInsertion += 1) {
    let indiceCourant = indiceInsertion;

    while (indiceCourant > 0) {
      yield {
        valeurs: [...valeurs],
        indicesComparaison: [indiceCourant - 1, indiceCourant],
        operation: true,
        indicesTries: Array.from({ length: indiceInsertion }, (_, index) => index),
      };

      if (valeurs[indiceCourant - 1] > valeurs[indiceCourant]) {
        [valeurs[indiceCourant - 1], valeurs[indiceCourant]] = [valeurs[indiceCourant], valeurs[indiceCourant - 1]];
        indiceCourant -= 1;
        yield {
          valeurs: [...valeurs],
          indicesComparaison: [indiceCourant, indiceCourant + 1],
          operation: true,
          indicesTries: Array.from({ length: indiceInsertion }, (_, index) => index),
          echange: true,
        };
      } else {
        break;
      }
    }
  }

  yield { valeurs: [...valeurs], indicesComparaison: [], termine: true, indicesTries: Array.from({ length: nombreElements }, (_, index) => index) };
}

function* triFusion(valeursDepart: number[]) {
  const valeurs = [...valeursDepart];
  const valeursAuxiliaires = [...valeursDepart];

  function* fusionner(debut: number, milieu: number, fin: number): Generator<EtatTri> {
    for (let indiceCopie = debut; indiceCopie <= fin; indiceCopie += 1) {
      valeursAuxiliaires[indiceCopie] = valeurs[indiceCopie];
    }

    let indiceGauche = debut;
    let indiceDroite = milieu + 1;

    for (let indiceFusion = debut; indiceFusion <= fin; indiceFusion += 1) {
      let indicesComparaison: number[] = [];

      if (indiceGauche > milieu) {
        valeurs[indiceFusion] = valeursAuxiliaires[indiceDroite];
        indiceDroite += 1;
      } else if (indiceDroite > fin) {
        valeurs[indiceFusion] = valeursAuxiliaires[indiceGauche];
        indiceGauche += 1;
      } else {
        indicesComparaison = [indiceGauche, indiceDroite];

        if (valeursAuxiliaires[indiceDroite] < valeursAuxiliaires[indiceGauche]) {
          valeurs[indiceFusion] = valeursAuxiliaires[indiceDroite];
          indiceDroite += 1;
        } else {
          valeurs[indiceFusion] = valeursAuxiliaires[indiceGauche];
          indiceGauche += 1;
        }
      }

      yield {
        indicesActifs: [indiceFusion],
        indicesComparaison,
        valeurs: [...valeurs],
        operation: true,
        plageActive: [debut, fin],
        echange: true,
      };
    }
  }

  function* diviserEtFusionner(debut: number, fin: number): Generator<EtatTri> {
    if (fin <= debut) {
      return;
    }

    const milieu = Math.floor((debut + fin) / 2);
    yield* diviserEtFusionner(debut, milieu);
    yield* diviserEtFusionner(milieu + 1, fin);
    yield* fusionner(debut, milieu, fin);
  }

  yield* diviserEtFusionner(0, valeurs.length - 1);
  yield { indicesActifs: [], valeurs: [...valeurs], termine: true, indicesTries: Array.from({ length: valeurs.length }, (_, index) => index) };
}

function* triRapide(valeursDepart: number[]) {
  const valeurs = [...valeursDepart];
  const indicesPivots = new Set<number>();

  function* partitionner(debut: number, fin: number): Generator<EtatTri, number> {
    const valeurPivot = valeurs[fin];
    let indicePlusPetit = debut - 1;

    for (let indiceLecture = debut; indiceLecture < fin; indiceLecture += 1) {
      yield {
        valeurs: [...valeurs],
        indicesComparaison: [indiceLecture, fin],
        operation: true,
        indicePivot: fin,
        indicesPivots: [...indicesPivots],
      };

      if (valeurs[indiceLecture] <= valeurPivot) {
        indicePlusPetit += 1;
        [valeurs[indicePlusPetit], valeurs[indiceLecture]] = [valeurs[indiceLecture], valeurs[indicePlusPetit]];
        yield {
          valeurs: [...valeurs],
          indicesComparaison: [indicePlusPetit, indiceLecture],
          operation: true,
          indicePivot: fin,
          indicesPivots: [...indicesPivots],
          echange: indicePlusPetit !== indiceLecture,
        };
      }
    }

    [valeurs[indicePlusPetit + 1], valeurs[fin]] = [valeurs[fin], valeurs[indicePlusPetit + 1]];
    indicesPivots.add(indicePlusPetit + 1);
    yield {
      valeurs: [...valeurs],
      indicesComparaison: [],
      operation: true,
      indicePivot: indicePlusPetit + 1,
      indicesPivots: [...indicesPivots],
      echange: indicePlusPetit + 1 !== fin,
    };

    return indicePlusPetit + 1;
  }

  function* trierRapidement(debut: number, fin: number): Generator<EtatTri> {
    if (debut >= fin) {
      if (debut === fin) {
        indicesPivots.add(debut);
      }

      return;
    }

    const indicePivot = yield* partitionner(debut, fin);
    yield* trierRapidement(debut, indicePivot - 1);
    yield* trierRapidement(indicePivot + 1, fin);
  }

  yield* trierRapidement(0, valeurs.length - 1);
  yield {
    valeurs: [...valeurs],
    indicesComparaison: [],
    termine: true,
    indicesPivots: [...indicesPivots],
    indicesTries: Array.from({ length: valeurs.length }, (_, index) => index),
  };
}

const DEFINITIONS_TRIS: Record<TypeTri, DefinitionTri> = {
  bulles: {
    etiquetteMeilleurCas: 'O(n)',
    description: 'Compare deux cases voisines et les échange si elles sont dans le mauvais ordre.',
    exempleInfobulle: 'Dans le pire cas, les grandes valeurs remontent une position à la fois vers la fin du tableau.',
    genererEtapes: triBulles,
    id: 'bulles',
    nuanceInfobulle: 'Le tri à bulles parcourt le tableau plusieurs fois. À chaque passage, il compare deux voisins et échange leur place si l’ordre est mauvais.',
    vitesseInitiale: 120,
    etiquetteEspace: 'O(1)',
    titre: 'Tri à bulles',
    etiquettePireCas: 'O(n^2)',
  },
  selection: {
    etiquetteMeilleurCas: 'O(n^2)',
    description: 'Cherche le minimum restant, puis le place au début de la partie non triée.',
    exempleInfobulle: 'La simulation marque le minimum courant, puis montre son placement au début de la zone non triée.',
    genererEtapes: triSelection,
    id: 'selection',
    nuanceInfobulle: 'Le tri par sélection cherche toujours la plus petite valeur restante. Même si le tableau est presque trié, il doit encore inspecter la partie non triée.',
    vitesseInitiale: 120,
    etiquetteEspace: 'O(1)',
    titre: 'Tri par sélection',
    etiquettePireCas: 'O(n^2)',
  },
  insertion: {
    etiquetteMeilleurCas: 'O(n)',
    description: 'Construit une partie triée de gauche à droite en insérant chaque valeur.',
    exempleInfobulle: 'Si le tableau est déjà presque trié, il y a peu de déplacements et le tri devient très rapide.',
    genererEtapes: triInsertion,
    id: 'insertion',
    nuanceInfobulle: 'Le tri par insertion construit une zone triée à gauche. Chaque nouvelle valeur recule jusqu’à sa bonne position.',
    vitesseInitiale: 120,
    etiquetteEspace: 'O(1)',
    titre: 'Tri par insertion',
    etiquettePireCas: 'O(n^2)',
  },
  fusion: {
    etiquetteMeilleurCas: 'O(n log n)',
    description: 'Divise le tableau, trie les morceaux, puis fusionne les parties ordonnées.',
    exempleInfobulle: 'Les copies visibles représentent le tableau auxiliaire utilisé pour fusionner proprement les sous-tableaux.',
    genererEtapes: triFusion,
    id: 'fusion',
    nuanceInfobulle: 'Le tri fusion divise le tableau en petits morceaux, puis fusionne des morceaux déjà ordonnés. Il garde un temps stable, mais utilise de la mémoire supplémentaire.',
    vitesseInitiale: 80,
    etiquetteEspace: 'O(n)',
    titre: 'Tri fusion',
    etiquettePireCas: 'O(n log n)',
  },
  rapide: {
    etiquetteMeilleurCas: 'O(n log n)',
    description: 'Choisit un pivot et partitionne les valeurs avant de trier chaque côté.',
    exempleInfobulle: 'Le pivot sépare les petites valeurs des grandes; un mauvais pivot peut déséquilibrer le travail.',
    genererEtapes: triRapide,
    id: 'rapide',
    nuanceInfobulle: 'Le tri rapide choisit un pivot, place les valeurs plus petites d’un côté et les plus grandes de l’autre, puis recommence sur chaque sous-partie.',
    vitesseInitiale: 80,
    etiquetteEspace: 'O(log n)',
    titre: 'Tri rapide',
    etiquettePireCas: 'O(n^2)',
  },
};

function CurseurTri({
  desactive = false,
  etiquette,
  maximum,
  minimum,
  modifierValeur,
  pas,
  suffixe = '',
  valeur,
}: ProprietesCurseur) {
  const definirDepuisEvenement = useCallback((event: GestureResponderEvent) => {
    if (desactive) {
      return;
    }

    event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, positionPageX) => {
      const position = borner(event.nativeEvent.pageX - positionPageX, 0, largeurMesuree);
      const valeurBrute = minimum + (position / largeurMesuree) * (maximum - minimum);
      const prochaineValeur = borner(arrondirAuPas(valeurBrute, pas), minimum, maximum);

      modifierValeur(Number(prochaineValeur.toFixed(0)));
    });
  }, [desactive, maximum, minimum, modifierValeur, pas]);

  const repondeurPanoramique = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => !desactive,
        onMoveShouldSetPanResponderCapture: () => !desactive,
        onPanResponderGrant: definirDepuisEvenement,
        onPanResponderMove: definirDepuisEvenement,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => !desactive,
        onStartShouldSetPanResponderCapture: () => !desactive,
      }),
    [desactive, definirDepuisEvenement]
  );

  const pourcentage = ((valeur - minimum) / (maximum - minimum)) * 100;

  return (
    <View style={styles.blocCurseur}>
      <View style={styles.enteteCurseur}>
        <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquette}>
          {etiquette}
        </TexteTheme>
        <TexteTheme lightColor={themeActif.ink} style={styles.texteValeurCurseur}>
          {valeur}
          {suffixe}
        </TexteTheme>
      </View>
      <View
        {...repondeurPanoramique.panHandlers}
        style={[styles.pisteCurseur, WEB_SLIDER_INTERACTION_STYLE, desactive ? styles.pisteCurseurDesactivee : null]}>
        <View style={[styles.remplissageCurseur, { width: `${pourcentage}%` }]} />
        <View style={[styles.poigneeCurseur, WEB_SLIDER_INTERACTION_STYLE, { left: `${pourcentage}%` }]} />
      </View>
    </View>
  );
}

function obtenirCouleurBarre(index: number, etat: EtatTri) {
  const estCompare = etat.indicesComparaison?.includes(index);
  const estTrie = etat.indicesTries?.includes(index) || etat.indicesPivots?.includes(index);
  const estActif = etat.indicesActifs?.includes(index);
  const estDansPlage = etat.plageActive ? index >= etat.plageActive[0] && index <= etat.plageActive[1] : false;
  const estMinimum = etat.indiceMinimum === index && !estTrie;
  const estPivot = etat.indicePivot === index && !estTrie;

  if (etat.termine || estTrie) {
    return themeActif.accent;
  }

  if (estPivot || estMinimum) {
    return themeActif.approximationNegativeStroke;
  }

  if (estCompare || estActif) {
    return themeActif.bounds;
  }

  if (estDansPlage) {
    return themeActif.approximationStroke;
  }

  return themeActif.function;
}

function EtiquetteStat({ etiquette, valeur }: { etiquette: string; valeur: string | number }) {
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

function BoutonAction({
  accent,
  children,
  desactive = false,
  sansBordure = false,
  selectionne = false,
  onPress,
}: {
  accent?: string;
  children: React.ReactNode;
  desactive?: boolean;
  sansBordure?: boolean;
  selectionne?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={desactive}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.boutonAction,
        selectionne ? styles.boutonActionSelectionne : { borderColor: accent ?? themeActif.border },
        sansBordure ? styles.boutonActionSansBordure : null,
        desactive ? styles.boutonActionDesactive : null,
        pressed || hovered ? styles.boutonActionAppuye : null,
      ]}>
      {children}
    </Pressable>
  );
}

export function EcranSimulationTri({ type }: ProprietesEcranSimulationTri) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const dimensionsEcran = useWindowDimensions();
  const definitionTri = DEFINITIONS_TRIS[type];
  const estLarge = dimensionsEcran.width >= 900;
  const largeurZoneTravail = Math.min(dimensionsEcran.width - 24, 1180);
  const largeurGraphique = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const hauteurGraphique = estLarge ? 330 : 260;
  const defilementY = useRef(new Animated.Value(0)).current;
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateurRef = useRef<Generator<EtatTri> | null>(null);
  const lectureActiveRef = useRef(false);
  const vitesseRef = useRef(definitionTri.vitesseInitiale);
  const [taille, setTaille] = useState(16);
  const [vitesse, setVitesse] = useState(definitionTri.vitesseInitiale);
  const [tableauDepart, setTableauDepart] = useState(() => genererTableau(16, 'aleatoire', type));
  const [etatTri, setEtatTri] = useState<EtatTri>(() => ({
    valeurs: genererTableau(16, 'aleatoire', type),
    indicesComparaison: [],
    indicesTries: [],
  }));
  const [lectureActive, setLectureActive] = useState(false);
  const [comparaisons, setComparaisons] = useState(0);
  const [echanges, setEchanges] = useState(0);
  const [operations, setOperations] = useState(0);
  const [casTableauActif, setCasTableauActif] = useState<CasTableau>('aleatoire');

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  COULEUR_ARRIERE_PLAN = themeActif.background;
  styles = creerStyles();

  const reinitialiser = useCallback((casTableau: CasTableau = 'aleatoire') => {
    if (minuteurRef.current) {
      clearTimeout(minuteurRef.current);
      minuteurRef.current = null;
    }

    const prochainTableau = genererTableau(taille, casTableau, type);
    setCasTableauActif(casTableau);
    lectureActiveRef.current = false;
    generateurRef.current = null;
    setTableauDepart(prochainTableau);
    setComparaisons(0);
    setOperations(0);
    setLectureActive(false);
    setEtatTri({ valeurs: prochainTableau, indicesComparaison: [], indicesTries: [] });
    setEchanges(0);
  }, [taille, type]);

  useEffect(() => {
    vitesseRef.current = vitesse;
  }, [vitesse]);

  useEffect(() => {
    lectureActiveRef.current = lectureActive;
  }, [lectureActive]);

  useEffect(() => {
    reinitialiser('aleatoire');
  }, [reinitialiser]);

  useEffect(
    () => () => {
      if (minuteurRef.current) {
        clearTimeout(minuteurRef.current);
      }
    },
    []
  );

  const avancer = useCallback(() => {
    if (!lectureActiveRef.current || !generateurRef.current) {
      return;
    }

    const resultat = generateurRef.current.next();

    if (resultat.done || resultat.value.termine) {
      lectureActiveRef.current = false;
      setLectureActive(false);

      if (!resultat.done) {
        setEtatTri(resultat.value);
      }

      return;
    }

    const etape = resultat.value;
    setEtatTri(etape);

    if (etape.operation) {
      setOperations((valeurActuelle) => valeurActuelle + 1);
    }

    if (etape.indicesComparaison?.length) {
      setComparaisons((valeurActuelle) => valeurActuelle + 1);
    }

    if (etape.echange) {
      setEchanges((valeurActuelle) => valeurActuelle + 1);
    }

    minuteurRef.current = setTimeout(avancer, vitesseRef.current);
  }, []);

  const basculerLecture = useCallback(() => {
    if (lectureActiveRef.current) {
      lectureActiveRef.current = false;
      setLectureActive(false);

      if (minuteurRef.current) {
        clearTimeout(minuteurRef.current);
        minuteurRef.current = null;
      }

      return;
    }

    if (!generateurRef.current) {
      generateurRef.current = definitionTri.genererEtapes(tableauDepart);
    }

    lectureActiveRef.current = true;
    setLectureActive(true);
    minuteurRef.current = setTimeout(avancer, vitesseRef.current);
  }, [avancer, tableauDepart, definitionTri]);

  const valeurMaximum = useMemo(() => Math.max(...etatTri.valeurs, 1), [etatTri.valeurs]);
  const attendu = definitionTri.id === 'fusion' || definitionTri.id === 'rapide'
    ? Math.round(taille * Math.log2(taille))
    : taille * taille;

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: COULEUR_ARRIERE_PLAN }]}>
      <VueTheme
        darkColor={COULEUR_ARRIERE_PLAN}
        lightColor={COULEUR_ARRIERE_PLAN}
        style={[styles.conteneur, { backgroundColor: COULEUR_ARRIERE_PLAN }]}>
        <Animated.View style={styles.superpositionEntete}>
          <EnteteEcranSimulation titre={definitionTri.titre} domaine="programmation-java" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={styles.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], {
            useNativeDriver: Platform.OS !== 'web',
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.zoneTravail, { flexDirection: estLarge ? 'row' : 'column', width: largeurZoneTravail }]}>
            <View style={[styles.colonneSimulation, { width: largeurGraphique }]}>
              <View style={styles.blocTitre}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.surtitre}>
                  Simulation de tri
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.titre}>
                  {definitionTri.titre}
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  {definitionTri.description}
                </TexteTheme>
              </View>

              <View style={styles.rangeeComplexites}>
                <View style={styles.pastilleComplexite}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteComplexite}>
                    Meilleur
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.accent} style={styles.valeurComplexite}>
                    {definitionTri.etiquetteMeilleurCas}
                  </TexteTheme>
                </View>
                <View style={styles.pastilleComplexite}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteComplexite}>
                    Pire
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.approximationNegativeStroke} style={styles.valeurComplexite}>
                    {definitionTri.etiquettePireCas}
                  </TexteTheme>
                </View>
                <View style={styles.pastilleComplexite}>
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteComplexite}>
                    Espace
                  </TexteTheme>
                  <TexteTheme lightColor={themeActif.approximationStroke} style={styles.valeurComplexite}>
                    {definitionTri.etiquetteEspace}
                  </TexteTheme>
                </View>
              </View>

              <View style={[styles.cadreGraphique, { height: hauteurGraphique }]}>
                <View style={styles.fondGraphique}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <View key={index} style={[styles.ligneGrille, { bottom: `${index * 20}%` }]} />
                  ))}
                </View>
                <View style={styles.rangeeBarres}>
                  {etatTri.valeurs.map((valeur, index) => (
                    <View
                      key={`${index}-${valeur}`}
                      style={[
                        styles.barre,
                        {
                          backgroundColor: obtenirCouleurBarre(index, etatTri),
                          height: `${Math.max((valeur / valeurMaximum) * 100, 5)}%`,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.rangeeLegende}>
                <View style={styles.elementLegende}>
                  <View style={[styles.pastilleLegende, { backgroundColor: themeActif.function }]} />
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                    valeur
                  </TexteTheme>
                </View>
                <View style={styles.elementLegende}>
                  <View style={[styles.pastilleLegende, { backgroundColor: themeActif.bounds }]} />
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                    comparé
                  </TexteTheme>
                </View>
                <View style={styles.elementLegende}>
                  <View style={[styles.pastilleLegende, { backgroundColor: themeActif.approximationNegativeStroke }]} />
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                    pivot/min
                  </TexteTheme>
                </View>
                <View style={styles.elementLegende}>
                  <View style={[styles.pastilleLegende, { backgroundColor: themeActif.accent }]} />
                  <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                    trié
                  </TexteTheme>
                </View>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: dimensionsEcran.width < 560 ? 'column' : 'row' }]}>
                <EtiquetteStat etiquette="Comparaisons" valeur={comparaisons} />
                <EtiquetteStat etiquette={definitionTri.id === 'fusion' ? 'Copies' : 'Échanges'} valeur={echanges} />
                <EtiquetteStat etiquette="Opérations" valeur={`${operations} / ~${attendu}`} />
              </View>
            </View>

            <View style={[styles.barreLaterale, { width: largeurPanneau, top: estLarge ? 105 : 10}]}>
              <View style={styles.panneau}>
                <CurseurTri
                  desactive={lectureActive}
                  etiquette="Éléments"
                  maximum={30}
                  minimum={6}
                  modifierValeur={setTaille}
                  pas={2}
                  valeur={taille}
                />
                <CurseurTri
                  etiquette="Vitesse"
                  maximum={300}
                  minimum={20}
                  modifierValeur={setVitesse}
                  pas={20}
                  suffixe=" ms"
                  valeur={vitesse}
                />
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Cas de départ
                </TexteTheme>
                <View style={styles.grilleCas}>
                  <BoutonAction
                    accent={themeActif.accent}
                    desactive={lectureActive}
                    onPress={() => reinitialiser('meilleur')}
                    sansBordure
                    selectionne={casTableauActif === 'meilleur'}>
                    <TexteTheme
                      lightColor="#FFFFFF"
                      darkColor="#FFFFFF"
                      style={[
                        styles.texteBoutonAction,
                        casTableauActif === 'meilleur' ? styles.texteBoutonActionSelectionne : null,
                      ]}>
                      Meilleur cas
                    </TexteTheme>
                  </BoutonAction>
                  <BoutonAction
                    accent={themeActif.approximationNegativeStroke}
                    desactive={lectureActive}
                    onPress={() => reinitialiser('pire')}
                    sansBordure
                    selectionne={casTableauActif === 'pire'}>
                    <TexteTheme
                      lightColor="#FFFFFF"
                      darkColor="#FFFFFF"
                      style={[
                        styles.texteBoutonAction,
                        casTableauActif === 'pire' ? styles.texteBoutonActionSelectionne : null,
                      ]}>
                      Pire cas
                    </TexteTheme>
                  </BoutonAction>
                  <BoutonAction
                    desactive={lectureActive}
                    onPress={() => reinitialiser('aleatoire')}
                    sansBordure
                    selectionne={casTableauActif === 'aleatoire'}>
                    <TexteTheme
                      lightColor="#FFFFFF"
                      darkColor="#FFFFFF"
                      style={[
                        styles.texteBoutonAction,
                        casTableauActif === 'aleatoire' ? styles.texteBoutonActionSelectionne : null,
                      ]}>
                      Aléatoire
                    </TexteTheme>
                  </BoutonAction>
                </View>
              </View>

              <View style={styles.panneau}>
                <View style={styles.rangeeLecture}>
                  <BoutonAction accent={themeActif.accent} onPress={basculerLecture} sansBordure>
                    <View style={styles.contenuBouton}>
                      <MaterialCommunityIcons
                        color={themeActif.ink}
                        name={lectureActive ? 'pause' : 'play'}
                        size={19}
                      />
                      <TexteTheme lightColor={themeActif.ink} style={styles.texteBoutonAction}>
                        {lectureActive ? 'Pause' : 'Trier'}
                      </TexteTheme>
                    </View>
                  </BoutonAction>
                  <Pressable
                    disabled={lectureActive}
                    onPress={() => reinitialiser('aleatoire')}
                    style={({ hovered, pressed }) => [
                      styles.boutonReinitialiser,
                      lectureActive ? styles.boutonActionDesactive : null,
                      pressed || hovered ? styles.boutonActionAppuye : null,
                    ]}>
                    <MaterialCommunityIcons color={themeActif.ink} name="restart" size={20} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Dans les cours Java, un tableau regroupe plusieurs valeurs du même type et chaque case possède un index. Un algorithme de tri utilise ces index pour comparer les cases, déplacer les valeurs et obtenir un ordre croissant.",
          definitionTri.nuanceInfobulle,
          "Les compteurs de la simulation montrent pourquoi le cas de départ change le coût : un tableau déjà ordonné, inversé ou aléatoire ne provoque pas les mêmes comparaisons ni les mêmes échanges.",
        ]}
        delayMs={5000}
        exampleLabel="À observer"
        exampleText={definitionTri.exempleInfobulle}
        eyebrow="Définition"
        title={`Qu'est-ce que ${definitionTri.titre.toLowerCase()} ?`}
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    boutonAction: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      flex: 1,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    boutonActionDesactive: {
      opacity: 0.48,
    },
    boutonActionAppuye: {
      transform: [{ translateY: -1 }],
    },
    boutonActionSelectionne: {
      backgroundColor: themeActif.activeButton,
      borderColor: themeActif.activeButton,
    },
    boutonActionSansBordure: {
      borderColor: 'transparent',
    },
    texteBoutonAction: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'center',
    },
    texteBoutonActionSelectionne: {
      color: themeActif.activeInk,
    },
    barre: {
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      flex: 1,
      minWidth: 3,
    },
    rangeeBarres: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      gap: 3,
      padding: 14,
    },
    contenuBouton: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
    },
    grilleCas: {
      gap: 10,
    },
    pastilleComplexite: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minWidth: 112,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    etiquetteComplexite: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 14,
      textTransform: 'uppercase',
    },
    rangeeComplexites: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    valeurComplexite: {
      color: themeActif.ink,
      fontSize: 15,
      fontWeight: '900',
      lineHeight: 20,
      marginTop: 3,
    },
    conteneur: {
      backgroundColor: COULEUR_ARRIERE_PLAN,
      flex: 1,
    },
    contenu: {
      alignItems: 'center',
      flexGrow: 1,
      paddingBottom: 58,
      paddingHorizontal: 12,
      paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + 12,
    },
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 650,
    },
    surtitre: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    fondGraphique: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: themeActif.panel,
    },
    cadreGraphique: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
    },
    ligneGrille: {
      backgroundColor: themeActif.gridSoft,
      height: 1,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    superpositionEntete: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 10,
    },
    etiquette: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    elementLegende: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    rangeeLegende: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    pastilleLegende: {
      borderRadius: 3,
      height: 10,
      width: 10,
    },
    texteLegende: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 15,
    },
    panneau: {
      backgroundColor: themeActif.panel,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 18,
      padding: 16,
      width: '100%',
    },
    titrePanneau: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    boutonReinitialiser: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 52,
    },
    rangeeLecture: {
      flexDirection: 'row',
      gap: 10,
    },
    zoneSecurisee: {
      backgroundColor: COULEUR_ARRIERE_PLAN,
      flex: 1,
    },
    barreLaterale: {
      gap: 16,
    },
    colonneSimulation: {
      gap: 16,
    },
    blocCurseur: {
      gap: 12,
    },
    remplissageCurseur: {
      backgroundColor: themeActif.grid,
      borderRadius: 999,
      height: '100%',
    },
    enteteCurseur: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
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
    pisteCurseur: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 999,
      borderWidth: 1.5,
      height: 16,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    pisteCurseurDesactivee: {
      opacity: 0.58,
    },
    texteValeurCurseur: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'right',
    },
    carteStatistique: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minHeight: 66,
      minWidth: 130,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
    valeurStatistique: {
      color: themeActif.ink,
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 22,
      marginTop: 5,
    },
    titre: {
      color: themeActif.ink,
      fontSize: 34,
      fontWeight: '900',
      lineHeight: 40,
    },
    blocTitre: {
      gap: 6,
    },
    zoneTravail: {
      gap: 20,
    },
  });
}
