import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import type { ExternalRatingProvider } from "@/application/ports/external-rating-provider";
import { SyncExternalGamesUseCase } from "../sync-external-games";

describe("SyncExternalGamesUseCase", () => {
  it("fetches games from the chosen provider and saves them tagged with the source and player", async () => {
    // Given a chess.com provider mock returning one game
    const games = mock<ExternalGameRepository>();
    const chesscomProvider = mock<ExternalRatingProvider>();
    chesscomProvider.fetchRecentGames.mockResolvedValue([
      {
        date: new Date("2026-06-01"),
        opponent: "Bob",
        result: "win",
        eloBefore: 1200,
        eloAfter: 1212,
      },
    ]);
    const lichessProvider = mock<ExternalRatingProvider>();
    const useCase = new SyncExternalGamesUseCase(games, {
      chesscom: chesscomProvider,
      lichess: lichessProvider,
    });

    // When syncing chess.com games for a player
    const outcome = await useCase.execute({
      playerId: "p1",
      source: "chesscom",
      username: "riadhm",
    });

    // Then the fetched game is saved tagged with the player and source
    expect(outcome.importedCount).toBe(1);
    expect(chesscomProvider.fetchRecentGames).toHaveBeenCalledWith("riadhm");
    expect(lichessProvider.fetchRecentGames).not.toHaveBeenCalled();
    expect(games.saveMany).toHaveBeenCalledWith([
      expect.objectContaining({
        playerId: "p1",
        source: "chesscom",
        opponent: "Bob",
        eloAfter: 1212,
      }),
    ]);
  });

  it("does not call the repository when no games are fetched", async () => {
    // Given a provider returning no games
    const games = mock<ExternalGameRepository>();
    const chesscomProvider = mock<ExternalRatingProvider>();
    chesscomProvider.fetchRecentGames.mockResolvedValue([]);
    const useCase = new SyncExternalGamesUseCase(games, {
      chesscom: chesscomProvider,
      lichess: mock<ExternalRatingProvider>(),
    });

    // When syncing
    const outcome = await useCase.execute({
      playerId: "p1",
      source: "chesscom",
      username: "riadhm",
    });

    // Then nothing is saved
    expect(outcome.importedCount).toBe(0);
    expect(games.saveMany).not.toHaveBeenCalled();
  });
});
