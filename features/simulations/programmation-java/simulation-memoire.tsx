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

type TypeMemoire = 'int' | 'long' | 'float' | 'byte' | 'boolean' | 'char';

type RepresentationMemoire = {
  adresse: string;
  avertissement?: boolean;
  bits: string;
  couleur: string;
  couleursBits?: string[];
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  memoire: string;
  note: string;
  plage: string;
  titre: string;
  type: TypeMemoire;
  valeur: string;
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

type ThemeSimulationMemoire = ReturnType<typeof obtenirThemesSimulationEcrans>['programmationJava'];

let themeActif: ThemeSimulationMemoire = obtenirThemesSimulationEcransInitial().programmationJava;
let couleurArrierePlan = themeActif.background;

const VALEUR_DEPART = 42;
const ADRESSE_MEMOIRE_DEPART = 0x1000;
const VALEUR_MINIMALE = -256;
const VALEUR_MAXIMALE = 512;

const STYLE_GLISSER_WEB =
  Platform.OS === 'web'
    ? ({
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

const STYLE_TEXTE_NON_SELECTIONNABLE =
  Platform.OS === 'web'
    ? ({
        WebkitUserSelect: 'none',
        userSelect: 'none',
      } as any)
    : undefined;

const EXEMPLES_VALEURS = [42, 65, 130, -1, 3.14];

function borner(valeur: number, minimum: number, maximum: number) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function arrondirAuPas(valeur: number, pas: number) {
  return Math.round(valeur / pas) * pas;
}

function formaterNombre(valeur: number) {
  if (!Number.isFinite(valeur)) {
    return '0';
  }

  return valeur.toLocaleString('fr-CA', {
    maximumFractionDigits: 6,
  });
}

function formaterNombreJava(valeur: number) {
  if (!Number.isFinite(valeur)) {
    return '0';
  }

  return Number.isInteger(valeur) ? String(valeur) : String(Number(valeur.toFixed(6)));
}

function formaterAdresse(adresse: number) {
  return `0x${adresse.toString(16).toUpperCase().padStart(4, '0')}`;
}

function formaterHexadecimal(valeur: number, chiffres: number) {
  return `U+${valeur.toString(16).toUpperCase().padStart(chiffres, '0')}`;
}

function convertirEnBinaire(valeur: number, nombreBits: number) {
  const taille = BigInt(nombreBits);
  const modulo = 1n << taille;
  const masque = modulo - 1n;
  let entier = BigInt(Math.trunc(Number.isFinite(valeur) ? valeur : 0));

  if (entier < 0) {
    entier = modulo + (entier % modulo);
  }

  return (entier & masque).toString(2).padStart(nombreBits, '0');
}

function obtenirBitsFlottant32(valeur: number) {
  const memoire = new ArrayBuffer(4);
  const vue = new DataView(memoire);
  vue.setFloat32(0, Math.fround(valeur), false);

  return vue.getUint32(0, false).toString(2).padStart(32, '0');
}

function convertirEnByte(valeur: number) {
  const entier = Math.trunc(valeur);
  const reste = ((entier % 256) + 256) % 256;

  return reste > 127 ? reste - 256 : reste;
}

function obtenirCodeChar(valeur: number) {
  const entier = Math.trunc(valeur);
  return ((entier % 65536) + 65536) % 65536;
}

function afficherCaractere(code: number) {
  if (code === 32) {
    return "' '";
  }

  if (code >= 33 && code <= 126) {
    return `'${String.fromCharCode(code)}'`;
  }

  if (code >= 160 && (code < 0xd800 || code > 0xdfff)) {
    return `'${String.fromCharCode(code)}'`;
  }

  return 'non imprimable';
}

function obtenirCouleursFlottant(bits: string) {
  return bits.split('').map((_, index) => {
    if (index === 0) {
      return themeActif.approximationNegativeStroke;
    }

    if (index <= 8) {
      return themeActif.bounds;
    }

    return themeActif.function;
  });
}

function normaliserTexteNombre(texte: string) {
  const valeur = Number(texte.replace(',', '.'));

  if (!Number.isFinite(valeur)) {
    return null;
  }

  return borner(valeur, -999999, 999999);
}

function CurseurMemoire({
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
      event.currentTarget.measure((_x, _y, largeurMesuree, _hauteur, positionPageX) => {
        const position = borner(event.nativeEvent.pageX - positionPageX, 0, largeurMesuree);
        const valeurBrute = minimum + (position / largeurMesuree) * (maximum - minimum);
        const prochaineValeur = borner(arrondirAuPas(valeurBrute, pas), minimum, maximum);

        modifierValeur(Number(prochaineValeur.toFixed(0)));
      });
    },
    [maximum, minimum, modifierValeur, pas]
  );

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
      <View {...repondeurPanoramique.panHandlers} style={[styles.pisteCurseur, STYLE_GLISSER_WEB]}>
        <View style={[styles.remplissageCurseur, { width: `${pourcentage}%` }]} />
        <View style={[styles.poigneeCurseur, STYLE_GLISSER_WEB, { left: `${pourcentage}%` }]} />
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
      <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurStatistique}>
        {valeur}
      </TexteTheme>
    </View>
  );
}

function BoutonOption({
  children,
  exemple = false,
  icone,
  onPress,
  selectionne = false,
}: {
  children: string;
  exemple?: boolean;
  icone?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  selectionne?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.boutonOption,
        exemple ? styles.boutonOptionExemple : null,
        selectionne ? styles.boutonOptionSelectionne : null,
        pressed || hovered ? styles.boutonOptionAppuye : null,
      ]}>
      {icone ? (
        <MaterialCommunityIcons
          color={selectionne ? themeActif.activeInk : themeActif.ink}
          name={icone}
          size={18}
        />
      ) : null}
      <TexteTheme
        numberOfLines={1}
        lightColor={selectionne ? themeActif.activeInk : themeActif.ink}
        style={[styles.texteBoutonOption, selectionne ? styles.texteBoutonOptionSelectionne : null]}>
        {children}
      </TexteTheme>
    </Pressable>
  );
}

function RangeeBits({ bits, couleursBits }: { bits: string; couleursBits?: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.rangeeBits}>
        {bits.split('').map((bit, index) => {
          const couleur = couleursBits?.[index] ?? themeActif.approximationStroke;

          return (
            <View
              key={`${index}-${bit}`}
              style={[
                styles.caseBit,
                {
                  backgroundColor: `${couleur}24`,
                  borderColor: `${couleur}66`,
                  marginRight: (index + 1) % 4 === 0 ? 5 : 1,
                },
              ]}>
              <TexteTheme lightColor={couleur} style={[styles.texteBit, { color: couleur }]}>
                {bit}
              </TexteTheme>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CarteMemoire({
  compacte,
  onPress,
  representation,
  selectionnee,
}: {
  compacte: boolean;
  onPress: () => void;
  representation: RepresentationMemoire;
  selectionnee: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.carteMemoire,
        {
          borderColor: selectionnee ? representation.couleur : themeActif.border,
        },
        selectionnee ? styles.carteMemoireSelectionnee : null,
        pressed || hovered ? styles.carteMemoireAppuyee : null,
      ]}>
      <View style={[styles.enteteCarteMemoire, compacte ? styles.enteteCarteMemoireMobile : null]}>
        <View style={styles.rangeeTypeMemoire}>
          <View style={[styles.pastilleType, { backgroundColor: representation.couleur }]} />
          <MaterialCommunityIcons color={representation.couleur} name={representation.icone} size={18} />
          <TexteTheme lightColor={representation.couleur} style={[styles.titreType, { color: representation.couleur }]}>
            {representation.titre}
          </TexteTheme>
        </View>
        <View style={[styles.blocAdresse, compacte ? styles.blocAdresseMobile : null]}>
          <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteAdresse}>
            {representation.memoire}
          </TexteTheme>
          <TexteTheme lightColor={themeActif.ink} style={styles.adresseMemoire}>
            {representation.adresse}
          </TexteTheme>
        </View>
      </View>

      <View style={[styles.rangeeValeurMemoire, compacte ? styles.rangeeValeurMemoireMobile : null]}>
        <TexteTheme lightColor={themeActif.ink} numberOfLines={1} style={styles.valeurMemoire}>
          {representation.valeur}
        </TexteTheme>
        <TexteTheme
          lightColor={representation.avertissement ? themeActif.approximationNegativeStroke : themeActif.function}
          numberOfLines={compacte ? 2 : 1}
          style={[
            styles.noteMemoire,
            compacte ? styles.noteMemoireMobile : null,
            {
              color: representation.avertissement ? themeActif.approximationNegativeStroke : themeActif.function,
            },
          ]}>
          {representation.note}
        </TexteTheme>
      </View>

      <RangeeBits bits={representation.bits} couleursBits={representation.couleursBits} />
    </Pressable>
  );
}

function creerRepresentations(valeur: number): RepresentationMemoire[] {
  const entier = Math.trunc(valeur);
  const flottant32 = Math.fround(valeur);
  const octet = convertirEnByte(entier);
  const codeChar = obtenirCodeChar(entier);
  const booleen = valeur !== 0;
  const adresseBase = ADRESSE_MEMOIRE_DEPART;
  const bitsFlottant = obtenirBitsFlottant32(valeur);
  const texteTroncature = valeur !== entier ? `décimales tronquées : ${formaterNombre(valeur)} -> ${entier}` : 'partie entière conservée';
  const texteArrondiFlottant =
    Object.is(flottant32, valeur) || Math.abs(flottant32 - valeur) < 0.000001
      ? 'simple précision stable'
      : `arrondi : ${formaterNombre(flottant32)}`;
  const charHorsPlage = entier < 0 || entier > 65535;

  return [
    {
      adresse: formaterAdresse(adresseBase),
      avertissement: valeur !== entier,
      bits: convertirEnBinaire(entier, 32),
      couleur: themeActif.approximationStroke,
      icone: 'numeric',
      memoire: '4 octets',
      note: texteTroncature,
      plage: '-2^31 à 2^31 - 1',
      titre: 'int',
      type: 'int',
      valeur: String(entier),
    },
    {
      adresse: formaterAdresse(adresseBase + 8),
      bits: convertirEnBinaire(entier, 64),
      couleur: themeActif.bounds,
      icone: 'counter',
      memoire: '8 octets',
      note: 'même entier, plus de bits',
      plage: '-2^63 à 2^63 - 1',
      titre: 'long',
      type: 'long',
      valeur: String(entier),
    },
    {
      adresse: formaterAdresse(adresseBase + 16),
      avertissement: !Object.is(flottant32, valeur) && Math.abs(flottant32 - valeur) >= 0.000001,
      bits: bitsFlottant,
      couleur: themeActif.accent,
      couleursBits: obtenirCouleursFlottant(bitsFlottant),
      icone: 'approximately-equal',
      memoire: '4 octets',
      note: texteArrondiFlottant,
      plage: 'IEEE 754 : signe, exposant, mantisse',
      titre: 'float',
      type: 'float',
      valeur: formaterNombre(flottant32),
    },
    {
      adresse: formaterAdresse(adresseBase + 24),
      avertissement: entier < -128 || entier > 127,
      bits: convertirEnBinaire(octet, 8),
      couleur: themeActif.approximationNegativeStroke,
      icone: 'memory',
      memoire: '1 octet',
      note: entier < -128 || entier > 127 ? `dépassement : ${entier} -> ${octet}` : 'dans la plage',
      plage: '-128 à 127',
      titre: 'byte',
      type: 'byte',
      valeur: String(octet),
    },
    {
      adresse: formaterAdresse(adresseBase + 25),
      bits: booleen ? '1' : '0',
      couleur: booleen ? themeActif.function : themeActif.approximationNegativeStroke,
      icone: 'toggle-switch-outline',
      memoire: '1 bit logique',
      note: 'condition : valeur != 0',
      plage: 'true / false',
      titre: 'boolean',
      type: 'boolean',
      valeur: String(booleen),
    },
    {
      adresse: formaterAdresse(adresseBase + 26),
      avertissement: charHorsPlage,
      bits: convertirEnBinaire(codeChar, 16),
      couleur: themeActif.function,
      icone: 'format-letter-case',
      memoire: '2 octets',
      note: charHorsPlage ? `modulo UTF-16 : ${formaterHexadecimal(codeChar, 4)}` : formaterHexadecimal(codeChar, 4),
      plage: 'U+0000 à U+FFFF',
      titre: 'char',
      type: 'char',
      valeur: afficherCaractere(codeChar),
    },
  ];
}

function codeJavaMemoire(valeur: number) {
  const valeurJava = formaterNombreJava(valeur);

  return `double source = ${valeurJava};
int entier = (int) source;          // tronque la partie décimale
byte petit = (byte) entier;         // garde seulement 8 bits
float reel = (float) source;        // simple précision IEEE 754
char lettre = (char) entier;        // code UTF-16 sur 16 bits
boolean actif = entier != 0;        // Java ne caste pas int vers boolean`;
}

export function SimulationMemoire() {
  const modeSombre = useSchemaCouleur() === 'dark';
  const { width } = useWindowDimensions();
  const defilementY = useRef(new Animated.Value(0)).current;
  const [valeur, definirValeur] = useState(VALEUR_DEPART);
  const [texteValeur, definirTexteValeur] = useState(String(VALEUR_DEPART));
  const [typeSelectionne, definirTypeSelectionne] = useState<TypeMemoire>('int');

  themeActif = obtenirThemesSimulationEcrans(modeSombre).programmationJava;
  couleurArrierePlan = themeActif.background;
  styles = creerStyles();

  const estTelephone = width < 560;
  const estLarge = width >= 900;
  const margeHorizontale = estTelephone ? 10 : 12;
  const largeurZoneTravail = Math.max(280, Math.min(width - margeHorizontale * 2, 1180));
  const largeurSimulation = estLarge ? Math.max(520, largeurZoneTravail - 360) : largeurZoneTravail;
  const largeurPanneau = estLarge ? 320 : largeurZoneTravail;
  const valeurCurseur = Math.round(borner(valeur, VALEUR_MINIMALE, VALEUR_MAXIMALE));
  const representations = useMemo(() => creerRepresentations(valeur), [valeur]);
  const representationActive = representations.find((representation) => representation.type === typeSelectionne) ?? representations[0];
  const defilementEnteteY = defilementY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  const changerValeurDepuisCurseur = useCallback((prochaineValeur: number) => {
    definirValeur(prochaineValeur);
    definirTexteValeur(String(prochaineValeur));
  }, []);

  const changerTexteValeur = useCallback((texte: string) => {
    definirTexteValeur(texte);

    const valeurNormalisee = normaliserTexteNombre(texte);
    if (valeurNormalisee !== null) {
      definirValeur(valeurNormalisee);
    }
  }, []);

  const appliquerExemple = useCallback((prochaineValeur: number) => {
    definirValeur(prochaineValeur);
    definirTexteValeur(String(prochaineValeur));
  }, []);

  const reinitialiser = useCallback(() => {
    definirValeur(VALEUR_DEPART);
    definirTexteValeur(String(VALEUR_DEPART));
    definirTypeSelectionne('int');
  }, []);

  return (
    <SafeAreaView edges={[]} style={[styles.zoneSecurisee, STYLE_TEXTE_NON_SELECTIONNABLE, { backgroundColor: couleurArrierePlan }]}>
      <VueTheme
        darkColor={couleurArrierePlan}
        lightColor={couleurArrierePlan}
        style={[styles.conteneur, STYLE_TEXTE_NON_SELECTIONNABLE, { backgroundColor: couleurArrierePlan }]}>
        <Animated.View style={[styles.superpositionEntete, { transform: [{ translateY: defilementEnteteY }] }]}>
          <EnteteEcranSimulation titre="Mémoire" domaine="programmation-java" />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={[styles.contenu, estTelephone ? styles.contenuMobile : null]}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: defilementY } } }], {
            useNativeDriver: Platform.OS !== 'web',
          })}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.zoneTravail,
              estTelephone ? styles.zoneTravailMobile : null,
              { flexDirection: estLarge ? 'row' : estTelephone ? 'column-reverse' : 'column', width: largeurZoneTravail },
            ]}>
            <View style={[styles.colonneSimulation, estTelephone ? styles.colonneSimulationMobile : null, { width: largeurSimulation }]}>
              <View style={styles.blocTitre}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.surtitre}>
                  Simulation Java
                </TexteTheme>
                <TexteTheme lightColor={themeActif.ink} style={[styles.titre, estTelephone ? styles.titreMobile : null]}>
                  Mémoire
                </TexteTheme>
                <TexteTheme lightColor={themeActif.mutedInk} style={[styles.description, estTelephone ? styles.descriptionMobile : null]}>
                  Observe comment une même valeur change de forme en mémoire : entier, réel, octet, caractère ou condition logique.
                </TexteTheme>
              </View>

              <View style={[styles.cadreMemoire, estTelephone ? styles.cadreMemoireMobile : null]}>
                <View style={[styles.enteteMemoire, estTelephone ? styles.enteteMemoireMobile : null]}>
                  <View>
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.etiquetteStatistique}>
                      Représentation binaire
                    </TexteTheme>
                    <TexteTheme lightColor={themeActif.ink} style={[styles.valeurPrincipale, estTelephone ? styles.valeurPrincipaleMobile : null]}>
                      source = {formaterNombre(valeur)}
                    </TexteTheme>
                  </View>
                </View>

                <View style={styles.listeRepresentations}>
                  {representations.map((representation) => (
                    <CarteMemoire
                      key={representation.type}
                      compacte={estTelephone}
                      onPress={() => definirTypeSelectionne(representation.type)}
                      representation={representation}
                      selectionnee={representation.type === typeSelectionne}
                    />
                  ))}
                </View>
              </View>

              <View style={[styles.grilleStatistiques, { flexDirection: width < 560 ? 'column' : 'row' }]}>
                <CarteStatistique etiquette="Type actif" valeur={representationActive.titre} />
                <CarteStatistique etiquette="Adresse" valeur={representationActive.adresse} />
                <CarteStatistique etiquette="Mémoire" valeur={representationActive.memoire} />
              </View>

              <View style={[styles.carteCode, estTelephone ? styles.panneauMobile : null]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TexteTheme lightColor={themeActif.ink} style={styles.texteCode}>
                    {codeJavaMemoire(valeur)}
                  </TexteTheme>
                </ScrollView>
              </View>
            </View>

            <View
              style={[
                styles.barreLaterale,
                estTelephone ? styles.barreLateraleMobile : null,
                estLarge ? styles.barreLateraleAligneeAnimation : null,
                { width: largeurPanneau },
              ]}>
              <View style={[styles.panneau, estTelephone ? styles.panneauMobile : null]}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Réglages
                </TexteTheme>
                <CurseurMemoire
                  etiquette="Valeur entière"
                  maximum={VALEUR_MAXIMALE}
                  minimum={VALEUR_MINIMALE}
                  modifierValeur={changerValeurDepuisCurseur}
                  pas={1}
                  valeur={valeurCurseur}
                />
                <TextInput
                  keyboardType="numeric"
                  onChangeText={changerTexteValeur}
                  placeholder="Nombre"
                  placeholderTextColor={themeActif.mutedInk}
                  selectionColor={themeActif.bounds}
                  style={styles.champTexte}
                  value={texteValeur}
                />
              </View>

              <View style={[styles.panneau, estTelephone ? styles.panneauMobile : null]}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Exemples
                </TexteTheme>
                <View style={styles.grilleExemples}>
                  {EXEMPLES_VALEURS.map((exemple) => (
                    <BoutonOption exemple key={exemple} onPress={() => appliquerExemple(exemple)}>
                      {String(exemple)}
                    </BoutonOption>
                  ))}
                </View>
                <BoutonOption icone="restart" onPress={reinitialiser}>
                  Réinitialiser
                </BoutonOption>
              </View>

              <View style={[styles.panneau, estTelephone ? styles.panneauMobile : null]}>
                <TexteTheme lightColor={themeActif.mutedInk} style={styles.titrePanneau}>
                  Légende float
                </TexteTheme>
                <View style={styles.grilleLegende}>
                  <View style={styles.elementLegende}>
                    <View style={[styles.pastilleLegende, { backgroundColor: themeActif.approximationNegativeStroke }]} />
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                      signe
                    </TexteTheme>
                  </View>
                  <View style={styles.elementLegende}>
                    <View style={[styles.pastilleLegende, { backgroundColor: themeActif.bounds }]} />
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                      exposant
                    </TexteTheme>
                  </View>
                  <View style={styles.elementLegende}>
                    <View style={[styles.pastilleLegende, { backgroundColor: themeActif.function }]} />
                    <TexteTheme lightColor={themeActif.mutedInk} style={styles.texteLegende}>
                      mantisse
                    </TexteTheme>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </VueTheme>
      <InfobulleDefinition
        body={[
          "Chaque type primitif Java réserve un nombre de bits. Le même nombre peut donc occuper une taille différente selon qu'il devient int, long, float, byte ou char.",
          "Le transtypage ne copie pas toujours la valeur parfaite : il peut tronquer les décimales, arrondir un réel ou ne garder que les bits de poids faible.",
          "Un boolean n'est pas un transtypage numérique en Java. La simulation montre plutôt la condition courante entier != 0.",
        ]}
        delayMs={5000}
        exampleLabel="À observer"
        exampleText="Essaie 130 : int le garde, mais byte déborde parce qu'il ne possède que 8 bits signés."
        eyebrow="Définition"
        title="Qu'est-ce que la mémoire d'un type ?"
      />
    </SafeAreaView>
  );
}

let styles = creerStyles();

function creerStyles() {
  return StyleSheet.create({
    adresseMemoire: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 16,
      textAlign: 'right',
    },
    barreLaterale: {
      gap: 16,
    },
    barreLateraleMobile: {
      gap: 10,
    },
    barreLateraleAligneeAnimation: {
      marginTop: 125,
    },
    blocAdresse: {
      alignItems: 'flex-end',
      gap: 2,
    },
    blocAdresseMobile: {
      alignItems: 'flex-start',
    },
    blocCurseur: {
      gap: 12,
    },
    blocTitre: {
      gap: 6,
    },
    boutonOption: {
      alignItems: 'center',
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 11,
      paddingVertical: 10,
    },
    boutonOptionExemple: {
      flexBasis: '30%',
      flexGrow: 1,
      minWidth: 68,
      paddingHorizontal: 8,
    },
    boutonOptionAppuye: {
      transform: [{ translateY: 1 }],
    },
    boutonOptionSelectionne: {
      backgroundColor: themeActif.activeButton,
      borderColor: themeActif.activeButton,
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
    cadreMemoireMobile: {
      padding: 12,
    },
    carteCode: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    carteMemoire: {
      backgroundColor: themeActif.surface,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    carteMemoireAppuyee: {
      transform: [{ translateY: 1 }],
    },
    carteMemoireSelectionnee: {
      backgroundColor: themeActif.boundsSoft,
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
    caseBit: {
      alignItems: 'center',
      borderRadius: 4,
      borderWidth: 1,
      height: 26,
      justifyContent: 'center',
      width: 20,
    },
    champTexte: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      color: themeActif.ink,
      fontSize: 15,
      fontWeight: '800',
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    colonneSimulation: {
      gap: 16,
    },
    colonneSimulationMobile: {
      gap: 12,
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
    contenuMobile: {
      paddingBottom: 22,
      paddingHorizontal: 10,
      paddingTop: HAUTEUR_TOTALE_ENTETE_SIMULATION + 12,
    },
    description: {
      color: themeActif.mutedInk,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
      maxWidth: 680,
    },
    descriptionMobile: {
      fontSize: 14,
      lineHeight: 20,
    },
    elementLegende: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 7,
    },
    enteteCarteMemoire: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
    },
    enteteCarteMemoireMobile: {
      flexDirection: 'column',
      gap: 7,
    },
    enteteCurseur: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteDetail: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    enteteMemoire: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    enteteMemoireMobile: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      gap: 10,
    },
    etiquetteAdresse: {
      color: themeActif.mutedInk,
      fontSize: 10,
      fontWeight: '900',
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
    grilleExemples: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    grilleLegende: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    grilleStatistiques: {
      gap: 10,
    },
    listeRepresentations: {
      gap: 10,
    },
    noteMemoire: {
      flex: 1,
      fontSize: 11,
      fontWeight: '900',
      lineHeight: 15,
      textAlign: 'right',
    },
    noteMemoireMobile: {
      flex: 0,
      textAlign: 'left',
      width: '100%',
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
    panneauMobile: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    panneauDetail: {
      backgroundColor: themeActif.surface,
      borderColor: themeActif.border,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 9,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pastilleLegende: {
      borderRadius: 3,
      height: 10,
      width: 10,
    },
    pastilleType: {
      borderRadius: 4,
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
    poigneeCurseur: {
      backgroundColor: themeActif.ink,
      borderColor: themeActif.panel,
      borderRadius: 10,
      height: 20,
      marginLeft: -10,
      position: 'absolute',
      width: 20,
    },
    rangeeBits: {
      flexDirection: 'row',
      minWidth: '100%',
    },
    rangeeTypeMemoire: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 1,
      gap: 7,
      minWidth: 0,
    },
    rangeeValeurMemoire: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    rangeeValeurMemoireMobile: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      gap: 4,
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
    texteBit: {
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: '900',
      lineHeight: 15,
    },
    texteBoutonOption: {
      color: themeActif.ink,
      flex: 1,
      fontSize: 14,
      fontWeight: '900',
      lineHeight: 18,
      textAlign: 'center',
    },
    texteBoutonOptionSelectionne: {
      color: themeActif.activeInk,
    },
    texteCode: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 18,
      minWidth: 620,
    },
    texteDetail: {
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
    titre: {
      color: themeActif.ink,
      fontSize: 34,
      fontWeight: '900',
      lineHeight: 40,
    },
    titreMobile: {
      fontSize: 28,
      lineHeight: 34,
    },
    titreDetail: {
      fontSize: 13,
      fontWeight: '900',
      lineHeight: 17,
      textTransform: 'uppercase',
    },
    titrePanneau: {
      color: themeActif.mutedInk,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0,
      lineHeight: 16,
      textTransform: 'uppercase',
    },
    titreType: {
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '900',
      lineHeight: 20,
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
      flexShrink: 1,
      fontFamily: 'monospace',
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 23,
    },
    valeurPrincipale: {
      color: themeActif.ink,
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 25,
      marginTop: 3,
    },
    valeurPrincipaleMobile: {
      fontSize: 17,
      lineHeight: 22,
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
    zoneTravailMobile: {
      gap: 14,
    },
  });
}
