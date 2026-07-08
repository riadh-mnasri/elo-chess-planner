import type {
  ExternalRatingProvider,
  FetchedExternalGame,
} from "@/application/ports/external-rating-provider";
import type { GameOutcome } from "@/domain/external-import/external-game";

interface LichessPlayer {
  user?: { id: string; name: string };
  rating: number;
  ratingDiff?: number;
}

interface LichessGame {
  createdAt: number;
  winner?: "white" | "black";
  players: { white: LichessPlayer; black: LichessPlayer };
}

export class LichessRatingProvider implements ExternalRatingProvider {
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly perfType: string = "rapid",
    private readonly maxGames: number = 30,
  ) {}

  async fetchRecentGames(username: string): Promise<FetchedExternalGame[]> {
    const url = `https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=${this.maxGames}&rated=true&perfType=${this.perfType}`;
    const response = await this.fetchFn(url, {
      headers: { Accept: "application/x-ndjson" },
    });
    if (!response.ok) {
      throw new Error(`lichess: could not fetch games for "${username}"`);
    }

    const text = await response.text();
    const usernameLower = username.toLowerCase();

    const games: LichessGame[] = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as LichessGame)
      .sort((a, b) => a.createdAt - b.createdAt);

    return games.map((game) => {
      const isWhite = game.players.white.user?.id?.toLowerCase() === usernameLower;
      const mine = isWhite ? game.players.white : game.players.black;
      const opponent = isWhite ? game.players.black : game.players.white;
      const ratingDiff = mine.ratingDiff ?? 0;

      const result: GameOutcome =
        game.winner === undefined
          ? "draw"
          : game.winner === (isWhite ? "white" : "black")
            ? "win"
            : "loss";

      return {
        date: new Date(game.createdAt),
        opponent: opponent.user?.name ?? opponent.user?.id ?? "Unknown",
        result,
        eloBefore: mine.rating - ratingDiff,
        eloAfter: mine.rating,
      };
    });
  }
}
