import { describe, expect, it } from "vitest";
import { createPlayer } from "../create-player";

describe("createPlayer", () => {
  it("creates a family player with a resolved official rating", () => {
    // Given a family player's name and FIDE rating
    const input = {
      name: "Riadh",
      type: "family" as const,
      birthDate: new Date("1985-04-12"),
      ratings: { fide: 1520 },
    };

    // When creating the player
    const player = createPlayer(input);

    // Then the player is built with a generated id and the resolved rating
    expect(player.id).toBeTruthy();
    expect(player.name).toBe("Riadh");
    expect(player.type).toBe("family");
    expect(player.officialRating).toEqual({ value: 1520, source: "fide" });
    expect(player.homeElo).toBeNull();
  });

  it("creates an unrated guest player without a birth date", () => {
    // Given a guest with no rating and no birth date
    const input = {
      name: "Cousin Max",
      type: "guest" as const,
      ratings: {},
    };

    // When creating the player
    const player = createPlayer(input);

    // Then the player is unrated and has no birth date
    expect(player.officialRating).toEqual({ value: null, source: "unrated" });
    expect(player.birthDate).toBeNull();
  });

  it("rejects a player with a blank name", () => {
    // Given a player name that is only whitespace
    const input = { name: "   ", type: "guest" as const, ratings: {} };

    // When creating the player
    // Then it throws a validation error
    expect(() => createPlayer(input)).toThrow(/name/i);
  });
});
