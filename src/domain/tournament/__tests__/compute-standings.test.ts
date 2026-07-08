import { describe, expect, it } from "vitest";
import type { Round, TournamentParticipant } from "../tournament";
import { computeStandings } from "../compute-standings";

function participant(id: string, name: string): TournamentParticipant {
  return { playerId: id, name, seedRating: null, seedRatingSource: "unrated" };
}

describe("computeStandings", () => {
  const participants = [
    participant("a", "Alice"),
    participant("b", "Bob"),
    participant("c", "Cid"),
  ];

  it("gives a full point for a win, half for a draw, none for a loss", () => {
    // Given a single round where Alice beats Bob and Cid has a bye
    const rounds: Round[] = [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "a", blackPlayerId: "b", result: "white" },
          { board: 2, whitePlayerId: "c", blackPlayerId: null, result: null },
        ],
      },
    ];

    // When computing standings
    const standings = computeStandings(participants, rounds);
    const byId = Object.fromEntries(standings.map((s) => [s.playerId, s]));

    // Then Alice has 1 point, Bob has 0, Cid has a full-point bye
    expect(byId.a.score).toBe(1);
    expect(byId.b.score).toBe(0);
    expect(byId.c.score).toBe(1);
    expect(byId.c.hadBye).toBe(true);
  });

  it("tracks opponents faced, color counts and the last color played", () => {
    // Given two rounds of results
    const rounds: Round[] = [
      {
        number: 1,
        pairings: [
          { board: 1, whitePlayerId: "a", blackPlayerId: "b", result: "draw" },
        ],
      },
      {
        number: 2,
        pairings: [
          { board: 1, whitePlayerId: "b", blackPlayerId: "a", result: "black" },
        ],
      },
    ];

    // When computing standings
    const standings = computeStandings(
      [participant("a", "Alice"), participant("b", "Bob")],
      rounds,
    );
    const alice = standings.find((s) => s.playerId === "a")!;

    // Then Alice faced Bob twice, played white then black, and has 1.5 points
    // (0.5 for the draw + 1 for winning as black in round 2)
    expect(alice.opponentIds).toEqual(["b", "b"]);
    expect(alice.whiteCount).toBe(1);
    expect(alice.blackCount).toBe(1);
    expect(alice.lastColor).toBe("black");
    expect(alice.score).toBe(1.5);
  });
});
