import path from "node:path";
import os from "node:os";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import { JsonFilePlayerRepository } from "@/infrastructure/repositories/json-file-player-repository";
import { JsonFileTournamentRepository } from "@/infrastructure/repositories/json-file-tournament-repository";
import { JsonFileExternalGameRepository } from "@/infrastructure/repositories/json-file-external-game-repository";
import { PostgresPlayerRepository } from "@/infrastructure/repositories/postgres-player-repository";
import { PostgresTournamentRepository } from "@/infrastructure/repositories/postgres-tournament-repository";
import { PostgresExternalGameRepository } from "@/infrastructure/repositories/postgres-external-game-repository";
import { sql } from "@/infrastructure/database/sql-client";
import { ChessComRatingProvider } from "@/infrastructure/external-rating-providers/chess-com-rating-provider";
import { LichessRatingProvider } from "@/infrastructure/external-rating-providers/lichess-rating-provider";
import { FfeHtmlTournamentProvider } from "@/infrastructure/external-rating-providers/ffe-tournament-provider";
import { RegisterPlayerUseCase } from "@/application/use-cases/register-player";
import { ListPlayersUseCase } from "@/application/use-cases/list-players";
import { RemovePlayerUseCase } from "@/application/use-cases/remove-player";
import { CreateTournamentUseCase } from "@/application/use-cases/create-tournament";
import { ListTournamentsUseCase } from "@/application/use-cases/list-tournaments";
import { GetTournamentUseCase } from "@/application/use-cases/get-tournament";
import { RemoveTournamentUseCase } from "@/application/use-cases/remove-tournament";
import { GenerateNextRoundUseCase } from "@/application/use-cases/generate-next-round";
import { SubmitRoundResultsUseCase } from "@/application/use-cases/submit-round-results";
import { SubmitPastedRoundResultsUseCase } from "@/application/use-cases/submit-pasted-round-results";
import { ImportExternalGamesFromCsvUseCase } from "@/application/use-cases/import-external-games-from-csv";
import { SyncExternalGamesUseCase } from "@/application/use-cases/sync-external-games";
import { ImportFfeTournamentGamesUseCase } from "@/application/use-cases/import-ffe-tournament-games";
import { ListExternalGamesUseCase } from "@/application/use-cases/list-external-games";
import { GetEloForecastUseCase } from "@/application/use-cases/get-elo-forecast";

// When DATABASE_URL is set (Neon Postgres, provisioned via the Vercel
// Marketplace), every repository is backed by a real, shared database -
// consistent across every serverless instance, unlike the JSON file store.
// Without it (e.g. local dev with no `.env.local` pulled), the app falls
// back to local JSON files under .data/, which stay useful as a
// zero-setup, exportable option for local-only use.
let playerRepository: PlayerRepository;
let tournamentRepository: TournamentRepository;
let externalGameRepository: ExternalGameRepository;

if (process.env.DATABASE_URL) {
  playerRepository = new PostgresPlayerRepository(sql);
  tournamentRepository = new PostgresTournamentRepository(sql);
  externalGameRepository = new PostgresExternalGameRepository(sql);
} else {
  const dataDir = process.env.VERCEL
    ? path.join(os.tmpdir(), "elo-chess-planner-data")
    : path.join(process.cwd(), ".data");

  playerRepository = new JsonFilePlayerRepository(path.join(dataDir, "players.json"));
  tournamentRepository = new JsonFileTournamentRepository(
    path.join(dataDir, "tournaments.json"),
  );
  externalGameRepository = new JsonFileExternalGameRepository(
    path.join(dataDir, "external-games.json"),
  );
}

export const registerPlayerUseCase = new RegisterPlayerUseCase(playerRepository);
export const listPlayersUseCase = new ListPlayersUseCase(playerRepository);
export const removePlayerUseCase = new RemovePlayerUseCase(playerRepository);

export const createTournamentUseCase = new CreateTournamentUseCase(
  tournamentRepository,
  playerRepository,
);
export const listTournamentsUseCase = new ListTournamentsUseCase(tournamentRepository);
export const getTournamentUseCase = new GetTournamentUseCase(tournamentRepository);
export const removeTournamentUseCase = new RemoveTournamentUseCase(tournamentRepository);
export const generateNextRoundUseCase = new GenerateNextRoundUseCase(tournamentRepository);
export const submitRoundResultsUseCase = new SubmitRoundResultsUseCase(tournamentRepository);
export const submitPastedRoundResultsUseCase = new SubmitPastedRoundResultsUseCase(
  tournamentRepository,
);

export const importExternalGamesFromCsvUseCase = new ImportExternalGamesFromCsvUseCase(
  externalGameRepository,
);
export const syncExternalGamesUseCase = new SyncExternalGamesUseCase(externalGameRepository, {
  chesscom: new ChessComRatingProvider(),
  lichess: new LichessRatingProvider(),
});
export const importFfeTournamentGamesUseCase = new ImportFfeTournamentGamesUseCase(
  externalGameRepository,
  playerRepository,
  new FfeHtmlTournamentProvider(),
);
export const listExternalGamesUseCase = new ListExternalGamesUseCase(externalGameRepository);
export const getEloForecastUseCase = new GetEloForecastUseCase(
  playerRepository,
  externalGameRepository,
);
