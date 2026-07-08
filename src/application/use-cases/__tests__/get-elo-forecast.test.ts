import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import type { Player } from "@/domain/player/player";
import { GetEloForecastUseCase } from "../get-elo-forecast";

function aPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Riadh",
    type: "family",
    birthDate: null,
    officialRating: { value: 1500, source: "fide" },
    homeElo: null,
    externalIds: {},
    ...overrides,
  };
}

describe("GetEloForecastUseCase", () => {
  it("combines the player's profile and imported games into a forecast", async () => {
    // Given a known player with two imported games
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(aPlayer());
    const games = mock<ExternalGameRepository>();
    games.findByPlayerId.mockResolvedValue([
      {
        id: "g1",
        playerId: "p1",
        source: "chesscom",
        date: new Date("2026-01-01"),
        opponent: "Bob",
        result: "win",
        eloBefore: 1500,
        eloAfter: 1510,
        importBatchId: "batch",
      },
      {
        id: "g2",
        playerId: "p1",
        source: "chesscom",
        date: new Date("2026-01-15"),
        opponent: "Carl",
        result: "win",
        eloBefore: 1510,
        eloAfter: 1520,
        importBatchId: "batch",
      },
    ]);
    const useCase = new GetEloForecastUseCase(players, games);

    // When getting the forecast for that player
    const forecast = await useCase.execute("p1", new Date("2026-02-01"));

    // Then a statistical forecast based on their games is returned
    expect(forecast).not.toBeNull();
    expect(forecast?.basis).toBe("statistical");
    expect(forecast?.currentRating).toBe(1520);
  });

  it("returns null when the player does not exist", async () => {
    // Given a repository that cannot find the player
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(null);
    const games = mock<ExternalGameRepository>();
    const useCase = new GetEloForecastUseCase(players, games);

    // When getting the forecast for an unknown player
    const forecast = await useCase.execute("missing", new Date());

    // Then no forecast is returned
    expect(forecast).toBeNull();
  });
});
