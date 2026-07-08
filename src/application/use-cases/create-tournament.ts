import { createTournament } from "@/domain/tournament/create-tournament";
import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import type { PlayerRepository } from "@/application/ports/player-repository";

export interface CreateTournamentInput {
  name: string;
  date: Date;
  roundsPlanned: number;
  playerIds: string[];
}

export class CreateTournamentUseCase {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly players: PlayerRepository,
  ) {}

  async execute(input: CreateTournamentInput): Promise<Tournament> {
    const participants = await Promise.all(
      input.playerIds.map(async (playerId) => {
        const player = await this.players.findById(playerId);
        if (!player) {
          throw new Error(`Player not found: ${playerId}`);
        }
        return {
          playerId: player.id,
          name: player.name,
          officialRating: player.officialRating,
        };
      }),
    );

    const tournament = createTournament({
      name: input.name,
      date: input.date,
      roundsPlanned: input.roundsPlanned,
      participants,
    });

    await this.tournaments.save(tournament);
    return tournament;
  }
}
