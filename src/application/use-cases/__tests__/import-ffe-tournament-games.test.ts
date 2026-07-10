import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { FfeTournamentProvider } from "@/application/ports/ffe-tournament-provider";
import type { Player } from "@/domain/player/player";
import { ImportFfeTournamentGamesUseCase } from "../import-ffe-tournament-games";

function aPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Seji MNASRI",
    type: "family",
    birthDate: null,
    officialRating: { value: 1738, source: "fide" },
    homeElo: null,
    externalIds: {},
    ...overrides,
  };
}

describe("ImportFfeTournamentGamesUseCase", () => {
  it("fetches a player's tournament games and saves them tagged as source ffe", async () => {
    // Given a player and a provider returning two games for a tournament
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(aPlayer());
    const games = mock<ExternalGameRepository>();
    const provider = mock<FfeTournamentProvider>();
    provider.fetchTournamentGames.mockResolvedValue([
      {
        date: new Date("2026-07-04"),
        opponent: "DUPONT Jean",
        result: "win",
        eloBefore: 1738,
        eloAfter: 1748,
      },
      {
        date: new Date("2026-07-05"),
        opponent: "MARTIN Alice",
        result: "draw",
        eloBefore: 1748,
        eloAfter: 1750,
      },
    ]);
    const useCase = new ImportFfeTournamentGamesUseCase(games, players, provider);

    // When importing games for that player from a tournament URL
    const outcome = await useCase.execute({
      playerId: "p1",
      tournamentUrl: "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
      playerName: "MNASRI Seji",
    });

    // Then both games are saved tagged with the player and the ffe source
    expect(outcome.importedCount).toBe(2);
    expect(provider.fetchTournamentGames).toHaveBeenCalledWith(
      "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
      "MNASRI Seji",
      null,
    );
    expect(games.saveMany).toHaveBeenCalledWith([
      expect.objectContaining({
        playerId: "p1",
        source: "ffe",
        opponent: "DUPONT Jean",
        eloAfter: 1748,
      }),
      expect.objectContaining({
        playerId: "p1",
        source: "ffe",
        opponent: "MARTIN Alice",
        eloAfter: 1750,
      }),
    ]);
  });

  it("throws when the player does not exist", async () => {
    // Given no matching player
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(null);
    const games = mock<ExternalGameRepository>();
    const provider = mock<FfeTournamentProvider>();
    const useCase = new ImportFfeTournamentGamesUseCase(games, players, provider);

    // When / Then importing rejects instead of calling the provider
    await expect(
      useCase.execute({
        playerId: "missing",
        tournamentUrl: "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
        playerName: "MNASRI Seji",
      }),
    ).rejects.toThrow("Player not found");
    expect(provider.fetchTournamentGames).not.toHaveBeenCalled();
  });

  it("does not save anything when the provider returns no games", async () => {
    // Given a provider that finds no games
    const players = mock<PlayerRepository>();
    players.findById.mockResolvedValue(aPlayer());
    const games = mock<ExternalGameRepository>();
    const provider = mock<FfeTournamentProvider>();
    provider.fetchTournamentGames.mockResolvedValue([]);
    const useCase = new ImportFfeTournamentGamesUseCase(games, players, provider);

    // When importing
    const outcome = await useCase.execute({
      playerId: "p1",
      tournamentUrl: "https://www.echecs.asso.fr/FicheTournoi.aspx?Ref=70274",
      playerName: "MNASRI Seji",
    });

    // Then nothing is saved
    expect(outcome.importedCount).toBe(0);
    expect(games.saveMany).not.toHaveBeenCalled();
  });
});
