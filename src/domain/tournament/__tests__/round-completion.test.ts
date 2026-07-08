import { describe, expect, it } from "vitest";
import type { Round } from "../tournament";
import { isRoundComplete } from "../round-completion";

describe("isRoundComplete", () => {
  it("is complete when every real pairing has a result and byes are ignored", () => {
    // Given a round with one finished pairing and one bye
    const round: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: "white" },
        { board: 2, whitePlayerId: "p3", blackPlayerId: null, result: null },
      ],
    };

    // When checking completion
    // Then the round is complete
    expect(isRoundComplete(round)).toBe(true);
  });

  it("is not complete when a pairing has no result yet", () => {
    // Given a round with one pending pairing
    const round: Round = {
      number: 1,
      pairings: [
        { board: 1, whitePlayerId: "p1", blackPlayerId: "p2", result: null },
      ],
    };

    // When checking completion
    // Then the round is not complete
    expect(isRoundComplete(round)).toBe(false);
  });
});
