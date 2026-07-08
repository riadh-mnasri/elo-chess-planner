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

### Architecture

The codebase follows a hexagonal (ports & adapters) architecture:

- `src/domain`: pure business entities and rules (Player, Tournament, the
  pairing engine, the CSV/API import parsers), no framework dependency.
- `src/application`: use cases orchestrating the domain, behind repository
  and external-provider ports.
- `src/infrastructure`: adapters (Postgres and JSON file repositories,
  chess.com/lichess API clients).
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

The app runs on [http://localhost:3220](http://localhost:3220). If a
`DATABASE_URL` environment variable is set (e.g. via `vercel env pull
.env.local` after provisioning the Neon integration below), data is read
from and written to that Postgres database - the same one the deployed app
uses. Without it, the app falls back to plain JSON files under `.data/`
(not tracked by git, copyable as a backup or export), which is enough for a
quick local-only trial.

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

Persistence is backed by Neon Postgres, provisioned via the Vercel
Marketplace:

```bash
npx vercel install neon   # provisions a Neon project and sets DATABASE_URL
```

Once installed, Vercel automatically injects `DATABASE_URL` (and a few
other Neon-specific variables) into the Production, Preview, and
Development environments, so every deployment - and any local dev session
that pulls those variables - shares the same database. The three
Postgres-backed repositories (`src/infrastructure/repositories/postgres-*`)
store each entity as a JSONB document keyed by id and create their own
tables on first use, so no separate migration step is needed. Without
`DATABASE_URL` set, the app falls back to local JSON files, which is only
suitable for a single local instance (an earlier attempt relied on
Vercel's `/tmp` as a fallback there too, but it turned out not to be
shared across serverless instances, causing data to intermittently
disappear or duplicate - Postgres removes that problem entirely).

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

### Architecture

Le projet suit une architecture hexagonale (ports & adapters) :

- `src/domain` : entités et règles métier pures (Player, Tournament, le
  moteur d'appariement, les parseurs d'import CSV/API), sans dépendance
  framework.
- `src/application` : cas d'usage orchestrant le domaine, derrière des
  ports de dépôts et de fournisseurs externes.
- `src/infrastructure` : adaptateurs (dépôts Postgres et JSON, clients API
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

L'application tourne sur [http://localhost:3220](http://localhost:3220). Si
une variable d'environnement `DATABASE_URL` est définie (par exemple via
`vercel env pull .env.local` après avoir provisionné l'intégration Neon
ci-dessous), les données sont lues et écrites dans cette base Postgres —
la même que celle utilisée par l'application déployée. Sans elle,
l'application bascule sur de simples fichiers JSON dans `.data/` (non
suivis par git, copiables comme sauvegarde ou export), suffisant pour un
essai rapide en local uniquement.

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

La persistance repose sur Neon Postgres, provisionné via le Marketplace
Vercel :

```bash
npx vercel install neon   # provisionne un projet Neon et définit DATABASE_URL
```

Une fois installée, Vercel injecte automatiquement `DATABASE_URL` (et
quelques autres variables spécifiques à Neon) dans les environnements
Production, Preview et Development, si bien que chaque déploiement — ainsi
que toute session de dev local ayant récupéré ces variables — partage la
même base. Les trois dépôts Postgres
(`src/infrastructure/repositories/postgres-*`) stockent chaque entité sous
forme de document JSONB indexé par id et créent leurs propres tables au
premier usage, sans étape de migration séparée. Sans `DATABASE_URL`,
l'application bascule sur des fichiers JSON locaux, adaptés uniquement à
une seule instance locale (une première tentative reposait aussi sur
`/tmp` sur Vercel comme repli, mais ce répertoire s'est avéré non partagé
entre les instances serverless, causant des données qui disparaissaient ou
se dupliquaient de façon intermittente — Postgres élimine complètement ce
problème).
