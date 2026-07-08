import type { GameOutcome } from "@/domain/external-import/external-game";

export interface FetchedExternalGame {
  date: Date;
  opponent: string;
  result: GameOutcome;
  eloBefore: number | null;
  eloAfter: number;
}

export interface ExternalRatingProvider {
  fetchRecentGames(username: string): Promise<FetchedExternalGame[]>;
}

export type ExternalApiSource = "chesscom" | "lichess";
