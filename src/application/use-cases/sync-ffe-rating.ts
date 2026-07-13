import type { PlayerRepository } from "@/application/ports/player-repository";
import type { FfePlayerRatingProvider } from "@/application/ports/ffe-player-rating-provider";
import type { RatingSource } from "@/domain/player/rating";

export interface SyncFfeRatingOutcome {
  rating: number;
  source: RatingSource;
  nrFfe: string;
}

// Refreshes a player's official rating from the FFE member registry. The
// registry is authoritative for French players, so the fetched Elo replaces
// whatever was entered manually, and the FFE license number is remembered.
export class SyncFfeRatingUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly provider: FfePlayerRatingProvider,
  ) {}

  async execute(playerId: string): Promise<SyncFfeRatingOutcome> {
    const player = await this.players.findById(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const fetched = await this.provider.fetchPlayerRating(player.name);
    await this.players.save({
      ...player,
      officialRating: { value: fetched.elo, source: fetched.source },
      externalIds: { ...player.externalIds, ffe: fetched.nrFfe },
    });

    return { rating: fetched.elo, source: fetched.source, nrFfe: fetched.nrFfe };
  }
}
