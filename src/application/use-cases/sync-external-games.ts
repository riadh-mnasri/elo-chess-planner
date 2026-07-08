import { randomUUID } from "node:crypto";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import type {
  ExternalApiSource,
  ExternalRatingProvider,
} from "@/application/ports/external-rating-provider";

export interface SyncExternalGamesInput {
  playerId: string;
  source: ExternalApiSource;
  username: string;
}

export interface SyncExternalGamesOutcome {
  importedCount: number;
}

export class SyncExternalGamesUseCase {
  constructor(
    private readonly games: ExternalGameRepository,
    private readonly providers: Record<ExternalApiSource, ExternalRatingProvider>,
  ) {}

  async execute(input: SyncExternalGamesInput): Promise<SyncExternalGamesOutcome> {
    const provider = this.providers[input.source];
    const fetched = await provider.fetchRecentGames(input.username);

    if (fetched.length === 0) {
      return { importedCount: 0 };
    }

    const importBatchId = randomUUID();
    const records: ExternalGameImport[] = fetched.map((game) => ({
      id: randomUUID(),
      playerId: input.playerId,
      source: input.source,
      date: game.date,
      opponent: game.opponent,
      result: game.result,
      eloBefore: game.eloBefore,
      eloAfter: game.eloAfter,
      importBatchId,
    }));

    await this.games.saveMany(records);
    return { importedCount: records.length };
  }
}
