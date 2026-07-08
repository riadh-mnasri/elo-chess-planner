import { describe, expect, it } from "vitest";
import type { Round, TournamentParticipant } from "../tournament";
import { applyParsedResultsToRound } from "../apply-parsed-results-to-round";

const participants: TournamentParticipant[] = [
  { playerId: "p1", name: "Riadh", seedRating: null, seedRatingSource: "unrated" },
  { playerId: "p2", name: "Sany", seedRating: null, seedRatingSource: "unrated" },
  { playerId: "p3", name: "Syma", seedRating: null, seedRatingSource: "unrated" },
];

describe("applyParsedResultsToRound", () => {
  it("matches parsed results to pairings by player name, case-insensitively", () => {
    // Given a round with one pairing and one bye
    const round: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: null },
        { board: 2, whitePlayerId: "p3", blackPlayerId: null, result: null },
      ],
    };

    // When applying a parsed result matching by name in a different case
    const outcome = applyParsedResultsToRound(
      round,
      [{ whiteName: "riadh", blackName: "SANY", result: "white" }],
      participants,
    );

    // Then the pairing is updated and the bye is left untouched
    expect(outcome.errors).toEqual([]);
    expect(outcome.round?.pairings[0].result).toBe("white");
    expect(outcome.round?.pairings[1].result).toBeNull();
  });

  it("reports an error when a pairing has no matching parsed result", () => {
    // Given a round with one unresolved pairing
    const round: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: null },
      ],
    };

    // When applying an empty set of parsed results
    const outcome = applyParsedResultsToRound(round, [], participants);

    // Then an error naming the missing pairing is reported and nothing is updated
    expect(outcome.errors).toHaveLength(1);
    expect(outcome.errors[0]).toMatch(/Riadh/);
    expect(outcome.errors[0]).toMatch(/Sany/);
    expect(outcome.round).toBeUndefined();
  });
});
