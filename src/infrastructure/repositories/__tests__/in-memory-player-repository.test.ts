import { describe, expect, it } from "vitest";
import type { Player } from "@/domain/player/player";
import { InMemoryPlayerRepository } from "../in-memory-player-repository";

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

describe("InMemoryPlayerRepository", () => {
  it("stores and retrieves a player by id", async () => {
    // Given an empty repository and a player
    const repository = new InMemoryPlayerRepository();
    const player = aPlayer();

    // When saving the player and looking it up by id
    await repository.save(player);
    const found = await repository.findById(player.id);

    // Then the same player is returned
    expect(found).toEqual(player);
  });

  it("returns null when the player does not exist", async () => {
    // Given an empty repository
    const repository = new InMemoryPlayerRepository();

    // When looking up an unknown id
    const found = await repository.findById("missing");

    // Then no player is returned
    expect(found).toBeNull();
  });

  it("lists every saved player", async () => {
    // Given a repository with two saved players
    const repository = new InMemoryPlayerRepository();
    await repository.save(aPlayer({ id: "p1" }));
    await repository.save(aPlayer({ id: "p2", name: "Sany" }));

    // When listing all players
    const players = await repository.findAll();

    // Then both players are returned
    expect(players.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("removes a player by id", async () => {
    // Given a repository with a saved player
    const repository = new InMemoryPlayerRepository();
    const player = aPlayer();
    await repository.save(player);

    // When removing that player
    await repository.remove(player.id);

    // Then it is no longer found
    expect(await repository.findById(player.id)).toBeNull();
  });
});
