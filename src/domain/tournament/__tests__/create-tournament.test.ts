import { describe, expect, it } from "vitest";
import { createTournament } from "../create-tournament";

const participants = [
  { playerId: "p1", name: "Riadh", officialRating: { value: 1522, source: "fide" as const } },
  { playerId: "p2", name: "Seji", officialRating: { value: 1738, source: "fide" as const } },
  { playerId: "p3", name: "Sany", officialRating: { value: 1597, source: "fide" as const } },
  { playerId: "p4", name: "Syma", officialRating: { value: 1399, source: "ffe" as const } },
];

describe("createTournament", () => {
  it("creates a tournament with a seeded round 1 already generated", () => {
    // Given a valid tournament setup with four participants
    const input = {
      name: "Family cup",
      date: new Date("2026-08-01"),
      roundsPlanned: 3,
      participants,
    };

    // When creating the tournament
    const tournament = createTournament(input);

    // Then it has an id, frozen rating snapshots, and a ready round 1
    expect(tournament.id).toBeTruthy();
    expect(tournament.participants).toHaveLength(4);
    expect(tournament.participants[0]).toMatchObject({
      playerId: "p1",
      seedRating: 1522,
      seedRatingSource: "fide",
    });
    expect(tournament.rounds).toHaveLength(1);
    expect(tournament.rounds[0].pairings.length).toBeGreaterThan(0);
  });

  it("rejects a tournament with fewer than two participants", () => {
    // Given a tournament with only one participant
    const input = {
      name: "Too small",
      date: new Date(),
      roundsPlanned: 3,
      participants: [participants[0]],
    };

    // When creating the tournament
    // Then it throws a validation error
    expect(() => createTournament(input)).toThrow(/participant/i);
  });

  it("rejects a blank tournament name", () => {
    // Given a blank name
    const input = {
      name: "   ",
      date: new Date(),
      roundsPlanned: 3,
      participants,
    };

    // When creating the tournament
    // Then it throws a validation error
    expect(() => createTournament(input)).toThrow(/name/i);
  });
});
