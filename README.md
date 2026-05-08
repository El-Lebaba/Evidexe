# Evidex

Evidex is an interactive learning application built with **Expo**, **React Native** and **TypeScript**. It helps students explore mathematics, physics and Java programming through short lessons, visual simulations, quizzes and local progress tracking.

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo" alt="Expo 54">
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react" alt="React Native 0.81">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript 5.9">
</p>

## Overview

Evidex turns abstract concepts into things students can inspect and manipulate. The app combines:

- guided course slides with examples and final quizzes;
- interactive simulations for mathematics, physics and Java algorithms;
- local user profiles with XP, levels, recent courses, achievements and settings;
- a modular Expo Router structure that makes new sections and simulations easy to add.

The project is currently a local-first educational app. It does not include a remote backend or account synchronization.

## Features

### Courses

- Mathematics: derivatives, integrals and limits.
- Physics: kinematics, forces and energy.
- Java: variables, data types, type casting, strings, operators, `Math`, conditionals, `switch`, loops, arrays, methods, classes and boolean logic.
- Course progress is saved per active local user.
- A course reaches 100% only after the final exercise is completed.

### Simulations

Available simulations:

- Mathematics: derivatives, integrals, Taylor series, limits, Fourier series, slope fields and numeric series.
- Physics: gravity, pendulum, projectile motion, Hooke's law spring, circular motion, magnetic fields, electric fields, optics/refraction, orbital mechanics and friction.
- Java: bubble sort, selection sort, insertion sort, merge sort, quicksort and `ArrayList`.

The catalog also contains placeholder or locked entries for future work, including vector fields, elastic collisions and several Java data-structure or language-feature simulations.

### Profile And Progression

- Multiple local users by display name.
- XP and level progression.
- Recent, active and completed courses.
- Achievement progress for courses, flashcards and simulation usage.
- Local settings for dark mode, language, notifications and the developer FPS counter.
- Flashcard storage by topic.

## Tech Stack

- **Expo 54** with **Expo Router 6** for routing and app entry.
- **React Native 0.81**, **React 19** and **React Native Web** for mobile/web UI.
- **TypeScript 5.9** with strict mode enabled.
- **React Native SVG** and **KaTeX** for diagrams and mathematical notation.
- **Expo SQLite** for native key-value persistence.
- **IndexedDB** for web key-value persistence.
- **ESLint** with Expo's flat config.

## Requirements

- Node.js 20 or newer is recommended.
- npm.
- Git.
- One of the following runtime targets:
  - Expo Go or a development build for physical devices;
  - Android Studio for Android emulator;
  - Xcode for iOS simulator on macOS;
  - a modern browser for the web build.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Veng143/Evidex.git
cd Evidex
```

Install dependencies:

```bash
npm install
```

Start Expo on the local network:

```bash
npm start
```

Start Expo without forcing LAN hosting:

```bash
npm run startlocal
```

Start Expo with a tunnel:

```bash
npm run start:tunnel
```

Run a specific target:

```bash
npm run android
npm run ios
npm run web
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts Expo with cache cleared and LAN hosting. |
| `npm run startlocal` | Starts Expo with cache cleared using Expo's default host behavior. |
| `npm run start:tunnel` | Starts Expo with cache cleared through a tunnel. |
| `npm run android` | Opens the project on Android through Expo. |
| `npm run ios` | Opens the project on iOS through Expo. |
| `npm run web` | Starts the web target. |
| `npm run lint` | Runs Expo ESLint. |
| `npm run reinitialiser-projet` | Runs the local reset utility in `scripts/reinitialiser-projet.js`. |

## Quality Checks

Run linting:

```bash
npm run lint
```

Run a TypeScript type check:

```bash
npx tsc --noEmit
```

There is currently no automated test script in `package.json`.

## Project Structure

```text
app/                       Expo Router routes and screens
assets/                    Images, icons and static assets
components/                Shared UI components
components/accueil/        Home screen panels and header
components/cours/          Course cards
components/profil/         Profile and achievement panels
constantes/                Shared theme constants
data/                      Course, slide and quiz data
db/                        Local persistence and user progress logic
features/cours/            Course reading screen
features/sections/         Section screen helpers
features/simulations/      Simulation catalog, screens and shared simulation UI
hooks/                     Theme and color-scheme hooks
scripts/                   Utility scripts
```

## Persistence Model

The app stores all user data locally under one application data object. Native platforms use `expo-sqlite`; the web implementation uses IndexedDB. The shared data layer in `db/donnees-principales.tsx` manages users, settings, course progress, flashcards, achievements and XP.

This persistence model is local to the device/browser. Data is not synchronized across devices.

## Current Limitations

- Some catalog entries are placeholders or locked rather than complete simulations.
- The app is local-first and has no remote authentication or cloud backup.
- Automated tests have not been added yet.
- The UI and content are mostly French, while some older helper text and code identifiers remain mixed between French and English.

## Roadmap

- Complete the remaining locked and placeholder simulations.
- Add automated tests for persistence, quiz completion, XP, achievements and simulation math.
- Improve accessibility and responsive polish across small screens.
- Add a stronger persistence strategy if the project evolves toward multi-device use.
- Consider a teacher/classroom mode for assigning lessons and reviewing progress.

## Contributors

- Tony Khabbaz
- Aris Hadjeb

## License

No license file is currently included in this repository. Add one before distributing or accepting external contributions.
