import { describe, expect, it } from "vitest";
import type { Round, TournamentParticipant } from "../tournament";
import { generatePairings } from "../generate-pairings";

function participant(
  id: string,
  rating: number | null,
): TournamentParticipant {
  return {
    playerId: id,
    name: id,
    seedRating: rating,
    seedRatingSource: rating === null ? "unrated" : "fide",
  };
}

describe("generatePairings", () => {
  it("splits four same-score players into top half vs bottom half for round 1", () => {
    // Given four players ranked p1 > p2 > p3 > p4 with no rounds played yet
    const participants = [
      participant("p1", 2000),
      participant("p2", 1800),
      participant("p3", 1600),
      participant("p4", 1400),
    ];

    // When generating the first round
    const pairings = generatePairings(participants, []);

    // Then the top half is paired against the bottom half, board order by rank
    expect(pairings).toEqual([
      { board: 1, whitePlayerId: "p1", blackPlayerId: "p3", result: null },
      { board: 2, whitePlayerId: "p2", blackPlayerId: "p4", result: null },
    ]);
  });

  it("gives the lowest-ranked player a bye when the field is odd", () => {
    // Given five players with no rounds played yet
    const participants = [
      participant("p1", 2000),
      participant("p2", 1800),
      participant("p3", 1600),
      participant("p4", 1400),
      participant("p5", 1200),
    ];

    // When generating the first round
    const pairings = generatePairings(participants, []);

    // Then p5 (lowest ranked) gets the bye and the other four are split-paired
    const bye = pairings.find((p) => p.blackPlayerId === null);
    expect(bye?.whitePlayerId).toBe("p5");
    expect(pairings).toHaveLength(3);
    expect(pairings.filter((p) => p.blackPlayerId !== null)).toEqual([
      { board: 1, whitePlayerId: "p1", blackPlayerId: "p3", result: null },
      { board: 2, whitePlayerId: "p2", blackPlayerId: "p4", result: null },
    ]);
  });

  it("regroups players by score for round 2, avoiding a repeat of round 1", () => {
    // Given four players who just finished round 1 (p1 beat p3, p4 beat p2)
    const participants = [
      participant("p1", 2000),
      participant("p2", 1800),
      participant("p3", 1600),
      participant("p4", 1400),
    ];
    const round1: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p3", result: "white" },
        { board: 2, whitePlayerId: "p2", blackPlayerId: "p4", result: "black" },
      ],
    };

    // When generating round 2
    const pairings = generatePairings(participants, [round1]);

    // Then the two winners (p1, p4) are paired together, and the two losers
    // (p2, p3) are paired together - nobody repeats their round 1 opponent
    const boards = pairings.map((p) => [p.whitePlayerId, p.blackPlayerId].sort());
    expect(boards).toContainEqual(["p1", "p4"].sort());
    expect(boards).toContainEqual(["p2", "p3"].sort());
  });

  it("allows a repeat pairing as a last resort when no alternative exists", () => {
    // Given two players who already played each other in round 1
    const participants = [participant("p1", 2000), participant("p2", 1800)];
    const round1: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: "draw" },
      ],
    };

    // When generating round 2, the only possible pairing is a repeat
    const pairings = generatePairings(participants, [round1]);

    // Then it still produces a valid pairing instead of failing
    expect(pairings).toHaveLength(1);
    expect([pairings[0].whitePlayerId, pairings[0].blackPlayerId].sort()).toEqual(
      ["p1", "p2"],
    );
  });
});
