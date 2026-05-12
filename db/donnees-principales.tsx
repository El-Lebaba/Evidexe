import { ecrireValeurStockee, lireValeurStockee } from '@/db/stockage-application';

export type CoursLocal = {
  id: number | string;
  name: string;
  progress: number;
  completed: boolean;
  subject?: string;
  courseId?: string;
  totalSlides?: number;
  highestSlideIndex?: number;
  exerciseCompleted?: boolean;
  lastOpenedAt?: string;
};

export type InfosUtilisateur = {
  id?: string;
  name?: string;
  avatarUri?: string;
  xp: number;
  level: number;
};

export type CarteMemoire = {
  front: string;
  back: string;
};

export type Succes = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export type RangSucces = 'Gris' | 'Bronze' | 'Fer' | 'Or' | 'Diamant';

export type SuccesProgression = {
  id: string;
  title: string;
  description: string;
  rang: RangSucces;
  progress: number;
  target: number;
  completed: boolean;
  category: 'course' | 'cards' | 'simulation';
  subject?: 'java' | 'mathematiques' | 'physique' | 'programmation-java';
};

export type ParametresApplication = {
  darkMode: boolean;
  language: string;
  notifications: boolean;
};

type UtilisateurStocke = {
  id: string;
  key: string;
  name: string;
  avatarUri?: string;
  xp: number;
  level: number;
  createdAt: string;
  lastSeenAt: string;
};

type ProgressionCoursStockee = {
  id: string;
  subject: string;
  courseId: string;
  name: string;
  progress: number;
  completed: boolean;
  totalSlides?: number;
  highestSlideIndex?: number;
  exerciseCompleted?: boolean;
  xpAwarded?: boolean;
  lastOpenedAt: string;
};

type DonneesUtilisateur = {
  courses: Record<string, ProgressionCoursStockee>;
  cartesMemoire: Record<string, CarteMemoire[]>;
  achievements: Record<string, Succes>;
  achievementStats: {
    createdCards: number;
    simulationClicksBySection: Record<string, string[]>;
  };
  settings: ParametresApplication;
};

type DonneesApplication = {
  activeUserId: string;
  users: Record<string, UtilisateurStocke>;
  DonneesUtilisateur: Record<string, DonneesUtilisateur>;
};

const cleStockage = 'evidex_app_data';
const nomUtilisateurDefaut = 'Utilisateur';

const parametresDefaut: ParametresApplication = {
  darkMode: false,
  language: 'fr',
  notifications: true,
};

const succesDefaut: Succes[] = [
  {
    id: 1,
    title: 'Premier pas',
    description: 'Ouvrir la simulation pour la premiere fois',
    completed: false,
  },
  {
    id: 2,
    title: 'Simulateur assidu',
    description: 'Ouvrir la simulation 5 fois',
    completed: false,
  },
  {
    id: 3,
    title: 'Premier cours termine',
    description: 'Completer 1 cours',
    completed: false,
  },
  {
    id: 4,
    title: 'Studieux',
    description: 'Completer 5 cours',
    completed: false,
  },
  {
    id: 5,
    title: 'Flashcards',
    description: 'Creer 10 flashcards',
    completed: false,
  },
  {
    id: 6,
    title: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    completed: false,
  },
];

const cartesMemoireDefaut: Record<string, CarteMemoire[]> = {
  'Java - If Statement': [
    {
      front: "C'est quoi un if statement?",
      back: 'Une condition qui execute du code seulement si elle est vraie.',
    },
    {
      front: 'Quelle est la syntaxe de base?',
      back: 'if (condition) { // code }',
    },
    {
      front: 'A quoi sert else?',
      back: 'Else donne un autre bloc de code si la condition est fausse.',
    },
  ],
  'Java - Variables': [
    {
      front: 'Comment declarer un entier?',
      back: 'int nombre = 42;',
    },
    {
      front: "C'est quoi une variable final?",
      back: 'Une valeur qui ne peut plus changer apres son initialisation.',
    },
  ],
  'Java - For Loops': [],
  'Java - Methods': [],
  'Java - Arrays': [],
};

const seuilsCoursSucces = [2, 4, 8, 16];
const seuilsSuccesSimple = [1, 2, 3, 4, 5];
const rangsSucces: RangSucces[] = ['Gris', 'Bronze', 'Fer', 'Or', 'Diamant'];

const succesProgressionDefaut = [
  {
    id: 'course-java',
    title: 'Completer des cours de Java',
    description: 'Termine les mini-cours Java pour monter de rang.',
    category: 'course',
    subject: 'java',
  },
  {
    id: 'course-mathematiques',
    title: 'Completer des cours de mathematiques',
    description: 'Termine les mini-cours de mathematiques.',
    category: 'course',
    subject: 'mathematiques',
  },
  {
    id: 'course-physique',
    title: 'Completer des cours de physique',
    description: 'Termine les mini-cours de physique.',
    category: 'course',
    subject: 'physique',
  },
  {
    id: 'cards-created',
    title: 'Creer 5 cartes',
    description: 'Cree tes propres cartes de revision.',
    category: 'cards',
  },
  {
    id: 'simulation-java',
    title: 'Cliquer sur 5 simulations differentes de Java',
    description: 'Ouvre des simulations Java differentes.',
    category: 'simulation',
    subject: 'programmation-java',
  },
  {
    id: 'simulation-mathematiques',
    title: 'Cliquer sur 5 simulations differentes de mathematiques',
    description: 'Ouvre des simulations de mathematiques differentes.',
    category: 'simulation',
    subject: 'mathematiques',
  },
  {
    id: 'simulation-physique',
    title: 'Cliquer sur 5 simulations differentes de physique',
    description: 'Ouvre des simulations de physique differentes.',
    category: 'simulation',
    subject: 'physique',
  },
] as const;

let donneesMemoire: DonneesApplication | null = null;
let chargementDonneesMemoire: Promise<DonneesApplication> | null = null;
const ecouteursParametres = new Set<() => void>();

function maintenantIso() {
  return new Date().toISOString();
}

function normaliserNomUtilisateur(nom?: string | null) {
  const nomNettoye = nom?.trim();
  return nomNettoye && nomNettoye.length > 0 ? nomNettoye : nomUtilisateurDefaut;
}

function cleUtilisateur(nom: string) {
  return normaliserNomUtilisateur(nom).toLocaleLowerCase();
}

function creerId(prefixe: string) {
  return `${prefixe}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function bornerProgression(progression: number) {
  if (!Number.isFinite(progression)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(progression)));
}

// Convertit la diapo la plus avancee en pourcentage entier stocke localement.
// La derniere diapo theorique est limitee a 99%; l'exercice final est requis pour 100%.
function progressionDepuisDiapo(indiceDiapo: number, totalDiapos?: number, exerciceTermine = false) {
  if (!totalDiapos || totalDiapos <= 0) {
    return indiceDiapo >= 0 ? 1 : 0;
  }

  const diapoValide = Math.max(0, Math.min(Math.floor(indiceDiapo), totalDiapos - 1));
  const derniereDiapoTheorieAtteinte = diapoValide >= totalDiapos - 1;

  if (derniereDiapoTheorieAtteinte) {
    return exerciceTermine ? 100 : 99;
  }

  return bornerProgression(((diapoValide + 1) / totalDiapos) * 100);
}

function carteSuccesDefaut() {
  return Object.fromEntries(succesDefaut.map((Succes) => [String(Succes.id), Succes]));
}

function carteMemoireDefaut() {
  return Object.fromEntries(
    Object.entries(cartesMemoireDefaut).map(([sujet, cartes]) => [
      sujet,
      cartes.map((carte) => ({ ...carte })),
    ]),
  );
}

function creerStatsSuccesDefaut() {
  return {
    createdCards: 0,
    simulationClicksBySection: {},
  };
}

function normaliserParametresApplication(parametres?: Partial<ParametresApplication>) {
  return {
    darkMode: parametres?.darkMode ?? parametresDefaut.darkMode,
    language: parametres?.language ?? parametresDefaut.language,
    notifications: parametres?.notifications ?? parametresDefaut.notifications,
  };
}

function creerUtilisateur(nom: string): UtilisateurStocke {
  const nomAffiche = normaliserNomUtilisateur(nom);
  return {
    id: creerId('user'),
    key: cleUtilisateur(nomAffiche),
    name: nomAffiche,
    xp: 0,
    level: 1,
    createdAt: maintenantIso(),
    lastSeenAt: maintenantIso(),
  };
}

function creerDonneesUtilisateur(): DonneesUtilisateur {
  return {
    courses: {},
    cartesMemoire: carteMemoireDefaut(),
    achievements: carteSuccesDefaut(),
    achievementStats: creerStatsSuccesDefaut(),
    settings: normaliserParametresApplication(),
  };
}

function creerDonneesApplicationDefaut() {
  const utilisateur = creerUtilisateur(nomUtilisateurDefaut);
  return {
    activeUserId: utilisateur.id,
    users: { [utilisateur.id]: utilisateur },
    DonneesUtilisateur: { [utilisateur.id]: creerDonneesUtilisateur() },
  };
}

function completerDonneesUtilisateur(donnees?: Partial<DonneesUtilisateur>): DonneesUtilisateur {
  return {
    courses: donnees?.courses ?? {},
    cartesMemoire: donnees?.cartesMemoire ?? carteMemoireDefaut(),
    achievements: {
      ...carteSuccesDefaut(),
      ...(donnees?.achievements ?? {}),
    },
    achievementStats: {
      ...creerStatsSuccesDefaut(),
      ...(donnees?.achievementStats ?? {}),
      simulationClicksBySection: {
        ...(donnees?.achievementStats?.simulationClicksBySection ?? {}),
      },
    },
    settings: normaliserParametresApplication(donnees?.settings),
  };
}

function normaliserDonneesApplication(valeur: unknown): DonneesApplication {
  const donneesDefaut = creerDonneesApplicationDefaut();

  if (!valeur || typeof valeur !== 'object') {
    return donneesDefaut;
  }

  const donneesBrutes = valeur as Partial<DonneesApplication> & {
    userData?: Record<string, Partial<DonneesUtilisateur>>;
  };
  const users = donneesBrutes.users && typeof donneesBrutes.users === 'object'
    ? donneesBrutes.users
    : donneesDefaut.users;
  const activeUserId = donneesBrutes.activeUserId && users[donneesBrutes.activeUserId]
    ? donneesBrutes.activeUserId
    : Object.keys(users)[0] ?? donneesDefaut.activeUserId;
  const donneesUtilisateurBrutes = donneesBrutes.DonneesUtilisateur ?? donneesBrutes.userData ?? {};
  const DonneesUtilisateur = Object.fromEntries(
    Object.keys(users).map((userId) => [
      userId,
      completerDonneesUtilisateur(donneesUtilisateurBrutes[userId]),
    ]),
  );

  if (!DonneesUtilisateur[activeUserId]) {
    DonneesUtilisateur[activeUserId] = creerDonneesUtilisateur();
  }

  return {
    activeUserId,
    users,
    DonneesUtilisateur,
  };
}

async function lireDonneesApplicationStockee(): Promise<DonneesApplication> {
  try {
    const valeurSauvegardee = await lireValeurStockee(cleStockage);
    return valeurSauvegardee ? normaliserDonneesApplication(JSON.parse(valeurSauvegardee)) : creerDonneesApplicationDefaut();
  } catch {
    return creerDonneesApplicationDefaut();
  }
}

function lireDonneesApplication(): DonneesApplication {
  if (donneesMemoire) {
    return donneesMemoire;
  }

  donneesMemoire = creerDonneesApplicationDefaut();
  void initialiserDonneesApplication();

  return donneesMemoire;
}

async function initialiserDonneesApplication() {
  if (!chargementDonneesMemoire) {
    chargementDonneesMemoire = lireDonneesApplicationStockee();
  }

  donneesMemoire = await chargementDonneesMemoire;

  if (!donneesMemoire) {
    donneesMemoire = creerDonneesApplicationDefaut();
  }

  return donneesMemoire;
}

function ecrireDonneesApplication(prochainesDonnees: DonneesApplication) {
  donneesMemoire = prochainesDonnees;
  void ecrireValeurStockee(cleStockage, JSON.stringify(prochainesDonnees));
}

function garantirUtilisateurActif(donnees = lireDonneesApplication()) {
  donnees.users = donnees.users ?? {};
  donnees.DonneesUtilisateur = donnees.DonneesUtilisateur ?? {};
  let utilisateurActif = donnees.users[donnees.activeUserId];

  if (!utilisateurActif) {
    utilisateurActif = creerUtilisateur(nomUtilisateurDefaut);
    donnees.activeUserId = utilisateurActif.id;
    donnees.users[utilisateurActif.id] = utilisateurActif;
  }

  if (!donnees.DonneesUtilisateur[utilisateurActif.id]) {
    donnees.DonneesUtilisateur[utilisateurActif.id] = creerDonneesUtilisateur();
  }

  return utilisateurActif;
}

function obtenirDonneesUtilisateurActif(donnees = lireDonneesApplication()) {
  const utilisateur = garantirUtilisateurActif(donnees);
  return donnees.DonneesUtilisateur[utilisateur.id];
}

function trouverUtilisateurParNom(donnees: DonneesApplication, nom: string) {
  const cle = cleUtilisateur(nom);
  return Object.values(donnees.users).find((utilisateur) => utilisateur.key === cle);
}

function identiteCours(coursLocal: Partial<CoursLocal>) {
  const texteId = String(coursLocal.id ?? '');

  if (coursLocal.subject && coursLocal.courseId) {
    return {
      subject: coursLocal.subject,
      courseId: coursLocal.courseId,
      id: `${coursLocal.subject}:${coursLocal.courseId}`,
    };
  }

  if (texteId.includes(':')) {
    const [subject, courseId] = texteId.split(':');
    return { subject, courseId, id: texteId };
  }

  return { subject: 'general', courseId: texteId, id: texteId };
}

function mapperCours(coursLocal: ProgressionCoursStockee): CoursLocal {
  return {
    id: coursLocal.id,
    name: coursLocal.name,
    progress: coursLocal.progress,
    completed: coursLocal.completed,
    subject: coursLocal.subject,
    courseId: coursLocal.courseId,
    totalSlides: coursLocal.totalSlides,
    highestSlideIndex: coursLocal.highestSlideIndex,
    exerciseCompleted: Boolean(coursLocal.exerciseCompleted),
    lastOpenedAt: coursLocal.lastOpenedAt,
  };
}

function calculerRangSucces(progression: number, seuils: number[]) {
  const seuilsCompletes = seuils.filter((seuil) => progression >= seuil).length;
  const indiceRang = Math.min(seuilsCompletes, rangsSucces.length - 1);
  const completed = progression >= seuils[seuils.length - 1];
  const target = completed ? seuils[seuils.length - 1] : seuils[seuilsCompletes] ?? seuils[seuils.length - 1];

  return {
    completed,
    rang: rangsSucces[indiceRang],
    target,
  };
}

function compterCoursTerminesParMatiere(donneesUtilisateur: DonneesUtilisateur, matiere: string) {
  return Object.values(donneesUtilisateur.courses).filter(
    (coursLocal) => coursLocal.subject === matiere && coursLocal.completed,
  ).length;
}

function emettreChangementParametres() {
  ecouteursParametres.forEach((ecouteur) => {
    ecouteur();
  });

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('evidex_settings_changed'));
  }
}

export const donneesLocales = {
  async init(nomUtilisateur?: string) {
    const donnees = await initialiserDonneesApplication();
    garantirUtilisateurActif(donnees);

    if (nomUtilisateur) {
      return donneesLocales.definirUtilisateurActif(nomUtilisateur);
    }

    ecrireDonneesApplication(donnees);
  },

  definirUtilisateurActif(nomUtilisateur: string) {
    const donnees = lireDonneesApplication();
    const nomAffiche = normaliserNomUtilisateur(nomUtilisateur);
    let utilisateur = trouverUtilisateurParNom(donnees, nomAffiche);

    if (!utilisateur) {
      utilisateur = creerUtilisateur(nomAffiche);
      donnees.users[utilisateur.id] = utilisateur;
      donnees.DonneesUtilisateur[utilisateur.id] = creerDonneesUtilisateur();
    }

    utilisateur.name = nomAffiche;
    utilisateur.key = cleUtilisateur(nomAffiche);
    utilisateur.lastSeenAt = maintenantIso();
    donnees.activeUserId = utilisateur.id;
    garantirUtilisateurActif(donnees);
    ecrireDonneesApplication(donnees);

    return donneesLocales.obtenirUtilisateur();
  },

  obtenirUtilisateur(): InfosUtilisateur {
    const donnees = lireDonneesApplication();
    const utilisateur = garantirUtilisateurActif(donnees);
    return {
      id: utilisateur.id,
      name: utilisateur.name,
      avatarUri: utilisateur.avatarUri,
      xp: utilisateur.xp,
      level: utilisateur.level,
    };
  },

  enregistrerUtilisateur(infosUtilisateur: InfosUtilisateur) {
    const donnees = lireDonneesApplication();
    const utilisateur = garantirUtilisateurActif(donnees);

    if (infosUtilisateur.name) {
      utilisateur.name = normaliserNomUtilisateur(infosUtilisateur.name);
      utilisateur.key = cleUtilisateur(utilisateur.name);
    }

    utilisateur.avatarUri = infosUtilisateur.avatarUri;
    utilisateur.xp = Math.max(0, Math.round(infosUtilisateur.xp));
    utilisateur.level = Math.max(1, Math.round(infosUtilisateur.level));
    utilisateur.lastSeenAt = maintenantIso();
    ecrireDonneesApplication(donnees);
  },

  obtenirCoursRecents(limite = 6) {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    return Object.values(donneesUtilisateur.courses)
      .filter((coursLocal) => coursLocal.progress > 0)
      .sort((gauche, droite) => droite.lastOpenedAt.localeCompare(gauche.lastOpenedAt))
      .slice(0, limite)
      .map(mapperCours);
  },

  obtenirCarteProgressionCours() {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    return Object.values(donneesUtilisateur.courses).reduce<Record<string, number>>((carteProgression, coursLocal) => {
      if (coursLocal.progress > 0) {
        carteProgression[coursLocal.id] = coursLocal.highestSlideIndex ?? 0;
      }

      return carteProgression;
    }, {});
  },

  obtenirProgressionCours(matiere: string, idCours: string) {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    const coursLocal = donneesUtilisateur.courses[`${matiere}:${idCours}`];
    return coursLocal?.highestSlideIndex ?? 0;
  },

  obtenirDetailsProgressionCours(matiere: string, idCours: string) {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    const coursLocal = donneesUtilisateur.courses[`${matiere}:${idCours}`];

    if (!coursLocal) {
      return {
        completed: false,
        exerciseCompleted: false,
        highestSlideIndex: -1,
        progress: 0,
      };
    }

    return {
      completed: coursLocal.completed,
      exerciseCompleted: Boolean(coursLocal.exerciseCompleted),
      highestSlideIndex: coursLocal.highestSlideIndex ?? -1,
      progress: coursLocal.progress,
    };
  },

  enregistrerProgressionCours(
    matiere: string,
    idCours: string,
    indiceDiapo: number,
    totalDiapos?: number,
    nomCours?: string,
    exerciceTermine = false,
  ) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const id = `${matiere}:${idCours}`;
    const coursExistant = donneesUtilisateur.courses[id];
    const prochainExerciceTermine = Boolean(coursExistant?.exerciseCompleted || exerciceTermine);
    const progression = progressionDepuisDiapo(indiceDiapo, totalDiapos, prochainExerciceTermine);

    if (progression <= 0) {
      return;
    }

    const plusHautIndiceDiapo = Math.max(coursExistant?.highestSlideIndex ?? -1, Math.max(0, Math.floor(indiceDiapo)));
    const progressionExistanteSelonRegle = prochainExerciceTermine ? coursExistant?.progress ?? 0 : Math.min(coursExistant?.progress ?? 0, 99);
    const prochaineProgression = Math.max(progressionExistanteSelonRegle, progression);
    const doitAttribuerXpCompletion = prochainExerciceTermine && prochaineProgression >= 100 && !coursExistant?.xpAwarded;

    if (doitAttribuerXpCompletion) {
      const utilisateur = garantirUtilisateurActif(donnees);
      utilisateur.xp = Math.max(0, utilisateur.xp + 25);
      utilisateur.level = Math.floor(utilisateur.xp / 100) + 1;
      utilisateur.lastSeenAt = maintenantIso();
    }

    donneesUtilisateur.courses[id] = {
      id,
      subject: matiere,
      courseId: idCours,
      name: nomCours ?? coursExistant?.name ?? `${matiere} - ${idCours}`,
      progress: prochaineProgression,
      completed: prochaineProgression >= 100,
      totalSlides: totalDiapos ?? coursExistant?.totalSlides,
      highestSlideIndex: plusHautIndiceDiapo,
      exerciseCompleted: prochainExerciceTermine,
      xpAwarded: Boolean(coursExistant?.xpAwarded || doitAttribuerXpCompletion),
      lastOpenedAt: maintenantIso(),
    };

    if (prochaineProgression >= 100) {
      const nombreCoursTermines = Object.values(donneesUtilisateur.courses).filter((coursLocal) => coursLocal.completed).length;
      donneesUtilisateur.achievements['3'] = { ...succesDefaut[2], completed: true };

      if (nombreCoursTermines >= 5) {
        donneesUtilisateur.achievements['4'] = { ...succesDefaut[3], completed: true };
      }
    }

    ecrireDonneesApplication(donnees);
  },

  enregistrerCours(cours: CoursLocal[]) {
    cours.forEach((coursLocal) => {
      const identite = identiteCours(coursLocal);

      if (coursLocal.highestSlideIndex !== undefined) {
        donneesLocales.enregistrerProgressionCours(
          identite.subject,
          identite.courseId,
          coursLocal.highestSlideIndex,
          coursLocal.totalSlides,
          coursLocal.name,
          coursLocal.exerciseCompleted,
        );
        return;
      }

      if (coursLocal.progress > 0) {
        const indiceDiapo = coursLocal.totalSlides
          ? Math.max(0, Math.ceil((coursLocal.progress / 100) * coursLocal.totalSlides) - 1)
          : 0;
        donneesLocales.enregistrerProgressionCours(
          identite.subject,
          identite.courseId,
          indiceDiapo,
          coursLocal.totalSlides,
          coursLocal.name,
          coursLocal.exerciseCompleted,
        );
      }
    });
  },

  mettreAJourCours(id: number | string, correctif: Partial<CoursLocal>) {
    const identite = identiteCours({ ...correctif, id });
    const progressionExistante = donneesLocales.obtenirProgressionCours(identite.subject, identite.courseId);

    donneesLocales.enregistrerProgressionCours(
      identite.subject,
      identite.courseId,
      correctif.highestSlideIndex ?? progressionExistante,
      correctif.totalSlides,
      correctif.name,
      correctif.exerciseCompleted,
    );
  },

  supprimerCours(id: number | string) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const identite = identiteCours({ id });
    delete donneesUtilisateur.courses[identite.id];
    ecrireDonneesApplication(donnees);
  },

  enregistrerCreationCarte() {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    donneesUtilisateur.achievementStats.createdCards = Math.max(
      0,
      Math.round(donneesUtilisateur.achievementStats.createdCards ?? 0),
    ) + 1;
    ecrireDonneesApplication(donnees);
  },

  obtenirCartesMemoire() {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    return Object.fromEntries(
      Object.entries(donneesUtilisateur.cartesMemoire).map(([sujet, cartes]) => [
        sujet,
        cartes.map((carte) => ({ ...carte })),
      ]),
    );
  },

  obtenirCartesMemoireSujet(sujet: string) {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    return (donneesUtilisateur.cartesMemoire[sujet] ?? []).map((carte) => ({ ...carte }));
  },

  enregistrerCarteMemoire(sujet: string, carte: CarteMemoire) {
    const sujetNettoye = sujet.trim();
    const recto = carte.front.trim();
    const verso = carte.back.trim();

    if (!sujetNettoye || !recto || !verso) {
      return [];
    }

    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const cartesActuelles = donneesUtilisateur.cartesMemoire[sujetNettoye] ?? [];
    const prochainesCartes = [...cartesActuelles, { front: recto, back: verso }];

    donneesUtilisateur.cartesMemoire[sujetNettoye] = prochainesCartes;
    donneesUtilisateur.achievementStats.createdCards = Math.max(
      0,
      Math.round(donneesUtilisateur.achievementStats.createdCards ?? 0),
    ) + 1;
    ecrireDonneesApplication(donnees);

    return prochainesCartes.map((carteSauvegardee) => ({ ...carteSauvegardee }));
  },

  enregistrerSerieCartesMemoire(sujet: string, cartes: CarteMemoire[]) {
    const sujetNettoye = sujet.trim();
    const cartesValides = cartes
      .map((carte) => ({
        front: carte.front.trim(),
        back: carte.back.trim(),
      }))
      .filter((carte) => carte.front.length > 0 && carte.back.length > 0);

    if (!sujetNettoye || cartesValides.length === 0) {
      return [];
    }

    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const cartesActuelles = donneesUtilisateur.cartesMemoire[sujetNettoye] ?? [];
    const prochainesCartes = [...cartesActuelles, ...cartesValides];

    donneesUtilisateur.cartesMemoire[sujetNettoye] = prochainesCartes;
    donneesUtilisateur.achievementStats.createdCards = Math.max(
      0,
      Math.round(donneesUtilisateur.achievementStats.createdCards ?? 0),
    ) + cartesValides.length;
    ecrireDonneesApplication(donnees);

    return prochainesCartes.map((carteSauvegardee) => ({ ...carteSauvegardee }));
  },

  renommerSujetCartesMemoire(ancienSujet: string, nouveauSujet: string) {
    const ancienSujetNettoye = ancienSujet.trim();
    const nouveauSujetNettoye = nouveauSujet.trim();

    if (!ancienSujetNettoye || !nouveauSujetNettoye) {
      return donneesLocales.obtenirCartesMemoire();
    }

    if (ancienSujetNettoye === nouveauSujetNettoye) {
      return donneesLocales.obtenirCartesMemoire();
    }

    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const cartesAnciennes = donneesUtilisateur.cartesMemoire[ancienSujetNettoye] ?? [];
    const cartesDestination = donneesUtilisateur.cartesMemoire[nouveauSujetNettoye] ?? [];

    donneesUtilisateur.cartesMemoire[nouveauSujetNettoye] = [...cartesDestination, ...cartesAnciennes];
    delete donneesUtilisateur.cartesMemoire[ancienSujetNettoye];
    ecrireDonneesApplication(donnees);

    return donneesLocales.obtenirCartesMemoire();
  },

  supprimerCarteMemoire(sujet: string, indiceCarte: number) {
    const sujetNettoye = sujet.trim();
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const cartesActuelles = donneesUtilisateur.cartesMemoire[sujetNettoye] ?? [];

    if (!sujetNettoye || indiceCarte < 0 || indiceCarte >= cartesActuelles.length) {
      return cartesActuelles.map((carte) => ({ ...carte }));
    }

    const prochainesCartes = cartesActuelles.filter((_carte, indice) => indice !== indiceCarte);
    donneesUtilisateur.cartesMemoire[sujetNettoye] = prochainesCartes;
    ecrireDonneesApplication(donnees);

    return prochainesCartes.map((carte) => ({ ...carte }));
  },

  supprimerSujetCartesMemoire(sujet: string) {
    const sujetNettoye = sujet.trim();

    if (!sujetNettoye) {
      return donneesLocales.obtenirCartesMemoire();
    }

    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    delete donneesUtilisateur.cartesMemoire[sujetNettoye];
    ecrireDonneesApplication(donnees);

    return donneesLocales.obtenirCartesMemoire();
  },

  enregistrerClicSimulation(section: string, idSimulation: string) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const clicsActuels = donneesUtilisateur.achievementStats.simulationClicksBySection[section] ?? [];

    if (!clicsActuels.includes(idSimulation)) {
      donneesUtilisateur.achievementStats.simulationClicksBySection[section] = [...clicsActuels, idSimulation];
      ecrireDonneesApplication(donnees);
    }
  },

  obtenirSuccesProgression(): SuccesProgression[] {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();

    return succesProgressionDefaut.map((Succes) => {
      let progression = 0;
      const seuils = Succes.category === 'course' ? seuilsCoursSucces : seuilsSuccesSimple;

      if (Succes.category === 'course') {
        progression = compterCoursTerminesParMatiere(donneesUtilisateur, Succes.subject);
      } else if (Succes.category === 'cards') {
        progression = donneesUtilisateur.achievementStats.createdCards;
      } else {
        progression = donneesUtilisateur.achievementStats.simulationClicksBySection[Succes.subject]?.length ?? 0;
      }

      const etatRang = calculerRangSucces(progression, seuils);

      return {
        id: Succes.id,
        title: Succes.title,
        description: Succes.description,
        category: Succes.category,
        subject: 'subject' in Succes ? Succes.subject : undefined,
        progress: progression,
        ...etatRang,
      };
    });
  },

  obtenirSucces() {
    const donneesUtilisateur = obtenirDonneesUtilisateurActif();
    return succesDefaut.map((Succes) => ({
      ...Succes,
      ...donneesUtilisateur.achievements[String(Succes.id)],
    }));
  },

  terminerSucces(id: number) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const succesExistant = donneesUtilisateur.achievements[String(id)] ?? succesDefaut.find((Succes) => Succes.id === id);

    if (succesExistant) {
      donneesUtilisateur.achievements[String(id)] = { ...succesExistant, completed: true };
      ecrireDonneesApplication(donnees);
    }
  },

  enregistrerSucces(succes: Succes) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    const succesExistant = donneesUtilisateur.achievements[String(succes.id)];
    donneesUtilisateur.achievements[String(succes.id)] = {
      ...succes,
      completed: succesExistant?.completed || succes.completed,
    };
    ecrireDonneesApplication(donnees);
  },

  obtenirParametres() {
    return normaliserParametresApplication(obtenirDonneesUtilisateurActif().settings);
  },

  ajouterEcouteurParametres(ecouteur: () => void) {
    ecouteursParametres.add(ecouteur);

    return () => {
      ecouteursParametres.delete(ecouteur);
    };
  },

  enregistrerParametres(parametres: ParametresApplication) {
    const donnees = lireDonneesApplication();
    const donneesUtilisateur = obtenirDonneesUtilisateurActif(donnees);
    donneesUtilisateur.settings = normaliserParametresApplication(parametres);
    ecrireDonneesApplication(donnees);
    emettreChangementParametres();
  },

  reinitialiserDonneesUtilisateurActif() {
    const donnees = lireDonneesApplication();
    const utilisateur = garantirUtilisateurActif(donnees);
    donnees.DonneesUtilisateur[utilisateur.id] = creerDonneesUtilisateur();
    utilisateur.xp = 0;
    utilisateur.level = 1;
    utilisateur.lastSeenAt = maintenantIso();
    ecrireDonneesApplication(donnees);
    emettreChangementParametres();
  },
};
