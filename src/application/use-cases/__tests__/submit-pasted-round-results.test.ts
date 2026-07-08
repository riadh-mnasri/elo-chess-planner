import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import type { Tournament } from "@/domain/tournament/tournament";
import { SubmitPastedRoundResultsUseCase } from "../submit-pasted-round-results";

function aTournament(): Tournament {
  return {
    id: "t1",
    name: "Family cup",
    date: new Date("2026-08-01"),
    roundsPlanned: 3,
    participants: [
      { playerId: "p1", name: "Riadh", seedRating: 1600, seedRatingSource: "fide" },
      { playerId: "p2", name: "Sany", seedRating: 1500, seedRatingSource: "fide" },
    ],
    rounds: [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: null },
        ],
      },
    ],
  };
}

describe("SubmitPastedRoundResultsUseCase", () => {
  it("parses the pasted text, applies it to the round and saves the tournament", async () => {
    // Given a tournament with an unresolved round 1 pairing
    const tournaments = mock<TournamentRepository>();
    tournaments.findById.mockResolvedValue(aTournament());
    const useCase = new SubmitPastedRoundResultsUseCase(tournaments);

    // When submitting the pasted result for that pairing
    const outcome = await useCase.execute({
      tournamentId: "t1",
      roundNumber: 1,
      text: "Riadh - Sany: 1-0",
    });

    // Then the round is updated and saved with no errors
    expect(outcome.errors).toEqual([]);
    expect(outcome.tournament?.rounds[0].pairings[0].result).toBe("white");
    expect(tournaments.save).toHaveBeenCalled();
  });

  it("reports errors and does not save when the pasted text is invalid", async () => {
    // Given the same tournament
    const tournaments = mock<TournamentRepository>();
    tournaments.findById.mockResolvedValue(aTournament());
    const useCase = new SubmitPastedRoundResultsUseCase(tournaments);

    // When submitting unparsable text
    const outcome = await useCase.execute({
      tournamentId: "t1",
      roundNumber: 1,
      text: "not a valid line",
    });

    // Then errors are reported and nothing is saved
    expect(outcome.errors.length).toBeGreaterThan(0);
    expect(tournaments.save).not.toHaveBeenCalled();
  });
});
