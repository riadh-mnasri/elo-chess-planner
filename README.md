# EloChessPlanner

Copyright © Riadh MNASRI. All rights reserved.

A web app to organize home chess tournaments and forecast your monthly Elo
change. Live at [elo-chess-planner.vercel.app](https://elo-chess-planner.vercel.app).

*La version française suit plus bas.*

## English

### What it does

- **Players**: register family members and occasional guests, with an
  official rating that follows a FIDE, then FFE, then chess.com priority
  (or "unrated" if none is known).
- **Tournaments**: create a home tournament, pick the participants, and get
  a FIDE-inspired Swiss pairing for round 1 automatically. See
  [docs/pairing-algorithm.md](docs/pairing-algorithm.md) for a full,
  step-by-step, worked-example explanation of how the pairing engine
  decides who plays whom and with which color.
- **Round results**: enter results board by board, or paste a whole round's
  results as text (`White - Black: Result`), then generate the next round
  with one click once the current one is complete.
- **Standings**: live leaderboard with Buchholz and Sonneborn-Berger
  tie-breaks, medals for the podium once a tournament is finished, and a
  printable pairing sheet per round.
- **Elo import**: paste a CSV of past games, or sync recent rated games
  directly from a chess.com or lichess username.
- **Elo forecast**: a statistical projection of next month's Elo change
  (min/median/max), extrapolated from the imported game history and playing
  cadence.
- Fully bilingual interface (English/French), light and dark themes.
- Optional shared-password gate for the deployed instance (see
  "Deploying to Vercel" below).

### Architecture

The codebase follows a hexagonal (ports & adapters) architecture:

- `src/domain`: pure business entities and rules (Player, Tournament, the
  pairing engine, the CSV/API import parsers), no framework dependency.
- `src/application`: use cases orchestrating the domain, behind repository
  and external-provider ports.
- `src/infrastructure`: adapters (JSON file repositories, chess.com/lichess
  API clients).
- `src/presentation`: reusable UI components (buttons, cards, badges,
  forms).
- `src/app`: Next.js App Router entry points and Server Actions (`[locale]`
  segment for i18n).

Every domain and application rule is covered by tests written first
(TDD), structured in `// Given // When // Then` blocks, using Vitest with
`vitest-mock-extended` for mocking repositories and external providers.

### Local development

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3220](http://localhost:3220). Data is
stored locally as plain JSON files under `.data/` (players, tournaments,
imported games), which is not tracked by git and can be copied as a backup
or export.

### Tests

```bash
npm test        # run once
npm run test:watch
```

### Deploying to Vercel

```bash
npx vercel        # preview deployment
npx vercel --prod # production deployment
```

Or connect the GitHub repository to a Vercel project for automatic
deployments on every push.

To protect the deployed instance with a shared password, set an
`APP_PASSWORD` environment variable (`vercel env add APP_PASSWORD
production`, or via the Vercel dashboard). When it is set, every visitor is
redirected to a login page until they enter it; a cookie then keeps them
signed in. Locally, the app stays open unless you also set `APP_PASSWORD` in
your shell or `.env.local` (which is gitignored - never commit it).

**Important limitation**: the local JSON file storage only works reliably
on a single local instance. On Vercel, the deployment's filesystem is
read-only except for `/tmp`, which the app falls back to automatically so
it doesn't crash, but data stored there can disappear at any time (cold
starts, redeploys, multiple instances). The Vercel deployment is useful to
preview the app live, but a database-backed adapter (e.g. Neon/Vercel
Postgres, implementing the same repository ports under
`src/application/ports`) is needed before relying on it for real,
persistent, multi-device usage.

### What's not built yet

- A database-backed persistence adapter for real, reliable Vercel usage.

## Français

### Ce que fait l'application

- **Joueurs** : enregistrez les membres de la famille et les invités
  ponctuels, avec un rating officiel qui suit une priorité FIDE, puis FFE,
  puis chess.com (ou "non classé" si aucun n'est connu).
- **Tournois** : créez un tournoi maison, choisissez les participants, et
  obtenez automatiquement un appariement Swiss inspiré des règles FIDE pour
  la ronde 1. Voir [docs/pairing-algorithm.md](docs/pairing-algorithm.md)
  pour une explication complète, étape par étape, avec un exemple concret,
  de la façon dont le moteur d'appariement décide qui affronte qui et avec
  quelle couleur.
- **Résultats de ronde** : saisissez les résultats échiquier par échiquier,
  ou collez les résultats de toute une ronde sous forme de texte
  (`Blancs - Noirs: Résultat`), puis générez la ronde suivante en un clic
  une fois la ronde en cours terminée.
- **Classement** : classement en direct avec départages Buchholz et
  Sonneborn-Berger, médailles pour le podium une fois le tournoi terminé, et
  une feuille d'appariement imprimable par ronde.
- **Import Elo** : collez un CSV de parties passées, ou synchronisez les
  parties classées récentes directement depuis un pseudo chess.com ou
  lichess.
- **Prédiction Elo** : une projection statistique de l'évolution Elo du mois
  prochain (min/médiane/max), extrapolée à partir de l'historique de parties
  importées et du rythme de jeu.
- Interface entièrement bilingue (anglais/français), thèmes clair et
  sombre.
- Protection optionnelle par mot de passe partagé pour l'instance déployée
  (voir "Déploiement sur Vercel" ci-dessous).

### Architecture

Le projet suit une architecture hexagonale (ports & adapters) :

- `src/domain` : entités et règles métier pures (Player, Tournament, le
  moteur d'appariement, les parseurs d'import CSV/API), sans dépendance
  framework.
- `src/application` : cas d'usage orchestrant le domaine, derrière des
  ports de dépôts et de fournisseurs externes.
- `src/infrastructure` : adaptateurs (dépôts JSON, clients API
  chess.com/lichess).
- `src/presentation` : composants d'interface réutilisables (boutons,
  cartes, badges, formulaires).
- `src/app` : points d'entrée Next.js App Router et Server Actions (segment
  `[locale]` pour l'i18n).

Chaque règle de domaine et d'application est couverte par des tests écrits
en premier (TDD), structurés en blocs `// Given // When // Then`, avec
Vitest et `vitest-mock-extended` pour mocker les dépôts et fournisseurs
externes.

### Développement local

```bash
npm install
npm run dev
```

L'application tourne sur [http://localhost:3220](http://localhost:3220).
Les données sont stockées localement sous forme de fichiers JSON dans
`.data/` (joueurs, tournois, parties importées), non suivis par git et
copiables directement comme sauvegarde ou export.

### Tests

```bash
npm test        # exécution unique
npm run test:watch
```

### Déploiement sur Vercel

```bash
npx vercel        # déploiement de prévisualisation
npx vercel --prod # déploiement en production
```

Ou connectez le dépôt GitHub à un projet Vercel pour un déploiement
automatique à chaque push.

Pour protéger l'instance déployée par un mot de passe partagé, définissez
une variable d'environnement `APP_PASSWORD` (`vercel env add APP_PASSWORD
production`, ou via le dashboard Vercel). Une fois définie, chaque visiteur
est redirigé vers une page de connexion tant qu'il ne l'a pas saisi ; un
cookie le garde ensuite connecté. En local, l'application reste ouverte sauf
si vous définissez aussi `APP_PASSWORD` dans votre shell ou `.env.local`
(qui est ignoré par git : ne le committez jamais).

**Limitation importante** : le stockage JSON local ne fonctionne de façon
fiable que sur une seule instance locale. Sur Vercel, le système de fichiers
du déploiement est en lecture seule sauf `/tmp`, sur lequel l'application
bascule automatiquement pour éviter de planter, mais les données qui y sont
stockées peuvent disparaître à tout moment (redémarrage à froid,
redéploiement, plusieurs instances). Le déploiement Vercel est utile pour
prévisualiser l'application en ligne, mais un adaptateur de persistance basé
sur une base de données (par exemple Neon/Vercel Postgres, implémentant les
mêmes ports de dépôt sous `src/application/ports`) est nécessaire avant de
s'en servir pour un usage réel, persistant et multi-appareils.

### Ce qui n'est pas encore fait

- Un adaptateur de persistance basé sur une base de données pour un usage
  Vercel réel et fiable.
