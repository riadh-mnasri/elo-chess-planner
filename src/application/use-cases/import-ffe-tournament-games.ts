import { randomUUID } from "node:crypto";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { FfeTournamentProvider } from "@/application/ports/ffe-tournament-provider";
import { computeAge } from "@/domain/elo-forecast/compute-age";

export interface ImportFfeTournamentGamesInput {
  playerId: string;
  tournamentUrl: string;
  playerName: string;
}

export interface ImportFfeTournamentGamesOutcome {
  importedCount: number;
}

export class ImportFfeTournamentGamesUseCase {
  constructor(
    private readonly games: ExternalGameRepository,
    private readonly players: PlayerRepository,
    private readonly provider: FfeTournamentProvider,
  ) {}

  async execute(
    input: ImportFfeTournamentGamesInput,
  ): Promise<ImportFfeTournamentGamesOutcome> {
    const player = await this.players.findById(input.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const age = computeAge(player.birthDate, new Date());
    const fetched = await this.provider.fetchTournamentGames(
      input.tournamentUrl,
      input.playerName,
      age,
    );

    if (fetched.length === 0) {
      return { importedCount: 0 };
    }

    const importBatchId = randomUUID();
    const records: ExternalGameImport[] = fetched.map((game) => ({
      id: randomUUID(),
      playerId: input.playerId,
      source: "ffe",
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
