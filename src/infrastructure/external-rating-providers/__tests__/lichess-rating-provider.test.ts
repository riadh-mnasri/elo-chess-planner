import { describe, expect, it, vi } from "vitest";
import { LichessRatingProvider } from "../lichess-rating-provider";

describe("LichessRatingProvider", () => {
  it("parses the ND-JSON game export and derives eloBefore from ratingDiff", async () => {
    // Given two ND-JSON lines: riadhm loses as black, then wins as white
    const ndjson = [
      JSON.stringify({
        createdAt: 1748000000000,
        winner: "white",
        players: {
          white: { user: { id: "bob", name: "Bob" }, rating: 1510, ratingDiff: 6 },
          black: { user: { id: "riadhm", name: "riadhm" }, rating: 1490, ratingDiff: -6 },
        },
      }),
      JSON.stringify({
        createdAt: 1749000000000,
        winner: "white",
        players: {
          white: { user: { id: "riadhm", name: "riadhm" }, rating: 1500, ratingDiff: 10 },
          black: { user: { id: "carl", name: "Carl" }, rating: 1480, ratingDiff: -10 },
        },
      }),
    ].join("\n");

    const fetchFn = vi.fn(async () => ({
      ok: true,
      text: async () => ndjson,
    })) as unknown as typeof fetch;

    const provider = new LichessRatingProvider(fetchFn);

    // When fetching recent games for riadhm
    const games = await provider.fetchRecentGames("riadhm");

    // Then both games are mapped with the correct opponent, result and
    // eloBefore/eloAfter derived from rating and ratingDiff
    expect(games).toEqual([
      {
        date: new Date(1748000000000),
        opponent: "Bob",
        result: "loss",
        eloBefore: 1496,
        eloAfter: 1490,
      },
      {
        date: new Date(1749000000000),
        opponent: "Carl",
        result: "win",
        eloBefore: 1490,
        eloAfter: 1500,
      },
    ]);
  });
});
