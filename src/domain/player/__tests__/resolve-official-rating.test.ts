import { describe, expect, it } from "vitest";
import { resolveOfficialRating } from "../resolve-official-rating";

describe("resolveOfficialRating", () => {
  it("prefers the FIDE rating when it is available", () => {
    // Given a player with FIDE, FFE and chess.com ratings
    const candidates = { fide: 1520, ffe: 1480, chesscom: 1600 };

    // When resolving the official rating
    const rating = resolveOfficialRating(candidates);

    // Then the FIDE rating wins
    expect(rating).toEqual({ value: 1520, source: "fide" });
  });

  it("falls back to the FFE rating when no FIDE rating is available", () => {
    // Given a player with only FFE and chess.com ratings
    const candidates = { ffe: 1480, chesscom: 1600 };

    // When resolving the official rating
    const rating = resolveOfficialRating(candidates);

    // Then the FFE rating wins
    expect(rating).toEqual({ value: 1480, source: "ffe" });
  });

  it("falls back to the chess.com rating when neither FIDE nor FFE is available", () => {
    // Given a player with only a chess.com rating
    const candidates = { chesscom: 1600 };

    // When resolving the official rating
    const rating = resolveOfficialRating(candidates);

    // Then the chess.com rating wins
    expect(rating).toEqual({ value: 1600, source: "chesscom" });
  });

  it("marks the player as unrated when no rating source is available", () => {
    // Given a player with no known rating
    const candidates = {};

    // When resolving the official rating
    const rating = resolveOfficialRating(candidates);

    // Then the player is unrated
    expect(rating).toEqual({ value: null, source: "unrated" });
  });
});
