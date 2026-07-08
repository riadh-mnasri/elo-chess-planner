import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Player } from "@/domain/player/player";
import { JsonFilePlayerRepository } from "../json-file-player-repository";

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

describe("JsonFilePlayerRepository", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "elo-chess-players-"));
    filePath = path.join(dir, "players.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns an empty list when the file does not exist yet", async () => {
    // Given a repository pointing to a file that was never written
    const repository = new JsonFilePlayerRepository(filePath);

    // When listing players
    const players = await repository.findAll();

    // Then the list is empty, no error is thrown
    expect(players).toEqual([]);
  });

  it("persists a player to disk and reloads it, including the birth date", async () => {
    // Given a repository and a player with a birth date
    const repository = new JsonFilePlayerRepository(filePath);
    const player = aPlayer({ birthDate: new Date("2014-03-20T00:00:00.000Z") });

    // When saving the player and reading it back through a fresh instance
    await repository.save(player);
    const reloadedRepository = new JsonFilePlayerRepository(filePath);
    const found = await reloadedRepository.findById(player.id);

    // Then the player, including its birth date, survives the round trip
    expect(found).toEqual(player);
  });

  it("updates an existing player instead of duplicating it", async () => {
    // Given a repository with a saved player
    const repository = new JsonFilePlayerRepository(filePath);
    await repository.save(aPlayer({ name: "Léa" }));

    // When saving a player with the same id but a different name
    await repository.save(aPlayer({ name: "Léa Dupont" }));

    // Then only one player remains, with the updated name
    const players = await repository.findAll();
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe("Léa Dupont");
  });

  it("removes a player from the file", async () => {
    // Given a repository with a saved player
    const repository = new JsonFilePlayerRepository(filePath);
    const player = aPlayer();
    await repository.save(player);

    // When removing that player
    await repository.remove(player.id);

    // Then it is no longer present
    expect(await repository.findById(player.id)).toBeNull();
  });
});
