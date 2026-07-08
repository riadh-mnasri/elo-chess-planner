import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import { JsonFileExternalGameRepository } from "../json-file-external-game-repository";

function aGame(overrides: Partial<ExternalGameImport> = {}): ExternalGameImport {
  return {
    id: "g1",
    playerId: "p1",
    source: "chesscom",
    date: new Date("2026-06-01T00:00:00.000Z"),
    opponent: "Bob",
    result: "win",
    eloBefore: 1200,
    eloAfter: 1212,
    importBatchId: "batch1",
    ...overrides,
  };
}

describe("JsonFileExternalGameRepository", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "elo-chess-external-games-"));
    filePath = path.join(dir, "external-games.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("appends saved games and reloads them for the right player only", async () => {
    // Given a repository and games for two different players
    const repository = new JsonFileExternalGameRepository(filePath);
    await repository.saveMany([aGame({ id: "g1", playerId: "p1" })]);
    await repository.saveMany([aGame({ id: "g2", playerId: "p2" })]);

    // When reloading through a fresh instance and finding by player
    const reloaded = new JsonFileExternalGameRepository(filePath);
    const p1Games = await reloaded.findByPlayerId("p1");

    // Then only p1's game is returned
    expect(p1Games).toHaveLength(1);
    expect(p1Games[0].id).toBe("g1");
  });
});
