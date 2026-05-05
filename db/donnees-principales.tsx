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
  xp: number;
  level: number;
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
  fpsCounterEnabled: boolean;
};

type UtilisateurStocke = {
  id: string;
  key: string;
  name: string;
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
  fpsCounterEnabled: true,
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

function peutUtiliserStockageLocal() {
  return typeof localStorage !== 'undefined';
}

function maintenantIso() {
  return new Date().toISOString();
}

function normaliserNomUtilisateur(name?: string | null) {
  const trimmedName = name?.trim();
  return trimmedName && trimmedName.length > 0 ? trimmedName : nomUtilisateurDefaut;
}

function cleUtilisateur(name: string) {
  return normaliserNomUtilisateur(name).toLocaleLowerCase();
}

function creerId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function bornerProgression(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(progress)));
}

// Converts the furthest opened slide into the integer percentage stored in local user data.
// The last theory slide is capped at 99%; the final exercise flag is required for 100%.
function progressionDepuisDiapo(slideIndex: number, totalSlides?: number, exerciseCompleted = false) {
  if (!totalSlides || totalSlides <= 0) {
    return slideIndex >= 0 ? 1 : 0;
  }

  const safeSlide = Math.max(0, Math.min(Math.floor(slideIndex), totalSlides - 1));
  const reachedLastTheorySlide = safeSlide >= totalSlides - 1;

  if (reachedLastTheorySlide) {
    return exerciseCompleted ? 100 : 99;
  }

  return bornerProgression(((safeSlide + 1) / totalSlides) * 100);
}

function carteSuccesDefaut() {
  return Object.fromEntries(succesDefaut.map((Succes) => [String(Succes.id), Succes]));
}

function creerStatsSuccesDefaut() {
  return {
    createdCards: 0,
    simulationClicksBySection: {},
  };
}

function creerUtilisateur(name: string): UtilisateurStocke {
  const displayName = normaliserNomUtilisateur(name);
  return {
    id: creerId('user'),
    key: cleUtilisateur(displayName),
    name: displayName,
    xp: 0,
    level: 1,
    createdAt: maintenantIso(),
    lastSeenAt: maintenantIso(),
  };
}

function creerDonneesUtilisateur(): DonneesUtilisateur {
  return {
    courses: {},
    achievements: carteSuccesDefaut(),
    achievementStats: creerStatsSuccesDefaut(),
    settings: { ...parametresDefaut },
  };
}

function creerDonneesApplicationDefaut() {
  const user = creerUtilisateur(nomUtilisateurDefaut);
  return {
    activeUserId: user.id,
    users: { [user.id]: user },
    DonneesUtilisateur: { [user.id]: creerDonneesUtilisateur() },
  };
}

function completerDonneesUtilisateur(donnees?: Partial<DonneesUtilisateur>): DonneesUtilisateur {
  return {
    courses: donnees?.courses ?? {},
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
    settings: {
      ...parametresDefaut,
      ...(donnees?.settings ?? {}),
    },
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

function lireDonneesApplication(): DonneesApplication {
  if (donneesMemoire) {
    return donneesMemoire;
  }

  if (!peutUtiliserStockageLocal()) {
    donneesMemoire = creerDonneesApplicationDefaut();
    return donneesMemoire;
  }

  try {
    const savedValue = localStorage.getItem(cleStockage);
    donneesMemoire = savedValue ? normaliserDonneesApplication(JSON.parse(savedValue)) : creerDonneesApplicationDefaut();
  } catch {
    donneesMemoire = creerDonneesApplicationDefaut();
  }

  if (!donneesMemoire) {
    donneesMemoire = creerDonneesApplicationDefaut();
  }

  return donneesMemoire;
}

function ecrireDonneesApplication(nextData: DonneesApplication) {
  donneesMemoire = nextData;

  if (peutUtiliserStockageLocal()) {
    localStorage.setItem(cleStockage, JSON.stringify(nextData));
  }
}

function garantirUtilisateurActif(data = lireDonneesApplication()) {
  data.users = data.users ?? {};
  data.DonneesUtilisateur = data.DonneesUtilisateur ?? {};
  let activeUser = data.users[data.activeUserId];

  if (!activeUser) {
    activeUser = creerUtilisateur(nomUtilisateurDefaut);
    data.activeUserId = activeUser.id;
    data.users[activeUser.id] = activeUser;
  }

  if (!data.DonneesUtilisateur[activeUser.id]) {
    data.DonneesUtilisateur[activeUser.id] = creerDonneesUtilisateur();
  }

  return activeUser;
}

function obtenirDonneesUtilisateurActif(data = lireDonneesApplication()) {
  const user = garantirUtilisateurActif(data);
  return data.DonneesUtilisateur[user.id];
}

function trouverUtilisateurParNom(data: DonneesApplication, name: string) {
  const key = cleUtilisateur(name);
  return Object.values(data.users).find((user) => user.key === key);
}

function identiteCours(CoursLocal: Partial<CoursLocal>) {
  const idText = String(CoursLocal.id ?? '');

  if (CoursLocal.subject && CoursLocal.courseId) {
    return {
      subject: CoursLocal.subject,
      courseId: CoursLocal.courseId,
      id: `${CoursLocal.subject}:${CoursLocal.courseId}`,
    };
  }

  if (idText.includes(':')) {
    const [subject, courseId] = idText.split(':');
    return { subject, courseId, id: idText };
  }

  return { subject: 'general', courseId: idText, id: idText };
}

function mapperCours(CoursLocal: ProgressionCoursStockee): CoursLocal {
  return {
    id: CoursLocal.id,
    name: CoursLocal.name,
    progress: CoursLocal.progress,
    completed: CoursLocal.completed,
    subject: CoursLocal.subject,
    courseId: CoursLocal.courseId,
    totalSlides: CoursLocal.totalSlides,
    highestSlideIndex: CoursLocal.highestSlideIndex,
    exerciseCompleted: Boolean(CoursLocal.exerciseCompleted),
    lastOpenedAt: CoursLocal.lastOpenedAt,
  };
}

function calculerRangSucces(progress: number, thresholds: number[]) {
  const completedThresholds = thresholds.filter((threshold) => progress >= threshold).length;
  const rankIndex = Math.min(completedThresholds, rangsSucces.length - 1);
  const completed = progress >= thresholds[thresholds.length - 1];
  const target = completed ? thresholds[thresholds.length - 1] : thresholds[completedThresholds] ?? thresholds[thresholds.length - 1];

  return {
    completed,
    rang: rangsSucces[rankIndex],
    target,
  };
}

function compterCoursTerminesParMatiere(DonneesUtilisateur: DonneesUtilisateur, subject: string) {
  return Object.values(DonneesUtilisateur.courses).filter(
    (CoursLocal) => CoursLocal.subject === subject && CoursLocal.completed,
  ).length;
}

function emettreChangementParametres() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('evidex_settings_changed'));
  }
}

export const donneesLocales = {
  init(userName?: string) {
    const data = lireDonneesApplication();
    garantirUtilisateurActif(data);

    if (userName) {
      donneesLocales.definirUtilisateurActif(userName);
      return;
    }

    ecrireDonneesApplication(data);
  },

  definirUtilisateurActif(userName: string) {
    const data = lireDonneesApplication();
    const displayName = normaliserNomUtilisateur(userName);
    let user = trouverUtilisateurParNom(data, displayName);

    if (!user) {
      user = creerUtilisateur(displayName);
      data.users[user.id] = user;
      data.DonneesUtilisateur[user.id] = creerDonneesUtilisateur();
    }

    user.name = displayName;
    user.key = cleUtilisateur(displayName);
    user.lastSeenAt = maintenantIso();
    data.activeUserId = user.id;
    garantirUtilisateurActif(data);
    ecrireDonneesApplication(data);

    return donneesLocales.obtenirUtilisateur();
  },

  synchroniserUtilisateur(userName: string) {
    return donneesLocales.definirUtilisateurActif(userName);
  },

  renommerUtilisateurActif(nextName: string) {
    const data = lireDonneesApplication();
    const currentUser = garantirUtilisateurActif(data);
    const displayName = normaliserNomUtilisateur(nextName);
    const existingUser = trouverUtilisateurParNom(data, displayName);

    if (existingUser && existingUser.id !== currentUser.id) {
      data.activeUserId = existingUser.id;
      existingUser.lastSeenAt = maintenantIso();
      garantirUtilisateurActif(data);
      ecrireDonneesApplication(data);
      return donneesLocales.obtenirUtilisateur();
    }

    currentUser.name = displayName;
    currentUser.key = cleUtilisateur(displayName);
    currentUser.lastSeenAt = maintenantIso();
    ecrireDonneesApplication(data);
    return donneesLocales.obtenirUtilisateur();
  },

  obtenirUtilisateurs() {
    const data = lireDonneesApplication();
    return Object.values(data.users)
      .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))
      .map((user) => ({
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
      }));
  },

  obtenirUtilisateur(): InfosUtilisateur {
    const data = lireDonneesApplication();
    const user = garantirUtilisateurActif(data);
    return {
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: user.level,
    };
  },

  enregistrerUtilisateur(InfosUtilisateur: InfosUtilisateur) {
    const data = lireDonneesApplication();
    const user = garantirUtilisateurActif(data);

    if (InfosUtilisateur.name) {
      user.name = normaliserNomUtilisateur(InfosUtilisateur.name);
      user.key = cleUtilisateur(user.name);
    }

    user.xp = Math.max(0, Math.round(InfosUtilisateur.xp));
    user.level = Math.max(1, Math.round(InfosUtilisateur.level));
    user.lastSeenAt = maintenantIso();
    ecrireDonneesApplication(data);
  },

  ajouterXp(amount: number) {
    const user = donneesLocales.obtenirUtilisateur();
    const xp = Math.max(0, user.xp + amount);
    const level = Math.floor(xp / 100) + 1;
    const nextUser = { ...user, xp, level };

    donneesLocales.enregistrerUtilisateur(nextUser);
    return nextUser;
  },

  obtenirCoursRecents(limit = 6) {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();
    return Object.values(DonneesUtilisateur.courses)
      .filter((CoursLocal) => CoursLocal.progress > 0)
      .sort((left, right) => right.lastOpenedAt.localeCompare(left.lastOpenedAt))
      .slice(0, limit)
      .map(mapperCours);
  },

  obtenirCarteProgressionCours() {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();
    return Object.values(DonneesUtilisateur.courses).reduce<Record<string, number>>((progressMap, CoursLocal) => {
      if (CoursLocal.progress > 0) {
        progressMap[CoursLocal.id] = CoursLocal.highestSlideIndex ?? 0;
      }

      return progressMap;
    }, {});
  },

  obtenirProgressionCours(subject: string, courseId: string) {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();
    const CoursLocal = DonneesUtilisateur.courses[`${subject}:${courseId}`];
    return CoursLocal?.highestSlideIndex ?? 0;
  },

  obtenirDetailsProgressionCours(subject: string, courseId: string) {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();
    const CoursLocal = DonneesUtilisateur.courses[`${subject}:${courseId}`];

    if (!CoursLocal) {
      return {
        completed: false,
        exerciseCompleted: false,
        highestSlideIndex: -1,
        progress: 0,
      };
    }

    return {
      completed: CoursLocal.completed,
      exerciseCompleted: Boolean(CoursLocal.exerciseCompleted),
      highestSlideIndex: CoursLocal.highestSlideIndex ?? -1,
      progress: CoursLocal.progress,
    };
  },

  saveCourseProgress(
    subject: string,
    courseId: string,
    slideIndex: number,
    totalSlides?: number,
    courseName?: string,
    exerciseCompleted = false,
  ) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    const id = `${subject}:${courseId}`;
    const existing = DonneesUtilisateur.courses[id];
    const nextExerciseCompleted = Boolean(existing?.exerciseCompleted || exerciseCompleted);
    const progress = progressionDepuisDiapo(slideIndex, totalSlides, nextExerciseCompleted);

    if (progress <= 0) {
      return;
    }

    const highestSlideIndex = Math.max(existing?.highestSlideIndex ?? -1, Math.max(0, Math.floor(slideIndex)));
    const existingProgressUnderCurrentRule = nextExerciseCompleted ? existing?.progress ?? 0 : Math.min(existing?.progress ?? 0, 99);
    const nextProgress = Math.max(existingProgressUnderCurrentRule, progress);
    const shouldAwardCompletionXp = nextExerciseCompleted && nextProgress >= 100 && !existing?.xpAwarded;

    if (shouldAwardCompletionXp) {
      const user = garantirUtilisateurActif(data);
      user.xp = Math.max(0, user.xp + 25);
      user.level = Math.floor(user.xp / 100) + 1;
      user.lastSeenAt = maintenantIso();
    }

    DonneesUtilisateur.courses[id] = {
      id,
      subject,
      courseId,
      name: courseName ?? existing?.name ?? `${subject} - ${courseId}`,
      progress: nextProgress,
      completed: nextProgress >= 100,
      totalSlides: totalSlides ?? existing?.totalSlides,
      highestSlideIndex,
      exerciseCompleted: nextExerciseCompleted,
      xpAwarded: Boolean(existing?.xpAwarded || shouldAwardCompletionXp),
      lastOpenedAt: maintenantIso(),
    };

    if (nextProgress >= 100) {
      const completedCourseCount = Object.values(DonneesUtilisateur.courses).filter((CoursLocal) => CoursLocal.completed).length;
      DonneesUtilisateur.achievements['3'] = { ...succesDefaut[2], completed: true };

      if (completedCourseCount >= 5) {
        DonneesUtilisateur.achievements['4'] = { ...succesDefaut[3], completed: true };
      }
    }

    ecrireDonneesApplication(data);
  },

  enregistrerCours(courses: CoursLocal[]) {
    courses.forEach((CoursLocal) => {
      const identity = identiteCours(CoursLocal);

      if (CoursLocal.highestSlideIndex !== undefined) {
        donneesLocales.saveCourseProgress(
          identity.subject,
          identity.courseId,
          CoursLocal.highestSlideIndex,
          CoursLocal.totalSlides,
          CoursLocal.name,
          CoursLocal.exerciseCompleted,
        );
        return;
      }

      if (CoursLocal.progress > 0) {
        const slideIndex = CoursLocal.totalSlides
          ? Math.max(0, Math.ceil((CoursLocal.progress / 100) * CoursLocal.totalSlides) - 1)
          : 0;
        donneesLocales.saveCourseProgress(
          identity.subject,
          identity.courseId,
          slideIndex,
          CoursLocal.totalSlides,
          CoursLocal.name,
          CoursLocal.exerciseCompleted,
        );
      }
    });
  },

  mettreAJourCours(id: number | string, patch: Partial<CoursLocal>) {
    const identity = identiteCours({ ...patch, id });
    const existingProgress = donneesLocales.obtenirProgressionCours(identity.subject, identity.courseId);

    donneesLocales.saveCourseProgress(
      identity.subject,
      identity.courseId,
      patch.highestSlideIndex ?? existingProgress,
      patch.totalSlides,
      patch.name,
      patch.exerciseCompleted,
    );
  },

  supprimerCours(id: number | string) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    const identity = identiteCours({ id });
    delete DonneesUtilisateur.courses[identity.id];
    ecrireDonneesApplication(data);
  },

  enregistrerCreationCarte() {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    DonneesUtilisateur.achievementStats.createdCards = Math.max(
      0,
      Math.round(DonneesUtilisateur.achievementStats.createdCards ?? 0),
    ) + 1;
    ecrireDonneesApplication(data);
  },

  enregistrerClicSimulation(section: string, simulationId: string) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    const currentClicks = DonneesUtilisateur.achievementStats.simulationClicksBySection[section] ?? [];

    if (!currentClicks.includes(simulationId)) {
      DonneesUtilisateur.achievementStats.simulationClicksBySection[section] = [...currentClicks, simulationId];
      ecrireDonneesApplication(data);
    }
  },

  obtenirSuccesProgression(): SuccesProgression[] {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();

    return succesProgressionDefaut.map((Succes) => {
      let progress = 0;
      const thresholds = Succes.category === 'course' ? seuilsCoursSucces : seuilsSuccesSimple;

      if (Succes.category === 'course') {
        progress = compterCoursTerminesParMatiere(DonneesUtilisateur, Succes.subject);
      } else if (Succes.category === 'cards') {
        progress = DonneesUtilisateur.achievementStats.createdCards;
      } else {
        progress = DonneesUtilisateur.achievementStats.simulationClicksBySection[Succes.subject]?.length ?? 0;
      }

      const rankState = calculerRangSucces(progress, thresholds);

      return {
        id: Succes.id,
        title: Succes.title,
        description: Succes.description,
        category: Succes.category,
        subject: 'subject' in Succes ? Succes.subject : undefined,
        progress,
        ...rankState,
      };
    });
  },

  obtenirSucces() {
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif();
    return succesDefaut.map((Succes) => ({
      ...Succes,
      ...DonneesUtilisateur.achievements[String(Succes.id)],
    }));
  },

  terminerSucces(id: number) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    const existing = DonneesUtilisateur.achievements[String(id)] ?? succesDefaut.find((Succes) => Succes.id === id);

    if (existing) {
      DonneesUtilisateur.achievements[String(id)] = { ...existing, completed: true };
      ecrireDonneesApplication(data);
    }
  },

  enregistrerSucces(Succes: Succes) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    const existing = DonneesUtilisateur.achievements[String(Succes.id)];
    DonneesUtilisateur.achievements[String(Succes.id)] = {
      ...Succes,
      completed: existing?.completed || Succes.completed,
    };
    ecrireDonneesApplication(data);
  },

  obtenirParametres() {
    return { ...obtenirDonneesUtilisateurActif().settings };
  },

  enregistrerParametres(settings: ParametresApplication) {
    const data = lireDonneesApplication();
    const DonneesUtilisateur = obtenirDonneesUtilisateurActif(data);
    DonneesUtilisateur.settings = { ...settings };
    ecrireDonneesApplication(data);
    emettreChangementParametres();
  },

  reinitialiserDonneesUtilisateurActif() {
    const data = lireDonneesApplication();
    const user = garantirUtilisateurActif(data);
    data.DonneesUtilisateur[user.id] = creerDonneesUtilisateur();
    user.xp = 0;
    user.level = 1;
    user.lastSeenAt = maintenantIso();
    ecrireDonneesApplication(data);
    emettreChangementParametres();
  },
};
