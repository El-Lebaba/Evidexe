# Evid.exe

Application educative interactive construite avec **Expo**, **React Native** et **TypeScript** pour explorer des notions de **mathematiques**, de **physique** et de **programmation Java** avec des cours, des simulations et un suivi de progression local.

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-Mobile-blue?style=for-the-badge&logo=react">&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Expo-Framework-black?style=for-the-badge&logo=expo">&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/TypeScript-Language-blue?style=for-the-badge&logo=typescript">&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Expo%20Router-Navigation-purple?style=for-the-badge&logo=expo">
</p>

---

## Description

**Evid.exe** transforme des concepts abstraits en experiences manipulables. L'utilisateur peut lire des cours courts, lancer des simulations interactives, completer des quiz et suivre sa progression avec de l'XP, des niveaux et des cours recents.

Le projet fonctionne avec Expo Router et une architecture modulaire: les routes sont dans `app/`, les composants reutilisables dans `components/`, les simulations dans `features/simulations/`, les cours dans `data/` et la persistence locale dans `db/`.

---

## Fonctionnalites principales

### Cours
- Cours de mathematiques: derivees, integrales et limites.
- Cours de physique: cinematique, forces et energie.
- Cours Java: variables, types, transtypage, chaines, operateurs, conditions, boucles, tableaux, methodes, classes, objets et logique booleenne.
- Quiz final et progression sauvegardee localement.

### Simulations
- Mathematiques: derivees, integrales, serie de Taylor, limites, Fourier, champ de pentes et series.
- Physique: gravite, pendule, mouvement projectile, ressort et loi de Hooke, mouvement circulaire, champs magnetiques, champs electriques, optique et refraction, mecanique orbitale et frottement.
- Programmation Java: catalogue de simulations en preparation, avec des entrees prevues autour des tris et des structures de donnees.
- Catalogue extensible avec certaines simulations encore marquees comme a venir ou fermees.

### Profil
- Utilisateurs locaux.
- XP, niveau, cours recents, cours actifs et cours termines.
- Parametres locaux: mode sombre, langue et notifications.

---

## Technologies utilisees

- **Expo 54** et **Expo Router** pour le lancement, le routage et la navigation.
- **React Native 0.81** et **React 19** pour l'interface.
- **TypeScript / TSX** pour le code applicatif.
- **React Native SVG**, **KaTeX** et rendu mathematique pour les visualisations.
- **Stockage local applicatif** via `localStorage` sur web, avec fallback memoire si necessaire.

> Note: une dependance `sqlite` est presente dans le projet, mais le stockage actuel n'utilise pas encore une base SQLite active.

---

## Installation

### Prerequis

- Node.js
- npm
- Git
- Expo Go, Android Studio ou un navigateur web selon la plateforme cible

### Cloner le depot

```bash
git clone https://github.com/Veng143/Evidex.git
cd Evidex
```

### Installer les dependances

```bash
npm install
```

---

## Lancement

Demarrer Expo en local:

```bash
npm run startlocal
```

Demarrer avec tunnel:

```bash
npm start
```

Lancer directement une cible:

```bash
npm run android
npm run ios
npm run web
```

---

## Verification

```bash
npm run lint
npx tsc --noEmit
```

---

## Structure du projet

```text
app/          Routes Expo Router et ecrans principaux
components/   Composants reutilisables
features/     Sections, simulations et logique de presentation
data/         Donnees des cours, diapositives et quiz
db/           Stockage local et progression utilisateur
constantes/   Constantes visuelles partagees
hooks/        Hooks React locaux
assets/       Images, icones et ressources statiques
scripts/      Scripts utilitaires du projet
```

---

## Etat du projet

Le projet est fonctionnel pour consulter les cours, lancer les simulations disponibles en mathematiques et en physique, suivre la progression et utiliser le profil. Les prochaines ameliorations naturelles seraient de completer les simulations Java, renforcer les tests automatises et remplacer le stockage local actuel par une persistence plus robuste si le projet evolue vers une utilisation multi-appareils.
