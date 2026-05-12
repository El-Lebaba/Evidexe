/**
 * Simulations de lois statistiques.
 *
 * La normale et la loi de Student sont dessinées avec des points calculés par
 * leurs fonctions de densité. Les bornes choisies fabriquent un chemin SVG
 * rempli sous la courbe, ce qui représente l'aire de probabilité. Pour Student,
 * les degrés de liberté modifient la largeur des queues.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { TexteTheme } from '@/components/texte-theme';
import { VueTheme } from '@/components/vue-theme';
import { obtenirThemeApplication } from '@/constantes/theme';
import {
  EnteteEcranSimulation,
  ESPACE_CONTENU_ENTETE_SIMULATION,
  HAUTEUR_TOTALE_ENTETE_SIMULATION,
} from '@/features/simulations/core/entete-ecran-simulation';
import { InfobulleDefinition } from '@/features/simulations/core/infobulle-definition';
import { useSchemaCouleur } from '@/hooks/use-schema-couleur';

type PointGraphique = {
  x: number;
  y: number;
};

type DomaineGraphique = {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
};

type PaletteStats = ReturnType<typeof creerPaletteStats>;

type ProprietesCurseur = {
  decimals?: number;
  displayMaximum?: number;
  displayMinimum?: number;
  etiquette: string;
  maximum: number;
  minimum: number;
  onChange: (value: number) => void;
  palette: PaletteStats;
  pas: number;
  valeur: number;
};

const STYLE_GLISSER_CURSEUR_WEB =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

const VALEURS_T_CRITIQUES: Record<number, Record<90 | 95 | 99, number>> = {
  1: { 90: 6.314, 95: 12.706, 99: 63.657 },
  2: { 90: 2.92, 95: 4.303, 99: 9.925 },
  3: { 90: 2.353, 95: 3.182, 99: 5.841 },
  5: { 90: 2.015, 95: 2.571, 99: 4.032 },
  10: { 90: 1.812, 95: 2.228, 99: 3.169 },
  20: { 90: 1.725, 95: 2.086, 99: 2.845 },
  30: { 90: 1.697, 95: 2.042, 99: 2.75 },
};
const ECART_MINIMUM_BORNES = 0.01;

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirPas(valeur: number, pas: number) {
  return Number((Math.round(valeur / pas) * pas).toFixed(6));
}

function gamma(zInitial: number): number {
  if (zInitial < 0.5) {
    return Math.PI / (Math.sin(Math.PI * zInitial) * gamma(1 - zInitial));
  }

  let z = zInitial - 1;
  const g = 7;
  const coefficients = [
    0.9999999999998099,
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];
  let x = coefficients[0];

  for (let index = 1; index < g + 2; index += 1) {
    x += coefficients[index] / (z + index);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function beta(a: number, b: number) {
  return gamma(a) * gamma(b) / gamma(a + b);
}

function betaIncompleteRegularisee(x: number, a: number, b: number) {
  const xBorne = borner(x, 0, 1);
  const pas = 240;
  let somme = 0;

  for (let index = 0; index < pas; index += 1) {
    const t = ((index + 0.5) / pas) * xBorne;
    somme += Math.pow(Math.max(t, 1e-10), a - 1) * Math.pow(Math.max(1 - t, 1e-10), b - 1);
  }

  return (somme * xBorne) / pas / beta(a, b);
}

function tPDF(x: number, nu: number) {
  return (
    gamma((nu + 1) / 2) /
    (Math.sqrt(nu * Math.PI) * gamma(nu / 2)) *
    Math.pow(1 + (x * x) / nu, -(nu + 1) / 2)
  );
}

function tCDF(t: number, nu: number) {
  const x = nu / (nu + t * t);
  const ib = betaIncompleteRegularisee(x, nu / 2, 0.5);
  return t < 0 ? 0.5 * ib : 1 - 0.5 * ib;
}

function normalPDF(x: number, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

function erf(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

function normalCDF(x: number, mu = 0, sigma = 1) {
  const z = (x - mu) / (sigma * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

function valeurCritiqueT(nu: number, alpha: number) {
  const confiance = Math.round((1 - alpha) * 100);
  const cleConfiance: 90 | 95 | 99 = confiance <= 92 ? 90 : confiance >= 98 ? 99 : 95;
  const lignes = Object.keys(VALEURS_T_CRITIQUES).map(Number).sort((a, b) => a - b);

  if (nu <= lignes[0]) {
    return VALEURS_T_CRITIQUES[lignes[0]][cleConfiance];
  }

  for (let index = 0; index < lignes.length - 1; index += 1) {
    const gauche = lignes[index];
    const droite = lignes[index + 1];

    if (nu >= gauche && nu <= droite) {
      const ratio = (nu - gauche) / (droite - gauche);
      const valeurGauche = VALEURS_T_CRITIQUES[gauche][cleConfiance];
      const valeurDroite = VALEURS_T_CRITIQUES[droite][cleConfiance];
      return valeurGauche + (valeurDroite - valeurGauche) * ratio;
    }
  }

  return VALEURS_T_CRITIQUES[30][cleConfiance];
}

function creerPaletteStats(modeSombre: boolean) {
  const theme = obtenirThemeApplication(modeSombre);

  return {
    acceptation: modeSombre ? 'rgba(131, 217, 200, 0.2)' : 'rgba(124, 207, 191, 0.28)',
    accent: modeSombre ? theme.blue : '#4E7FC4',
    accentSecondaire: modeSombre ? '#B99AF4' : '#7C5FC7',
    arrierePlan: modeSombre ? theme.background : '#EAE3D2',
    axe: modeSombre ? 'rgba(242, 239, 230, 0.34)' : 'rgba(36, 59, 83, 0.34)',
    bordure: theme.border,
    carte: theme.surface,
    encre: theme.ink,
    grille: modeSombre ? 'rgba(174, 188, 175, 0.18)' : 'rgba(36, 59, 83, 0.1)',
    grilleCurseur: theme.grid,
    ligneNormale: modeSombre ? 'rgba(242, 239, 230, 0.38)' : 'rgba(36, 59, 83, 0.38)',
    panneau: theme.panel,
    rejet: modeSombre ? 'rgba(225, 132, 118, 0.28)' : 'rgba(217, 123, 108, 0.28)',
    rouge: theme.red,
    surface: theme.soft,
    texteAttenue: theme.muted,
    vert: theme.green,
    jaune: theme.yellow,
  };
}

function convertirPoint(x: number, y: number, largeur: number, hauteur: number, domaine: DomaineGraphique): PointGraphique {
  return {
    x: ((x - domaine.xMin) / (domaine.xMax - domaine.xMin)) * largeur,
    y: hauteur - ((y - domaine.yMin) / (domaine.yMax - domaine.yMin)) * hauteur,
  };
}

function creerChemin(points: PointGraphique[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function creerCheminCourbe(
  fn: (x: number) => number,
  domaine: DomaineGraphique,
  largeur: number,
  hauteur: number,
  pas = 260
) {
  const points: PointGraphique[] = [];

  for (let index = 0; index <= pas; index += 1) {
    const x = domaine.xMin + (index / pas) * (domaine.xMax - domaine.xMin);
    points.push(convertirPoint(x, fn(x), largeur, hauteur, domaine));
  }

  return creerChemin(points);
}

function creerCheminSurface(
  fn: (x: number) => number,
  domaine: DomaineGraphique,
  largeur: number,
  hauteur: number,
  minimum: number,
  maximum: number,
  pas = 220
) {
  const debut = borner(minimum, domaine.xMin, domaine.xMax);
  const fin = borner(maximum, domaine.xMin, domaine.xMax);

  if (debut >= fin) {
    return '';
  }

  const points: PointGraphique[] = [convertirPoint(debut, 0, largeur, hauteur, domaine)];

  for (let index = 0; index <= pas; index += 1) {
    const x = debut + (index / pas) * (fin - debut);
    points.push(convertirPoint(x, fn(x), largeur, hauteur, domaine));
  }

  points.push(convertirPoint(fin, 0, largeur, hauteur, domaine));
  return `${creerChemin(points)} Z`;
}

function CurseurSimulation({
  decimals = 2,
  displayMaximum,
  displayMinimum,
  etiquette,
  maximum,
  minimum,
  onChange,
  palette,
  pas,
  valeur,
}: ProprietesCurseur) {
  const [valeurTexte, setValeurTexte] = useState(valeur.toFixed(decimals));

  useEffect(() => {
    setValeurTexte(valeur.toFixed(decimals));
  }, [decimals, valeur]);

  const normaliser = useCallback(
    (prochaineValeur: number) => borner(arrondirPas(prochaineValeur, pas), minimum, maximum),
    [maximum, minimum, pas]
  );
  const minimumVisuel = displayMinimum ?? minimum;
  const maximumVisuel = displayMaximum ?? maximum;

  const definirDepuisEvenement = useCallback(
    (event: GestureResponderEvent) => {
      event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, pageX) => {
        const position = borner(event.nativeEvent.pageX - pageX, 0, largeurMesuree);
        const ratio = largeurMesuree === 0 ? 0 : position / largeurMesuree;
        onChange(normaliser(minimumVisuel + ratio * (maximumVisuel - minimumVisuel)));
      });
    },
    [maximumVisuel, minimumVisuel, normaliser, onChange]
  );

  const reponseGlisser = useMemo(
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

  const validerTexte = () => {
    const valeurNumerique = Number(valeurTexte.replace(',', '.').trim());

    if (!Number.isFinite(valeurNumerique)) {
      setValeurTexte(valeur.toFixed(decimals));
      return;
    }

    const valeurValidee = normaliser(valeurNumerique);
    onChange(valeurValidee);
    setValeurTexte(valeurValidee.toFixed(decimals));
  };

  const pourcentage = ((valeur - minimumVisuel) / (maximumVisuel - minimumVisuel || 1)) * 100;

  return (
    <View style={styles.blocCurseur}>
      <View style={styles.enteteCurseur}>
        <TexteTheme lightColor={palette.texteAttenue} style={[styles.etiquette, { color: palette.texteAttenue }]}>
          {etiquette}
        </TexteTheme>
        <TextInput
          inputMode="decimal"
          keyboardType="numeric"
          onBlur={validerTexte}
          onChangeText={setValeurTexte}
          onSubmitEditing={validerTexte}
          selectTextOnFocus
          style={[styles.champValeur, { color: palette.encre }]}
          value={valeurTexte}
        />
      </View>
      <View
        {...reponseGlisser.panHandlers}
        style={[styles.pisteCurseur, STYLE_GLISSER_CURSEUR_WEB, { backgroundColor: palette.surface, borderColor: palette.bordure }]}>
        <View style={[styles.remplissageCurseur, { backgroundColor: palette.grilleCurseur, width: `${pourcentage}%` }]} />
        <View style={[styles.pouceCurseur, STYLE_GLISSER_CURSEUR_WEB, { backgroundColor: palette.encre, borderColor: palette.panneau, left: `${pourcentage}%` }]} />
      </View>
    </View>
  );
}

function CarteStat({
  accent,
  etiquette,
  palette,
  sousTexte,
  valeur,
}: {
  accent: string;
  etiquette: string;
  palette: PaletteStats;
  sousTexte?: string;
  valeur: string;
}) {
  return (
    <View style={[styles.carteStat, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
      <TexteTheme lightColor={palette.texteAttenue} style={[styles.etiquetteStat, { color: palette.texteAttenue }]}>
        {etiquette}
      </TexteTheme>
      <TexteTheme lightColor={accent} style={[styles.valeurStat, { color: accent }]}>
        {valeur}
      </TexteTheme>
      {sousTexte ? (
        <TexteTheme lightColor={palette.texteAttenue} style={[styles.sousTexteStat, { color: palette.texteAttenue }]}>
          {sousTexte}
        </TexteTheme>
      ) : null}
    </View>
  );
}

function CarteFormuleStatistique({
  formule,
  palette,
}: {
  formule: string;
  palette: PaletteStats;
}) {
  return (
    <View style={[styles.carteFormule, { backgroundColor: palette.carte, borderColor: palette.bordure }]}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.64} style={[styles.texteFormule, { color: palette.encre }]}>
        {formule}
      </Text>
    </View>
  );
}

function GraphiqueNormale({
  hauteur,
  largeur,
  mu,
  palette,
  sigma,
  xHigh,
  xLow,
}: {
  hauteur: number;
  largeur: number;
  mu: number;
  palette: PaletteStats;
  sigma: number;
  xHigh: number;
  xLow: number;
}) {
  const domaine = useMemo(
    () => ({
      xMax: mu + 4 * sigma,
      xMin: mu - 4 * sigma,
      yMax: normalPDF(mu, mu, sigma) * 1.18,
      yMin: 0,
    }),
    [mu, sigma]
  );
  const cheminCourbe = useMemo(
    () => creerCheminCourbe((x) => normalPDF(x, mu, sigma), domaine, largeur, hauteur),
    [domaine, hauteur, largeur, mu, sigma]
  );
  const cheminSurface = useMemo(
    () => creerCheminSurface((x) => normalPDF(x, mu, sigma), domaine, largeur, hauteur, xLow, xHigh),
    [domaine, hauteur, largeur, mu, sigma, xHigh, xLow]
  );
  const xMu = convertirPoint(mu, 0, largeur, hauteur, domaine).x;
  const lignesVerticales = [-3, -2, -1, 0, 1, 2, 3].map((ecart) => {
    const x = mu + ecart * sigma;
    const point = convertirPoint(x, 0, largeur, hauteur, domaine);
    return {
      etiquette: ecart === 0 ? 'mu' : `${ecart > 0 ? '+' : ''}${ecart}s`,
      x: point.x,
    };
  });

  return (
    <View style={[styles.graphique, { backgroundColor: palette.panneau, borderColor: palette.bordure, height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={palette.panneau} height={hauteur} width={largeur} x={0} y={0} />
        {Array.from({ length: 5 }, (_, index) => (index / 4) * hauteur).map((y, index) => (
          <Line key={`grille-n-${index}`} stroke={palette.grille} strokeWidth={1} x1={0} x2={largeur} y1={y} y2={y} />
        ))}
        {lignesVerticales.map((ligne) => (
          <Line key={`v-${ligne.etiquette}`} stroke={palette.grille} strokeWidth={1} x1={ligne.x} x2={ligne.x} y1={0} y2={hauteur} />
        ))}
        {cheminSurface ? <Path d={cheminSurface} fill={palette.acceptation} /> : null}
        <Path d={cheminCourbe} fill="none" stroke={palette.accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
        {[{ couleur: palette.rouge, x: xLow }, { couleur: palette.vert, x: xHigh }].map((borne) => {
          const x = convertirPoint(borne.x, 0, largeur, hauteur, domaine).x;
          const y = convertirPoint(borne.x, normalPDF(borne.x, mu, sigma), largeur, hauteur, domaine).y;

          return borne.x >= domaine.xMin && borne.x <= domaine.xMax ? (
            <Line key={`borne-${borne.x}`} stroke={borne.couleur} strokeDasharray="6 5" strokeWidth={2} x1={x} x2={x} y1={hauteur} y2={y} />
          ) : null;
        })}
        <Line stroke={palette.ligneNormale} strokeDasharray="7 5" strokeWidth={2} x1={xMu} x2={xMu} y1={hauteur} y2={convertirPoint(mu, normalPDF(mu, mu, sigma), largeur, hauteur, domaine).y} />
        <Line stroke={palette.axe} strokeWidth={1.5} x1={0} x2={largeur} y1={hauteur - 1} y2={hauteur - 1} />
        {lignesVerticales.map((ligne) => (
          <SvgText fill={palette.texteAttenue} fontSize={11} key={`label-${ligne.etiquette}`} textAnchor="middle" x={ligne.x} y={hauteur - 10}>
            {ligne.etiquette}
          </SvgText>
        ))}
      </Svg>
      <Legende
        dansGraphique
        elements={[
          { couleur: palette.accent, label: 'Courbe normale' },
          { couleur: palette.acceptation, label: 'Probabilite', type: 'box' },
          { couleur: palette.rouge, label: 'Borne a' },
          { couleur: palette.vert, label: 'Borne b' },
        ]}
        palette={palette}
      />
    </View>
  );
}

function GraphiqueStudent({
  alpha,
  critT,
  hauteur,
  largeur,
  nu,
  palette,
}: {
  alpha: number;
  critT: number;
  hauteur: number;
  largeur: number;
  nu: number;
  palette: PaletteStats;
}) {
  const domaine = useMemo(
    () => ({
      xMax: 5,
      xMin: -5,
      yMax: tPDF(0, nu) * 1.2,
      yMin: 0,
    }),
    [nu]
  );
  const cheminStudent = useMemo(
    () => creerCheminCourbe((x) => tPDF(x, nu), domaine, largeur, hauteur),
    [domaine, hauteur, largeur, nu]
  );
  const cheminNormal = useMemo(
    () => creerCheminCourbe((x) => normalPDF(x), domaine, largeur, hauteur),
    [domaine, hauteur, largeur]
  );
  const cheminAcceptation = useMemo(
    () => creerCheminSurface((x) => tPDF(x, nu), domaine, largeur, hauteur, -critT, critT),
    [critT, domaine, hauteur, largeur, nu]
  );
  const cheminRejetGauche = useMemo(
    () => creerCheminSurface((x) => tPDF(x, nu), domaine, largeur, hauteur, domaine.xMin, -critT),
    [critT, domaine, hauteur, largeur, nu]
  );
  const cheminRejetDroite = useMemo(
    () => creerCheminSurface((x) => tPDF(x, nu), domaine, largeur, hauteur, critT, domaine.xMax),
    [critT, domaine, hauteur, largeur, nu]
  );

  return (
    <View style={[styles.graphique, { backgroundColor: palette.panneau, borderColor: palette.bordure, height: hauteur, width: largeur }]}>
      <Svg height={hauteur} width={largeur}>
        <Rect fill={palette.panneau} height={hauteur} width={largeur} x={0} y={0} />
        {Array.from({ length: 5 }, (_, index) => (index / 4) * hauteur).map((y, index) => (
          <Line key={`grille-t-${index}`} stroke={palette.grille} strokeWidth={1} x1={0} x2={largeur} y1={y} y2={y} />
        ))}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((xv) => {
          const x = convertirPoint(xv, 0, largeur, hauteur, domaine).x;
          return <Line key={`v-${xv}`} stroke={palette.grille} strokeWidth={1} x1={x} x2={x} y1={0} y2={hauteur} />;
        })}
        {cheminRejetGauche ? <Path d={cheminRejetGauche} fill={palette.rejet} /> : null}
        {cheminRejetDroite ? <Path d={cheminRejetDroite} fill={palette.rejet} /> : null}
        {cheminAcceptation ? <Path d={cheminAcceptation} fill={palette.acceptation} /> : null}
        <Path d={cheminNormal} fill="none" stroke={palette.ligneNormale} strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <Path d={cheminStudent} fill="none" stroke={palette.accentSecondaire} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
        {[-critT, critT].map((xv) => {
          const x = convertirPoint(xv, 0, largeur, hauteur, domaine).x;
          const y = convertirPoint(xv, tPDF(xv, nu), largeur, hauteur, domaine).y;
          return xv >= domaine.xMin && xv <= domaine.xMax ? (
            <Line key={`crit-${xv}`} stroke={palette.rouge} strokeDasharray="6 5" strokeWidth={2} x1={x} x2={x} y1={hauteur} y2={y} />
          ) : null;
        })}
        <Line stroke={palette.axe} strokeWidth={1.5} x1={0} x2={largeur} y1={hauteur - 1} y2={hauteur - 1} />
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((xv) => (
          <SvgText fill={palette.texteAttenue} fontSize={11} key={`label-${xv}`} textAnchor="middle" x={convertirPoint(xv, 0, largeur, hauteur, domaine).x} y={hauteur - 10}>
            {xv}
          </SvgText>
        ))}
        <SvgText fill={palette.rouge} fontSize={11} fontWeight="700" textAnchor="middle" x={largeur / 2} y={18}>
          {`+/- ${critT.toFixed(3)} | alpha=${alpha.toFixed(2)}`}
        </SvgText>
      </Svg>
      <Legende
        dansGraphique
        elements={[
          { couleur: palette.accentSecondaire, label: `t(nu=${nu})` },
          { couleur: palette.ligneNormale, label: 'N(0,1)', pointille: true },
          { couleur: palette.acceptation, label: 'Acceptation', type: 'box' },
          { couleur: palette.rejet, label: 'Rejet alpha', type: 'box' },
        ]}
        palette={palette}
      />
    </View>
  );
}

function Legende({
  dansGraphique = false,
  elements,
  palette,
}: {
  dansGraphique?: boolean;
  elements: { couleur: string; label: string; pointille?: boolean; type?: 'box' | 'line' }[];
  palette: PaletteStats;
}) {
  return (
    <View
      style={[
        styles.legende,
        dansGraphique
          ? { backgroundColor: palette.carte, borderColor: palette.bordure }
          : null,
        dansGraphique ? styles.legendeDansGraphique : null,
      ]}>
      {elements.map((element) => (
        <View key={element.label} style={styles.elementLegende}>
          <View
            style={[
              element.type === 'box' ? styles.boiteLegende : styles.ligneLegende,
              { backgroundColor: element.couleur, borderColor: element.couleur },
              element.pointille ? styles.lignePointillee : null,
            ]}
          />
          <TexteTheme lightColor={palette.texteAttenue} style={[styles.texteLegende, { color: palette.texteAttenue }]}>
            {element.label}
          </TexteTheme>
        </View>
      ))}
    </View>
  );
}

function EcranSimulationStats({
  children,
  definition,
  titre,
}: {
  children: (props: { contentWidth: number; graphHeight: number; graphWidth: number; isCompact: boolean; isWide: boolean; palette: PaletteStats; sideWidth: number }) => ReactNode;
  definition: React.ComponentProps<typeof InfobulleDefinition>;
  titre: string;
}) {
  const modeSombre = useSchemaCouleur() === 'dark';
  const palette = creerPaletteStats(modeSombre);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const contentWidth = width - (width >= 1200 ? 24 : 32);
  const isWide = width >= 980;
  const isCompact = width < 560;
  const graphWidth = isWide ? Math.round(contentWidth * 0.64) : contentWidth;
  const sideWidth = isWide ? contentWidth - graphWidth - 20 : contentWidth;
  const graphHeight = isWide ? borner(Math.round(graphWidth * 0.5), 360, 520) : borner(Math.round(graphWidth * 0.62), 260, 420);
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView edges={[]} style={[styles.safeArea, { backgroundColor: palette.arrierePlan }]}>
      <VueTheme darkColor={palette.arrierePlan} lightColor={palette.arrierePlan} style={[styles.container, { backgroundColor: palette.arrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: headerTranslateY }] }]}>
          <EnteteEcranSimulation titre={titre} domaine="mathematiques" />
        </Animated.View>
        <Animated.ScrollView
          contentContainerStyle={styles.contenu}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          {children({ contentWidth, graphHeight, graphWidth, isCompact, isWide, palette, sideWidth })}
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition {...definition} />
    </SafeAreaView>
  );
}

export function SimulationLoiNormaleStandard() {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [xLow, setXLow] = useState(-1);
  const [xHigh, setXHigh] = useState(1);

  const minimumDomaine = mu - 4 * sigma;
  const maximumDomaine = mu + 4 * sigma;

  useEffect(() => {
    setXLow((valeur) => borner(valeur, minimumDomaine, Math.min(xHigh - ECART_MINIMUM_BORNES, maximumDomaine)));
    setXHigh((valeur) => borner(valeur, Math.max(xLow + ECART_MINIMUM_BORNES, minimumDomaine), maximumDomaine));
  }, [maximumDomaine, minimumDomaine, xHigh, xLow]);

  const probabilite = useMemo(() => normalCDF(xHigh, mu, sigma) - normalCDF(xLow, mu, sigma), [mu, sigma, xHigh, xLow]);
  const definirBorneInferieure = (valeur: number) => {
    setXLow(borner(valeur, minimumDomaine, xHigh - ECART_MINIMUM_BORNES));
  };
  const definirBorneSuperieure = (valeur: number) => {
    setXHigh(borner(valeur, xLow + ECART_MINIMUM_BORNES, maximumDomaine));
  };

  return (
    <EcranSimulationStats
      definition={{
        body: [
          'La loi normale modelise une variable centree autour de sa moyenne, avec une dispersion controlee par son ecart-type.',
          'L aire sous la courbe entre deux bornes represente la probabilite que X tombe dans cet intervalle.',
        ],
        exampleLabel: 'Lecture rapide',
        exampleText: 'La zone coloree correspond a P(a <= X <= b). Bouge les bornes pour voir cette aire changer.',
        eyebrow: 'Definition',
        title: 'Qu est-ce qu une loi normale ?',
      }}
      titre="Loi normale standard">
      {({ contentWidth, graphHeight, graphWidth, isCompact, isWide, palette, sideWidth }) => {
        return (
          <View
            style={[
              styles.espaceTravail,
              {
                flexDirection: isWide ? 'row' : 'column',
                width: contentWidth,
              },
            ]}>
            <View style={[styles.colonneGraphique, { width: graphWidth }]}>
              <GraphiqueNormale hauteur={graphHeight} largeur={graphWidth} mu={mu} palette={palette} sigma={sigma} xHigh={xHigh} xLow={xLow} />
            </View>

            <View style={[styles.colonneLaterale, { width: sideWidth }]}>
              <CarteFormuleStatistique formule="X ~ N(mu, sigma^2)" palette={palette} />

              <View style={[styles.carteProbabilite, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.etiquetteStat, { color: palette.texteAttenue }]}>
                  {`P(${xLow.toFixed(2)} <= X <= ${xHigh.toFixed(2)})`}
                </TexteTheme>
                <TexteTheme lightColor={palette.accent} style={[styles.valeurProbabilite, { color: palette.accent }]}>
                  {(probabilite * 100).toFixed(2)}%
                </TexteTheme>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.sousTexteStat, { color: palette.texteAttenue }]}>
                  {`= ${probabilite.toFixed(4)}`}
                </TexteTheme>
              </View>

              <View style={[styles.grilleStats, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <CarteStat accent={palette.encre} etiquette="Moyenne mu" palette={palette} valeur={mu.toFixed(1)} />
                <CarteStat accent={palette.encre} etiquette="Ecart-type sigma" palette={palette} valeur={sigma.toFixed(1)} />
                <CarteStat accent={palette.encre} etiquette="Variance sigma^2" palette={palette} valeur={(sigma * sigma).toFixed(2)} />
              </View>

              <View style={[styles.panneau, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <CurseurSimulation decimals={1} etiquette="Moyenne mu" maximum={3} minimum={-3} onChange={setMu} palette={palette} pas={0.1} valeur={mu} />
                <CurseurSimulation decimals={1} etiquette="Ecart-type sigma" maximum={3} minimum={0.3} onChange={setSigma} palette={palette} pas={0.1} valeur={sigma} />
                <CurseurSimulation
                  decimals={2}
                  displayMaximum={maximumDomaine}
                  displayMinimum={minimumDomaine}
                  etiquette="Borne inferieure a"
                  maximum={xHigh - ECART_MINIMUM_BORNES}
                  minimum={minimumDomaine}
                  onChange={definirBorneInferieure}
                  palette={palette}
                  pas={0.01}
                  valeur={xLow}
                />
                <CurseurSimulation
                  decimals={2}
                  displayMaximum={maximumDomaine}
                  displayMinimum={minimumDomaine}
                  etiquette="Borne superieure b"
                  maximum={maximumDomaine}
                  minimum={xLow + ECART_MINIMUM_BORNES}
                  onChange={definirBorneSuperieure}
                  palette={palette}
                  pas={0.01}
                  valeur={xHigh}
                />
              </View>

              <View style={[styles.sectionStatistiques, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.titreSection, { color: palette.texteAttenue }]}>
                  Regle des 68-95-99.7
                </TexteTheme>
                <View style={[styles.grilleStats, { flexDirection: isCompact ? 'column' : 'row' }]}>
                  <CarteStat accent={palette.accent} etiquette="mu +/- 1sigma" palette={palette} sousTexte="zone centrale" valeur="68.27%" />
                  <CarteStat accent={palette.accent} etiquette="mu +/- 2sigma" palette={palette} sousTexte="zone centrale" valeur="95.45%" />
                  <CarteStat accent={palette.accent} etiquette="mu +/- 3sigma" palette={palette} sousTexte="zone centrale" valeur="99.73%" />
                </View>
              </View>
            </View>
          </View>
        );
      }}
    </EcranSimulationStats>
  );
}

export function SimulationLoiStudent() {
  const [nu, setNu] = useState(5);
  const [alpha, setAlpha] = useState(0.05);
  const critT = useMemo(() => valeurCritiqueT(nu, alpha), [alpha, nu]);
  const probabiliteIntervalle = useMemo(() => tCDF(critT, nu) - tCDF(-critT, nu), [critT, nu]);

  return (
    <EcranSimulationStats
      definition={{
        body: [
          'La loi de Student ressemble a la loi normale, mais ses queues sont plus epaisses quand le nombre de degres de liberte est petit.',
          'Elle sert souvent aux intervalles de confiance quand l ecart-type de la population est inconnu.',
        ],
        exampleLabel: 'Lecture rapide',
        exampleText: 'La zone centrale montre l intervalle accepte et les deux queues rouges representent le risque alpha.',
        eyebrow: 'Definition',
        title: 'Qu est-ce que la loi de Student ?',
      }}
      titre="Loi de Student">
      {({ contentWidth, graphHeight, graphWidth, isCompact, isWide, palette, sideWidth }) => {
        return (
          <View
            style={[
              styles.espaceTravail,
              {
                flexDirection: isWide ? 'row' : 'column',
                width: contentWidth,
              },
            ]}>
            <View style={[styles.colonneGraphique, { width: graphWidth }]}>
              <GraphiqueStudent alpha={alpha} critT={critT} hauteur={graphHeight} largeur={graphWidth} nu={nu} palette={palette} />
            </View>

            <View style={[styles.colonneLaterale, { width: sideWidth }]}>
              <CarteFormuleStatistique formule="T ~ t(nu)" palette={palette} />

              <View style={[styles.grilleStats, { flexDirection: isCompact ? 'column' : 'row' }]}>
                <CarteStat accent={palette.accentSecondaire} etiquette="Valeur critique t*" palette={palette} sousTexte={`alpha = ${alpha.toFixed(2)}, nu = ${nu}`} valeur={`+/- ${critT.toFixed(3)}`} />
                <CarteStat accent={palette.vert} etiquette="Intervalle de conf." palette={palette} sousTexte="P(-t* <= T <= t*)" valeur={`${((1 - alpha) * 100).toFixed(0)}%`} />
              </View>

              <View style={[styles.carteProbabilite, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.etiquetteStat, { color: palette.texteAttenue }]}>
                  Probabilite centrale estimee
                </TexteTheme>
                <TexteTheme lightColor={palette.vert} style={[styles.valeurProbabilite, { color: palette.vert }]}>
                  {(probabiliteIntervalle * 100).toFixed(2)}%
                </TexteTheme>
              </View>

              <View style={[styles.panneau, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <CurseurSimulation decimals={0} etiquette="Degres de liberte nu" maximum={30} minimum={1} onChange={(value) => setNu(Math.round(value))} palette={palette} pas={1} valeur={nu} />
                <CurseurSimulation decimals={2} etiquette="Niveau de signification alpha" maximum={0.2} minimum={0.01} onChange={setAlpha} palette={palette} pas={0.01} valeur={alpha} />
              </View>

              <View style={[styles.sectionStatistiques, { backgroundColor: palette.panneau, borderColor: palette.bordure }]}>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.titreSection, { color: palette.texteAttenue }]}>
                  Proprietes de t(nu)
                </TexteTheme>
                <View style={[styles.grilleStats, { flexDirection: isCompact ? 'column' : 'row' }]}>
                  <CarteStat accent={palette.encre} etiquette="Esperance E[T]" palette={palette} valeur="0" sousTexte="nu > 1" />
                  <CarteStat accent={palette.encre} etiquette="Variance Var[T]" palette={palette} valeur={nu > 2 ? (nu / (nu - 2)).toFixed(3) : 'infini'} />
                </View>
                <View style={[styles.grilleStats, { flexDirection: isCompact ? 'column' : 'row' }]}>
                  <CarteStat accent={palette.encre} etiquette="Kurtosis" palette={palette} valeur={nu > 4 ? (6 / (nu - 4)).toFixed(3) : 'infini'} />
                  <CarteStat accent={palette.encre} etiquette="Convergence" palette={palette} valeur="N(0,1)" sousTexte="quand nu augmente" />
                </View>
                <TexteTheme lightColor={palette.texteAttenue} style={[styles.note, { color: palette.texteAttenue }]}>
                  Pour nu proche de 30, la loi t(nu) devient tres proche de la loi normale standard. Les queues plus epaisses representent l incertitude liee aux petits echantillons.
                </TexteTheme>
              </View>
            </View>
          </View>
        );
      }}
    </EcranSimulationStats>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
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
    paddingBottom: 28,
    paddingHorizontal: 12,
    paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + ESPACE_CONTENU_ENTETE_SIMULATION,
  },
  espaceTravail: {
    alignItems: 'center',
    gap: 20,
  },
  colonneGraphique: {
    alignItems: 'center',
    gap: 14,
  },
  colonneLaterale: {
    gap: 14,
  },
  carteFormule: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  texteFormule: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
    width: '100%',
  },
  graphique: {
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  legende: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendeDansGraphique: {
    borderRadius: 8,
    borderWidth: 1.5,
    bottom: 12,
    left: 12,
    maxWidth: 300,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
  },
  elementLegende: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  ligneLegende: {
    borderRadius: 999,
    height: 3,
    width: 28,
  },
  lignePointillee: {
    borderStyle: 'dashed',
    borderTopWidth: 2,
    height: 0,
  },
  boiteLegende: {
    borderRadius: 4,
    height: 12,
    width: 12,
  },
  texteLegende: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  panneau: {
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 18,
    padding: 16,
    width: '100%',
  },
  sectionStatistiques: {
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 12,
    padding: 16,
    width: '100%',
  },
  carteProbabilite: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
    padding: 18,
    width: '100%',
  },
  valeurProbabilite: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'center',
  },
  grilleStats: {
    gap: 10,
    width: '100%',
  },
  carteStat: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    gap: 6,
    padding: 14,
  },
  etiquetteStat: {
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  valeurStat: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    textAlign: 'center',
  },
  sousTexteStat: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
  },
  blocCurseur: {
    gap: 12,
  },
  enteteCurseur: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  etiquette: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  champValeur: {
    fontSize: 17,
    fontWeight: '900',
    minWidth: 68,
    padding: 0,
    textAlign: 'right',
  },
  pisteCurseur: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  remplissageCurseur: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  pouceCurseur: {
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    marginLeft: -9,
    position: 'absolute',
    width: 18,
  },
  titreSection: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  ligneRegle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  labelRegle: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    width: 92,
  },
  barreRegle: {
    borderRadius: 999,
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  barreRegleActive: {
    borderRadius: 999,
    height: '100%',
  },
  valeurRegle: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'right',
    width: 58,
  },
  lignePropriete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textePropriete: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  valeurPropriete: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
    textAlign: 'right',
  },
  note: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
