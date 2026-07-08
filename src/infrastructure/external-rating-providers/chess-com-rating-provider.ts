import type {
  ExternalRatingProvider,
  FetchedExternalGame,
} from "@/application/ports/external-rating-provider";
import type { GameOutcome } from "@/domain/external-import/external-game";

interface ChessComPlayerResult {
  username: string;
  rating: number;
  result: string;
}

interface ChessComGame {
  end_time: number;
  rated: boolean;
  time_class: string;
  white: ChessComPlayerResult;
  black: ChessComPlayerResult;
}

// chess.com's per-player result strings that mean a draw. Anything else
// that isn't "win" is treated as a loss (checkmated, resigned, timeout,
// abandoned...).
const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

function mapResult(result: string): GameOutcome {
  if (result === "win") return "win";
  if (DRAW_RESULTS.has(result)) return "draw";
  return "loss";
}

export class ChessComRatingProvider implements ExternalRatingProvider {
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly timeClass: string = "rapid",
    private readonly monthsBack: number = 3,
  ) {}

  async fetchRecentGames(username: string): Promise<FetchedExternalGame[]> {
    const archivesResponse = await this.fetchFn(
      `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`,
    );
    if (!archivesResponse.ok) {
      throw new Error(`chess.com: could not fetch archives for "${username}"`);
    }
    const { archives } = (await archivesResponse.json()) as { archives: string[] };

    const games: ChessComGame[] = [];
    for (const archiveUrl of archives.slice(-this.monthsBack)) {
      const response = await this.fetchFn(archiveUrl);
      if (!response.ok) continue;
      const body = (await response.json()) as { games: ChessComGame[] };
      games.push(...body.games);
    }

    const usernameLower = username.toLowerCase();
    const relevant = games
      .filter((game) => game.rated && game.time_class === this.timeClass)
      .filter(
        (game) =>
          game.white.username.toLowerCase() === usernameLower ||
          game.black.username.toLowerCase() === usernameLower,
      )
      .sort((a, b) => a.end_time - b.end_time);

    const fetched: FetchedExternalGame[] = [];
    let previousElo: number | null = null;

    for (const game of relevant) {
      const isWhite = game.white.username.toLowerCase() === usernameLower;
      const mine = isWhite ? game.white : game.black;
      const opponent = isWhite ? game.black : game.white;

      fetched.push({
        date: new Date(game.end_time * 1000),
        opponent: opponent.username,
        result: mapResult(mine.result),
        eloBefore: previousElo,
        eloAfter: mine.rating,
      });
      previousElo = mine.rating;
    }

    return fetched;
  }
}
