# Evidexe

Evidexe est une application d'apprentissage interactive construite avec **Expo**, **React Native** et **TypeScript**. Elle aide les étudiants à explorer les mathématiques, la physique et la programmation Java avec des cours courts, des simulations visuelles, des quiz et un suivi de progression local.

<p align="center">

  <img src="https://img.shields.io/badge/Expo-Framework-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Framework" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Expo%20Router-Navigation-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router Navigation" style="margin: 4px;">
  <img src="https://img.shields.io/badge/React%20Native-Mobile-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React Native Mobile" style="margin: 4px;">
  <img src="https://img.shields.io/badge/React-UI-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React UI" style="margin: 4px;">
  <img src="https://img.shields.io/badge/React%20Navigation-Tabs-6B52AE?style=for-the-badge&logo=react&logoColor=white" alt="React Navigation Tabs" style="margin: 4px;">
  <img src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Language" style="margin: 4px;">
  <img src="https://img.shields.io/badge/JavaScript-Runtime%20Support-F7DF1E?style=for-the-badge&logo=javascript&logoColor=20232A" alt="JavaScript Runtime Support" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Java-Course%20Content-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java Course Content" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Node.js-Tooling-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Tooling" style="margin: 4px;">
  <img src="https://img.shields.io/badge/npm-Package%20Manager-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm Package Manager" style="margin: 4px;">
  <img src="https://img.shields.io/badge/SQLite-Native%20Storage-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Native Storage" style="margin: 4px;">
  <img src="https://img.shields.io/badge/IndexedDB-Web%20Storage-4A5568?style=for-the-badge&logo=databricks&logoColor=white" alt="IndexedDB Web Storage" style="margin: 4px;">
  <img src="https://img.shields.io/badge/KaTeX-Math%20Rendering-4A90E2?style=for-the-badge&logo=katex&logoColor=white" alt="KaTeX Math Rendering" style="margin: 4px;">
  <img src="https://img.shields.io/badge/SVG-Visualisations-FFB13B?style=for-the-badge&logo=svg&logoColor=20232A" alt="SVG Visualisations" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Android-Mobile%20Target-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android Mobile Target" style="margin: 4px;">
  <img src="https://img.shields.io/badge/iOS-Mobile%20Target-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS Mobile Target" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Web-Browser%20Target-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Web Browser Target" style="margin: 4px;">
  <img src="https://img.shields.io/badge/ESLint-Code%20Quality-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint Code Quality" style="margin: 4px;">
  <img src="https://img.shields.io/badge/Git-Version%20Control-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git Version Control" style="margin: 4px;">
  <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" style="margin: 4px;">
  <img src="https://img.shields.io/badge/WebStorm-IDE-000000?style=for-the-badge&logo=webstorm&logoColor=white" alt="WebStorm IDE" style="margin: 4px;">

</p>

## Aperçu

Evidexe transforme des concepts abstraits en éléments que l'étudiant peut observer et manipuler. L'application combine :

- des diapositives de cours guidées avec exemples et quiz final;
- des simulations interactives pour les mathématiques, la physique et les algorithmes Java;
- des profils locaux avec XP, niveaux, cours récents, succès et paramètres;
- une architecture modulaire avec Expo Router pour faciliter l'ajout de sections et de simulations.

Le projet est actuellement une application éducative centrée sur le stockage local. Il ne contient pas de serveur distant, d'authentification distante ni de synchronisation de compte.

## Fonctionnalités

### Cours

- Mathématiques : dérivées, intégrales et limites.
- Physique : cinématique, forces et énergie.
- Java : variables, types de données, transtypage, chaînes, opérateurs, `Math`, conditions, `switch`, boucles, tableaux, méthodes, classes et logique booléenne.
- La progression des cours est sauvegardée pour l'utilisateur local actif.
- Un cours atteint 100 % seulement lorsque l'exercice final est complété.

### Simulations

Simulations disponibles :

- Mathématiques : dérivées, intégrales, série de Taylor, limites, Fourier, champ de pentes et séries numériques.
- Physique : gravité, pendule, mouvement projectile, ressort et loi de Hooke, mouvement circulaire, champs magnétiques, champs électriques, optique et réfraction, mécanique orbitale et frottement.
- Java : tri à bulles, tri par sélection, tri par insertion, tri fusion, tri rapide et `ArrayList`.

Le catalogue contient aussi des entrées verrouillées ou en préparation, notamment le champ vectoriel, les collisions élastiques et plusieurs simulations Java sur les structures de données ou les notions avancées du langage.

### Profil et progression

- Plusieurs utilisateurs locaux par nom d'affichage.
- Progression par XP et niveaux.
- Cours récents, cours actifs et cours terminés.
- Succès liés aux cours, aux cartes mémoire et à l'utilisation des simulations.
- Paramètres locaux pour le mode sombre, la langue, les notifications et le compteur de FPS de développement.
- Stockage de cartes mémoire par sujet.

## Technologies

- **Expo 54** avec **Expo Router 6** pour le routage et le point d'entrée de l'application.
- **React Native 0.81**, **React 19** et **React Native Web** pour l'interface mobile et web.
- **TypeScript 5.9** avec le mode strict activé.
- **React Native SVG** et **KaTeX** pour les schémas et la notation mathématique.
- **Expo SQLite** pour la persistance clé-valeur sur plateformes natives.
- **IndexedDB** pour la persistance clé-valeur sur le web.
- **ESLint** avec la configuration Expo.

## Prérequis

- Node.js 20 ou plus récent est recommandé.
- npm.
- Git.
- Une des cibles d'exécution suivantes :
  - Expo Go ou une version de développement sur appareil physique;
  - Android Studio pour l'émulateur Android;
  - Xcode pour le simulateur iOS sur macOS;
  - un navigateur moderne pour la version web.

## Installation

Cloner le dépôt :

```bash
git clone https://github.com/Veng143/Evidexe.git
cd Evidexe
```

Installer les dépendances :

```bash
npm install
```

Démarrer Expo sur le réseau local :

```bash
npm start
```

Démarrer Expo avec le comportement d'hébergement par défaut :

```bash
npm run startlocal
```

Démarrer Expo avec un tunnel :

```bash
npm run start:tunnel
```

Lancer une cible précise :

```bash
npm run android
npm run ios
npm run web
```

## Scripts

| Commande | Description |
| --- | --- |
| `npm start` | Démarre Expo avec le cache vidé et l'hébergement sur le réseau local. |
| `npm run startlocal` | Démarre Expo avec le cache vidé et le comportement d'hébergement par défaut. |
| `npm run start:tunnel` | Démarre Expo avec le cache vidé à travers un tunnel. |
| `npm run android` | Ouvre le projet sur Android avec Expo. |
| `npm run ios` | Ouvre le projet sur iOS avec Expo. |
| `npm run web` | Démarre la cible web. |
| `npm run lint` | Lance ESLint avec Expo. |
| `npm run reinitialiser-projet` | Lance l'utilitaire local `scripts/reinitialiser-projet.js`. |

## Vérification

Lancer l'analyse du code :

```bash
npm run lint
```

Lancer la vérification TypeScript :

```bash
npx tsc --noEmit
```

Il n'y a actuellement aucun script de tests automatisés dans `package.json`.

## Structure du projet

```text
app/                       Routes Expo Router et écrans
assets/                    Images, icônes et ressources statiques
components/                Composants d'interface partagés
components/accueil/        Panneaux et barre supérieure de l'accueil
components/cours/          Cartes de cours
components/profil/         Panneaux de profil et de succès
constantes/                Constantes de thème partagées
data/                      Données des cours, diapositives et quiz
db/                        Persistance locale et logique de progression
features/cours/            Écran de lecture des cours
features/sections/         Aides pour les écrans de section
features/simulations/      Catalogue, écrans et interface partagée des simulations
hooks/                     Fonctions React de thème et de schéma de couleur
scripts/                   Scripts utilitaires
```

## Modèle de persistance

L'application stocke toutes les données utilisateur localement dans un seul objet de données applicatives. Les plateformes natives utilisent `expo-sqlite`; la version web utilise IndexedDB. La couche partagée dans `db/donnees-principales.tsx` gère les utilisateurs, les paramètres, la progression des cours, les cartes mémoire, les succès et l'XP.

Ce modèle de persistance reste local à l'appareil ou au navigateur. Les données ne sont pas synchronisées entre plusieurs appareils.

## Limites Actuelles

- Certaines entrées du catalogue sont des simulations verrouillées ou en préparation.
- L'application fonctionne avec des données locales et ne possède pas d'authentification distante ni de sauvegarde infonuagique.
- Les tests automatisés ne sont pas encore ajoutés.
- L'interface et le contenu sont principalement en français, mais certains identifiants techniques restent en anglais dans le code.

## Feuille De Route

- Compléter les simulations verrouillées et les entrées en préparation.
- Ajouter des tests automatisés pour la persistance, les quiz, l'XP, les succès et les calculs des simulations.
- Améliorer l'accessibilité et l'adaptation aux petits écrans.
- Renforcer la stratégie de persistance si le projet évolue vers une utilisation sur plusieurs appareils.
- Étudier un mode enseignant pour assigner des cours et consulter la progression.

## Contributeurs

- Tony Khabbaz
- Aris Hadjeb

## Licence

Aucun fichier de licence n'est actuellement inclus dans ce dépôt. Il faudra en ajouter un avant une distribution publique ou l'acceptation de contributions externes.
