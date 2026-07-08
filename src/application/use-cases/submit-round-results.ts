import type { GameResult, Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

export interface SubmitRoundResultsInput {
  tournamentId: string;
  roundNumber: number;
  results: { board: number; result: GameResult }[];
}

export class SubmitRoundResultsUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(input: SubmitRoundResultsInput): Promise<Tournament> {
    const tournament = await this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      throw new Error(`Tournament not found: ${input.tournamentId}`);
    }

    const resultByBoard = new Map(input.results.map((r) => [r.board, r.result]));

    const updatedTournament: Tournament = {
      ...tournament,
      rounds: tournament.rounds.map((round) => {
        if (round.number !== input.roundNumber) return round;
        return {
          ...round,
          pairings: round.pairings.map((pairing) => {
            const result = resultByBoard.get(pairing.board);
            return result !== undefined ? { ...pairing, result } : pairing;
          }),
        };
      }),
    };

    await this.tournaments.save(updatedTournament);
    return updatedTournament;
  }
}
