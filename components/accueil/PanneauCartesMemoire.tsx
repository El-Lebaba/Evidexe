import { useEffect, useMemo, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { CarteMemoire } from '@/db/donnees-principales';

const Couleurs = obtenirThemeApplication(false);
const sujetPersonnel = 'Cartes personnelles';

type LigneCarteEdition = CarteMemoire & {
  id: string;
};

function creerLigneCarte(): LigneCarteEdition {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    front: '',
    back: '',
  };
}

export default function PanneauCartesMemoire({ darkMode = false }: { darkMode?: boolean }) {
  const themeActif = obtenirThemeApplication(darkMode);
  const [sujetSelectionne, setSujetSelectionne] = useState<string | null>(null);
  const [cartesParSujet, setCartesParSujet] = useState<Record<string, CarteMemoire[]>>({});
  const [indiceCarte, setIndiceCarte] = useState(0);
  const [afficherVerso, setAfficherVerso] = useState(false);
  const [modalCreationOuverte, setModalCreationOuverte] = useState(false);
  const [modalRenommageOuverte, setModalRenommageOuverte] = useState(false);
  const [titreSerie, setTitreSerie] = useState(sujetPersonnel);
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [lignesCartes, setLignesCartes] = useState<LigneCarteEdition[]>([creerLigneCarte()]);

  const sujets = useMemo(
    () => Array.from(new Set([...Object.keys(cartesParSujet), sujetPersonnel])),
    [cartesParSujet],
  );
  const cartes = sujetSelectionne ? cartesParSujet[sujetSelectionne] ?? [] : [];
  const carteActuelle = cartes[indiceCarte];

  useEffect(() => {
    let composantMonte = true;

    async function chargerCartesMemoire() {
      await donneesLocales.init();

      if (composantMonte) {
        setCartesParSujet(donneesLocales.obtenirCartesMemoire());
      }
    }

    void chargerCartesMemoire();

    return () => {
      composantMonte = false;
    };
  }, []);

  function selectionnerSujet(sujet: string) {
    setSujetSelectionne(sujet);
    setIndiceCarte(0);
    setAfficherVerso(false);
  }

  function ouvrirCreation() {
    setTitreSerie(sujetSelectionne ?? sujetPersonnel);
    setLignesCartes([creerLigneCarte()]);
    setModalCreationOuverte(true);
  }

  function mettreAJourLigneCarte(id: string, champ: 'front' | 'back', valeur: string) {
    setLignesCartes((lignes) =>
      lignes.map((ligne) => (ligne.id === id ? { ...ligne, [champ]: valeur } : ligne)),
    );
  }

  function supprimerLigneCarte(id: string) {
    setLignesCartes((lignes) => (lignes.length <= 1 ? lignes : lignes.filter((ligne) => ligne.id !== id)));
  }

  function enregistrerSerie() {
    const sujet = titreSerie.trim();
    const cartesValides = lignesCartes
      .map((ligne) => ({ front: ligne.front, back: ligne.back }))
      .filter((carte) => carte.front.trim().length > 0 && carte.back.trim().length > 0);

    if (!sujet || cartesValides.length === 0) {
      return;
    }

    const cartesSauvegardees = donneesLocales.enregistrerSerieCartesMemoire(sujet, cartesValides);
    setCartesParSujet((cartesActuelles) => ({
      ...cartesActuelles,
      [sujet]: cartesSauvegardees,
    }));
    setSujetSelectionne(sujet);
    setIndiceCarte(Math.max(cartesSauvegardees.length - cartesValides.length, 0));
    setAfficherVerso(false);
    setModalCreationOuverte(false);
  }

  function ouvrirRenommage() {
    if (!sujetSelectionne) {
      return;
    }

    setNouveauTitre(sujetSelectionne);
    setModalRenommageOuverte(true);
  }

  function renommerSerie() {
    if (!sujetSelectionne) {
      return;
    }

    const titreNettoye = nouveauTitre.trim();

    if (!titreNettoye) {
      return;
    }

    const prochainesCartes = donneesLocales.renommerSujetCartesMemoire(sujetSelectionne, titreNettoye);
    setCartesParSujet(prochainesCartes);
    setSujetSelectionne(titreNettoye);
    setIndiceCarte(0);
    setAfficherVerso(false);
    setModalRenommageOuverte(false);
  }

  function supprimerCarteActuelle() {
    if (!sujetSelectionne || !carteActuelle) {
      return;
    }

    const prochainesCartesSujet = donneesLocales.supprimerCarteMemoire(sujetSelectionne, indiceCarte);
    setCartesParSujet((cartesActuelles) => ({
      ...cartesActuelles,
      [sujetSelectionne]: prochainesCartesSujet,
    }));
    setIndiceCarte((indiceActuel) => Math.max(0, Math.min(indiceActuel, prochainesCartesSujet.length - 1)));
    setAfficherVerso(false);
  }

  function supprimerSerie() {
    if (!sujetSelectionne) {
      return;
    }

    const prochainesCartes = donneesLocales.supprimerSujetCartesMemoire(sujetSelectionne);
    setCartesParSujet(prochainesCartes);
    setSujetSelectionne(null);
    setIndiceCarte(0);
    setAfficherVerso(false);
  }

  function changerCarte(direction: number) {
    const prochainIndice = indiceCarte + direction;

    if (prochainIndice >= 0 && prochainIndice < cartes.length) {
      setIndiceCarte(prochainIndice);
      setAfficherVerso(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: themeActif.text }]}>Cartes de revision</Text>
          <Text style={[styles.subtitle, { color: themeActif.muted }]}>
            {sujetSelectionne ? `${sujetSelectionne} · ${cartes.length} cartes` : 'Series de cartes'}
          </Text>
        </View>

        <Pressable onPress={ouvrirCreation} style={[styles.addButton, { backgroundColor: themeActif.blue }]}>
          <MaterialIcons name="add" size={17} color="white" />
          <Text style={styles.addButtonText}>Serie</Text>
        </Pressable>
      </View>

      {!sujetSelectionne ? (
        <ScrollView contentContainerStyle={styles.topicList} showsVerticalScrollIndicator={false}>
          <Text style={[styles.helpText, { color: themeActif.muted }]}>Selectionne ou cree une serie.</Text>
          {sujets.map((sujet) => {
            const totalCartes = cartesParSujet[sujet]?.length ?? 0;

            return (
              <Pressable
                key={sujet}
                onPress={() => selectionnerSujet(sujet)}
                style={[
                  styles.topicButton,
                  {
                    backgroundColor: themeActif.panel,
                    borderColor: `${themeActif.border}25`,
                  },
                ]}>
                <View style={styles.topicMeta}>
                  <Text style={[styles.topicText, { color: themeActif.text }]}>{sujet}</Text>
                  <Text style={[styles.topicCount, { color: themeActif.muted }]}>
                    {totalCartes} carte{totalCartes > 1 ? 's' : ''}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={themeActif.muted} />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {sujetSelectionne && !carteActuelle ? (
        <View style={styles.emptyTopicWrap}>
          <View style={styles.seriesActions}>
            <Pressable onPress={() => setSujetSelectionne(null)} style={styles.iconTextButton}>
              <MaterialIcons name="arrow-back" size={17} color={themeActif.muted} />
              <Text style={[styles.iconText, { color: themeActif.muted }]}>Series</Text>
            </Pressable>
          </View>

          <View style={styles.emptyTopic}>
            <MaterialIcons name="style" size={30} color={themeActif.muted} />
            <Text style={[styles.emptyTitle, { color: themeActif.text }]}>Aucune carte</Text>
            <Text style={[styles.emptyText, { color: themeActif.muted }]}>
              Ajoute plusieurs cartes dans cette serie pour commencer.
            </Text>
            <View style={styles.emptyActions}>
              <Pressable onPress={ouvrirCreation} style={[styles.secondaryButton, { borderColor: `${themeActif.border}35` }]}>
                <Text style={[styles.secondaryButtonText, { color: themeActif.text }]}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {sujetSelectionne && carteActuelle ? (
        <View style={styles.viewer}>
          <View style={styles.seriesActions}>
            <Pressable onPress={() => setSujetSelectionne(null)} style={styles.iconTextButton}>
              <MaterialIcons name="arrow-back" size={17} color={themeActif.muted} />
              <Text style={[styles.iconText, { color: themeActif.muted }]}>Series</Text>
            </Pressable>
            <View style={styles.seriesActionRight}>
              <Pressable onPress={ouvrirRenommage} style={styles.iconOnlyButton}>
                <MaterialIcons name="edit" size={18} color={themeActif.muted} />
              </Pressable>
              <Pressable onPress={supprimerSerie} style={styles.iconOnlyButton}>
                <MaterialIcons name="delete-sweep" size={19} color={themeActif.red} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setAfficherVerso(!afficherVerso)}
            style={[
              styles.card,
              {
                backgroundColor: afficherVerso ? themeActif.background : themeActif.panel,
                borderColor: afficherVerso ? `${themeActif.green}80` : `${themeActif.border}30`,
              },
            ]}>
            <MaterialIcons
              name={afficherVerso ? 'check-circle' : 'auto-awesome'}
              size={26}
              color={afficherVerso ? themeActif.green : themeActif.blue}
            />
            <Text style={[styles.cardText, { color: themeActif.text }]}>
              {afficherVerso ? carteActuelle.back : carteActuelle.front}
            </Text>
            <Text style={[styles.tapText, { color: themeActif.muted }]}>
              {afficherVerso ? 'Clique pour revenir' : 'Clique pour voir la reponse'}
            </Text>
          </Pressable>

          <View style={styles.cardControls}>
            <Pressable
              onPress={() => changerCarte(-1)}
              disabled={indiceCarte === 0}
              style={[
                styles.arrowButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                indiceCarte === 0 && styles.disabled,
              ]}>
              <MaterialIcons name="chevron-left" size={24} color={themeActif.text} />
            </Pressable>

            <View style={styles.counterBox}>
              <Text style={[styles.counter, { color: themeActif.muted }]}>
                {indiceCarte + 1}/{cartes.length}
              </Text>
              <Pressable onPress={() => setAfficherVerso(false)}>
                <MaterialIcons name="restart-alt" size={19} color={themeActif.muted} />
              </Pressable>
              <Pressable onPress={supprimerCarteActuelle}>
                <MaterialIcons name="delete-outline" size={20} color={themeActif.red} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => changerCarte(1)}
              disabled={indiceCarte === cartes.length - 1}
              style={[
                styles.arrowButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                indiceCarte === cartes.length - 1 && styles.disabled,
              ]}>
              <MaterialIcons name="chevron-right" size={24} color={themeActif.text} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal transparent visible={modalCreationOuverte} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalBox, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}40` }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.title, { color: themeActif.text }]}>Nouvelle serie</Text>
              <Pressable onPress={() => setModalCreationOuverte(false)}>
                <MaterialIcons name="close" size={24} color={themeActif.muted} />
              </Pressable>
            </View>

            <TextInput
              placeholder="Titre de la serie"
              placeholderTextColor={themeActif.muted}
              value={titreSerie}
              onChangeText={setTitreSerie}
              style={[
                styles.input,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}30`,
                  color: themeActif.text,
                },
              ]}
            />

            <ScrollView contentContainerStyle={styles.cardEditorList} showsVerticalScrollIndicator={false}>
              {lignesCartes.map((ligne, index) => (
                <View key={ligne.id} style={[styles.cardEditor, { borderColor: `${themeActif.border}25` }]}>
                  <View style={styles.cardEditorHeader}>
                    <Text style={[styles.editorLabel, { color: themeActif.muted }]}>Carte {index + 1}</Text>
                    <Pressable onPress={() => supprimerLigneCarte(ligne.id)} disabled={lignesCartes.length <= 1}>
                      <MaterialIcons
                        name="remove-circle-outline"
                        size={20}
                        color={lignesCartes.length <= 1 ? `${themeActif.muted}70` : themeActif.red}
                      />
                    </Pressable>
                  </View>
                  <TextInput
                    multiline
                    placeholder="Question"
                    placeholderTextColor={themeActif.muted}
                    value={ligne.front}
                    onChangeText={(valeur) => mettreAJourLigneCarte(ligne.id, 'front', valeur)}
                    style={[
                      styles.input,
                      styles.compactInput,
                      {
                        backgroundColor: themeActif.panel,
                        borderColor: `${themeActif.border}30`,
                        color: themeActif.text,
                      },
                    ]}
                  />
                  <TextInput
                    multiline
                    placeholder="Reponse"
                    placeholderTextColor={themeActif.muted}
                    value={ligne.back}
                    onChangeText={(valeur) => mettreAJourLigneCarte(ligne.id, 'back', valeur)}
                    style={[
                      styles.input,
                      styles.compactInput,
                      {
                        backgroundColor: themeActif.panel,
                        borderColor: `${themeActif.border}30`,
                        color: themeActif.text,
                      },
                    ]}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setLignesCartes((lignes) => [...lignes, creerLigneCarte()])}
                style={[styles.secondaryButton, { borderColor: `${themeActif.border}35` }]}>
                <MaterialIcons name="add" size={17} color={themeActif.text} />
                <Text selectable={false} style={[styles.secondaryButtonText, { color: themeActif.text }]}>Ajouter une carte</Text>
              </Pressable>
              <Pressable onPress={enregistrerSerie} style={[styles.saveButton, { backgroundColor: themeActif.blue }]}>
                <Text selectable={false} style={styles.saveText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={modalRenommageOuverte} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalBox, { backgroundColor: themeActif.surface, borderColor: `${themeActif.border}40` }]}>
            <View style={styles.modalHeader}>
              <Text selectable={false} style={[styles.title, { color: themeActif.text }]}>Renommer la serie</Text>
              <Pressable onPress={() => setModalRenommageOuverte(false)}>
                <MaterialIcons name="close" size={24} color={themeActif.muted} />
              </Pressable>
            </View>
            <TextInput
              placeholder="Nouveau titre"
              placeholderTextColor={themeActif.muted}
              value={nouveauTitre}
              onChangeText={setNouveauTitre}
              style={[
                styles.input,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}30`,
                  color: themeActif.text,
                },
              ]}
            />
            <Pressable onPress={renommerSerie} style={[styles.saveButton, { backgroundColor: themeActif.blue }]}>
              <Text style={styles.saveText}>Renommer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: Couleurs.text,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: Couleurs.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Couleurs.blue,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  topicList: {
    gap: 9,
    paddingBottom: 8,
  },
  helpText: {
    color: Couleurs.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  topicButton: {
    alignItems: 'center',
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5325',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 12,
  },
  topicMeta: {
    flex: 1,
    gap: 3,
  },
  topicText: {
    color: Couleurs.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  topicCount: {
    color: Couleurs.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  viewer: {
    flex: 1,
    gap: 13,
  },
  seriesActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seriesActionRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconTextButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  iconText: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  iconOnlyButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  emptyTopic: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    minHeight: 230,
    padding: 22,
  },
  emptyTopicWrap: {
    flex: 1,
    gap: 12,
  },
  emptyActions: {
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  emptyTitle: {
    color: Couleurs.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: Couleurs.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5330',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 230,
    padding: 22,
  },
  cardText: {
    color: Couleurs.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: 14,
    textAlign: 'center',
  },
  tapText: {
    color: Couleurs.muted,
    fontSize: 11,
    marginTop: 14,
  },
  cardControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5325',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  disabled: {
    opacity: 0.35,
  },
  counterBox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  counter: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  changeTopic: {
    color: Couleurs.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  modalBackground: {
    alignItems: 'center',
    backgroundColor: '#00000055',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: Couleurs.surface,
    borderColor: '#243B5340',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    maxHeight: '88%',
    maxWidth: 520,
    padding: 18,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5330',
    borderRadius: 8,
    borderWidth: 1,
    color: Couleurs.text,
    minHeight: 46,
    padding: 12,
    textAlignVertical: 'top',
  },
  compactInput: {
    minHeight: 72,
  },
  cardEditorList: {
    gap: 12,
    paddingBottom: 2,
  },
  cardEditor: {
    borderRadius: 10,
    borderWidth: 1,
    gap: 9,
    padding: 10,
  },
  cardEditorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editorLabel: {
    color: Couleurs.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalActions: {
    gap: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    padding: 11,
  },
  secondaryButtonText: {
    color: Couleurs.text,
    fontSize: 12,
    fontWeight: '800',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Couleurs.blue,
    borderRadius: 8,
    padding: 12,
  },
  saveText: {
    color: 'white',
    fontWeight: '800',
  },
});
