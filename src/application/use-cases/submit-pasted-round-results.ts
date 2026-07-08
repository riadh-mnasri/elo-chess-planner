import { parsePastedResults } from "@/domain/tournament/parse-pasted-results";
import { applyParsedResultsToRound } from "@/domain/tournament/apply-parsed-results-to-round";
import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

export interface SubmitPastedRoundResultsInput {
  tournamentId: string;
  roundNumber: number;
  text: string;
}

export interface SubmitPastedRoundResultsOutcome {
  tournament?: Tournament;
  errors: string[];
}

export class SubmitPastedRoundResultsUseCase {
  constructor(private readonly tournaments: TournamentRepository) {}

  async execute(
    input: SubmitPastedRoundResultsInput,
  ): Promise<SubmitPastedRoundResultsOutcome> {
    const tournament = await this.tournaments.findById(input.tournamentId);
    if (!tournament) {
      return { errors: [`Tournament not found: ${input.tournamentId}`] };
    }

    const round = tournament.rounds.find((r) => r.number === input.roundNumber);
    if (!round) {
      return { errors: [`Round not found: ${input.roundNumber}`] };
    }

    const { parsed, failures } = parsePastedResults(input.text);
    if (failures.length > 0) {
      return {
        errors: failures.map((f) => `Unrecognized line: "${f.line}"`),
      };
    }

    const applied = applyParsedResultsToRound(round, parsed, tournament.participants);
    if (applied.errors.length > 0) {
      return { errors: applied.errors };
    }

    const updatedTournament: Tournament = {
      ...tournament,
      rounds: tournament.rounds.map((r) =>
        r.number === input.roundNumber ? applied.round! : r,
      ),
    };

    await this.tournaments.save(updatedTournament);
    return { tournament: updatedTournament, errors: [] };
  }
}
