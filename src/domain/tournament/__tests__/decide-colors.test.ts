import { describe, expect, it } from "vitest";
import type { PlayerStanding } from "../compute-standings";
import { decideColors } from "../decide-colors";

function standing(overrides: Partial<PlayerStanding>): PlayerStanding {
  return {
    playerId: "id",
    score: 0,
    opponentIds: [],
    whiteCount: 0,
    blackCount: 0,
    lastColor: null,
    hadBye: false,
    ...overrides,
  };
}

describe("decideColors", () => {
  it("gives the higher-ranked player white when neither has a color history", () => {
    // Given two players who have not played yet
    const higher = standing({ playerId: "top" });
    const lower = standing({ playerId: "bottom" });

    // When deciding colors
    const colors = decideColors(higher, lower);

    // Then the higher-ranked player gets white by convention
    expect(colors).toEqual({ whitePlayerId: "top", blackPlayerId: "bottom" });
  });

  it("gives each player the color they are owed to balance their color count", () => {
    // Given a higher-ranked player who has played white once more than black
    const higher = standing({ playerId: "top", whiteCount: 2, blackCount: 1 });
    const lower = standing({ playerId: "bottom" });

    // When deciding colors
    const colors = decideColors(higher, lower);

    // Then the higher-ranked player is owed black
    expect(colors).toEqual({ whitePlayerId: "bottom", blackPlayerId: "top" });
  });

  it("prefers the color opposite to the last one played when counts are balanced", () => {
    // Given a higher-ranked player with balanced counts who played white last
    const higher = standing({
      playerId: "top",
      whiteCount: 1,
      blackCount: 1,
      lastColor: "white",
    });
    const lower = standing({ playerId: "bottom" });

    // When deciding colors
    const colors = decideColors(higher, lower);

    // Then the higher-ranked player alternates to black
    expect(colors).toEqual({ whitePlayerId: "bottom", blackPlayerId: "top" });
  });

  it("gives the higher-ranked player their preference when both want the same color", () => {
    // Given both players owed white
    const higher = standing({ playerId: "top", whiteCount: 0, blackCount: 1 });
    const lower = standing({ playerId: "bottom", whiteCount: 0, blackCount: 1 });

    // When deciding colors
    const colors = decideColors(higher, lower);

    // Then the higher-ranked player gets the shared preference
    expect(colors).toEqual({ whitePlayerId: "top", blackPlayerId: "bottom" });
  });
});
