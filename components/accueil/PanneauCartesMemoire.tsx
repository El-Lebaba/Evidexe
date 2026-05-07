import { useEffect, useMemo, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { obtenirThemeApplication } from '@/constantes/theme';
import { donneesLocales } from '@/db/donnees-principales';
import type { CarteMemoire } from '@/db/donnees-principales';

const Couleurs = obtenirThemeApplication(false);

const topicPersonnel = 'Cartes personnelles';

export default function PanneauCartesMemoire({ darkMode = false }: { darkMode?: boolean }) {
  const themeActif = obtenirThemeApplication(darkMode);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [cartesSauvegardees, setCartesSauvegardees] = useState<Record<string, CarteMemoire[]>>({});
  const [cards, setCards] = useState<CarteMemoire[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const currentCard = cards[currentIndex];
  const topics = useMemo(
    () => Array.from(new Set([...Object.keys(cartesSauvegardees), topicPersonnel])),
    [cartesSauvegardees],
  );

  useEffect(() => {
    let isMounted = true;

    async function chargerCartesMemoire() {
      await donneesLocales.init();

      if (isMounted) {
        setCartesSauvegardees(donneesLocales.obtenirCartesMemoire());
      }
    }

    void chargerCartesMemoire();

    return () => {
      isMounted = false;
    };
  }, []);

  function getCardsForTopic(topic: string, savedCardsByTopic = cartesSauvegardees) {
    return savedCardsByTopic[topic] ?? [];
  }

  function selectTopic(topic: string) {
    setSelectedTopic(topic);
    setCards(getCardsForTopic(topic));
    setCurrentIndex(0);
    setShowBack(false);
  }

  function createCard() {
    if (!newFront.trim() || !newBack.trim()) {
      return;
    }

    const topic = selectedTopic ?? topicPersonnel;
    const savedTopicCards = donneesLocales.enregistrerCarteMemoire(topic, {
      front: newFront,
      back: newBack,
    });
    const nextSavedCards = {
      ...cartesSauvegardees,
      [topic]: savedTopicCards,
    };

    setCartesSauvegardees(nextSavedCards);
    setSelectedTopic(topic);
    const nextCards = getCardsForTopic(topic, nextSavedCards);
    setCards(nextCards);
    setCurrentIndex(nextCards.length - 1);
    setShowBack(false);
    setNewFront('');
    setNewBack('');
    setModalOpen(false);
  }

  function changeCard(direction: number) {
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < cards.length) {
      setCurrentIndex(nextIndex);
      setShowBack(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Panel title and add button */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeActif.text }]}>Cartes de revision</Text>
          {selectedTopic && (
            <Text style={[styles.subtitle, { color: themeActif.muted }]}>{selectedTopic}</Text>
          )}
        </View>

        <Pressable
          onPress={() => setModalOpen(true)}
          style={[styles.addButton, { backgroundColor: themeActif.blue }]}
        >
          <MaterialIcons name="add" size={17} color="white" />
          <Text style={styles.addButtonText}>Creer</Text>
        </Pressable>
      </View>

      {/* First screen: choose what CoursLocal the cards are about */}
      {!selectedTopic && (
        <View style={styles.topicList}>
          <Text style={[styles.helpText, { color: themeActif.muted }]}>
            Selectionne un sujet pour commencer.
          </Text>
          {topics.map((topic) => (
            <Pressable
              key={topic}
              onPress={() => selectTopic(topic)}
              style={[
                styles.topicButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
              ]}
            >
              <Text style={[styles.topicText, { color: themeActif.text }]}>{topic}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Flashcard viewer */}
      {selectedTopic && !currentCard && (
        <View style={styles.emptyTopic}>
          <MaterialIcons name="style" size={30} color={themeActif.muted} />
          <Text style={[styles.emptyTitle, { color: themeActif.text }]}>Aucune carte</Text>
          <Text style={[styles.emptyText, { color: themeActif.muted }]}>
            Cree une premiere carte pour ce sujet.
          </Text>
          <Pressable
            onPress={() => {
              setSelectedTopic(null);
              setCards([]);
            }}
          >
            <Text style={[styles.changeTopic, { color: themeActif.muted }]}>
              Changer de sujet
            </Text>
          </Pressable>
        </View>
      )}

      {selectedTopic && currentCard && (
        <View style={styles.viewer}>
          <Pressable
            onPress={() => setShowBack(!showBack)}
            style={[
              styles.card,
              {
                backgroundColor: showBack ? themeActif.background : themeActif.panel,
                borderColor: showBack ? `${themeActif.green}80` : `${themeActif.border}30`,
              },
            ]}
          >
            <MaterialIcons
              name={showBack ? 'check-circle' : 'auto-awesome'}
              size={26}
              color={showBack ? themeActif.green : themeActif.blue}
            />
            <Text style={[styles.cardText, { color: themeActif.text }]}>
              {showBack ? currentCard.back : currentCard.front}
            </Text>
            <Text style={[styles.tapText, { color: themeActif.muted }]}>
              {showBack ? 'Clique pour revenir' : 'Clique pour voir la reponse'}
            </Text>
          </Pressable>

          <View style={styles.cardControls}>
            <Pressable
              onPress={() => changeCard(-1)}
              disabled={currentIndex === 0}
              style={[
                styles.arrowButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                currentIndex === 0 && styles.disabled,
              ]}
            >
              <MaterialIcons name="chevron-left" size={24} color={themeActif.text} />
            </Pressable>

            <View style={styles.counterBox}>
              <Text style={[styles.counter, { color: themeActif.muted }]}>
                {currentIndex + 1}/{cards.length}
              </Text>
              <Pressable
                onPress={() => {
                  setCurrentIndex(0);
                  setShowBack(false);
                }}
              >
                <MaterialIcons name="restart-alt" size={19} color={themeActif.muted} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => changeCard(1)}
              disabled={currentIndex === cards.length - 1}
              style={[
                styles.arrowButton,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}25`,
                },
                currentIndex === cards.length - 1 && styles.disabled,
              ]}
            >
              <MaterialIcons name="chevron-right" size={24} color={themeActif.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setSelectedTopic(null);
              setCards([]);
            }}
          >
            <Text style={[styles.changeTopic, { color: themeActif.muted }]}>
              Changer de sujet
            </Text>
          </Pressable>
        </View>
      )}

      {/* Simple modal to add one personal card */}
      <Modal transparent visible={modalOpen} animationType="fade">
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: themeActif.surface,
                borderColor: `${themeActif.border}40`,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.title, { color: themeActif.text }]}>Nouvelle carte</Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={themeActif.muted} />
              </Pressable>
            </View>

            <TextInput
              multiline
              placeholder="Question"
              placeholderTextColor={themeActif.muted}
              value={newFront}
              onChangeText={setNewFront}
              style={[
                styles.input,
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
              value={newBack}
              onChangeText={setNewBack}
              style={[
                styles.input,
                {
                  backgroundColor: themeActif.panel,
                  borderColor: `${themeActif.border}30`,
                  color: themeActif.text,
                },
              ]}
            />

            <Pressable
              onPress={createCard}
              style={[styles.saveButton, { backgroundColor: themeActif.blue }]}
            >
              <Text style={styles.saveText}>Creer la carte</Text>
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
    justifyContent: 'space-between',
  },
  title: {
    color: Couleurs.text,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: Couleurs.muted,
    fontSize: 12,
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
  },
  helpText: {
    color: Couleurs.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  topicButton: {
    backgroundColor: Couleurs.panel,
    borderColor: '#243B5325',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  topicText: {
    color: Couleurs.text,
    fontSize: 13,
    fontWeight: '700',
  },
  viewer: {
    flex: 1,
    gap: 13,
  },
  emptyTopic: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    minHeight: 230,
    padding: 22,
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
  cardBack: {
    backgroundColor: Couleurs.background,
    borderColor: '#7CCFBF80',
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
    maxWidth: 420,
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
    minHeight: 82,
    padding: 12,
    textAlignVertical: 'top',
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
