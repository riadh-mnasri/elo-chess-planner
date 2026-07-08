import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Tournament } from "@/domain/tournament/tournament";
import { JsonFileTournamentRepository } from "../json-file-tournament-repository";

function aTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t1",
    name: "Family cup",
    date: new Date("2026-08-01T00:00:00.000Z"),
    roundsPlanned: 3,
    participants: [
      { playerId: "p1", name: "Riadh", seedRating: 1600, seedRatingSource: "fide" },
    ],
    rounds: [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "p1", blackPlayerId: null, result: null },
        ],
      },
    ],
    ...overrides,
  };
}

describe("JsonFileTournamentRepository", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "elo-chess-tournaments-"));
    filePath = path.join(dir, "tournaments.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("persists a tournament to disk and reloads it, including the date", async () => {
    // Given a repository and a tournament
    const repository = new JsonFileTournamentRepository(filePath);
    const tournament = aTournament();

    // When saving and reloading through a fresh instance
    await repository.save(tournament);
    const reloaded = new JsonFileTournamentRepository(filePath);
    const found = await reloaded.findById(tournament.id);

    // Then the tournament survives the round trip
    expect(found).toEqual(tournament);
  });

  it("updates an existing tournament instead of duplicating it", async () => {
    // Given a saved tournament
    const repository = new JsonFileTournamentRepository(filePath);
    await repository.save(aTournament());

    // When saving a new version with an extra round
    const updated = aTournament({
      rounds: [
        ...aTournament().rounds,
        { number: 2, pairings: [] },
      ],
    });
    await repository.save(updated);

    // Then only one tournament remains, with two rounds
    const all = await repository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].rounds).toHaveLength(2);
  });
});
