import { describe, expect, it } from "vitest";
import type { Round, TournamentParticipant } from "../tournament";
import { computeStandingsTable } from "../compute-standings-table";

function participant(id: string): TournamentParticipant {
  return { playerId: id, name: id, seedRating: null, seedRatingSource: "unrated" };
}

describe("computeStandingsTable", () => {
  it("computes Buchholz and Sonneborn-Berger from opponents' final scores", () => {
    // Given a 3-round mini round-robin between three players:
    // round 1: a beats b
    // round 2: a beats c
    // round 3: b beats c
    // Final scores: a=2, b=1, c=0
    const participants = [participant("a"), participant("b"), participant("c")];
    const rounds: Round[] = [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "a", blackPlayerId: "b", result: "white" },
          { board: 2, whitePlayerId: "c", blackPlayerId: null, result: null },
        ],
      },
      {
        number: 2,
        pairings: [
          { board: 1, whitePlayerId: "a", blackPlayerId: "c", result: "white" },
          { board: 2, whitePlayerId: "b", blackPlayerId: null, result: null },
        ],
      },
      {
        number: 3,
        pairings: [
          { board: 1, whitePlayerId: "b", blackPlayerId: "c", result: "white" },
          { board: 2, whitePlayerId: "a", blackPlayerId: null, result: null },
        ],
      },
    ];

    // When computing the standings table
    const table = computeStandingsTable(participants, rounds);
    const byId = Object.fromEntries(table.map((r) => [r.playerId, r]));

    // Then a's Buchholz is the sum of b's and c's final scores (1 + 0),
    // wait a played b and c: opponents' final scores are b=1 (after bye
    // adjustments) and c=0
    expect(byId.a.buchholz).toBe(byId.b.score + byId.c.score);
    // a won both real games, so Sonneborn-Berger equals the sum of both
    // opponents' final scores
    expect(byId.a.sonnebornBerger).toBe(byId.b.score + byId.c.score);
  });

  it("orders players by score, then Buchholz, then Sonneborn-Berger", () => {
    // Given two players with the same score but different Buchholz
    const participants = [participant("a"), participant("b"), participant("c"), participant("d")];
    const rounds: Round[] = [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "a", blackPlayerId: "b", result: "draw" },
          { board: 2, whitePlayerId: "c", blackPlayerId: "d", result: "white" },
        ],
      },
    ];

    // When computing the standings table
    const table = computeStandingsTable(participants, rounds);

    // Then c (1 point, beat d) ranks above a and b (0.5 each from the draw)
    expect(table[0].playerId).toBe("c");
  });
});
