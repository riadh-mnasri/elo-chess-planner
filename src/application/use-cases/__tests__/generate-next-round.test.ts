import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import type { Tournament } from "@/domain/tournament/tournament";
import { GenerateNextRoundUseCase } from "../generate-next-round";

function aTournament(overrides: Partial<Tournament> = {}): Tournament {
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
          { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: "white" },
        ],
      },
    ],
    ...overrides,
  };
}

describe("GenerateNextRoundUseCase", () => {
  it("appends a new round when the current one is complete and rounds remain", async () => {
    // Given a tournament with a finished round 1 and more rounds planned
    const tournaments = mock<TournamentRepository>();
    tournaments.findById.mockResolvedValue(aTournament());
    const useCase = new GenerateNextRoundUseCase(tournaments);

    // When generating the next round
    const tournament = await useCase.execute("t1");

    // Then a second round is appended and the tournament is saved
    expect(tournament.rounds).toHaveLength(2);
    expect(tournament.rounds[1].number).toBe(2);
    expect(tournaments.save).toHaveBeenCalledWith(tournament);
  });

  it("rejects when the current round still has unresolved pairings", async () => {
    // Given a tournament whose round 1 result is not recorded yet
    const tournaments = mock<TournamentRepository>();
    tournaments.findById.mockResolvedValue(
      aTournament({
        rounds: [
          {
            number: 1,
            pairings: [
              { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: null },
            ],
          },
        ],
      }),
    );
    const useCase = new GenerateNextRoundUseCase(tournaments);

    // When generating the next round
    // Then it rejects and nothing is saved
    await expect(useCase.execute("t1")).rejects.toThrow(/complete/i);
    expect(tournaments.save).not.toHaveBeenCalled();
  });

  it("rejects when the tournament already reached its planned number of rounds", async () => {
    // Given a tournament that has already played its only planned round
    const tournaments = mock<TournamentRepository>();
    tournaments.findById.mockResolvedValue(aTournament({ roundsPlanned: 1 }));
    const useCase = new GenerateNextRoundUseCase(tournaments);

    // When generating the next round
    // Then it rejects and nothing is saved
    await expect(useCase.execute("t1")).rejects.toThrow(/planned/i);
    expect(tournaments.save).not.toHaveBeenCalled();
  });
});
