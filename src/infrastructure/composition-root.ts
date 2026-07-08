import { InMemoryPlayerRepository } from "@/infrastructure/repositories/in-memory-player-repository";
import { RegisterPlayerUseCase } from "@/application/use-cases/register-player";
import { ListPlayersUseCase } from "@/application/use-cases/list-players";
import { RemovePlayerUseCase } from "@/application/use-cases/remove-player";

// Temporary process-wide singleton repository. It satisfies the
// PlayerRepository port and lets the app run end to end locally without any
// external service, but it does not survive a server restart or work across
// multiple server instances. It must be replaced by a persistent adapter
// (Postgres/Neon) before relying on multi-device usage in production.
const playerRepository = new InMemoryPlayerRepository();

export const registerPlayerUseCase = new RegisterPlayerUseCase(
  playerRepository,
);
export const listPlayersUseCase = new ListPlayersUseCase(playerRepository);
export const removePlayerUseCase = new RemovePlayerUseCase(playerRepository);
