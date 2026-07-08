import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import { ListExternalGamesUseCase } from "../list-external-games";

describe("ListExternalGamesUseCase", () => {
  it("returns the games imported for the given player", async () => {
    // Given a repository with games for a player
    const repository = mock<ExternalGameRepository>();
    repository.findByPlayerId.mockResolvedValue([
      {
        id: "g1",
        playerId: "p1",
        source: "chesscom",
        date: new Date("2026-06-01"),
        opponent: "Bob",
        result: "win",
        eloBefore: 1200,
        eloAfter: 1212,
        importBatchId: "batch1",
      },
    ]);
    const useCase = new ListExternalGamesUseCase(repository);

    // When listing games for that player
    const games = await useCase.execute("p1");

    // Then the repository's games for that player are returned
    expect(games).toHaveLength(1);
    expect(repository.findByPlayerId).toHaveBeenCalledWith("p1");
  });
});
