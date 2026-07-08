import { generatePairings } from "@/domain/tournament/generate-pairings";
import { isRoundComplete } from "@/domain/tournament/round-completion";
import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

export class GenerateNextRoundUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(tournamentId: string): Promise<Tournament> {
    const tournament = await this.tournaments.findById(tournamentId);
    if (!tournament) {
      throw new Error(`Tournament not found: ${tournamentId}`);
    }

    const lastRound = tournament.rounds[tournament.rounds.length - 1];
    if (!isRoundComplete(lastRound)) {
      throw new Error("The current round is not complete yet");
    }
    if (tournament.rounds.length >= tournament.roundsPlanned) {
      throw new Error("This tournament has already reached its planned number of rounds");
    }

    const pairings = generatePairings(tournament.participants, tournament.rounds);
    const updatedTournament: Tournament = {
      ...tournament,
      rounds: [
        ...tournament.rounds,
        { number: lastRound.number + 1, pairings },
      ],
    };

    await this.tournaments.save(updatedTournament);
    return updatedTournament;
  }
}
