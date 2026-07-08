# EloChessPlanner

Copyright © Riadh MNASRI. All rights reserved.

## English

A web app to organize home chess tournaments (family + occasional guests) with
FIDE-compliant Swiss pairings, round-by-round results entry, and a statistical
forecast of next month's Elo change based on imported external results
(chess.com, lichess, FFE...).

The source code and code comments are written in English. The user interface
and documentation are available in English and French.

### Architecture

The codebase follows a hexagonal (ports & adapters) architecture:

- `src/domain`: pure business entities and rules, no framework dependency.
- `src/application`: use cases orchestrating the domain.
- `src/infrastructure`: adapters (database, external APIs, CSV import).
- `src/presentation`: Next.js routes and UI components.
- `src/app`: Next.js App Router entry points (`[locale]` segment for i18n).

### Local development

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3220](http://localhost:3220).

### Tests

Tests follow a TDD approach, structured in `// Given // When // Then` blocks.

```bash
npm test        # run once
npm run test:watch
```

### Deploying to Vercel

```bash
npx vercel        # preview deployment
npx vercel --prod # production deployment
```

Or connect the GitHub repository to a Vercel project for automatic deployments
on every push.

---

## Français

Une application web pour organiser des tournois d'échecs maison (famille +
invités ponctuels) avec un appariement Swiss conforme aux règles FIDE, une
saisie des résultats ronde par ronde, et une prédiction statistique de
l'évolution de l'Elo pour le mois suivant, basée sur les résultats importés de
sites externes (chess.com, lichess, FFE...).

Le code source et les commentaires sont écrits en anglais. L'interface
utilisateur et la documentation sont disponibles en anglais et en français.

### Architecture

Le projet suit une architecture hexagonale (ports & adapters) :

- `src/domain` : entités et règles métier pures, sans dépendance framework.
- `src/application` : cas d'usage orchestrant le domaine.
- `src/infrastructure` : adaptateurs (base de données, API externes, import CSV).
- `src/presentation` : routes et composants Next.js.
- `src/app` : points d'entrée Next.js App Router (segment `[locale]` pour l'i18n).

### Développement local

```bash
npm install
npm run dev
```

L'application tourne sur [http://localhost:3220](http://localhost:3220).

### Tests

Les tests suivent une approche TDD, structurés en blocs `// Given // When // Then`.

```bash
npm test        # exécution unique
npm run test:watch
```

### Déploiement sur Vercel

```bash
npx vercel        # déploiement de prévisualisation
npx vercel --prod # déploiement en production
```

Ou connectez le dépôt GitHub à un projet Vercel pour un déploiement automatique
à chaque push.
