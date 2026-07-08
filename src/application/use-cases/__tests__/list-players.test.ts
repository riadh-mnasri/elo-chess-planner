import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { PlayerRepository } from "@/application/ports/player-repository";
import type { Player } from "@/domain/player/player";
import { ListPlayersUseCase } from "../list-players";

function aPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Léa",
    type: "family",
    birthDate: null,
    officialRating: { value: null, source: "unrated" },
    homeElo: null,
    externalIds: {},
    ...overrides,
  };
}

describe("ListPlayersUseCase", () => {
  it("returns every player from the repository", async () => {
    // Given a repository containing two players
    const repository = mock<PlayerRepository>();
    repository.findAll.mockResolvedValue([
      aPlayer({ id: "p1" }),
      aPlayer({ id: "p2", name: "Sany" }),
    ]);
    const useCase = new ListPlayersUseCase(repository);

    // When listing the players
    const players = await useCase.execute();

    // Then all stored players are returned
    expect(players).toHaveLength(2);
    expect(players.map((p) => p.id)).toEqual(["p1", "p2"]);
  });
});
