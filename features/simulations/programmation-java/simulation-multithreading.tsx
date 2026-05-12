/**
 * Simulation Java du multithreading.
 *
 * Les scénarios génèrent un tableau de tâches visuelles. Des "ouvriers"
 * asynchrones prennent ces tâches selon le nombre de fils choisi et changent
 * leur état: attente, active, terminée, bloquée, etc. Ça donne une image simple
 * d'un pool de threads sans lancer de vrais threads Java.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
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

type TypeScenario = 'calcul' | 'recherche' | 'pipeline';
type EtatTache = 'attente' | 'active' | 'terminee' | 'trouvee' | 'annulee' | 'bloquee';

type TacheVisuelle = {
  detail: string;
  etat: EtatTache;
  fil?: string;
  groupe?: 'principal' | 'ouvrier';
  id: string;
  libelle: string;
  valeur?: string | number;
};

type DefinitionScenario = {
  description: string;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  titre: string;
};

type ThemeSimulationMultithreading = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

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

let themeActif: ThemeSimulationMultithreading = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const NOMBRE_MAX_FILS = 8;
const NOMBRE_MORCEAUX_DEFAUT = 10;
const STYLE_GLISSER_WEB =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

const DEFINITIONS_SCENARIOS: Record<TypeScenario, DefinitionScenario> = {
  calcul: {
    description: 'Le travail est découpé en morceaux, puis chaque fil traite un morceau libre du bassin.',
    icone: 'cpu-64-bit',
    titre: 'Calcul partagé',
  },
  recherche: {
    description: 'Chaque fil inspecte une plage. Quand la valeur est trouvée, les morceaux restants sont annulés.',
    icone: 'magnify',
    titre: 'Recherche avec arrêt',
  },
  pipeline: {
    description: 'Le fil principal prépare l’interface pendant que les fils ouvriers traitent les lots.',
    icone: 'source-branch',
    titre: 'Pipeline parallèle',
  },
};

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirAuPas(valeur: number, pas: number) {
  return Math.round(valeur / pas) * pas;
}

function maintenant() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function attendre(dureeMs: number) {
  return new Promise((resoudre) => setTimeout(resoudre, dureeMs));
}

function formaterTemps(dureeMs: number | null) {
  return dureeMs == null ? '—' : `${Math.round(dureeMs)} ms`;
}

function formaterNombre(valeur: number) {
  return Math.round(valeur).toLocaleString('fr-CA');
}

function estimationTravail(debut: number, fin: number) {
  const taille = Math.max(1, fin - debut + 1);
  const densite = Math.max(2, Math.log(Math.max(fin, 10)));
  return Math.max(1, Math.round(taille / densite));
}

function creerMorceaux(debut: number, fin: number, nombreMorceaux: number): TacheVisuelle[] {
  const taille = Math.max(1, fin - debut + 1);
  const total = Math.min(nombreMorceaux, taille);
  const base = Math.floor(taille / total);
  let reste = taille % total;
  let curseur = debut;

  return Array.from({ length: total }, (_, index) => {
    const longueur = base + (reste > 0 ? 1 : 0);
    reste -= 1;
    const depart = curseur;
    const arrivee = curseur + longueur - 1;
    curseur = arrivee + 1;

    return {
      detail: `${formaterNombre(depart)} à ${formaterNombre(arrivee)}`,
      etat: 'attente',
      id: `morceau-${index}`,
      libelle: `M${index + 1}`,
      valeur: estimationTravail(depart, arrivee),
    };
  });
}

function creerPipeline(nombreLots: number): TacheVisuelle[] {
  const lots = Array.from({ length: nombreLots }, (_, index) => ({
    detail: `lot ${index + 1}`,
    etat: 'attente' as EtatTache,
    groupe: 'ouvrier' as const,
    id: `lot-${index}`,
    libelle: `L${index + 1}`,
  }));

  return [
    {
      detail: 'valider les données',
      etat: 'attente',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-valider',
      libelle: 'P1',
    },
    {
      detail: 'découper le travail',
      etat: 'attente',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-decouper',
      libelle: 'P2',
    },
    ...lots,
    {
      detail: 'préparer l’aperçu',
      etat: 'attente',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-apercu',
      libelle: 'P3',
    },
    {
      detail: 'préparer le rapport',
      etat: 'attente',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-rapport',
      libelle: 'P4',
    },
    {
      detail: 'attendre les lots',
      etat: 'bloquee',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-fusion',
      libelle: 'P5',
    },
    {
      detail: 'afficher le résultat',
      etat: 'attente',
      fil: 'principal',
      groupe: 'principal',
      id: 'principal-rendu',
      libelle: 'P6',
    },
  ];
}

function mettreAJourTache(
  definirTaches: React.Dispatch<React.SetStateAction<TacheVisuelle[]>>,
  id: string,
  modification: Partial<TacheVisuelle>
) {
  definirTaches((taches) => taches.map((tache) => (tache.id === id ? { ...tache, ...modification } : tache)));
}

function codeScenario(typeScenario: TypeScenario, fils: number, limite: number, morceaux: number, cible: number) {
  if (typeScenario === 'calcul') {
    return `ExecutorService bassin = Executors.newFixedThreadPool(${fils});
List<Future<Integer>> resultats = new ArrayList<>();

for (Plage plage : decouper(2, ${limite}, ${morceaux})) {
  resultats.add(bassin.submit(() -> compter(plage)));
}

int total = 0;
for (Future<Integer> resultat : resultats) {
  total += resultat.get();
}`;
  }

  if (typeScenario === 'recherche') {
    return `AtomicBoolean trouve = new AtomicBoolean(false);
ExecutorService bassin = Executors.newFixedThreadPool(${fils});

for (Plage plage : decouper(1, ${limite}, ${morceaux})) {
  bassin.submit(() -> {
    if (trouve.get()) return;
    if (plage.contient(${cible})) {
      trouve.set(true);
      bassin.shutdownNow();
    }
  });
}`;
  }

  return `validerDonnees();
decouperTravail();

Future<?> lots = bassin.submit(() -> traiterLots());
preparerApercu();
preparerRapport();

lots.get();
fusionnerResultats();
afficherResultat();`;
}

function CurseurSimulation({
  desactive = false,
  etiquette,
  maximum,
  minimum,
  modifierValeur,
  pas,
  suffixe = '',
  valeur,
}: ProprietesCurseur) {
  const definirDepuisEvenement = useCallback(
    (event: GestureResponderEvent) => {
      if (desactive) {
        return;
      }

      event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, positionPageX) => {
        const position = borner(event.nativeEvent.pageX - positionPageX, 0, largeurMesuree);
        const valeurBrute = minimum + (position / largeurMesuree) * (maximum - minimum);
        const prochaineValeur = borner(arrondirAuPas(valeurBrute, pas), minimum, maximum);

        modifierValeur(Number(prochaineValeur.toFixed(0)));
      });
    },
    [desactive, maximum, minimum, modifierValeur, pas]
  );

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
        style={[styles.pisteCurseur, STYLE_GLISSER_WEB, desactive ? styles.pisteCurseurDesactivee : null]}>
        <View style={[styles.remplissageCurseur, { width: `${pourcentage}%` }]} />
        <View style={[styles.poigneeCurseur, STYLE_GLISSER_WEB, { left: `${pourcentage}%` }]} />
      </View>
    </View>
  );
}

function BoutonAction({
  children,
  desactive = false,
  icone,
  onPress,
  selectionne = false,
}: {
  children: ReactNode;
  desactive?: boolean;
  icone?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  selectionne?: boolean;
}) {
  return (
    <Pressable
      disabled={desactive}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.boutonAction,
        selectionne ? styles.boutonActionSelectionne : null,
        desactive ? styles.boutonActionDesactive : null,
        pressed || hovered ? styles.boutonActionAppuye : null,
      ]}>
      {icone ? (
        <MaterialCommunityIcons
          color={selectionne ? themeActif.activeInk : themeActif.ink}
          name={icone}
          size={18}
        />
      ) : null}
      {children}
    </Pressable>
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

function couleurEtat(etat: EtatTache) {
  if (etat === 'active') {
    return themeActif.bounds;
  }

  if (etat === 'terminee') {
    return themeActif.function;
  }

  if (etat === 'trouvee') {
    return themeActif.approximationStroke;
  }

  if (etat === 'annulee') {
    return themeActif.approximationNegativeStroke;
  }

  if (etat === 'bloquee') {
    return themeActif.accent;
  }

  return themeActif.grid;
}

function libelleEtat(etat: EtatTache) {
  if (etat === 'active') return 'actif';
  if (etat === 'terminee') return 'fait';
  if (etat === 'trouvee') return 'trouvé';
  if (etat === 'annulee') return 'annulé';
  if (etat === 'bloquee') return 'attente';
  return 'prêt';
}

function GrilleTaches({ taches }: { taches: TacheVisuelle[] }) {
  const defilementRef = useRef<ScrollView | null>(null);
  const [largeurGrille, definirLargeurGrille] = useState(0);
  const indexActif = taches.findIndex((tache) => tache.etat === 'active' || tache.etat === 'trouvee');

  useEffect(() => {
    if (indexActif < 0 || largeurGrille <= 0) {
      return;
    }

    const largeurCarte = 106;
    const espacement = 8;
    const colonnes = Math.max(1, Math.floor((largeurGrille + espacement) / (largeurCarte + espacement)));
    const rangee = Math.floor(indexActif / colonnes);
    defilementRef.current?.scrollTo({ animated: true, y: Math.max(0, rangee * 88 - 12) });
  }, [indexActif, largeurGrille]);

  return (
    <ScrollView
      nestedScrollEnabled
      ref={defilementRef}
      showsVerticalScrollIndicator
      style={styles.zoneDefilementTaches}>
      <View
        onLayout={(event) => definirLargeurGrille(event.nativeEvent.layout.width)}
        style={styles.grilleTaches}>
        {taches.map((tache) => {
          const couleur = couleurEtat(tache.etat);

          return (
            <View key={tache.id} style={[styles.tache, { backgroundColor: `${couleur}22`, borderColor: couleur }]}>
              <View style={styles.enteteTache}>
                <TexteTheme lightColor={couleur} style={[styles.etatTache, { color: couleur }]}>
                  {libelleEtat(tache.etat)}
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} numberOfLines={1} style={styles.filTache}>
                  {tache.fil ?? '—'}
                </TexteTheme>
              </View>
              <TexteTheme lightColor={themeActif.ink} style={styles.libelleTache}>
                {tache.libelle}
              </TexteTheme>
              <TexteTheme lightColor={themeActif.mutedInk} numberOfLines={1} style={styles.detailTache}>
                {tache.detail}
              </TexteTheme>
              {tache.valeur != null ? (
                <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurTache}>
                  {tache.valeur}
                </TexteTheme>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function PanneauExecution({
  accent,
  description,
  resultat,
  taches,
  temps,
  titre,
}: {
  accent: string;
  description: string;
  resultat: string;
  taches: TacheVisuelle[];
  temps: number | null;
  titre: string;
}) {
  return (
    <View style={[styles.panneauExecution, { borderColor: accent }]}>
      <View style={styles.enteteExecution}>
        <View style={styles.titreExecution}>
          <TexteTheme lightColor={accent} style={[styles.titrePanneauExecution, { color: accent }]}>
            {titre}
          </TexteTheme>
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.descriptionExecution}>
            {description}
          </TexteTheme>
        </View>
        <View style={styles.blocTemps}>
          <TexteTheme lightColor={accent} style={[styles.tempsExecution, { color: accent }]}>
            {formaterTemps(temps)}
          </TexteTheme>
          <TexteTheme lightColor={themeActif.mutedInk} numberOfLines={1} style={styles.resultatExecution}>
            {resultat}
          </TexteTheme>
        </View>
      </View>
      <GrilleTaches taches={taches} />
    </View>
  );
}

export function SimulationMultithreading() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const executionRef = useRef(0);
  const annulationRef = useRef(false);
  const [typeScenario, definirTypeScenario] = useState<TypeScenario>('calcul');
  const [nombreFils, definirNombreFils] = useState(4);
  const [nombreMorceaux, definirNombreMorceaux] = useState(NOMBRE_MORCEAUX_DEFAUT);
  const [limite, definirLimite] = useState(80000);
  const [cible, definirCible] = useState(62000);
  const [delai, definirDelai] = useState(150);
  const [executionActive, definirExecutionActive] = useState(false);
  const [tachesSequentielles, definirTachesSequentielles] = useState<TacheVisuelle[]>([]);
  const [tachesParalleles, definirTachesParalleles] = useState<TacheVisuelle[]>([]);
  const [tempsSequentiel, definirTempsSequentiel] = useState<number | null>(null);
  const [tempsParallele, definirTempsParallele] = useState<number | null>(null);
  const [resultatSequentiel, definirResultatSequentiel] = useState('—');
  const [resultatParallele, definirResultatParallele] = useState('—');
  const [journal, definirJournal] = useState('Choisis un scénario, ajuste les valeurs, puis lance la comparaison.');

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estLarge = width >= 900;
  const largeurZoneTravail = Math.min(width - 24, 1180);
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const definitionScenario = DEFINITIONS_SCENARIOS[typeScenario];
  const gain = tempsSequentiel && tempsParallele ? tempsSequentiel / tempsParallele : null;
  const bornesLimite = typeScenario === 'pipeline' ? [8, 24] : [10000, 200000];
  const libelleLimite = typeScenario === 'pipeline' ? 'Lots de pipeline' : 'Limite de plage';
  const valeurLimiteAffichee = typeScenario === 'pipeline' ? nombreMorceaux : limite;

  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  useEffect(
    () => () => {
      executionRef.current += 1;
      annulationRef.current = true;
    },
    []
  );

  const delaiVisuel = useCallback(
    (indexFil: number, multiplicateur = 1) => {
      const variation = ((indexFil * 29) % 55) - 18;
      return Math.max(35, (delai + variation) * multiplicateur);
    },
    [delai]
  );

  const creerTaches = useCallback(() => {
    if (typeScenario === 'pipeline') {
      return creerPipeline(nombreMorceaux);
    }

    return creerMorceaux(typeScenario === 'calcul' ? 2 : 1, limite, nombreMorceaux);
  }, [limite, nombreMorceaux, typeScenario]);

  const executerSequentiel = useCallback(
    async (idExecution: number, taches: TacheVisuelle[]) => {
      const debut = maintenant();
      let cumul = 0;
      let trouve = false;

      for (const tache of taches) {
        if (idExecution !== executionRef.current || annulationRef.current) {
          return;
        }

        mettreAJourTache(definirTachesSequentielles, tache.id, { etat: 'active', fil: 'principal' });
        await attendre(delaiVisuel(0, typeScenario === 'pipeline' ? 1.05 : 0.95));

        if (typeScenario === 'recherche') {
          const [depart, arrivee] = tache.detail.split(' à ').map((texte) => Number(texte.replace(/\s/g, '')));
          trouve = cible >= depart && cible <= arrivee;
          mettreAJourTache(definirTachesSequentielles, tache.id, {
            etat: trouve ? 'trouvee' : 'terminee',
            valeur: trouve ? cible : 'non',
          });

          if (trouve) {
            break;
          }
        } else if (typeScenario === 'pipeline') {
          mettreAJourTache(definirTachesSequentielles, tache.id, {
            etat: 'terminee',
            valeur: tache.groupe === 'ouvrier' ? 'lot' : 'principal',
          });
        } else {
          cumul += Number(tache.valeur ?? 0);
          mettreAJourTache(definirTachesSequentielles, tache.id, { etat: 'terminee' });
        }
      }

      if (idExecution !== executionRef.current || annulationRef.current) {
        return;
      }

      const duree = maintenant() - debut;
      definirTempsSequentiel(duree);
      definirResultatSequentiel(
        typeScenario === 'recherche'
          ? trouve
            ? `trouvé : ${formaterNombre(cible)}`
            : 'introuvable'
          : typeScenario === 'pipeline'
            ? 'pipeline terminé'
            : `≈ ${formaterNombre(cumul)} unités`
      );
    },
    [cible, delaiVisuel, typeScenario]
  );

  const executerCalculParallele = useCallback(
    async (idExecution: number, taches: TacheVisuelle[]) => {
      const debut = maintenant();
      let prochainIndex = 0;
      let cumul = 0;

      async function ouvrier(indexFil: number) {
        while (prochainIndex < taches.length) {
          if (idExecution !== executionRef.current || annulationRef.current) {
            return;
          }

          const tache = taches[prochainIndex];
          prochainIndex += 1;

          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'active', fil: `F${indexFil + 1}` });
          await attendre(delaiVisuel(indexFil));
          cumul += Number(tache.valeur ?? 0);
          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'terminee' });
        }
      }

      await Promise.all(Array.from({ length: Math.min(nombreFils, taches.length) }, (_, index) => ouvrier(index)));

      if (idExecution !== executionRef.current || annulationRef.current) {
        return;
      }

      definirTempsParallele(maintenant() - debut);
      definirResultatParallele(`≈ ${formaterNombre(cumul)} unités`);
      definirJournal(`Le bassin de ${nombreFils} fil(s) a partagé ${taches.length} morceau(x) sans bloquer le fil principal.`);
    },
    [delaiVisuel, nombreFils]
  );

  const executerRechercheParallele = useCallback(
    async (idExecution: number, taches: TacheVisuelle[]) => {
      const debut = maintenant();
      let prochainIndex = 0;
      let trouve = false;

      async function ouvrier(indexFil: number) {
        while (prochainIndex < taches.length && !trouve) {
          if (idExecution !== executionRef.current || annulationRef.current) {
            return;
          }

          const tache = taches[prochainIndex];
          prochainIndex += 1;
          const [depart, arrivee] = tache.detail.split(' à ').map((texte) => Number(texte.replace(/\s/g, '')));

          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'active', fil: `F${indexFil + 1}` });
          await attendre(delaiVisuel(indexFil));

          if (cible >= depart && cible <= arrivee) {
            trouve = true;
            mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'trouvee', valeur: cible });
            definirTachesParalleles((tachesCourantes) =>
              tachesCourantes.map((tacheCourante) =>
                tacheCourante.etat === 'attente' || tacheCourante.etat === 'active'
                  ? { ...tacheCourante, etat: 'annulee', valeur: 'stop' }
                  : tacheCourante
              )
            );
            return;
          }

          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'terminee', valeur: 'non' });
        }
      }

      await Promise.all(Array.from({ length: Math.min(nombreFils, taches.length) }, (_, index) => ouvrier(index)));

      if (idExecution !== executionRef.current || annulationRef.current) {
        return;
      }

      definirTempsParallele(maintenant() - debut);
      definirResultatParallele(trouve ? `trouvé : ${formaterNombre(cible)}` : 'introuvable');
      definirJournal(
        trouve
          ? `Une tâche a trouvé ${formaterNombre(cible)}; les morceaux encore en attente ont été annulés.`
          : `${formaterNombre(cible)} n’a pas été trouvé dans la plage configurée.`
      );
    },
    [cible, delaiVisuel, nombreFils]
  );

  const executerPipelineParallele = useCallback(
    async (idExecution: number, taches: TacheVisuelle[]) => {
      const debut = maintenant();
      const lots = taches.filter((tache) => tache.groupe === 'ouvrier');

      async function etapePrincipale(id: string, valeur = 'principal') {
        if (idExecution !== executionRef.current || annulationRef.current) {
          return;
        }

        mettreAJourTache(definirTachesParalleles, id, { etat: 'active', fil: 'principal' });
        await attendre(delaiVisuel(0, 0.8));
        mettreAJourTache(definirTachesParalleles, id, { etat: 'terminee', valeur });
      }

      await etapePrincipale('principal-valider');
      await etapePrincipale('principal-decouper');

      let prochainIndex = 0;
      async function ouvrier(indexFil: number) {
        while (prochainIndex < lots.length) {
          if (idExecution !== executionRef.current || annulationRef.current) {
            return;
          }

          const tache = lots[prochainIndex];
          prochainIndex += 1;
          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'active', fil: `F${indexFil + 1}` });
          await attendre(delaiVisuel(indexFil));
          mettreAJourTache(definirTachesParalleles, tache.id, { etat: 'terminee', valeur: 'lot' });
        }
      }

      const promesseLots = Promise.all(Array.from({ length: Math.min(nombreFils, lots.length) }, (_, index) => ouvrier(index)));
      await etapePrincipale('principal-apercu');
      await etapePrincipale('principal-rapport');
      mettreAJourTache(definirTachesParalleles, 'principal-fusion', { etat: 'bloquee', valeur: 'lots' });
      await promesseLots;
      await etapePrincipale('principal-fusion', 'fusion');
      await etapePrincipale('principal-rendu', 'rendu');

      if (idExecution !== executionRef.current || annulationRef.current) {
        return;
      }

      definirTempsParallele(maintenant() - debut);
      definirResultatParallele('pipeline terminé');
      definirJournal('Le fil principal a préparé l’aperçu et le rapport pendant que les lots étaient traités en parallèle.');
    },
    [delaiVisuel, nombreFils]
  );

  const reinitialiser = useCallback(() => {
    executionRef.current += 1;
    annulationRef.current = true;
    definirExecutionActive(false);
    definirTachesSequentielles([]);
    definirTachesParalleles([]);
    definirTempsSequentiel(null);
    definirTempsParallele(null);
    definirResultatSequentiel('—');
    definirResultatParallele('—');
    definirJournal('Réinitialisé. Ajuste les paramètres, puis relance la simulation.');
  }, []);

  const lancerSimulation = useCallback(() => {
    const prochaineLimite = borner(limite, 10000, 200000);
    const prochaineCible = borner(cible, 1, prochaineLimite);
    const prochainId = executionRef.current + 1;
    const taches = creerTaches();
    const tachesSequence = taches.map((tache) => ({ ...tache }));
    const tachesPool = taches.map((tache) => ({ ...tache }));

    executionRef.current = prochainId;
    annulationRef.current = false;
    definirLimite(prochaineLimite);
    definirCible(prochaineCible);
    definirTachesSequentielles(tachesSequence);
    definirTachesParalleles(tachesPool);
    definirTempsSequentiel(null);
    definirTempsParallele(null);
    definirResultatSequentiel('—');
    definirResultatParallele('—');
    definirExecutionActive(true);
    definirJournal(`${definitionScenario.titre} lancé avec ${nombreFils} fil(s) et ${taches.length} tâche(s).`);

    const executionSequence = executerSequentiel(prochainId, tachesSequence);
    const executionPool =
      typeScenario === 'calcul'
        ? executerCalculParallele(prochainId, tachesPool)
        : typeScenario === 'recherche'
          ? executerRechercheParallele(prochainId, tachesPool)
          : executerPipelineParallele(prochainId, tachesPool);

    Promise.all([executionSequence, executionPool]).then(() => {
      if (prochainId === executionRef.current && !annulationRef.current) {
        definirExecutionActive(false);
      }
    });
  }, [
    cible,
    creerTaches,
    definitionScenario.titre,
    executerCalculParallele,
    executerPipelineParallele,
    executerRechercheParallele,
    executerSequentiel,
    limite,
    nombreFils,
    typeScenario,
  ]);

  const tachesApercu = useMemo(() => {
    const taches = creerTaches();
    return taches.length ? taches : creerMorceaux(1, limite, nombreMorceaux);
  }, [creerTaches, limite, nombreMorceaux]);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Multithreading" domaine="programmation-java" />
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
                  Simulation Java
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={styles.titre}>
                  Multithreading
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.description}>
                  Compare une exécution séquentielle avec un bassin de fils qui partage les tâches, annule une recherche ou chevauche un pipeline.
                </TexteTheme>
              </View>

              <View style={[styles.grilleExecutions, { flexDirection: width < 720 ? 'column' : 'row' }]}>
                <PanneauExecution
                  accent={themeActif.approximationNegativeStroke}
                  description="Une tâche après l’autre"
                  resultat={resultatSequentiel}
                  taches={tachesSequentielles.length ? tachesSequentielles : tachesApercu}
                  temps={tempsSequentiel}
                  titre="Sans fils"
                />
                <PanneauExecution
                  accent={themeActif.function}
                  description={`${nombreFils} fil(s) disponibles`}
                  resultat={resultatParallele}
                  taches={tachesParalleles.length ? tachesParalleles : tachesApercu}
                  temps={tempsParallele}
                  titre="Bassin de fils"
                />
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Séquentiel" valeur={formaterTemps(tempsSequentiel)} />
                <CarteStatistique etiquette="Parallèle" valeur={formaterTemps(tempsParallele)} />
                <CarteStatistique etiquette="Gain" valeur={gain ? `${gain.toFixed(2)}x` : '—'} />
              </View>

              <View style={styles.journal}>
                <TexteTheme lightColor={themeActif.ink} style={styles.texteJournal}>
                  {journal}
                </TexteTheme>
              </View>

              <View style={styles.carteCode}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>
                    {codeScenario(typeScenario, nombreFils, limite, nombreMorceaux, cible)}
                  </TexteTheme>
                </ScrollView>
              </View>
            </View>

            <View style={[styles.barreLaterale, estLarge ? styles.barreLateraleAligneeAnimation : null, { width: largeurPanneau }]}>
              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Scénario
                </TexteTheme>
                {(Object.keys(DEFINITIONS_SCENARIOS) as TypeScenario[]).map((scenario) => {
                  const definition = DEFINITIONS_SCENARIOS[scenario];
                  const selectionne = scenario === typeScenario;

                  return (
                    <BoutonAction
                      desactive={executionActive}
                      icone={definition.icone}
                      key={scenario}
                      onPress={() => definirTypeScenario(scenario)}
                      selectionne={selectionne}>
                      <TexteTheme
                        lightColor={selectionne ? themeActif.activeInk : themeActif.ink}
                        style={[
                          styles.texteBoutonAction,
                          selectionne ? styles.texteBoutonActionSelectionne : null,
                        ]}>
                        {definition.titre}
                      </TexteTheme>
                    </BoutonAction>
                  );
                })}
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.descriptionScenario}>
                  {definitionScenario.description}
                </TexteTheme>
              </View>

              <View style={styles.panneau}>
                <CurseurSimulation
                  desactive={executionActive}
                  etiquette={libelleLimite}
                  maximum={bornesLimite[1]}
                  minimum={bornesLimite[0]}
                  modifierValeur={typeScenario === 'pipeline' ? definirNombreMorceaux : definirLimite}
                  pas={typeScenario === 'pipeline' ? 1 : 10000}
                  valeur={valeurLimiteAffichee}
                />
                {typeScenario === 'recherche' ? (
                  <CurseurSimulation
                    desactive={executionActive}
                    etiquette="Valeur cible"
                    maximum={limite}
                    minimum={1}
                    modifierValeur={definirCible}
                    pas={1000}
                    valeur={cible}
                  />
                ) : null}
                {typeScenario !== 'pipeline' ? (
                  <CurseurSimulation
                    desactive={executionActive}
                    etiquette="Morceaux"
                    maximum={18}
                    minimum={4}
                    modifierValeur={definirNombreMorceaux}
                    pas={1}
                    valeur={nombreMorceaux}
                  />
                ) : null}
                <CurseurSimulation
                  desactive={executionActive}
                  etiquette="Fils"
                  maximum={NOMBRE_MAX_FILS}
                  minimum={1}
                  modifierValeur={definirNombreFils}
                  pas={1}
                  valeur={nombreFils}
                />
                <CurseurSimulation
                  etiquette="Délai visuel"
                  maximum={420}
                  minimum={50}
                  modifierValeur={definirDelai}
                  pas={10}
                  suffixe=" ms"
                  valeur={delai}
                />
              </View>

              <View style={styles.panneau}>
                <View style={styles.rangeeActions}>
                  <BoutonAction desactive={executionActive} icone="play" onPress={lancerSimulation} selectionne>
                    <TexteTheme lightColor={themeActif.activeInk} style={styles.texteBoutonActionSelectionne}>
                      {executionActive ? 'En cours' : 'Comparer'}
                    </TexteTheme>
                  </BoutonAction>
                  <Pressable
                    onPress={reinitialiser}
                    style={({ hovered, pressed }) => [
                      styles.boutonReinitialiser,
                      pressed || hovered ? styles.boutonActionAppuye : null,
                    ]}>
                    <MaterialCommunityIcons color={themeActif.ink} name="restart" size={20} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.panneau}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Légende
                </TexteTheme>
                <View style={styles.grilleLegende}>
                  {(['attente', 'active', 'terminee', 'trouvee', 'annulee', 'bloquee'] as EtatTache[]).map((etat) => (
                    <View key={etat} style={styles.elementLegende}>
                      <View style={[styles.pastilleLegende, { backgroundColor: couleurEtat(etat) }]} />
                      <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                        {libelleEtat(etat)}
                      </TexteTheme>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Le multithreading permet à plusieurs fils d'exécuter des tâches indépendantes en même temps, souvent à travers un ExecutorService.",
          "Le gain dépend du découpage, du nombre de fils et des attentes. Trop de fils peut ajouter du coût au lieu d'accélérer le programme.",
        ]}
        delayMs={5000}
        exampleLabel="Idée clé"
        exampleText="Un bassin de fils réutilise quelques ouvriers au lieu de créer un fil pour chaque petite tâche."
        eyebrow="Définition"
        title="Qu'est-ce que le multithreading ?"
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
    blocTemps: {
      alignItems: 'flex-end',
      flexShrink: 0,
      gap: 2,
      minWidth: 88,
    },
    blocTitre: {
      gap: 6,
    },
    boutonAction: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 9,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    boutonActionAppuye: {
      transform: [{ translateY: 1 }],
    },
    boutonActionDesactive: {
      opacity: 0.48,
    },
    boutonActionSelectionne: {
      backgroundColor: themeActif.activeButton,
      borderColor: themeActif.activeButton,
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
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 710,
    },
    descriptionExecution: {
      color: themeActif.mutedInk,
      fontSize: 11,
      fontWeight: '800',
      lineHeight: 15,
    },
    descriptionScenario: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 18,
    },
    detailTache: {
      color: themeActif.mutedInk,
      fontSize: 10,
      fontWeight: '700',
      lineHeight: 13,
    },
    elementLegende: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 7,
      minWidth: 84,
    },
    enteteCurseur: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteExecution: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteTache: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'space-between',
    },
    etiquette: {
      color: themeActif.mutedInk,
      fontSize: 13,
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
    etatTache: {
      fontSize: 10,
      fontWeight: '900',
      lineHeight: 13,
      textTransform: 'uppercase',
    },
    filTache: {
      color: themeActif.mutedInk,
      fontSize: 10,
      fontWeight: '900',
      lineHeight: 13,
    },
    grilleExecutions: {
      gap: 12,
    },
    grilleLegende: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    grilleStatistiques: {
      gap: 10,
    },
    grilleTaches: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingRight: 4,
    },
    journal: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      minHeight: 64,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    libelleTache: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      marginTop: 4,
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
    panneauExecution: {
      backgroundColor: themeActif.panel,
      borderRadius: 8,
      borderWidth: 1.5,
      flex: 1,
      gap: 14,
      padding: 14,
    },
    pastilleLegende: {
      borderRadius: 3,
      height: 10,
      width: 10,
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
    poigneeCurseur: {
      backgroundColor: themeActif.ink,
      borderColor: themeActif.panel,
      borderRadius: 10,
      height: 20,
      marginLeft: -10,
      position: 'absolute',
      width: 20,
    },
    rangeeActions: {
      flexDirection: 'row',
      gap: 10,
    },
    remplissageCurseur: {
      backgroundColor: themeActif.grid,
      borderRadius: 999,
      height: '100%',
    },
    resultatExecution: {
      color: themeActif.mutedInk,
      fontSize: 10,
      fontWeight: '800',
      lineHeight: 13,
      maxWidth: 110,
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
    tache: {
      borderRadius: 8,
      borderWidth: 1.2,
      flexBasis: 106,
      flexGrow: 1,
      minHeight: 76,
      paddingHorizontal: 9,
      paddingVertical: 8,
    },
    tempsExecution: {
      fontSize: 15,
      fontWeight: '900',
      lineHeight: 19,
    },
    texteBoutonAction: {
      color: themeActif.ink,
      flex: 1,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'center',
    },
    texteBoutonActionSelectionne: {
      color: themeActif.activeInk,
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
      minWidth: 560,
    },
    texteJournal: {
      color: themeActif.ink,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 19,
    },
    texteLegende: {
      color: themeActif.mutedInk,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 15,
    },
    texteValeurCurseur: {
      color: themeActif.ink,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'right',
    },
    titre: {
      color: themeActif.ink,
      fontSize: 34,
      fontWeight: '900',
      lineHeight: 40,
    },
    titreExecution: {
      flex: 1,
      gap: 3,
      minWidth: 0,
    },
    titrePanneau: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    titrePanneauExecution: {
      fontSize: 13,
      fontWeight: '900',
      lineHeight: 17,
      textTransform: 'uppercase',
    },
    valeurStatistique: {
      color: themeActif.ink,
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 22,
      marginTop: 5,
    },
    valeurTache: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '800',
      lineHeight: 13,
      marginTop: 3,
    },
    zoneSecurisee: {
      backgroundColor: couleurArrierePlan,
      flex: 1,
    },
    zoneDefilementTaches: {
      maxHeight: 340,
    },
    zoneTravail: {
      gap: 20,
    },
  });
}
