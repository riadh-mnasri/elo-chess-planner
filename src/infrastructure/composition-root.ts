import path from "node:path";
import os from "node:os";
import { JsonFilePlayerRepository } from "@/infrastructure/repositories/json-file-player-repository";
import { JsonFileTournamentRepository } from "@/infrastructure/repositories/json-file-tournament-repository";
import { JsonFileExternalGameRepository } from "@/infrastructure/repositories/json-file-external-game-repository";
import { ChessComRatingProvider } from "@/infrastructure/external-rating-providers/chess-com-rating-provider";
import { LichessRatingProvider } from "@/infrastructure/external-rating-providers/lichess-rating-provider";
import { RegisterPlayerUseCase } from "@/application/use-cases/register-player";
import { ListPlayersUseCase } from "@/application/use-cases/list-players";
import { RemovePlayerUseCase } from "@/application/use-cases/remove-player";
import { CreateTournamentUseCase } from "@/application/use-cases/create-tournament";
import { ListTournamentsUseCase } from "@/application/use-cases/list-tournaments";
import { GetTournamentUseCase } from "@/application/use-cases/get-tournament";
import { GenerateNextRoundUseCase } from "@/application/use-cases/generate-next-round";
import { SubmitRoundResultsUseCase } from "@/application/use-cases/submit-round-results";
import { SubmitPastedRoundResultsUseCase } from "@/application/use-cases/submit-pasted-round-results";
import { ImportExternalGamesFromCsvUseCase } from "@/application/use-cases/import-external-games-from-csv";
import { SyncExternalGamesUseCase } from "@/application/use-cases/sync-external-games";
import { ListExternalGamesUseCase } from "@/application/use-cases/list-external-games";

// Local file-based persistence: keeps data across server restarts and is
// trivially exportable/backed up as a plain JSON file. The project folder
// is writable locally, which is what makes the file useful as a backup/
// export, but on Vercel the deployment bundle is read-only - only /tmp is
// writable there, and it is not guaranteed to survive between invocations
// or be shared across instances. Writing to /tmp avoids crashing on Vercel,
// but data can still disappear at any time in that environment. A
// database-backed adapter (Postgres/Neon) implementing the same repository
// ports is still needed for real persistence once deployed.
const dataDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "elo-chess-planner-data")
  : path.join(process.cwd(), ".data");

const playerRepository = new JsonFilePlayerRepository(
  path.join(dataDir, "players.json"),
);
const tournamentRepository = new JsonFileTournamentRepository(
  path.join(dataDir, "tournaments.json"),
);
const externalGameRepository = new JsonFileExternalGameRepository(
  path.join(dataDir, "external-games.json"),
);

export const registerPlayerUseCase = new RegisterPlayerUseCase(playerRepository);
export const listPlayersUseCase = new ListPlayersUseCase(playerRepository);
export const removePlayerUseCase = new RemovePlayerUseCase(playerRepository);

export const createTournamentUseCase = new CreateTournamentUseCase(
  tournamentRepository,
  playerRepository,
);
export const listTournamentsUseCase = new ListTournamentsUseCase(tournamentRepository);
export const getTournamentUseCase = new GetTournamentUseCase(tournamentRepository);
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
export const listExternalGamesUseCase = new ListExternalGamesUseCase(externalGameRepository);
