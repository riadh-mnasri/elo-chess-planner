import { describe, expect, it } from "vitest";
import type { TournamentParticipant } from "../tournament";
import { rankParticipants } from "../rank-participants";

function participant(
  overrides: Partial<TournamentParticipant>,
): TournamentParticipant {
  return {
    playerId: overrides.name ?? "id",
    name: "Player",
    seedRating: null,
    seedRatingSource: "unrated",
    ...overrides,
  };
}

describe("rankParticipants", () => {
  it("orders rated players by seed rating, highest first", () => {
    // Given three rated players in random order
    const participants = [
      participant({ playerId: "a", name: "Sany", seedRating: 1597, seedRatingSource: "fide" }),
      participant({ playerId: "b", name: "Seji", seedRating: 1738, seedRatingSource: "fide" }),
      participant({ playerId: "c", name: "Riadh", seedRating: 1522, seedRatingSource: "fide" }),
    ];

    // When ranking them
    const ranked = rankParticipants(participants);

    // Then they are sorted by rating descending
    expect(ranked.map((p) => p.playerId)).toEqual(["b", "a", "c"]);
  });

  it("places unrated players below every rated player, alphabetically among themselves", () => {
    // Given a mix of rated and unrated players
    const participants = [
      participant({ playerId: "guest-z", name: "Zoe", seedRating: null, seedRatingSource: "unrated" }),
      participant({ playerId: "rated", name: "Riadh", seedRating: 1522, seedRatingSource: "fide" }),
      participant({ playerId: "guest-a", name: "Alice", seedRating: null, seedRatingSource: "unrated" }),
    ];

    // When ranking them
    const ranked = rankParticipants(participants);

    // Then the rated player comes first, then unrated players alphabetically
    expect(ranked.map((p) => p.playerId)).toEqual(["rated", "guest-a", "guest-z"]);
  });
});
