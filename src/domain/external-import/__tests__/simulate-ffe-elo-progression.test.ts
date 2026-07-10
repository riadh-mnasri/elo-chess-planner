import { describe, expect, it } from "vitest";
import { simulateFfeEloProgression } from "../simulate-ffe-elo-progression";

describe("simulateFfeEloProgression", () => {
  it("replays the FIDE expected-score formula game by game, chaining the rating forward", () => {
    // Given a 1500-rated adult player and three rounds with known opponents
    // When simulating the progression
    const games = simulateFfeEloProgression({
      startingRating: 1500,
      age: 30,
      games: [
        { round: 1, result: "win", opponentRating: 1500 },
        { round: 2, result: "loss", opponentRating: 1510 },
        { round: 3, result: "draw", opponentRating: 1700 },
      ],
    });

    // Then each game's before/after rating matches the standard K=20 formula
    expect(games).toEqual([
      { round: 1, result: "win", eloBefore: 1500, eloAfter: 1510 },
      { round: 2, result: "loss", eloBefore: 1510, eloAfter: 1500 },
      { round: 3, result: "draw", eloBefore: 1500, eloAfter: 1505 },
    ]);
  });

  it("uses the junior K-factor (40) for players under 18 rated below 2300", () => {
    // Given a 1500-rated 12-year-old beating an equally-rated opponent
    // When simulating a single game
    const games = simulateFfeEloProgression({
      startingRating: 1500,
      age: 12,
      games: [{ round: 1, result: "win", opponentRating: 1500 }],
    });

    // Then the full K=40 gain applies instead of the standard K=20
    expect(games[0].eloAfter).toBe(1520);
  });

  it("sorts games by round before simulating, regardless of input order", () => {
    // Given rounds passed out of order
    // When simulating
    const games = simulateFfeEloProgression({
      startingRating: 1500,
      age: 30,
      games: [
        { round: 2, result: "loss", opponentRating: 1510 },
        { round: 1, result: "win", opponentRating: 1500 },
      ],
    });

    // Then round 1 is processed first
    expect(games.map((g) => g.round)).toEqual([1, 2]);
    expect(games[0].eloBefore).toBe(1500);
  });
});
