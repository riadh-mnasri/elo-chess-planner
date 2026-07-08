import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";

export class ListExternalGamesUseCase {
  constructor(private readonly games: ExternalGameRepository) {}

  async execute(playerId: string): Promise<ExternalGameImport[]> {
    return this.games.findByPlayerId(playerId);
  }
}
