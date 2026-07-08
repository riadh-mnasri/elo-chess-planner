import { describe, expect, it, vi } from "vitest";
import { ChessComRatingProvider } from "../chess-com-rating-provider";

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

describe("ChessComRatingProvider", () => {
  it("fetches recent rapid games, ordered chronologically, with rating deltas", async () => {
    // Given a chess.com account with two archive months and mixed game types
    const fetchFn = vi.fn(async (url: string) => {
      if (url.endsWith("/games/archives")) {
        return jsonResponse({
          archives: [
            "https://api.chess.com/pub/player/riadhm/games/2026/05",
            "https://api.chess.com/pub/player/riadhm/games/2026/06",
          ],
        });
      }
      if (url.endsWith("/2026/05")) {
        return jsonResponse({
          games: [
            {
              end_time: 1748000000,
              rated: true,
              time_class: "rapid",
              white: { username: "riadhm", rating: 1500, result: "win" },
              black: { username: "Bob", rating: 1480, result: "checkmated" },
            },
            {
              end_time: 1748100000,
              rated: true,
              time_class: "bullet",
              white: { username: "riadhm", rating: 1300, result: "win" },
              black: { username: "Carl", rating: 1290, result: "resigned" },
            },
          ],
        });
      }
      if (url.endsWith("/2026/06")) {
        return jsonResponse({
          games: [
            {
              end_time: 1749000000,
              rated: true,
              time_class: "rapid",
              white: { username: "Dan", rating: 1600, result: "win" },
              black: { username: "riadhm", rating: 1510, result: "agreed" },
            },
          ],
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const provider = new ChessComRatingProvider(fetchFn as unknown as typeof fetch);

    // When fetching recent rapid games for riadhm
    const games = await provider.fetchRecentGames("riadhm");

    // Then only the two rated rapid games are returned, oldest first, with
    // eloBefore chained from the previous game and a draw correctly mapped
    expect(games).toEqual([
      {
        date: new Date(1748000000 * 1000),
        opponent: "Bob",
        result: "win",
        eloBefore: null,
        eloAfter: 1500,
      },
      {
        date: new Date(1749000000 * 1000),
        opponent: "Dan",
        result: "draw",
        eloBefore: 1500,
        eloAfter: 1510,
      },
    ]);
  });
});
