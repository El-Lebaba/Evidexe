import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { TexteTheme as TexteThematique } from '@/components/texte-theme';
import { VueTheme as VueThematique } from '@/components/vue-theme';
import { InfobulleDefinition as PopoverDefinition } from '@/features/simulations/core/infobulle-definition';
import { RenduFormule as RenduFormule } from '@/features/simulations/core/rendu-formule';
import {
  ESPACE_CONTENU_ENTETE_SIMULATION as ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION as HAUTEUR_TOTALE_ENTETE_SIMULATION,
  EnteteEcranSimulation as EnTeteEcranSimulation,
} from '@/features/simulations/core/entete-ecran-simulation';

type DefinitionSerie = {
  converge: boolean;
  description: string;
  etiquetteFormule: string;
  etiquetteLimite: string;
  limiteExacte: number;
  nom: string;
  terme: (indice: number) => number;
  texteLatex: string;
};

type PointGraphique = {
  x: number;
  y: number;
};

type DonneeSommePartielle = {
  indice: number;
  somme: number;
  terme: number;
};

const ARRIERE_PLAN_PAGE_SERIES = '#EAE3D2';
const NOMBRE_MIN_TERMES = 5;
const NOMBRE_MAX_TERMES = 100;
const PAS_NOMBRE_TERMES = 5;
const HAUTEUR_GRAPHIQUE_SOMMES = 300;
const HAUTEUR_GRAPHIQUE_TERMES = 170;
const NOMBRE_MAX_BARRES_TERMES = 40;

const PALETTE_SERIES = {
  accent: '#D8A94A',
  accentDoux: 'rgba(216, 169, 74, 0.2)',
  arrierePlan: '#E9ECE4',
  bordure: '#243B53',
  courbe: '#7CCFBF',
  courbeDouce: 'rgba(124, 207, 191, 0.22)',
  grille: '#B7C7B0',
  grilleDouce: 'rgba(167, 184, 158, 0.35)',
  encre: '#243B53',
  limite: '#7EA6E0',
  encreAttenue: '#6E7F73',
  negatif: '#D97B6C',
  panneau: '#DDE4D5',
  surface: '#F3F1E7',
};

// Sur le web, on bloque la selection de texte pendant le glisser du curseur.
const STYLE_GLISSER_CURSEUR_WEB =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

// Liste des series disponibles avec leur terme general et leur limite attendue.
const SERIES_DISPONIBLES: DefinitionSerie[] = [
  {
    converge: true,
    description: 'Suite geometrique positive qui se stabilise rapidement.',
    etiquetteFormule: '1/2^n',
    etiquetteLimite: '2',
    limiteExacte: 2,
    nom: 'Geometrique',
    terme: (indice) => Math.pow(0.5, indice),
    texteLatex: '\\left(\\frac{1}{2}\\right)^n',
  },
  {
    converge: false,
    description: 'Serie harmonique qui diverge lentement.',
    etiquetteFormule: '1/n',
    etiquetteLimite: '\\infty',
    limiteExacte: Number.POSITIVE_INFINITY,
    nom: 'Harmonique',
    terme: (indice) => 1 / indice,
    texteLatex: '\\frac{1}{n}',
  },
  {
    converge: true,
    description: 'Serie de Bale qui converge vers pi carre sur 6.',
    etiquetteFormule: '1/n^2',
    etiquetteLimite: '\\frac{\\pi^2}{6}',
    limiteExacte: (Math.PI * Math.PI) / 6,
    nom: 'Bale',
    terme: (indice) => 1 / (indice * indice),
    texteLatex: '\\frac{1}{n^2}',
  },
  {
    converge: true,
    description: 'Serie alternee classique qui converge vers ln(2).',
    etiquetteFormule: '(-1)^(n+1)/n',
    etiquetteLimite: '\\ln(2)',
    limiteExacte: Math.log(2),
    nom: 'Alternee',
    terme: (indice) => Math.pow(-1, indice + 1) / indice,
    texteLatex: '\\frac{(-1)^{n+1}}{n}',
  },
  {
    converge: true,
    description: 'Serie de Leibniz qui approche pi sur 4.',
    etiquetteFormule: '(-1)^n/(2n+1)',
    etiquetteLimite: '\\frac{\\pi}{4}',
    limiteExacte: Math.PI / 4,
    nom: 'Leibniz',
    terme: (indice) => Math.pow(-1, indice) / (2 * indice + 1),
    texteLatex: '\\frac{(-1)^n}{2n+1}',
  },
];

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function formaterValeur(valeur: number) {
  if (!Number.isFinite(valeur)) {
    return 'infini';
  }

  return valeur.toFixed(5);
}

// Transforme des points en chemin SVG continu pour dessiner la courbe.
function creerCheminSvg(points: PointGraphique[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

// Calcule les sommes partielles S_n = a_1 + ... + a_n a partir du terme general.
function construireSommesPartielles(serie: DefinitionSerie, nombreTermes: number) {
  const donneesSommes: DonneeSommePartielle[] = [];
  let sommeAccumulee = 0;

  for (let indice = 1; indice <= Math.min(nombreTermes, NOMBRE_MAX_TERMES); indice += 1) {
    const valeurTerme = serie.terme(indice);
    sommeAccumulee += valeurTerme;
    donneesSommes.push({ indice, somme: sommeAccumulee, terme: valeurTerme });
  }

  return donneesSommes;
}

function GraphiqueSommesPartielles({
  hauteur,
  largeur,
  serie,
  sommesPartielles,
}: {
  hauteur: number;
  largeur: number;
  serie: DefinitionSerie;
  sommesPartielles: DonneeSommePartielle[];
}) {
  const valeursSommes = sommesPartielles.map((donneeSomme) => donneeSomme.somme);
  const minimumGraphique = Math.min(
    ...valeursSommes,
    serie.converge ? serie.limiteExacte : valeursSommes[0] ?? 0,
    0
  );
  const maximumGraphique = Math.max(
    ...valeursSommes,
    serie.converge ? serie.limiteExacte : valeursSommes[valeursSommes.length - 1] ?? 0,
    0
  );
  const margeVerticale = Math.max((maximumGraphique - minimumGraphique) * 0.14, 0.35);
  const ordonneeMinimum = minimumGraphique - margeVerticale;
  const ordonneeMaximum = maximumGraphique + margeVerticale;
  const indiceMaximum = Math.max(sommesPartielles.length, 2);

  // Conversion du repere mathematique vers les pixels de l'ecran.
  const convertirEnPointEcran = (indice: number, valeur: number): PointGraphique => ({
    x: ((indice - 1) / Math.max(indiceMaximum - 1, 1)) * largeur,
    y: hauteur - ((valeur - ordonneeMinimum) / Math.max(ordonneeMaximum - ordonneeMinimum, 0.0001)) * hauteur,
  });

  const pointsCourbe = sommesPartielles.map((donneeSomme) =>
    convertirEnPointEcran(donneeSomme.indice, donneeSomme.somme)
  );
  const cheminSurface =
    pointsCourbe.length > 1
      ? `${creerCheminSvg(pointsCourbe)} L ${pointsCourbe[pointsCourbe.length - 1].x.toFixed(2)} ${hauteur.toFixed(
          2
        )} L ${pointsCourbe[0].x.toFixed(2)} ${hauteur.toFixed(2)} Z`
      : '';
  const cheminCourbe = pointsCourbe.length > 1 ? creerCheminSvg(pointsCourbe) : '';
  const positionAxeHorizontal = convertirEnPointEcran(1, 0).y;
  const positionLimite = serie.converge ? convertirEnPointEcran(1, serie.limiteExacte).y : null;
  const grilleHorizontale = useMemo(
    () => Array.from({ length: 6 }, (_, indexLigne) => (indexLigne / 5) * hauteur),
    [hauteur]
  );
  const grilleVerticale = useMemo(
    () => Array.from({ length: 6 }, (_, indexLigne) => (indexLigne / 5) * largeur),
    [largeur]
  );

  return (
    <View style={[stylesSeries.graphique, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={PALETTE_SERIES.panneau} height={hauteur} width={largeur} x={0} y={0} />

        {grilleHorizontale.map((y, indexLigne) => (
          <Line
            key={`grille-h-${indexLigne}`}
            stroke={PALETTE_SERIES.grilleDouce}
            strokeWidth={1}
            x1={0}
            x2={largeur}
            y1={y}
            y2={y}
          />
        ))}
        {grilleVerticale.map((x, indexLigne) => (
          <Line
            key={`grille-v-${indexLigne}`}
            stroke={PALETTE_SERIES.grilleDouce}
            strokeWidth={1}
            x1={x}
            x2={x}
            y1={0}
            y2={hauteur}
          />
        ))}

        <Line
          stroke={PALETTE_SERIES.grille}
          strokeWidth={1.5}
          x1={0}
          x2={largeur}
          y1={positionAxeHorizontal}
          y2={positionAxeHorizontal}
        />

        {serie.converge && positionLimite !== null ? (
          <Line
            stroke={PALETTE_SERIES.limite}
            strokeDasharray="8 6"
            strokeWidth={2}
            x1={0}
            x2={largeur}
            y1={positionLimite}
            y2={positionLimite}
          />
        ) : null}

        {cheminSurface ? <Path d={cheminSurface} fill={PALETTE_SERIES.courbeDouce} /> : null}
        {cheminCourbe ? (
          <Path
            d={cheminCourbe}
            fill="none"
            stroke={PALETTE_SERIES.courbe}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
        ) : null}
      </Svg>

      <View style={stylesSeries.legendeGraphique}>
        <View style={stylesSeries.elementLegende}>
          <View style={[stylesSeries.ligneLegende, { backgroundColor: PALETTE_SERIES.courbe }]} />
          <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.texteLegende}>
            Sommes partielles
          </TexteThematique>
        </View>
        {serie.converge ? (
          <View style={stylesSeries.elementLegende}>
            <View
              style={[
                stylesSeries.ligneLegende,
                stylesSeries.ligneLegendePointillee,
                { backgroundColor: PALETTE_SERIES.limite },
              ]}
            />
            <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.texteLegende}>
              Limite
            </TexteThematique>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function GraphiqueBarresTermes({
  hauteur,
  largeur,
  sommesPartielles,
}: {
  hauteur: number;
  largeur: number;
  sommesPartielles: DonneeSommePartielle[];
}) {
  const termesAffiches = sommesPartielles.slice(0, NOMBRE_MAX_BARRES_TERMES);
  const amplitudeMaximale = Math.max(...termesAffiches.map((donneeSomme) => Math.abs(donneeSomme.terme)), 0.001);
  const espaceEntreBarres = 2;
  const nombreBarres = Math.max(termesAffiches.length, 1);
  const largeurBarre = Math.max((largeur - espaceEntreBarres * (nombreBarres - 1)) / nombreBarres, 2);

  return (
    <View style={[stylesSeries.graphique, { height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={PALETTE_SERIES.panneau} height={hauteur} width={largeur} x={0} y={0} />
        <Line
          stroke={PALETTE_SERIES.grille}
          strokeWidth={1.5}
          x1={0}
          x2={largeur}
          y1={hauteur}
          y2={hauteur}
        />

        {termesAffiches.map((donneeSomme, indexBarre) => {
          const amplitudeNormalisee = Math.abs(donneeSomme.terme) / amplitudeMaximale;
          const hauteurBarre = amplitudeNormalisee * (hauteur - 18);
          const positionX = indexBarre * (largeurBarre + espaceEntreBarres);
          const positionY = hauteur - hauteurBarre;

          return (
            <Rect
              key={`barre-${donneeSomme.indice}`}
              fill={donneeSomme.terme >= 0 ? PALETTE_SERIES.courbe : PALETTE_SERIES.negatif}
              height={hauteurBarre}
              rx={3}
              ry={3}
              width={largeurBarre}
              x={positionX}
              y={positionY}
            />
          );
        })}
      </Svg>
    </View>
  );
}

function CurseurNombreEntier({
  etiquette,
  maximum,
  minimum,
  pas,
  surChangement,
  valeur,
}: {
  etiquette: string;
  maximum: number;
  minimum: number;
  pas: number;
  surChangement: (valeur: number) => void;
  valeur: number;
}) {
  const [valeurTexte, definirValeurTexte] = useState(String(valeur));

  useEffect(() => {
    definirValeurTexte(String(valeur));
  }, [valeur]);

  const normaliserValeur = useCallback(
    (prochaineValeur: number) => borner(Math.round(prochaineValeur), minimum, maximum),
    [maximum, minimum]
  );

  const validerValeurTexte = () => {
    const valeurSaisie = Number(valeurTexte.trim());

    if (!Number.isFinite(valeurSaisie)) {
      definirValeurTexte(String(valeur));
      return;
    }

    const valeurAjustee = normaliserValeur(Math.round(valeurSaisie / pas) * pas);
    surChangement(valeurAjustee);
    definirValeurTexte(String(valeurAjustee));
  };

  // Convertit la position du doigt ou de la souris en valeur du curseur.
  const definirDepuisGlisser = useCallback(
    (evenement: GestureResponderEvent) => {
      evenement.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, pageX) => {
        const positionHorizontale = borner(evenement.nativeEvent.pageX - pageX, 0, largeurMesuree);
        const ratio = largeurMesuree === 0 ? 0 : positionHorizontale / largeurMesuree;
        const valeurBrute = minimum + ratio * (maximum - minimum);
        const valeurAjustee = normaliserValeur(Math.round(valeurBrute / pas) * pas);
        surChangement(valeurAjustee);
      });
    },
    [maximum, minimum, normaliserValeur, pas, surChangement]
  );

  const reponseGlisser = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: definirDepuisGlisser,
        onPanResponderMove: definirDepuisGlisser,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
      }),
    [definirDepuisGlisser]
  );

  const pourcentageRemplissage = ((valeur - minimum) / (maximum - minimum || 1)) * 100;

  return (
    <View style={stylesSeries.blocCurseur}>
      <View style={stylesSeries.enteteCurseur}>
        <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquette}>
          {etiquette}
        </TexteThematique>
        <TextInput
          inputMode="numeric"
          keyboardType="numeric"
          onBlur={validerValeurTexte}
          onChangeText={definirValeurTexte}
          onSubmitEditing={validerValeurTexte}
          selectTextOnFocus
          style={stylesSeries.champValeurCurseur}
          value={valeurTexte}
        />
      </View>

      <View {...reponseGlisser.panHandlers} style={[stylesSeries.pisteCurseur, STYLE_GLISSER_CURSEUR_WEB]}>
        <View style={[stylesSeries.remplissageCurseur, { width: `${pourcentageRemplissage}%` }]} />
        <View
          style={[
            stylesSeries.pouceCurseur,
            STYLE_GLISSER_CURSEUR_WEB,
            { left: `${pourcentageRemplissage}%` },
          ]}
        />
      </View>
    </View>
  );
}

export function SimulationSeries() {
  const [indexSerieActive, definirIndexSerieActive] = useState(0);
  const [nombreTermes, definirNombreTermes] = useState(20);
  const animationPositionScroll = useRef(new Animated.Value(0)).current;
  const { width: largeurFenetre } = useWindowDimensions();

  const margeHorizontale = largeurFenetre >= 1200 ? 12 : 16;
  const largeurContenu = largeurFenetre - margeHorizontale * 2;
  const afficherDeuxColonnes = largeurFenetre >= 980;
  const affichageCompact = largeurFenetre < 560;
  const largeurColonneGraphique = afficherDeuxColonnes ? Math.round(largeurContenu * 0.665) : largeurContenu;
  const largeurColonneCommandes = afficherDeuxColonnes ? largeurContenu - largeurColonneGraphique - 20 : largeurContenu;

  const serieActive = SERIES_DISPONIBLES[indexSerieActive];
  const sommesPartielles = useMemo(
    () => construireSommesPartielles(serieActive, nombreTermes),
    [serieActive, nombreTermes]
  );
  const sommeActuelle = sommesPartielles[sommesPartielles.length - 1]?.somme ?? 0;
  const ecartActuel = serieActive.converge ? Math.abs(serieActive.limiteExacte - sommeActuelle) : Number.NaN;

  // L'entete sort completement de l'ecran quand on descend dans la page.
  const translationEntete = animationPositionScroll.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 120],
    outputRange: [0, -HAUTEUR_TOTALE_ENTETE_SIMULATION],
  });
  const opaciteEntete = animationPositionScroll.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0],
  });

  return (
    <SafeAreaView style={stylesSeries.safeArea} edges={['top']}>
      <VueThematique lightColor={PALETTE_SERIES.arrierePlan} style={stylesSeries.conteneur}>
        <Animated.View
          style={[
            stylesSeries.superpositionEntete,
            {
              opacity: opaciteEntete,
              transform: [{ translateY: translationEntete }],
            },
          ]}>
          <EnTeteEcranSimulation titre="Series" domaine="mathematiques" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={stylesSeries.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: animationPositionScroll } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              stylesSeries.espaceTravail,
              {
                flexDirection: afficherDeuxColonnes ? 'row' : 'column',
                paddingLeft: afficherDeuxColonnes ? 22 : 0,
                paddingRight: afficherDeuxColonnes ? 22 : 0,
                width: largeurContenu,
              },
            ]}>
            <View style={[stylesSeries.colonneGraphique, { width: largeurColonneGraphique }]}>
              <View style={stylesSeries.carteFormule}>
                <RenduFormule centered fallback={'S_n = Somme des a_k'} mathematiques={'S_n=\\sum_{k=1}^{n} a_k'} size="md" />
              </View>

              <View style={stylesSeries.panneauGraphique}>
                <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquettePanneau}>
                  Sommes partielles
                </TexteThematique>
                <GraphiqueSommesPartielles
                  hauteur={HAUTEUR_GRAPHIQUE_SOMMES}
                  largeur={largeurColonneGraphique - 32}
                  serie={serieActive}
                  sommesPartielles={sommesPartielles}
                />
              </View>

              <View style={stylesSeries.panneauGraphique}>
                <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquettePanneau}>
                  Valeur des termes |a_n|
                </TexteThematique>
                <GraphiqueBarresTermes
                  hauteur={HAUTEUR_GRAPHIQUE_TERMES}
                  largeur={largeurColonneGraphique - 32}
                  sommesPartielles={sommesPartielles}
                />
              </View>
            </View>

            <View
              style={[
                stylesSeries.colonneLaterale,
                { paddingRight: afficherDeuxColonnes ? 44 : 0, width: largeurColonneCommandes },
              ]}>
              <View style={stylesSeries.panneau}>
                <View style={stylesSeries.enteteCommande}>
                  <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquette}>
                    Serie
                  </TexteThematique>
                </View>

                <View style={stylesSeries.listeSeries}>
                  {SERIES_DISPONIBLES.map((serie, indexSerie) => {
                    const estSerieActive = indexSerieActive === indexSerie;

                    return (
                      <Pressable
                        key={serie.nom}
                        onPress={() => definirIndexSerieActive(indexSerie)}
                        style={[stylesSeries.boutonSerie, estSerieActive ? stylesSeries.boutonSerieActif : undefined]}>
                        <View style={stylesSeries.ligneBoutonSerie}>
                          <TexteThematique lightColor={PALETTE_SERIES.encre} style={stylesSeries.titreBoutonSerie}>
                            {serie.nom}
                          </TexteThematique>
                          <View style={stylesSeries.formuleBoutonSerie}>
                            <RenduFormule centered fallback={serie.etiquetteFormule} mathematiques={serie.texteLatex} size="sm" />
                          </View>
                        </View>
                        <TexteThematique
                          lightColor={PALETTE_SERIES.encreAttenue}
                          style={stylesSeries.descriptionBoutonSerie}>
                          {serie.description}
                        </TexteThematique>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={stylesSeries.panneau}>
                <CurseurNombreEntier
                  etiquette="Nombre de termes n"
                  maximum={NOMBRE_MAX_TERMES}
                  minimum={NOMBRE_MIN_TERMES}
                  pas={PAS_NOMBRE_TERMES}
                  surChangement={definirNombreTermes}
                  valeur={nombreTermes}
                />
              </View>

              <View
                style={[stylesSeries.grilleStatistiques, { flexDirection: affichageCompact ? 'column' : 'row' }]}>
                <View style={stylesSeries.carteStatistique}>
                  <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquetteStatistique}>
                    S({nombreTermes})
                  </TexteThematique>
                  <TexteThematique lightColor={PALETTE_SERIES.encre} style={stylesSeries.valeurStatistique}>
                    {formaterValeur(sommeActuelle)}
                  </TexteThematique>
                </View>

                <View style={stylesSeries.carteStatistique}>
                  <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquetteStatistique}>
                    Limite
                  </TexteThematique>
                  <View style={stylesSeries.zoneFormuleStatistique}>
                    <RenduFormule
                      centered
                      fallback={serieActive.converge ? serieActive.etiquetteLimite : 'infini'}
                      mathematiques={serieActive.converge ? serieActive.etiquetteLimite : '\\infty'}
                      size="sm"
                    />
                  </View>
                </View>

                <View style={stylesSeries.carteStatistique}>
                  <TexteThematique lightColor={PALETTE_SERIES.encreAttenue} style={stylesSeries.etiquetteStatistique}>
                    Ecart
                  </TexteThematique>
                  <TexteThematique lightColor={PALETTE_SERIES.encre} style={stylesSeries.valeurStatistique}>
                    {serieActive.converge ? formaterValeur(ecartActuel) : 'infini'}
                  </TexteThematique>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueThematique>

      <PopoverDefinition
        body={[
          'Une suite fournit des termes a_1, a_2, a_3 et ainsi de suite. Une serie additionne ces termes pour former les sommes partielles S_n.',
          'Si les sommes partielles se stabilisent vers une valeur finie, la serie converge. Sinon, elle diverge ou oscille sans se fixer.',
        ]}
        exampleLabel="Lecture rapide"
        exampleText="La courbe verte montre S_n et la ligne bleue represente la limite quand elle existe."
        eyebrow="Definition"
        title="Qu est ce qu une serie ?"
      />
    </SafeAreaView>
  );
}

const stylesSeries = StyleSheet.create({
  safeArea: {
    backgroundColor: ARRIERE_PLAN_PAGE_SERIES,
    flex: 1,
  },
  conteneur: {
    backgroundColor: ARRIERE_PLAN_PAGE_SERIES,
    flex: 1,
  },
  superpositionEntete: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  contenu: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 28,
    paddingHorizontal: 12,
    paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
  },
  espaceTravail: {
    alignItems: 'flex-start',
    gap: 20,
  },
  colonneGraphique: {
    gap: 16,
  },
  colonneLaterale: {
    gap: 16,
  },
  carteFormule: {
    backgroundColor: PALETTE_SERIES.surface,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  panneauGraphique: {
    backgroundColor: PALETTE_SERIES.panneau,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 12,
    padding: 16,
    width: '100%',
  },
  etiquettePanneau: {
    color: PALETTE_SERIES.encreAttenue,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  graphique: {
    backgroundColor: PALETTE_SERIES.panneau,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  legendeGraphique: {
    backgroundColor: PALETTE_SERIES.surface,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1.5,
    bottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    left: 12,
    maxWidth: 240,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
  },
  elementLegende: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ligneLegende: {
    borderRadius: 999,
    height: 3,
    width: 26,
  },
  ligneLegendePointillee: {
    borderStyle: 'dashed',
  },
  texteLegende: {
    color: PALETTE_SERIES.encreAttenue,
    fontSize: 11,
    lineHeight: 14,
  },
  panneau: {
    backgroundColor: PALETTE_SERIES.panneau,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 18,
    padding: 16,
    width: '100%',
  },
  enteteCommande: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etiquette: {
    color: PALETTE_SERIES.encreAttenue,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  listeSeries: {
    gap: 10,
  },
  boutonSerie: {
    backgroundColor: PALETTE_SERIES.surface,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  boutonSerieActif: {
    backgroundColor: PALETTE_SERIES.courbeDouce,
    borderColor: PALETTE_SERIES.bordure,
  },
  ligneBoutonSerie: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  titreBoutonSerie: {
    color: PALETTE_SERIES.encre,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  formuleBoutonSerie: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  descriptionBoutonSerie: {
    color: PALETTE_SERIES.encreAttenue,
    fontSize: 13,
    lineHeight: 18,
  },
  blocCurseur: {
    gap: 16,
  },
  enteteCurseur: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  champValeurCurseur: {
    color: PALETTE_SERIES.encre,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 58,
    padding: 0,
    textAlign: 'right',
  },
  pisteCurseur: {
    backgroundColor: PALETTE_SERIES.surface,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  remplissageCurseur: {
    backgroundColor: PALETTE_SERIES.grille,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  pouceCurseur: {
    backgroundColor: PALETTE_SERIES.encre,
    borderColor: PALETTE_SERIES.panneau,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    marginLeft: -9,
    position: 'absolute',
    width: 18,
  },
  grilleStatistiques: {
    gap: 12,
    width: '100%',
  },
  carteStatistique: {
    alignItems: 'center',
    backgroundColor: PALETTE_SERIES.panneau,
    borderColor: PALETTE_SERIES.bordure,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    gap: 6,
    padding: 18,
  },
  etiquetteStatistique: {
    color: PALETTE_SERIES.encreAttenue,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  valeurStatistique: {
    color: PALETTE_SERIES.encre,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  zoneFormuleStatistique: {
    minHeight: 26,
    width: '100%',
  },
});

