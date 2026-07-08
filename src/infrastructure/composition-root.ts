import path from "node:path";
import { JsonFilePlayerRepository } from "@/infrastructure/repositories/json-file-player-repository";
import { RegisterPlayerUseCase } from "@/application/use-cases/register-player";
import { ListPlayersUseCase } from "@/application/use-cases/list-players";
import { RemovePlayerUseCase } from "@/application/use-cases/remove-player";

// Local file-based persistence: keeps data across server restarts and is
// trivially exportable/backed up as a plain JSON file. Works well for a
// single local instance (dev, or self-hosted at home), but is not suitable
// for a multi-instance serverless deployment (Vercel) since the filesystem
// is ephemeral and not shared between instances there. A database-backed
// adapter (Postgres/Neon) implementing the same PlayerRepository port will
// be needed before deploying to Vercel with real persistence.
const dataFilePath = path.join(process.cwd(), ".data", "players.json");
const playerRepository = new JsonFilePlayerRepository(dataFilePath);

export const registerPlayerUseCase = new RegisterPlayerUseCase(
  playerRepository,
);
export const listPlayersUseCase = new ListPlayersUseCase(playerRepository);
export const removePlayerUseCase = new RemovePlayerUseCase(playerRepository);
