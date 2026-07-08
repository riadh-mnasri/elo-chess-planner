import {
  computeEloForecast,
  type EloForecastResult,
} from "@/domain/elo-forecast/compute-elo-forecast";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";

export class GetEloForecastUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly games: ExternalGameRepository,
  ) {}

  async execute(
    playerId: string,
    referenceDate: Date,
  ): Promise<EloForecastResult | null> {
    const player = await this.players.findById(playerId);
    if (!player) {
      return null;
    }

    const games = await this.games.findByPlayerId(playerId);

    return computeEloForecast({
      games,
      birthDate: player.birthDate,
      fallbackRating: player.officialRating.value,
      referenceDate,
    });
  }
}
