const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const racine = path.resolve(__dirname, '..');
const mdPath = path.join(racine, 'RAPPORT_COMPLET_EVIDEXE.md');
const htmlPath = path.join(racine, 'RAPPORT_COMPLET_EVIDEXE_STYLE_UML.html');
const pdfPath = path.join(racine, 'RAPPORT_COMPLET_EVIDEXE_STYLE_UML.pdf');

function tableMd(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tableHtml(headers, rows, caption) {
  return `<table>
  <caption>${esc(caption)}</caption>
  <thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join('')}</tr></thead>
  <tbody>
    ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('\n    ')}
  </tbody>
</table>`;
}

function liste(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

const acteurs = [
  ['Utilisateur / Étudiant', 'Consulte les cours, réalise les quiz, lance les simulations et suit sa progression.'],
  ['Stockage local', 'Conserve les données de progression, le profil, les paramètres et les informations liées à l’utilisateur actif.'],
  ['Application Evidexe', 'Présente les contenus, calcule les résultats des simulations, met à jour l’interface et la progression.'],
];

const casUtilisation = [
  ['Consulter un cours', 'L’utilisateur choisit une matière, ouvre un cours et lit les diapositives.'],
  ['Répondre à un quiz', 'L’utilisateur répond au quiz final associé à un cours.'],
  ['Lancer une simulation', 'L’utilisateur choisit une simulation disponible dans le catalogue.'],
  ['Modifier un paramètre de simulation', 'L’utilisateur agit sur un contrôle et observe le recalcul du résultat.'],
  ['Sauvegarder la progression', 'L’application enregistre localement l’avancement, les cours récents et les complétions.'],
  ['Consulter le profil', 'L’utilisateur voit son niveau, son XP, ses cours récents, ses succès et ses cartes mémoire.'],
  ['Personnaliser le profil', 'L’utilisateur modifie le pseudo ou la photo de profil.'],
  ['Modifier les paramètres', 'L’utilisateur règle notamment le mode sombre et le compteur FPS.'],
  ['Consulter les succès', 'L’utilisateur consulte les objectifs atteints et la progression des succès.'],
  ['Utiliser les cartes mémoire', 'L’utilisateur consulte, ajoute, renomme ou supprime des cartes mémoire locales.'],
];

const technologies = [
  ['React Native', 'Interface multiplateforme de l’application.'],
  ['Expo', 'Environnement de développement et d’exécution web/mobile.'],
  ['Expo Router', 'Navigation par fichiers dans le dossier <code>app/</code>.'],
  ['TypeScript / TSX', 'Typage et structure des écrans, composants et données.'],
  ['React Native SVG', 'Graphiques et visualisations dans plusieurs simulations.'],
  ['KaTeX / rendu de formules', 'Affichage de formules mathématiques dans certaines simulations.'],
  ['IndexedDB', 'Stockage persistant côté web via <code>stockage-application.web.ts</code>.'],
  ['expo-sqlite', 'Stockage persistant côté Android/native via <code>stockage-application.ts</code>.'],
  ['Node.js / npm', 'Installation des dépendances et scripts du projet.'],
  ['WebStorm', 'Environnement de développement utilisé pour le projet.'],
];

const echeancier = [
  ['Semaine 1', 'Définir le sujet', 'Choix d’une application éducative sur les mathématiques, la physique et Java.', 'Le périmètre initial est pédagogique et interactif.'],
  ['Semaine 2', 'Créer le projet', 'Mise en place avec Expo, React Native et TypeScript.', 'Base technique créée.'],
  ['Semaine 3', 'Faire la navigation', 'Ajout de l’intro, de l’accueil, des sections et du profil.', 'Navigation fondée sur Expo Router.'],
  ['Semaine 4', 'Ajouter les cours', 'Création des cours, diapositives et quiz dans <code>data/cours.tsx</code>.', 'Les contenus sont centralisés par matière.'],
  ['Semaine 5', 'Gérer la progression', 'Ajout du profil actif, d’utilisateurs locaux, des cours récents, de l’XP, des niveaux et des succès.', 'La logique de complétion devient plus stricte.'],
  ['Semaine 6', 'Ajouter des simulations de mathématiques', 'Dérivées, intégrales, limites, Taylor, Fourier, champs, séries et statistiques.', 'Simulations disponibles dans le catalogue.'],
  ['Semaine 7', 'Ajouter des simulations de physique', 'Gravité, pendule, projectile, ressort, mouvement circulaire, champs, optique, orbites et frottement.', 'Une entrée collisions reste prévue.'],
  ['Semaine 8', 'Ajouter les simulations Java', 'Tris, structures de données, chaînes, mémoire et multithreading.', 'Hachage et héritage restent prévus.'],
  ['Semaine 9', 'Stabiliser l’interface', 'Ajustements visuels, profil, paramètres, responsive et catalogue.', 'Travail de cohérence entre modules.'],
  ['Semaine 10', 'Préparer la remise', 'Mise à jour du rapport, vérification des diagrammes et distinction entre prêt et bientôt.', 'Le rapport doit rester aligné avec le code.'],
];

const taches = [
  ['Mise en place du projet', 'Créer la base Expo / React Native / TypeScript.', '<code>package.json</code>, <code>app.json</code>, configuration Expo'],
  ['Navigation', 'Organiser l’introduction, l’accueil, les onglets, les cours, les simulations et le profil.', '<code>app/</code>'],
  ['Cours et quiz', 'Définir les cours, diapositives et quiz finaux.', '<code>data/cours.tsx</code>, <code>features/cours/</code>'],
  ['Simulations mathématiques', 'Créer les simulations de calcul, analyse et statistiques.', '<code>features/simulations/mathematiques/</code>'],
  ['Simulations physiques', 'Créer les simulations de mécanique, champs, optique et frottement.', '<code>features/simulations/physique/</code>'],
  ['Simulations Java', 'Créer les simulations de tris, structures de données et notions Java.', '<code>features/simulations/programmation-java/</code>'],
  ['Profil et progression', 'Afficher XP, niveau, cours récents, cours terminés, succès et cartes mémoire.', '<code>app/(tabs)/profil/</code>, <code>components/profil/</code>'],
  ['Sauvegarde locale', 'Persister les données utilisateur sur web et native.', '<code>db/donnees-principales.tsx</code>, <code>db/stockage-application*.ts</code>'],
  ['Paramètres', 'Gérer le mode sombre, le compteur FPS et la personnalisation.', '<code>components/accueil/PanneauParametres.tsx</code>, profil'],
  ['Stabilisation visuelle', 'Rendre les modules lisibles sur web et mobile.', '<code>components/</code>, écrans de sections'],
  ['Rapport et UML', 'Structurer le document, les scénarios et les diagrammes.', '<code>RAPPORT_COMPLET_EVIDEXE.md</code>'],
];

const scenarioCours = [
  ['1', 'Choix de la matière', 'L’utilisateur choisit mathématiques, physique ou Java.'],
  ['2', 'Choix du cours', 'L’utilisateur sélectionne un cours dans la liste.'],
  ['3', 'Lecture des diapositives', 'L’application affiche le contenu progressivement.'],
  ['4', 'Progression partielle', 'La progression augmente mais reste sous 100 % avant le quiz final.'],
  ['5', 'Quiz final', 'L’utilisateur répond aux questions finales.'],
  ['6', 'Sauvegarde', 'Progression, XP, cours récent et complétion sont enregistrés.'],
  ['7', 'Profil mis à jour', 'Le profil affiche le niveau et l’avancement mis à jour.'],
];

const simulationsMath = [
  ['Dérivées', 'Disponible', 'Tangente, point choisi, valeur de la fonction et pente locale.'],
  ['Intégrales', 'Disponible', 'Sommes de Riemann, aire approchée, aire exacte et erreur.'],
  ['Série de Taylor', 'Disponible', 'Approximation par développement local et erreur.'],
  ['Limites', 'Disponible', 'Approche à gauche et à droite d’une valeur.'],
  ['Fourier', 'Disponible', 'Signal reconstruit par harmoniques et phaseurs.'],
  ['Champ de pentes', 'Disponible', 'Champ directionnel et courbe solution.'],
  ['Champ vectoriel', 'Disponible', 'Vecteurs, norme, divergence, rotation et particules.'],
  ['Séries', 'Disponible', 'Termes et sommes partielles.'],
  ['Loi normale standard', 'Disponible', 'Probabilité entre deux bornes.'],
  ['Loi de Student', 'Disponible', 'Degrés de liberté, valeur critique et intervalle central.'],
];

const simulationsPhysique = [
  ['Gravité', 'Disponible', 'Force gravitationnelle selon masses et distance.'],
  ['Pendule', 'Disponible', 'Oscillation, période, longueur, gravité et amortissement.'],
  ['Mouvement projectile', 'Disponible', 'Trajectoire et statistiques du lancer.'],
  ['Ressort et loi de Hooke', 'Disponible', 'Oscillation, constante de rappel, masse et amortissement.'],
  ['Mouvement circulaire', 'Disponible', 'Vitesse, période, accélération et force centripète.'],
  ['Champs magnétiques', 'Disponible', 'Fils, courant, lignes de champ et point d’observation.'],
  ['Champs électriques', 'Disponible', 'Configurations de charges et champ résultant.'],
  ['Optique et réfraction', 'Disponible', 'Réflexion, réfraction et angle critique.'],
  ['Mécanique orbitale', 'Disponible', 'Orbite, périhélie, aphélie et statistiques orbitales.'],
  ['Frottement', 'Disponible', 'Force nette, état du bloc et accélération.'],
];

const simulationsJava = [
  ['Tri à bulles', 'Disponible', 'Comparaisons et échanges successifs.'],
  ['Tri par sélection', 'Disponible', 'Sélection du minimum restant.'],
  ['Tri par insertion', 'Disponible', 'Insertion progressive dans une partie ordonnée.'],
  ['Tri fusion', 'Disponible', 'Découpage, tri des sous-tableaux et fusion.'],
  ['Tri rapide', 'Disponible', 'Pivot et partitionnement.'],
  ['Pile', 'Disponible', 'Opérations <code>push</code>, <code>pop</code>, <code>peek</code> et principe LIFO.'],
  ['File', 'Disponible', 'Opérations <code>offer</code>, <code>poll</code>, <code>peek</code> et principe FIFO.'],
  ['Liste chaînée', 'Disponible', 'Noeuds, liens, insertions et suppressions.'],
  ['ArrayList', 'Disponible', 'Taille dynamique, capacité et redimensionnement.'],
  ['Tableaux', 'Disponible', 'Index, cases fixes et accès direct.'],
  ['Chaînes et caractères', 'Disponible', 'Index, caractères, sous-chaînes et longueur.'],
  ['Mémoire', 'Disponible', 'Types, bits, adresses et représentation mémoire.'],
  ['Multithreading', 'Disponible', 'Threads, synchronisation et comportements concurrents.'],
];

const prevues = [
  ['Collisions élastiques', 'Bientôt', 'Route présente, mais elle charge l’écran générique <code>EcranSimulationLigne</code>.'],
  ['Collisions de hachage', 'Bientôt', 'Route présente, mais elle charge l’écran générique <code>EcranSimulationLigne</code>.'],
  ['Héritage', 'Bientôt', 'Route présente, mais elle charge l’écran générique <code>EcranSimulationLigne</code>.'],
  ['Cartes génériques “Bientôt” en mathématiques', 'À corriger', 'Elles sont générées avec <code>statut: "pret"</code>, mais pointent vers des routes absentes.'],
  ['Cartes génériques “Bientôt” en physique', 'À corriger', 'Elles sont générées avec <code>statut: "pret"</code>, mais pointent vers des routes absentes.'],
];

const cineSimulation = [
  ['1', 'Ouvrir le catalogue', 'L’utilisateur accède aux simulations depuis l’accueil.'],
  ['2', 'Choisir une catégorie', 'Mathématiques, physique ou programmation Java.'],
  ['3', 'Sélectionner une simulation prête', 'La carte mène vers une route Expo Router existante.'],
  ['4', 'Affichage initial', 'Le composant TSX affiche l’état de départ.'],
  ['5', 'Modifier un paramètre', 'L’utilisateur agit sur un slider, bouton, champ ou sélecteur.'],
  ['6', 'Mise à jour d’état', 'React met à jour les valeurs locales du composant.'],
  ['7', 'Recalcul', 'La simulation recalcule les valeurs théoriques ou visuelles.'],
  ['8', 'Redessin', 'Le graphique SVG ou l’interface visuelle est rafraîchi.'],
  ['9', 'Navigation', 'L’utilisateur peut revenir, retourner à l’accueil ou ouvrir le profil.'],
];

const stockage = [
  ['Web', 'IndexedDB', 'Stockage local persistant dans un magasin clé-valeur.'],
  ['Android/native', 'expo-sqlite', 'Stockage local persistant avec une table <code>kv</code>.'],
  ['Fallback', 'Stockage mémoire', 'Stockage temporaire si IndexedDB est indisponible.'],
];

const dossiers = [
  ['<code>app/</code>', 'Routes Expo Router: introduction, accueil, cours, simulations, profil et succès.'],
  ['<code>components/</code>', 'Composants réutilisables: interface, profil, panneaux, thème et logo.'],
  ['<code>features/</code>', 'Écrans et logiques spécialisées des cours, sections et simulations.'],
  ['<code>features/simulations/</code>', 'Catalogue, écrans de sections et simulations par domaine.'],
  ['<code>features/simulations/core</code>', 'Éléments communs: entête, rendu de formules, infobulles et utilitaires d’animation.'],
  ['<code>data/</code>', 'Cours, diapositives et quiz.'],
  ['<code>db/</code>', 'Modèle local, progression, utilisateurs, succès, paramètres et stockage plateforme.'],
  ['<code>assets/</code>', 'Images, logo et icônes de l’application.'],
];

const fichiers = [
  ['Routes', '<code>app/</code>', 'Contient les écrans et les chemins Expo Router.'],
  ['Cours', '<code>data/cours.tsx</code>, <code>features/cours/ecran-cours.tsx</code>', 'Stocke les cours, diapositives, quiz et affichage.'],
  ['Simulations', '<code>features/simulations/</code>', 'Contient catalogue, noyau commun et simulations par matière.'],
  ['Profil', '<code>app/(tabs)/profil</code>, <code>components/profil</code>, <code>components/accueil</code>', 'Affiche progression, paramètres, succès, cartes mémoire, pseudo et photo.'],
  ['Stockage', '<code>db/donnees-principales.tsx</code>, <code>db/stockage-application.ts</code>, <code>db/stockage-application.web.ts</code>', 'Gère utilisateurs locaux, cours, XP, succès et paramètres.'],
  ['Thème', '<code>constantes/theme.ts</code>, <code>hooks/use-schema-couleur.ts</code>', 'Gère l’apparence claire/sombre.'],
];

const optionsMath = [
  ['Dérivées', 'Choisir une fonction et modifier <code>x0</code>', 'Affiche le point, la tangente, <code>f(x0)</code> et <code>f’(x0)</code>.'],
  ['Intégrales', 'Choisir une fonction, une méthode et le nombre de rectangles', 'Compare l’aire approchée, l’aire exacte et l’erreur.'],
  ['Série de Taylor', 'Choisir une fonction et le nombre de termes', 'Montre l’approximation et l’erreur.'],
  ['Limites', 'Choisir une fonction et la distance d’approche', 'Affiche les valeurs à gauche et à droite.'],
  ['Fourier', 'Choisir un signal et le nombre d’harmoniques', 'Affiche l’onde approximée et les phaseurs.'],
  ['Champ de pentes', 'Choisir une équation différentielle et des conditions', 'Affiche le champ et une courbe solution.'],
  ['Champ vectoriel', 'Choisir un champ et activer les particules', 'Affiche vecteurs, divergence, rotation et mouvement.'],
  ['Séries', 'Choisir une série et le nombre de termes', 'Affiche les termes et les sommes partielles.'],
  ['Loi normale standard', 'Modifier moyenne, écart-type et bornes', 'Calcule une probabilité sur la courbe normale.'],
  ['Loi de Student', 'Modifier degrés de liberté et alpha', 'Affiche valeur critique et intervalle central.'],
];

const optionsPhysique = [
  ['Gravité', 'Modifier les masses et la distance', 'Calcule la force gravitationnelle.'],
  ['Pendule', 'Modifier longueur, gravité, amortissement et angle', 'Anime le pendule et calcule la période.'],
  ['Mouvement projectile', 'Modifier vitesse, angle et gravité', 'Affiche la trajectoire et les statistiques.'],
  ['Ressort et loi de Hooke', 'Modifier <code>k</code>, masse, amplitude et amortissement', 'Affiche l’oscillation et la phase.'],
  ['Mouvement circulaire', 'Modifier rayon, vitesse angulaire et masse', 'Calcule vitesse, période, accélération et force centripète.'],
  ['Champs magnétiques', 'Modifier fils, courant, affichage du champ et point d’observation', 'Affiche vecteurs, lignes de champ et intensité.'],
  ['Champs électriques', 'Choisir une configuration de charges', 'Affiche le champ résultant et les lignes.'],
  ['Optique et réfraction', 'Modifier indices et angle incident', 'Calcule réflexion, réfraction et angle critique.'],
  ['Mécanique orbitale', 'Modifier masse, excentricité, orientation et vitesse orbitale', 'Affiche orbite, périhélie, aphélie et statistiques orbitales.'],
  ['Frottement', 'Modifier masse, force appliquée et coefficients', 'Calcule force nette, état du bloc et accélération.'],
];

const optionsJava = [
  ['Tris', 'Mélanger un tableau et avancer étape par étape', 'Visualise comparaisons, échanges, pivots ou fusions.'],
  ['Pile', 'Utiliser <code>push</code>, <code>pop</code> et <code>peek</code>', 'Montre le sommet et le principe LIFO.'],
  ['File', 'Utiliser <code>offer</code>, <code>poll</code> et <code>peek</code>', 'Montre l’avant, l’arrière et le principe FIFO.'],
  ['Liste chaînée', 'Ajouter, retirer ou parcourir des noeuds', 'Montre les liens et les changements de pointeurs.'],
  ['ArrayList', 'Modifier taille et opérations', 'Montre capacité, occupation et redimensionnement.'],
  ['Tableaux', 'Choisir index et opérations', 'Montre accès direct, cases et décalages.'],
  ['Chaînes et caractères', 'Modifier texte et index', 'Montre caractères, sous-chaînes et longueur.'],
  ['Mémoire', 'Manipuler des valeurs et observer leur représentation', 'Montre des idées liées aux types, bits et mémoire.'],
  ['Multithreading', 'Modifier threads, itérations et synchronisation', 'Compare une exécution synchronisée et une situation à risque.'],
];

const fonctionsImportantes = [
  '<code>donneesLocales.enregistrerProgressionCours</code>: sauvegarde la progression d’un cours.',
  '<code>donneesLocales.obtenirCoursRecents</code>: récupère les cours récemment ouverts.',
  '<code>donneesLocales.enregistrerClicSimulation</code>: garde une trace des simulations ouvertes.',
  '<code>obtenirQuizCours</code>: récupère le quiz d’un cours.',
  '<code>EcranIndexSection</code>: affiche les cartes de simulation selon la section.',
  '<code>EnteteEcranSimulation</code>: fournit un entête commun aux simulations.',
  '<code>utiliserIntervalleSimulation</code>: aide certaines animations à se mettre à jour régulièrement.',
];

const svgUseCase = `<svg viewBox="0 0 920 520" role="img" aria-label="Cas d'utilisation principal d'Evidexe">
  <defs><style>
    .box{fill:#fff;stroke:#111;stroke-width:2}.actor{fill:none;stroke:#111;stroke-width:2}.uc{fill:#f9f9f9;stroke:#111;stroke-width:1.6}
    .txt{font:15px Georgia,serif;fill:#111}.small{font:13px Georgia,serif}.line{stroke:#111;stroke-width:1.4;fill:none}
  </style></defs>
  <rect class="box" x="170" y="34" width="590" height="438" rx="0"/>
  <text class="txt" x="395" y="62">Application Evidexe</text>
  <circle class="actor" cx="84" cy="105" r="18"/><line class="actor" x1="84" y1="123" x2="84" y2="185"/><line class="actor" x1="48" y1="145" x2="120" y2="145"/><line class="actor" x1="84" y1="185" x2="52" y2="230"/><line class="actor" x1="84" y1="185" x2="116" y2="230"/>
  <text class="txt" x="18" y="260">Utilisateur / Étudiant</text>
  <rect class="box" x="800" y="210" width="86" height="76"/><text class="txt small" x="809" y="240">Stockage</text><text class="txt small" x="823" y="260">local</text>
  <ellipse class="uc" cx="330" cy="110" rx="110" ry="28"/><text class="txt small" x="278" y="115">Consulter les cours</text>
  <ellipse class="uc" cx="570" cy="110" rx="100" ry="28"/><text class="txt small" x="522" y="115">Répondre aux quiz</text>
  <ellipse class="uc" cx="330" cy="180" rx="110" ry="28"/><text class="txt small" x="272" y="185">Lancer une simulation</text>
  <ellipse class="uc" cx="590" cy="180" rx="130" ry="28"/><text class="txt small" x="500" y="185">Modifier les paramètres simulation</text>
  <ellipse class="uc" cx="330" cy="250" rx="100" ry="28"/><text class="txt small" x="283" y="255">Consulter le profil</text>
  <ellipse class="uc" cx="590" cy="250" rx="118" ry="28"/><text class="txt small" x="516" y="255">Modifier pseudo / photo</text>
  <ellipse class="uc" cx="330" cy="320" rx="100" ry="28"/><text class="txt small" x="282" y="325">Consulter les succès</text>
  <ellipse class="uc" cx="590" cy="320" rx="105" ry="28"/><text class="txt small" x="528" y="325">Gérer les paramètres</text>
  <ellipse class="uc" cx="330" cy="390" rx="118" ry="28"/><text class="txt small" x="264" y="395">Consulter cartes mémoire</text>
  <ellipse class="uc" cx="590" cy="390" rx="125" ry="28"/><text class="txt small" x="516" y="395">Sauvegarder la progression</text>
  <path class="line" d="M120 145 L220 110 M120 145 L220 180 M120 145 L230 250 M120 145 L230 320 M120 145 L218 390"/>
  <path class="line" d="M700 390 L800 248 M690 320 L800 248 M708 250 L800 248 M670 110 L800 248"/>
</svg>`;

const svgArch = `<svg viewBox="0 0 940 520" role="img" aria-label="Architecture technique simplifiée d'Evidexe">
  <defs><style>.b{fill:#fff;stroke:#111;stroke-width:1.8}.t{font:15px Georgia,serif;fill:#111}.s{font:13px Georgia,serif}.l{stroke:#111;stroke-width:1.5;marker-end:url(#a)}.p{fill:#f7f7f7;stroke:#111;stroke-width:1.3}</style><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#111"/></marker></defs>
  <rect class="b" x="40" y="50" width="170" height="70"/><text class="t" x="64" y="82">Appareil utilisateur</text><text class="s t" x="72" y="104">mobile ou navigateur</text>
  <rect class="b" x="285" y="50" width="170" height="70"/><text class="t" x="337" y="82">Expo app</text><text class="s t" x="327" y="104">React Native</text>
  <rect class="b" x="530" y="50" width="170" height="70"/><text class="t" x="575" y="82">Expo Router</text><text class="s t" x="564" y="104">navigation par fichiers</text>
  <rect class="p" x="90" y="190" width="150" height="56"/><text class="t" x="124" y="224">app/ routes</text>
  <rect class="p" x="290" y="190" width="150" height="56"/><text class="t" x="336" y="224">features/</text>
  <rect class="p" x="490" y="190" width="150" height="56"/><text class="t" x="540" y="224">data/</text>
  <rect class="p" x="690" y="190" width="150" height="56"/><text class="t" x="748" y="224">db/</text>
  <rect class="b" x="570" y="330" width="135" height="58"/><text class="t" x="604" y="365">IndexedDB</text>
  <rect class="b" x="725" y="330" width="135" height="58"/><text class="t" x="759" y="365">SQLite</text>
  <rect class="b" x="650" y="425" width="135" height="58"/><text class="t" x="680" y="460">Mémoire</text>
  <line class="l" x1="210" y1="85" x2="285" y2="85"/><line class="l" x1="455" y1="85" x2="530" y2="85"/>
  <line class="l" x1="615" y1="120" x2="165" y2="190"/><line class="l" x1="615" y1="120" x2="365" y2="190"/><line class="l" x1="615" y1="120" x2="565" y2="190"/><line class="l" x1="615" y1="120" x2="765" y2="190"/>
  <line class="l" x1="765" y1="246" x2="637" y2="330"/><line class="l" x1="765" y1="246" x2="792" y2="330"/><line class="l" x1="765" y1="246" x2="718" y2="425"/>
</svg>`;

const svgLogic = `<svg viewBox="0 0 940 560" role="img" aria-label="Architecture logique du code">
  <defs><style>.b{fill:#fff;stroke:#111;stroke-width:1.6}.g{fill:#f8f8f8;stroke:#111;stroke-width:1.2}.t{font:14px Georgia,serif;fill:#111}.h{font:bold 15px Georgia,serif}.l{stroke:#111;stroke-width:1.2;fill:none;marker-end:url(#a)}</style><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#111"/></marker></defs>
  <rect class="b" x="380" y="30" width="180" height="54"/><text class="h" x="442" y="62">app/</text>
  <rect class="g" x="60" y="150" width="160" height="52"/><text class="t" x="92" y="181">components/</text>
  <rect class="g" x="260" y="150" width="160" height="52"/><text class="t" x="315" y="181">features/</text>
  <rect class="g" x="480" y="150" width="160" height="52"/><text class="t" x="515" y="181">data/cours.tsx</text>
  <rect class="g" x="700" y="150" width="180" height="52"/><text class="t" x="735" y="181">db/données locales</text>
  <rect class="b" x="190" y="270" width="220" height="54"/><text class="t" x="212" y="302">catalogue-simulations.ts</text>
  <rect class="b" x="455" y="270" width="170" height="54"/><text class="t" x="500" y="302">core</text>
  <rect class="g" x="80" y="400" width="190" height="52"/><text class="t" x="110" y="431">simulations maths</text>
  <rect class="g" x="320" y="400" width="190" height="52"/><text class="t" x="344" y="431">simulations physique</text>
  <rect class="g" x="560" y="400" width="190" height="52"/><text class="t" x="601" y="431">simulations Java</text>
  <rect class="g" x="735" y="270" width="155" height="48"/><text class="t" x="752" y="299">stockage native</text>
  <rect class="g" x="735" y="342" width="155" height="48"/><text class="t" x="760" y="371">stockage web</text>
  <line class="l" x1="470" y1="84" x2="140" y2="150"/><line class="l" x1="470" y1="84" x2="340" y2="150"/><line class="l" x1="470" y1="84" x2="560" y2="150"/><line class="l" x1="470" y1="84" x2="790" y2="150"/>
  <line class="l" x1="340" y1="202" x2="300" y2="270"/><line class="l" x1="340" y1="202" x2="540" y2="270"/>
  <line class="l" x1="300" y1="324" x2="175" y2="400"/><line class="l" x1="300" y1="324" x2="415" y2="400"/><line class="l" x1="300" y1="324" x2="655" y2="400"/>
  <line class="l" x1="790" y1="202" x2="812" y2="270"/><line class="l" x1="790" y1="202" x2="812" y2="342"/>
</svg>`;

const svgSimFlux = `<svg viewBox="0 0 940 560" role="img" aria-label="Flux commun d'une simulation interactive">
  <defs><style>.lif{stroke:#111;stroke-width:1.2;stroke-dasharray:5 4}.head{fill:#fff;stroke:#111;stroke-width:1.5}.t{font:13px Georgia,serif;fill:#111}.l{stroke:#111;stroke-width:1.2;marker-end:url(#a)}.note{fill:#f8f8f8;stroke:#111;stroke-width:1.2}</style><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#111"/></marker></defs>
  ${['Utilisateur','Router','Catalogue','Simulation','Contrôles','Graphique'].map((name, i) => {
    const x = 70 + i * 155;
    return `<rect class="head" x="${x}" y="35" width="115" height="36"/><text class="t" x="${x + 16}" y="58">${name}</text><line class="lif" x1="${x + 57}" y1="71" x2="${x + 57}" y2="500"/>`;
  }).join('')}
  ${[
    [127,282,110,'Ouvre une section'],
    [282,437,160,'Lit le catalogue'],
    [437,127,210,'Affiche les cartes'],
    [127,282,260,'Choisit une simulation prête'],
    [282,592,310,'Charge la route TSX'],
    [592,747,360,'Affiche les contrôles'],
    [127,747,410,'Modifie un paramètre'],
    [747,592,440,'Met à jour l’état'],
    [592,902,470,'Recalcule et redessine']
  ].map(([x1,x2,y,label]) => `<line class="l" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><text class="t" x="${Math.min(x1,x2)+8}" y="${y-7}">${label}</text>`).join('')}
</svg>`;

const svgCatalogue = `<svg viewBox="0 0 940 520" role="img" aria-label="Organisation du catalogue des simulations">
  <defs><style>.b{fill:#fff;stroke:#111;stroke-width:1.6}.g{fill:#f8f8f8;stroke:#111;stroke-width:1.2}.t{font:13px Georgia,serif;fill:#111}.h{font:bold 15px Georgia,serif}.l{stroke:#111;stroke-width:1.2;marker-end:url(#a)}</style><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#111"/></marker></defs>
  <rect class="b" x="345" y="28" width="250" height="52"/><text class="h" x="382" y="60">CATALOGUE_SIMULATIONS</text>
  <rect class="b" x="65" y="140" width="230" height="55"/><text class="h" x="130" y="173">Mathématiques</text>
  <rect class="b" x="355" y="140" width="230" height="55"/><text class="h" x="440" y="173">Physique</text>
  <rect class="b" x="645" y="140" width="230" height="55"/><text class="h" x="714" y="173">Java</text>
  <rect class="g" x="45" y="250" width="270" height="135"/><text class="t" x="62" y="280">10 simulations disponibles</text><text class="t" x="62" y="305">Dérivées, intégrales, Taylor,</text><text class="t" x="62" y="330">limites, Fourier, champs,</text><text class="t" x="62" y="355">séries et distributions.</text><text class="t" x="62" y="380">+ cartes génériques à corriger.</text>
  <rect class="g" x="335" y="250" width="270" height="135"/><text class="t" x="352" y="280">10 simulations disponibles</text><text class="t" x="352" y="305">Gravité, pendule, projectile,</text><text class="t" x="352" y="330">ressort, mouvement circulaire,</text><text class="t" x="352" y="355">champs, optique, orbite, frottement.</text><text class="t" x="352" y="380">+ collisions et cartes à corriger.</text>
  <rect class="g" x="625" y="250" width="270" height="135"/><text class="t" x="642" y="280">13 simulations disponibles</text><text class="t" x="642" y="305">Tris, pile, file, liste chaînée,</text><text class="t" x="642" y="330">ArrayList, tableaux, chaînes,</text><text class="t" x="642" y="355">mémoire et multithreading.</text><text class="t" x="642" y="380">+ hachage et héritage prévus.</text>
  <line class="l" x1="470" y1="80" x2="180" y2="140"/><line class="l" x1="470" y1="80" x2="470" y2="140"/><line class="l" x1="470" y1="80" x2="760" y2="140"/>
  <line class="l" x1="180" y1="195" x2="180" y2="250"/><line class="l" x1="470" y1="195" x2="470" y2="250"/><line class="l" x1="760" y1="195" x2="760" y2="250"/>
</svg>`;

const svgProgression = `<svg viewBox="0 0 940 500" role="img" aria-label="Modèle de progression">
  <defs><style>.c{fill:#fff;stroke:#111;stroke-width:1.6}.t{font:13px Georgia,serif;fill:#111}.h{font:bold 14px Georgia,serif}.l{stroke:#111;stroke-width:1.2;marker-end:url(#a)}</style><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#111"/></marker></defs>
  <rect class="c" x="370" y="30" width="200" height="70"/><text class="h" x="438" y="58">Utilisateur</text><text class="t" x="405" y="82">id, name, xp, level</text>
  <rect class="c" x="75" y="165" width="180" height="70"/><text class="h" x="135" y="193">Profil</text><text class="t" x="104" y="217">pseudo, photo, XP</text>
  <rect class="c" x="285" y="165" width="180" height="70"/><text class="h" x="323" y="193">ProgressionCours</text><text class="t" x="308" y="217">progress, completed</text>
  <rect class="c" x="495" y="165" width="180" height="70"/><text class="h" x="543" y="193">CoursRecent</text><text class="t" x="523" y="217">lastOpenedAt</text>
  <rect class="c" x="705" y="165" width="180" height="70"/><text class="h" x="764" y="193">Succès</text><text class="t" x="735" y="217">rang, cible, état</text>
  <rect class="c" x="185" y="315" width="180" height="70"/><text class="h" x="230" y="343">CarteMemoire</text><text class="t" x="225" y="367">front, back, sujet</text>
  <rect class="c" x="395" y="315" width="180" height="70"/><text class="h" x="447" y="343">Paramètres</text><text class="t" x="428" y="367">darkMode, FPS</text>
  <rect class="c" x="605" y="315" width="180" height="70"/><text class="h" x="650" y="343">StockageLocal</text><text class="t" x="630" y="367">IndexedDB / SQLite</text>
  <line class="l" x1="470" y1="100" x2="165" y2="165"/><line class="l" x1="470" y1="100" x2="375" y2="165"/><line class="l" x1="470" y1="100" x2="585" y2="165"/><line class="l" x1="470" y1="100" x2="795" y2="165"/>
  <line class="l" x1="470" y1="100" x2="275" y2="315"/><line class="l" x1="470" y1="100" x2="485" y2="315"/><line class="l" x1="570" y1="65" x2="695" y2="315"/>
</svg>`;

const md = `# Evidexe - Rapport complet d'analyse avec UML

Projet final - Programmation  
Tony Khabbaz & Aris Hadjeb

## Table des matières

- I. L’auteur
- II. Cahier des charges
- III. Cas d’utilisation principal
- IV. Architecture
- V. Organisation du projet
- VI. Détaillons les fonctionnalités
- VII. Description d’une interface homme-machine
- VIII. Traitement des données locales
- IX. Description des contenus pédagogiques
- X. Conception
- XI. Difficultés rencontrées
- XII. Limites et améliorations possibles
- XIII. Conclusion
- XIV. Annexes

## I. L’auteur

Le projet Evidexe est réalisé par Tony Khabbaz et Aris Hadjeb dans le cadre du projet final de programmation. Le document présente l’application comme un travail d’analyse et de spécification, en gardant le contenu centré sur le projet Evidexe et sur l’état réel du code.

## II. Cahier des charges

### II-A. Préambule

Evidexe part d’un besoin simple: aider les étudiants à réviser des notions abstraites en mathématiques, en physique et en programmation Java. L’application regroupe des cours courts, des quiz, des simulations interactives et un suivi de progression.

### II-B. Le besoin

Des notions comme les dérivées, les intégrales, les forces, les champs, les circuits, les algorithmes et les structures de données sont difficiles à comprendre uniquement avec du texte. Evidexe répond à ce besoin en regroupant des cours organisés par matière, des quiz, des simulations interactives, un suivi de progression, un profil utilisateur et des paramètres.

#### II-B-1. Architecture générale

L’application est construite avec Expo, React Native, TypeScript et Expo Router. Le dossier \`app/\` contient les routes, \`components/\` les éléments d’interface réutilisables, \`features/\` les écrans et logiques spécialisés, \`data/\` les cours et quiz, \`db/\` les données locales et \`features/simulations/\` le catalogue ainsi que les composants de simulation.

#### II-B-2. Principe de fonctionnement

1. L’utilisateur ouvre Evidexe.
2. L’écran d’introduction mène vers l’accueil.
3. L’utilisateur choisit les cours, simulations, profil, succès ou paramètres.
4. Les cours contiennent des diapositives et un quiz final.
5. Les simulations permettent de manipuler des paramètres.
6. La progression est sauvegardée localement.
7. Le profil montre XP, niveau, cours terminés, cours récents, succès, cartes mémoire et personnalisation.

#### II-B-3. Contraintes

Evidexe doit fonctionner sur web et mobile. Le stockage local change selon la plateforme: IndexedDB sur web avec \`stockage-application.web.ts\`, \`expo-sqlite\` sur Android/native avec \`stockage-application.ts\`, et un fallback mémoire si IndexedDB n’est pas disponible. Le projet n’utilise pas de backend distant. Les cartes de simulation prévues ou incomplètes ne doivent pas être présentées comme terminées.

#### II-B-4. Objectifs du projet

- créer une application Expo utilisable sur web et mobile;
- organiser le contenu en mathématiques, physique et Java;
- proposer des cours courts avec diapositives et quiz;
- créer un catalogue de simulations interactives;
- sauvegarder la progression localement;
- gérer un profil avec XP, niveau, succès, cartes mémoire et paramètres;
- conserver une structure claire pour ajouter du contenu plus tard.

## III. Cas d’utilisation principal

### III-A. Préambule

Cette section donne une vue synthétique des interactions entre l’utilisateur, l’application et la couche de stockage local.

### III-B. Use case principal

#### III-B-1. Diagramme du cas d’utilisation

\`\`\`mermaid
flowchart LR
  U[Utilisateur / Étudiant]
  S[(Stockage local)]
  A[Application Evidexe]
  U --> C((Consulter les cours))
  U --> Q((Répondre aux quiz))
  U --> L((Lancer une simulation))
  U --> M((Modifier les paramètres d'une simulation))
  U --> P((Consulter le profil))
  U --> PP((Modifier pseudo / photo))
  U --> SU((Consulter les succès))
  U --> PA((Gérer les paramètres))
  U --> CM((Consulter les cartes mémoire))
  A --> C
  A --> Q
  A --> L
  A --> M
  A --> P
  A --> PP
  A --> SU
  A --> PA
  A --> CM
  A --> SG((Sauvegarder la progression))
  SG --> S
\`\`\`

Figure 1 — Cas d’utilisation principal d’Evidexe.

Le diagramme résume les fonctions visibles par l’utilisateur. Le stockage local n’est pas un utilisateur humain, mais il intervient dans les actions qui doivent persister entre deux ouvertures de l’application.

#### III-B-2. Description des acteurs

${tableMd(['Acteur', 'Rôle'], acteurs)}

#### III-B-3. Description des cas d’utilisation

${tableMd(['Cas d’utilisation', 'Description'], casUtilisation)}

### III-C. Parcours utilisateur global

Un diagramme de parcours ne suffit pas à expliquer une application: il doit être accompagné d’un texte qui précise les choix, les limites et les cas particuliers. Ici, le flux montre le chemin principal depuis l’introduction jusqu’aux cours, simulations et données de profil.

\`\`\`mermaid
flowchart TD
  U[Utilisateur] --> Intro[app/index.tsx - écran d'introduction]
  Intro --> Accueil[/(tabs)/accueil]
  Accueil --> Cours[/(tabs)/cours]
  Accueil --> Simulations[/(tabs)/simulations]
  Accueil --> Profil[/(tabs)/profil]
  Accueil --> Succes[/(tabs)/succes]
  Cours --> ChoixMatiere[Choix d'une matière]
  ChoixMatiere --> LectureCours[Lecture des diapositives]
  LectureCours --> QuizFinal[Quiz final]
  QuizFinal --> Progression[enregistrerProgressionCours]
  Progression --> Profil
  Simulations --> IndexMath[/(tabs)/mathematiques]
  Simulations --> IndexPhysique[/(tabs)/physique]
  Simulations --> IndexJava[/(tabs)/programmation-java]
  IndexMath --> SimulationMath[Simulation math prête]
  IndexPhysique --> SimulationPhysique[Simulation physique prête]
  IndexJava --> SimulationJava[Simulation Java prête]
  SimulationMath --> Controles[Contrôles]
  SimulationPhysique --> Controles
  SimulationJava --> Controles
  Controles --> Recalcul[État React et recalcul]
  Recalcul --> Rendu[Graphique ou interface]
  Profil --> Parametres[Paramètres]
  Profil --> CartesMemoire[Cartes mémoire]
\`\`\`

Figure 1 bis — Parcours utilisateur global d’Evidexe.

Le parcours confirme que les cours et les simulations ne sont pas isolés: ils alimentent le profil, les données locales et les indicateurs de progression.

### III-D. Risques et points importants

- garder le rapport aligné avec le code réel;
- ne pas présenter les simulations prévues comme terminées;
- gérer la complexité du stockage local selon la plateforme;
- maintenir la compatibilité web/mobile;
- garder une interface cohérente malgré le nombre de cours et simulations;
- éviter l’attribution multiple d’XP;
- considérer un cours comme terminé seulement après le quiz final.

## IV. Architecture

### IV-A. Préambule

L’architecture est importante parce qu’Evidexe combine navigation, contenus pédagogiques, simulations, persistance locale et interface responsive.

### IV-B. Technologies utilisées

${tableMd(['Technologie', 'Rôle dans le projet'], technologies.map(([a, b]) => [a, b.replace(/<code>/g, '`').replace(/<\/code>/g, '`')]))}

### IV-C. Diagramme de déploiement / architecture technique

\`\`\`mermaid
flowchart TB
  Device[Appareil utilisateur / navigateur] --> Expo[Application Expo React Native]
  Expo --> Router[Expo Router]
  Router --> App[app/ routes]
  Router --> Features[features/]
  Router --> Data[data/]
  Router --> DB[db/]
  DB --> Web[IndexedDB sur web]
  DB --> Native[expo-sqlite sur native]
  DB --> Memory[Fallback mémoire]
\`\`\`

Figure 2 — Architecture technique simplifiée d’Evidexe.

Cette vue montre que le reste de l’application dépend d’une abstraction de stockage, et non directement d’IndexedDB ou de SQLite.

### IV-D. Architecture logique du code

\`\`\`mermaid
flowchart TB
  App[app/ - routes Expo Router] --> Components[components/]
  App --> Features[features/]
  App --> Data[data/cours.tsx]
  App --> DB[db/donnees-principales.tsx]
  Features --> Catalogue[features/simulations/catalogue-simulations.ts]
  Features --> Core[features/simulations/core]
  Features --> SimMath[simulations mathématiques]
  Features --> SimPhysique[simulations physiques]
  Features --> SimJava[simulations Java]
  DB --> StockageNative[db/stockage-application.ts]
  DB --> StockageWeb[db/stockage-application.web.ts]
  StockageNative --> SQLite[expo-sqlite]
  StockageWeb --> IndexedDB[IndexedDB]
  StockageWeb --> Memoire[fallback mémoire]
\`\`\`

Figure 2 bis — Architecture logique du code.

### IV-E. Épilogue

Cette architecture sépare les routes, les composants d’interface, les contenus pédagogiques, la logique des simulations et la gestion des données locales. Cette séparation facilite l’ajout futur de cours et de simulations.

## V. Organisation du projet

### V-A. Préambule

Le projet couvre trois domaines: mathématiques, physique et programmation Java. Cette diversité oblige à structurer les tâches, les fichiers et les responsabilités logiques.

### V-B. Échéancier du projet

${tableMd(['Période', 'Travail prévu', 'Travail réalisé', 'Commentaire'], echeancier.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

### V-C. Description des tâches du projet

${tableMd(['Tâche', 'Description', 'Fichiers / zones concernées'], taches.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

### V-D. Répartition logique du travail

Le rapport et le code disponibles ne donnent pas une répartition nominative fiable entre Tony Khabbaz et Aris Hadjeb. Il ne faut donc pas inventer de responsabilités individuelles. La répartition exacte dépend du travail effectué par l’équipe.

### V-E. Épilogue

L’organisation du projet permet de faire évoluer le contenu tout en conservant une base plus facile à maintenir.

## VI. Détaillons les fonctionnalités

### VI-A. Préambule

Cette section décrit les principaux modules fonctionnels de l’application.

### VI-B. Module des cours

#### VI-B-1. Fonctionnalité

Les cours sont définis dans \`data/cours.tsx\`. Le code contient 20 cours de mathématiques, 15 cours de physique et 15 cours de Java, pour un total de 50 cours. Chaque cours contient des diapositives et un quiz final. La théorie peut faire monter la progression jusqu’à 99 %, mais le vrai 100 % nécessite le quiz ou exercice final.

#### VI-B-2. Scénario: suivre un cours

${tableMd(['Code', 'Étape', 'Commentaire'], scenarioCours)}

### VI-C. Module des simulations

#### VI-C-1. Fonctionnalité

Le catalogue des simulations se trouve dans \`features/simulations/catalogue-simulations.ts\`. Le rapport distingue les simulations prêtes des entrées prévues ou à corriger.

#### VI-C-2. Simulations prêtes

${tableMd(['Simulation mathématique', 'État', 'Rôle'], simulationsMath.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

${tableMd(['Simulation physique', 'État', 'Rôle'], simulationsPhysique)}

${tableMd(['Simulation Java', 'État', 'Rôle'], simulationsJava.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

#### VI-C-3. Simulations prévues ou à corriger

${tableMd(['Élément', 'État', 'Commentaire'], prevues.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

#### VI-C-4. Flux commun d’une simulation

\`\`\`mermaid
sequenceDiagram
  participant U as Utilisateur
  participant R as Expo Router
  participant C as Catalogue
  participant S as Simulation
  participant X as Contrôles
  participant G as Graphique ou interface
  U->>R: Ouvre une section de simulations
  R->>C: Lit CATALOGUE_SIMULATIONS
  C-->>U: Affiche les cartes
  U->>R: Choisit une simulation prête
  R->>S: Charge le composant TSX
  S->>G: Affiche l'état initial
  U->>X: Modifie un paramètre
  X->>S: Met à jour l'état React
  S->>S: Recalcule les valeurs
  S->>G: Redessine le résultat
\`\`\`

Figure 3 — Flux commun d’une simulation interactive.

### VI-D. Module du profil et de la progression

Le profil utilise l’utilisateur actif. Il affiche XP, niveau, cours récents, cours complétés, succès, cartes mémoire, pseudo, photo de profil, mode sombre et compteur FPS. Les données sont locales et ne sont pas synchronisées avec un backend.

### VI-E. Module des paramètres

Les paramètres visibles concernent surtout le mode sombre, le compteur FPS et la personnalisation du profil. Le fichier de données prévoit aussi une langue et des notifications, mais le rapport ne doit pas présenter un système complet de notifications distantes.

## VII. Description d’une interface homme-machine

### VII-A. Préambule

Cette section décrit les écrans principaux, comme dans un document d’analyse qui relie les fonctions aux interfaces.

### VII-B. Interface d’accueil

L’application commence par un écran d’introduction puis mène vers l’accueil. L’accueil donne accès aux cours, aux simulations, au profil, aux succès et aux paramètres.

### VII-C. Interface des cours

L’interface des cours propose le choix de la matière, une liste de cours, une vue par diapositives, un quiz final et un affichage de la progression.

### VII-D. Interface des simulations

L’interface des simulations présente des cartes. Les cartes disponibles ouvrent des routes fonctionnelles. Les cartes “bientôt” ou génériques doivent rester clairement séparées des simulations terminées. Les simulations utilisent des contrôles comme sliders, boutons, champs, sélecteurs et affichages graphiques.

### VII-E. Interface du profil

Le profil regroupe le niveau, l’XP, les cours récents, les cours terminés, les succès, les cartes mémoire et la personnalisation.

### VII-F. Cinématique d’une simulation

${tableMd(['Code', 'Étape', 'Commentaire'], cineSimulation)}

### VII-G. Contrôles

Les simulations utilisent des sliders, boutons, sélecteurs de choix, champs numériques et toggles. Ces contrôles doivent rester lisibles sur web et mobile.

## VIII. Traitement des données locales

### VIII-A. Préambule

Evidexe n’a pas de traitement batch mensuel. Le traitement important est la sauvegarde locale et la mise à jour de la progression.

### VIII-B. Sauvegarde de la progression

La sauvegarde concerne l’utilisateur actif, les cours complétés, les cours récents, l’XP, les niveaux, les succès et les paramètres. La logique passe par \`donnees-principales.tsx\` et par l’abstraction \`stockage-application\`.

### VIII-C. Web vs native

${tableMd(['Plateforme', 'Technologie', 'Rôle'], stockage.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

### VIII-D. Reprise en cas d’erreur

Les cas à prévoir sont IndexedDB indisponible, données introuvables, utilisateur actif absent ou route de simulation manquante. Le comportement attendu est d’utiliser un fallback mémoire, de recréer un profil par défaut, d’éviter les crashs et d’afficher un écran prévu ou simplifié pour une simulation indisponible.

## IX. Description des contenus pédagogiques

### IX-A. Préambule

Evidexe regroupe trois domaines d’apprentissage.

### IX-B. Mathématiques

Le contenu couvre fonctions, limites, dérivées, intégrales, sommes de Riemann, séries de Taylor, champs vectoriels, champs de pentes, lois normale et de Student, probabilités, inférence et mathématiques discrètes.

### IX-C. Physique

Le contenu couvre vecteurs, position, vitesse, accélération, MRUA, chute libre, projectiles, mouvement circulaire, lois de Newton, force nette, frottement, travail, énergie, puissance, quantité de mouvement, gravité, pendule, ressort, orbites, champs électriques, champs magnétiques, optique et circuits.

### IX-D. Programmation Java

Le contenu couvre variables, types, transtypage, opérateurs, conditions, boucles, tableaux, chaînes, méthodes, classes, objets, algorithmes de tri, pile, file, liste chaînée, ArrayList, mémoire et multithreading. Les collisions de hachage et l’héritage sont prévus.

## X. Conception

### X-A. Préambule

Cette section résume les choix de conception du projet.

### X-B. Découpage en packages / dossiers

${tableMd(['Dossier', 'Rôle'], dossiers.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

### X-C. Catalogue des simulations

\`\`\`mermaid
flowchart TB
  Catalogue[CATALOGUE_SIMULATIONS] --> Math[Mathématiques]
  Catalogue --> Physique[Physique]
  Catalogue --> Java[Programmation Java]
  Math --> MReady[10 simulations prêtes]
  Math --> MBientot[Cartes génériques à corriger]
  Physique --> PReady[10 simulations prêtes]
  Physique --> PBientot[Collisions + cartes à corriger]
  Java --> JReady[13 simulations prêtes]
  Java --> JBientot[Hachage et héritage prévus]
\`\`\`

Figure 4 — Organisation du catalogue des simulations.

### X-D. Modèle de progression

\`\`\`mermaid
classDiagram
  Utilisateur --> Profil
  Utilisateur --> ProgressionCours
  Utilisateur --> CoursRecent
  Utilisateur --> Succes
  Utilisateur --> CarteMemoire
  Utilisateur --> Parametres
  StockageLocal --> Utilisateur
  class Utilisateur {
    id
    name
    xp
    level
  }
  class ProgressionCours {
    progress
    completed
    exerciseCompleted
    xpAwarded
  }
\`\`\`

Figure 5 — Modèle simplifié de progression locale.

### X-E. Règles importantes

- Un cours est vraiment complété seulement après le quiz final.
- L’XP doit être attribuée une seule fois par complétion.
- Les simulations marquées “bientôt” ne sont pas comptées comme terminées.
- Le stockage local doit fonctionner sur web et native.
- L’interface doit rester cohérente entre les modules.
- Toutes les affirmations du rapport doivent correspondre au code réel.

## XI. Difficultés rencontrées

- organiser un projet couvrant trois domaines;
- gérer une progression plus complexe que prévu;
- adapter le stockage web et mobile;
- éviter les affirmations incorrectes dans le rapport;
- distinguer les simulations prêtes et prévues;
- garder une interface cohérente;
- tester un grand nombre de simulations.

## XII. Limites et améliorations possibles

- ajouter un backend ou une synchronisation de compte plus tard;
- terminer les routes de simulations prévues;
- corriger les cartes génériques “Bientôt” marquées comme prêtes;
- ajouter plus d’options d’accessibilité;
- ajouter des statistiques d’usage plus détaillées;
- ajouter plus d’exercices par cours;
- améliorer la couverture de tests;
- améliorer les diagrammes et captures générées;
- rendre les formules des simulations plus faciles à valider.

## XIII. Conclusion

Evidexe atteint son objectif principal: proposer un support d’apprentissage interactif qui combine cours, quiz, simulations, profil, progression et persistance locale. L’application ne remplace pas un cours complet, mais elle aide à réviser et à visualiser des notions abstraites.

L’architecture actuelle permet de faire évoluer le projet. Les ajouts futurs devraient surtout compléter les simulations prévues, corriger les entrées de catalogue ambiguës et renforcer les tests.

## XIV. Annexes

### Annexe A — Liste complète des simulations

Les simulations prêtes sont celles listées en VI-C-2. Les simulations prévues ou à corriger sont listées en VI-C-3.

#### Annexe A-1 — Options des simulations mathématiques

${tableMd(['Simulation', 'Options principales', 'Résultat'], optionsMath.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

#### Annexe A-2 — Options des simulations physiques

${tableMd(['Simulation', 'Options principales', 'Résultat'], optionsPhysique.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

#### Annexe A-3 — Options des simulations Java

${tableMd(['Simulation', 'Options principales', 'Résultat'], optionsJava.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

### Annexe B — Liste des fichiers importants

${tableMd(['Partie', 'Fichiers importants', 'Rôle'], fichiers.map((row) => row.map((cell) => cell.replace(/<code>/g, '`').replace(/<\/code>/g, '`'))))}

Fonctions et composants importants:

${fonctionsImportantes.map((item) => `- ${item.replace(/<code>/g, '`').replace(/<\/code>/g, '`')}`).join('\n')}

### Annexe C — Diagrammes UML

Les diagrammes utilisés dans le rapport couvrent le cas d’utilisation principal, le parcours utilisateur, l’architecture technique, l’architecture logique, le flux d’une simulation, le catalogue des simulations et le modèle de progression.

### Annexe D — Notes sur les fonctionnalités prévues

Les collisions élastiques, les collisions de hachage et l’héritage doivent rester présentés comme prévus. Les cartes génériques “Bientôt” de mathématiques et de physique doivent être corrigées, car elles sont générées comme disponibles tout en pointant vers des routes absentes.
`;

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Rapport complet Evidexe - Style UML</title>
<style>
  @page { size: A4; margin: 17mm 16mm 18mm 16mm; }
  body { background:#fff; color:#111; font-family: Georgia, "Times New Roman", serif; font-size: 11.2pt; line-height: 1.38; margin:0; }
  .page { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 23pt; text-align:center; margin: 32px 0 10px; font-weight:700; }
  h2 { font-size: 16pt; border-bottom: 1px solid #111; margin: 28px 0 12px; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 13pt; margin: 18px 0 8px; page-break-after: avoid; }
  h4 { font-size: 11.5pt; margin: 14px 0 6px; page-break-after: avoid; }
  p { margin: 7px 0; text-align: justify; }
  .cover { min-height: 760px; display:flex; flex-direction:column; justify-content:center; text-align:center; page-break-after: always; }
  .cover h1 { border:0; font-size: 28pt; line-height: 1.15; }
  .cover .subtitle { font-size: 15pt; margin-top: 20px; }
  .cover .authors { margin-top: 45px; font-size: 13pt; }
  .toc { page-break-after: always; }
  .toc ul { columns: 2; list-style: none; padding-left: 0; }
  .toc li { border-bottom: 1px dotted #999; padding: 5px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0 18px; page-break-inside: avoid; }
  caption { caption-side: top; text-align: left; font-weight: 700; margin-bottom: 5px; }
  th, td { border: 1px solid #111; padding: 6px 7px; vertical-align: top; }
  th { background: #f1f1f1; font-weight: 700; }
  code { font-family: "Consolas", "Courier New", monospace; font-size: 0.94em; }
  figure { margin: 14px auto 8px; page-break-inside: avoid; text-align:center; }
  figure svg { width: 100%; max-width: 820px; height: auto; border: 1px solid #111; background: #fff; }
  figcaption { font-style: italic; margin-top: 5px; text-align:center; }
  .explication { margin: 4px auto 15px; max-width: 760px; text-align: justify; }
  .section { page-break-inside: auto; }
  ul, ol { margin-top: 6px; margin-bottom: 10px; }
  li { margin: 3px 0; }
  .note { border: 1px solid #111; padding: 8px 10px; margin: 10px 0; background:#fafafa; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<main class="page">
<section class="cover">
  <h1>Evidexe<br>Rapport complet d’analyse avec UML</h1>
  <div class="subtitle">Projet final - Programmation</div>
  <div class="authors">Tony Khabbaz &amp; Aris Hadjeb</div>
</section>

<section class="toc">
  <h2>Table des matières</h2>
  <ul>
    <li>I. L’auteur</li><li>II. Cahier des charges</li><li>III. Cas d’utilisation principal</li><li>IV. Architecture</li><li>V. Organisation du projet</li><li>VI. Détaillons les fonctionnalités</li><li>VII. Description d’une interface homme-machine</li><li>VIII. Traitement des données locales</li><li>IX. Description des contenus pédagogiques</li><li>X. Conception</li><li>XI. Difficultés rencontrées</li><li>XII. Limites et améliorations possibles</li><li>XIII. Conclusion</li><li>XIV. Annexes</li>
  </ul>
</section>

<section><h2>I. L’auteur</h2><p>Le projet Evidexe est réalisé par Tony Khabbaz et Aris Hadjeb dans le cadre du projet final de programmation. Le document présente l’application comme un travail d’analyse et de spécification, en gardant le contenu centré sur le projet Evidexe et sur l’état réel du code.</p></section>

<section><h2>II. Cahier des charges</h2>
<h3>II-A. Préambule</h3><p>Evidexe part d’un besoin simple: aider les étudiants à réviser des notions abstraites en mathématiques, en physique et en programmation Java. L’application regroupe des cours courts, des quiz, des simulations interactives et un suivi de progression.</p>
<h3>II-B. Le besoin</h3><p>Des notions comme les dérivées, les intégrales, les forces, les champs, les circuits, les algorithmes et les structures de données sont difficiles à comprendre uniquement avec du texte. Evidexe répond à ce besoin en regroupant des cours organisés par matière, des quiz, des simulations interactives, un suivi de progression, un profil utilisateur et des paramètres.</p>
<h4>II-B-1. Architecture générale</h4><p>L’application est construite avec Expo, React Native, TypeScript et Expo Router. Le dossier <code>app/</code> contient les routes, <code>components/</code> les éléments d’interface réutilisables, <code>features/</code> les écrans et logiques spécialisés, <code>data/</code> les cours et quiz, <code>db/</code> les données locales et <code>features/simulations/</code> le catalogue ainsi que les composants de simulation.</p>
<h4>II-B-2. Principe de fonctionnement</h4>${liste(['L’utilisateur ouvre Evidexe.', 'L’écran d’introduction mène vers l’accueil.', 'L’utilisateur choisit les cours, simulations, profil, succès ou paramètres.', 'Les cours contiennent des diapositives et un quiz final.', 'Les simulations permettent de manipuler des paramètres.', 'La progression est sauvegardée localement.', 'Le profil montre XP, niveau, cours terminés, cours récents, succès, cartes mémoire et personnalisation.'])}
<h4>II-B-3. Contraintes</h4><p>Evidexe doit fonctionner sur web et mobile. Le stockage local change selon la plateforme: IndexedDB sur web avec <code>stockage-application.web.ts</code>, <code>expo-sqlite</code> sur Android/native avec <code>stockage-application.ts</code>, et un fallback mémoire si IndexedDB n’est pas disponible. Le projet n’utilise pas de backend distant. Les cartes de simulation prévues ou incomplètes ne doivent pas être présentées comme terminées.</p>
<h4>II-B-4. Objectifs du projet</h4>${liste(['créer une application Expo utilisable sur web et mobile;', 'organiser le contenu en mathématiques, physique et Java;', 'proposer des cours courts avec diapositives et quiz;', 'créer un catalogue de simulations interactives;', 'sauvegarder la progression localement;', 'gérer un profil avec XP, niveau, succès, cartes mémoire et paramètres;', 'conserver une structure claire pour ajouter du contenu plus tard.'])}</section>

<section><h2>III. Cas d’utilisation principal</h2>
<h3>III-A. Préambule</h3><p>Cette section donne une vue synthétique des interactions entre l’utilisateur, l’application et la couche de stockage local.</p>
<h3>III-B. Use case principal</h3><h4>III-B-1. Diagramme du cas d’utilisation</h4><figure>${svgUseCase}<figcaption>Figure 1 — Cas d’utilisation principal d’Evidexe</figcaption></figure><p class="explication">Le diagramme résume les fonctions visibles par l’utilisateur. Le stockage local n’est pas un utilisateur humain, mais il intervient dans les actions qui doivent persister entre deux ouvertures de l’application.</p>
<h4>III-B-2. Description des acteurs</h4>${tableHtml(['Acteur','Rôle'], acteurs.map((r) => r.map(esc)), 'Tableau 1 — Description des acteurs')}
<h4>III-B-3. Description des cas d’utilisation</h4>${tableHtml(['Cas d’utilisation','Description'], casUtilisation.map((r) => r.map(esc)), 'Tableau 2 — Description des cas d’utilisation')}
<h3>III-C. Parcours utilisateur global</h3><p>Un diagramme de parcours ne suffit pas à expliquer une application: il doit être accompagné d’un texte qui précise les choix, les limites et les cas particuliers.</p><div class="note">Parcours principal: introduction, accueil, choix d’un module, cours ou simulation, puis sauvegarde locale et consultation du profil.</div><p>Le parcours confirme que les cours et les simulations ne sont pas isolés: ils alimentent le profil, les données locales et les indicateurs de progression.</p>
<h3>III-D. Risques et points importants</h3>${liste(['garder le rapport aligné avec le code réel;', 'ne pas présenter les simulations prévues comme terminées;', 'gérer la complexité du stockage local selon la plateforme;', 'maintenir la compatibilité web/mobile;', 'garder une interface cohérente malgré le nombre de cours et simulations;', 'éviter l’attribution multiple d’XP;', 'considérer un cours comme terminé seulement après le quiz final.'])}</section>

<section><h2>IV. Architecture</h2>
<h3>IV-A. Préambule</h3><p>L’architecture est importante parce qu’Evidexe combine navigation, contenus pédagogiques, simulations, persistance locale et interface responsive.</p>
<h3>IV-B. Technologies utilisées</h3>${tableHtml(['Technologie','Rôle dans le projet'], technologies, 'Tableau 3 — Technologies utilisées')}
<h3>IV-C. Diagramme de déploiement / architecture technique</h3><figure>${svgArch}<figcaption>Figure 2 — Architecture technique simplifiée d’Evidexe</figcaption></figure><p class="explication">Cette vue montre que le reste de l’application dépend d’une abstraction de stockage, et non directement d’IndexedDB ou de SQLite.</p>
<h3>IV-D. Architecture logique du code</h3><figure>${svgLogic}<figcaption>Figure 2 bis — Architecture logique du code</figcaption></figure><p class="explication">Les routes, les composants, les contenus, les simulations et la persistance locale sont séparés dans des dossiers distincts.</p>
<h3>IV-E. Épilogue</h3><p>Cette architecture sépare les routes, les composants d’interface, les contenus pédagogiques, la logique des simulations et la gestion des données locales. Cette séparation facilite l’ajout futur de cours et de simulations.</p></section>

<section><h2>V. Organisation du projet</h2>
<h3>V-A. Préambule</h3><p>Le projet couvre trois domaines: mathématiques, physique et programmation Java. Cette diversité oblige à structurer les tâches, les fichiers et les responsabilités logiques.</p>
<h3>V-B. Échéancier du projet</h3>${tableHtml(['Période','Travail prévu','Travail réalisé','Commentaire'], echeancier, 'Tableau 4 — Échéancier du projet')}
<h3>V-C. Description des tâches du projet</h3>${tableHtml(['Tâche','Description','Fichiers / zones concernées'], taches, 'Tableau 5 — Description des tâches')}
<h3>V-D. Répartition logique du travail</h3><p>Le rapport et le code disponibles ne donnent pas une répartition nominative fiable entre Tony Khabbaz et Aris Hadjeb. Il ne faut donc pas inventer de responsabilités individuelles. La répartition exacte dépend du travail effectué par l’équipe.</p>
<h3>V-E. Épilogue</h3><p>L’organisation du projet permet de faire évoluer le contenu tout en conservant une base plus facile à maintenir.</p></section>

<section><h2>VI. Détaillons les fonctionnalités</h2>
<h3>VI-A. Préambule</h3><p>Cette section décrit les principaux modules fonctionnels de l’application.</p>
<h3>VI-B. Module des cours</h3><h4>VI-B-1. Fonctionnalité</h4><p>Les cours sont définis dans <code>data/cours.tsx</code>. Le code contient 20 cours de mathématiques, 15 cours de physique et 15 cours de Java, pour un total de 50 cours. Chaque cours contient des diapositives et un quiz final. La théorie peut faire monter la progression jusqu’à 99 %, mais le vrai 100 % nécessite le quiz ou exercice final.</p>
<h4>VI-B-2. Scénario: suivre un cours</h4>${tableHtml(['Code','Étape','Commentaire'], scenarioCours, 'Tableau 6 — Scénario de suivi d’un cours')}
<h3>VI-C. Module des simulations</h3><h4>VI-C-1. Fonctionnalité</h4><p>Le catalogue des simulations se trouve dans <code>features/simulations/catalogue-simulations.ts</code>. Le rapport distingue les simulations prêtes des entrées prévues ou à corriger.</p>
<h4>VI-C-2. Simulations prêtes</h4>${tableHtml(['Simulation mathématique','État','Rôle'], simulationsMath, 'Tableau 7 — Simulations mathématiques prêtes')}${tableHtml(['Simulation physique','État','Rôle'], simulationsPhysique, 'Tableau 8 — Simulations physiques prêtes')}${tableHtml(['Simulation Java','État','Rôle'], simulationsJava, 'Tableau 9 — Simulations Java prêtes')}
<h4>VI-C-3. Simulations prévues ou à corriger</h4>${tableHtml(['Élément','État','Commentaire'], prevues, 'Tableau 10 — Simulations prévues ou à corriger')}
<h4>VI-C-4. Flux commun d’une simulation</h4><figure>${svgSimFlux}<figcaption>Figure 3 — Flux commun d’une simulation interactive</figcaption></figure><p class="explication">Le flux est volontairement commun: les détails mathématiques, physiques ou Java changent, mais la logique d’ouverture, de modification de paramètres et de recalcul reste similaire.</p>
<h3>VI-D. Module du profil et de la progression</h3><p>Le profil utilise l’utilisateur actif. Il affiche XP, niveau, cours récents, cours complétés, succès, cartes mémoire, pseudo, photo de profil, mode sombre et compteur FPS. Les données sont locales et ne sont pas synchronisées avec un backend.</p>
<h3>VI-E. Module des paramètres</h3><p>Les paramètres visibles concernent surtout le mode sombre, le compteur FPS et la personnalisation du profil. Le fichier de données prévoit aussi une langue et des notifications, mais le rapport ne doit pas présenter un système complet de notifications distantes.</p></section>

<section><h2>VII. Description d’une interface homme-machine</h2>
<h3>VII-A. Préambule</h3><p>Cette section décrit les écrans principaux, comme dans un document d’analyse qui relie les fonctions aux interfaces.</p>
<h3>VII-B. Interface d’accueil</h3><p>L’application commence par un écran d’introduction puis mène vers l’accueil. L’accueil donne accès aux cours, aux simulations, au profil, aux succès et aux paramètres.</p>
<h3>VII-C. Interface des cours</h3><p>L’interface des cours propose le choix de la matière, une liste de cours, une vue par diapositives, un quiz final et un affichage de la progression.</p>
<h3>VII-D. Interface des simulations</h3><p>L’interface des simulations présente des cartes. Les cartes disponibles ouvrent des routes fonctionnelles. Les cartes “bientôt” ou génériques doivent rester clairement séparées des simulations terminées. Les simulations utilisent des contrôles comme sliders, boutons, champs, sélecteurs et affichages graphiques.</p>
<h3>VII-E. Interface du profil</h3><p>Le profil regroupe le niveau, l’XP, les cours récents, les cours terminés, les succès, les cartes mémoire et la personnalisation.</p>
<h3>VII-F. Cinématique d’une simulation</h3>${tableHtml(['Code','Étape','Commentaire'], cineSimulation, 'Tableau 11 — Cinématique d’une simulation')}
<h3>VII-G. Contrôles</h3><p>Les simulations utilisent des sliders, boutons, sélecteurs de choix, champs numériques et toggles. Ces contrôles doivent rester lisibles sur web et mobile.</p></section>

<section><h2>VIII. Traitement des données locales</h2>
<h3>VIII-A. Préambule</h3><p>Evidexe n’a pas de traitement batch mensuel. Le traitement important est la sauvegarde locale et la mise à jour de la progression.</p>
<h3>VIII-B. Sauvegarde de la progression</h3><p>La sauvegarde concerne l’utilisateur actif, les cours complétés, les cours récents, l’XP, les niveaux, les succès et les paramètres. La logique passe par <code>donnees-principales.tsx</code> et par l’abstraction <code>stockage-application</code>.</p>
<h3>VIII-C. Web vs native</h3>${tableHtml(['Plateforme','Technologie','Rôle'], stockage, 'Tableau 12 — Stockage selon la plateforme')}
<h3>VIII-D. Reprise en cas d’erreur</h3><p>Les cas à prévoir sont IndexedDB indisponible, données introuvables, utilisateur actif absent ou route de simulation manquante. Le comportement attendu est d’utiliser un fallback mémoire, de recréer un profil par défaut, d’éviter les crashs et d’afficher un écran prévu ou simplifié pour une simulation indisponible.</p></section>

<section><h2>IX. Description des contenus pédagogiques</h2>
<h3>IX-A. Préambule</h3><p>Evidexe regroupe trois domaines d’apprentissage.</p>
<h3>IX-B. Mathématiques</h3><p>Le contenu couvre fonctions, limites, dérivées, intégrales, sommes de Riemann, séries de Taylor, champs vectoriels, champs de pentes, lois normale et de Student, probabilités, inférence et mathématiques discrètes.</p>
<h3>IX-C. Physique</h3><p>Le contenu couvre vecteurs, position, vitesse, accélération, MRUA, chute libre, projectiles, mouvement circulaire, lois de Newton, force nette, frottement, travail, énergie, puissance, quantité de mouvement, gravité, pendule, ressort, orbites, champs électriques, champs magnétiques, optique et circuits.</p>
<h3>IX-D. Programmation Java</h3><p>Le contenu couvre variables, types, transtypage, opérateurs, conditions, boucles, tableaux, chaînes, méthodes, classes, objets, algorithmes de tri, pile, file, liste chaînée, ArrayList, mémoire et multithreading. Les collisions de hachage et l’héritage sont prévus.</p></section>

<section><h2>X. Conception</h2>
<h3>X-A. Préambule</h3><p>Cette section résume les choix de conception du projet.</p>
<h3>X-B. Découpage en packages / dossiers</h3>${tableHtml(['Dossier','Rôle'], dossiers, 'Tableau 13 — Découpage en dossiers')}
<h3>X-C. Catalogue des simulations</h3><figure>${svgCatalogue}<figcaption>Figure 4 — Organisation du catalogue des simulations</figcaption></figure><p class="explication">Le catalogue sert de point d’entrée pour les cartes affichées dans les sections. Les entrées “bientôt” doivent être séparées des simulations réellement utilisables.</p>
<h3>X-D. Modèle de progression</h3><figure>${svgProgression}<figcaption>Figure 5 — Modèle simplifié de progression locale</figcaption></figure><p class="explication">Le modèle relie l’utilisateur actif à son profil, ses cours, ses succès, ses cartes mémoire, ses paramètres et la couche de stockage local.</p>
<h3>X-E. Règles importantes</h3>${liste(['Un cours est vraiment complété seulement après le quiz final.', 'L’XP doit être attribuée une seule fois par complétion.', 'Les simulations marquées “bientôt” ne sont pas comptées comme terminées.', 'Le stockage local doit fonctionner sur web et native.', 'L’interface doit rester cohérente entre les modules.', 'Toutes les affirmations du rapport doivent correspondre au code réel.'])}</section>

<section><h2>XI. Difficultés rencontrées</h2>${liste(['organiser un projet couvrant trois domaines;', 'gérer une progression plus complexe que prévu;', 'adapter le stockage web et mobile;', 'éviter les affirmations incorrectes dans le rapport;', 'distinguer les simulations prêtes et prévues;', 'garder une interface cohérente;', 'tester un grand nombre de simulations.'])}</section>

<section><h2>XII. Limites et améliorations possibles</h2>${liste(['ajouter un backend ou une synchronisation de compte plus tard;', 'terminer les routes de simulations prévues;', 'corriger les cartes génériques “Bientôt” marquées comme prêtes;', 'ajouter plus d’options d’accessibilité;', 'ajouter des statistiques d’usage plus détaillées;', 'ajouter plus d’exercices par cours;', 'améliorer la couverture de tests;', 'améliorer les diagrammes et captures générées;', 'rendre les formules des simulations plus faciles à valider.'])}</section>

<section><h2>XIII. Conclusion</h2><p>Evidexe atteint son objectif principal: proposer un support d’apprentissage interactif qui combine cours, quiz, simulations, profil, progression et persistance locale. L’application ne remplace pas un cours complet, mais elle aide à réviser et à visualiser des notions abstraites.</p><p>L’architecture actuelle permet de faire évoluer le projet. Les ajouts futurs devraient surtout compléter les simulations prévues, corriger les entrées de catalogue ambiguës et renforcer les tests.</p></section>

<section><h2>XIV. Annexes</h2>
<h3>Annexe A — Liste complète des simulations</h3><p>Les simulations prêtes sont celles listées en VI-C-2. Les simulations prévues ou à corriger sont listées en VI-C-3.</p>
<h4>Annexe A-1 — Options des simulations mathématiques</h4>${tableHtml(['Simulation','Options principales','Résultat'], optionsMath, 'Tableau 14 — Options des simulations mathématiques')}
<h4>Annexe A-2 — Options des simulations physiques</h4>${tableHtml(['Simulation','Options principales','Résultat'], optionsPhysique, 'Tableau 15 — Options des simulations physiques')}
<h4>Annexe A-3 — Options des simulations Java</h4>${tableHtml(['Simulation','Options principales','Résultat'], optionsJava, 'Tableau 16 — Options des simulations Java')}
<h3>Annexe B — Liste des fichiers importants</h3>${tableHtml(['Partie','Fichiers importants','Rôle'], fichiers, 'Tableau 17 — Fichiers importants')}<p>Fonctions et composants importants:</p>${liste(fonctionsImportantes)}
<h3>Annexe C — Diagrammes UML</h3><p>Les diagrammes utilisés dans le rapport couvrent le cas d’utilisation principal, le parcours utilisateur, l’architecture technique, l’architecture logique, le flux d’une simulation, le catalogue des simulations et le modèle de progression.</p>
<h3>Annexe D — Notes sur les fonctionnalités prévues</h3><p>Les collisions élastiques, les collisions de hachage et l’héritage doivent rester présentés comme prévus. Les cartes génériques “Bientôt” de mathématiques et de physique doivent être corrigées, car elles sont générées comme disponibles tout en pointant vers des routes absentes.</p>
</section>
</main>
</body>
</html>`;

fs.writeFileSync(mdPath, md, 'utf8');
fs.writeFileSync(htmlPath, html, 'utf8');

const edgeCandidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const edge = edgeCandidates.find((candidate) => fs.existsSync(candidate));
if (!edge) {
  console.error('Microsoft Edge introuvable: HTML généré, PDF non généré.');
  process.exitCode = 2;
} else {
  const userDataDir = path.join(racine, '.tmp-edge-pdf-profile');
  fs.mkdirSync(userDataDir, { recursive: true });
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const result = spawnSync(edge, [
    '--headless',
    '--disable-gpu',
    '--disable-extensions',
    '--run-all-compositor-stages-before-draw',
    '--no-pdf-header-footer',
    `--user-data-dir=${userDataDir}`,
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ], { encoding: 'utf8' });

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || 'Échec de génération PDF.');
    process.exit(result.status || 1);
  }
}
