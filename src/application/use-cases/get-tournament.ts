import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

export class GetTournamentUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(tournamentId: string): Promise<Tournament | null> {
    return this.tournaments.findById(tournamentId);
  }
}
