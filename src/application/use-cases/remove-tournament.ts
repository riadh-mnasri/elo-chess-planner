import type { TournamentRepository } from "@/application/ports/tournament-repository";

export class RemoveTournamentUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(tournamentId: string): Promise<void> {
    await this.tournaments.remove(tournamentId);
  }
}
