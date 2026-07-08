import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { TournamentRepository } from "@/application/ports/tournament-repository";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { Player } from "@/domain/player/player";
import { CreateTournamentUseCase } from "../create-tournament";

function aPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Riadh",
    type: "family",
    birthDate: null,
    officialRating: { value: 1522, source: "fide" },
    homeElo: null,
    externalIds: {},
    ...overrides,
  };
}

describe("CreateTournamentUseCase", () => {
  it("builds tournament participants from the given player ids and saves the tournament", async () => {
    // Given a player repository with two known players
    const tournaments = mock<TournamentRepository>();
    const players = mock<PlayerRepository>();
    players.findById.mockImplementation(async (id) =>
      id === "p1"
        ? aPlayer({ id: "p1", name: "Riadh" })
        : aPlayer({ id: "p2", name: "Sany", officialRating: { value: 1597, source: "fide" } }),
    );
    const useCase = new CreateTournamentUseCase(tournaments, players);

    // When creating a tournament with those two players
    const tournament = await useCase.execute({
      name: "Family cup",
      date: new Date("2026-08-01"),
      roundsPlanned: 3,
      playerIds: ["p1", "p2"],
    });

    // Then the tournament is built with their rating snapshots and saved
    expect(tournament.participants.map((p) => p.playerId)).toEqual(["p1", "p2"]);
    expect(tournaments.save).toHaveBeenCalledWith(tournament);
  });

  it("rejects when a given player id does not exist", async () => {
    // Given a player repository that cannot find the requested player
    const tournaments = mock<TournamentRepository>();
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(null);
    const useCase = new CreateTournamentUseCase(tournaments, players);

    // When creating a tournament referencing an unknown player id
    // Then the use case rejects and nothing is saved
    await expect(
      useCase.execute({
        name: "Family cup",
        date: new Date(),
        roundsPlanned: 3,
        playerIds: ["missing"],
      }),
    ).rejects.toThrow(/missing/);
    expect(tournaments.save).not.toHaveBeenCalled();
  });
});
