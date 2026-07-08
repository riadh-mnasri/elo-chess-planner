import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

export class ListTournamentsUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(): Promise<Tournament[]> {
    return this.tournaments.findAll();
  }
}
