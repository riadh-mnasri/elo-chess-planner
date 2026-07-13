import type { RatingSource } from "@/domain/player/rating";

export interface FetchedFfePlayerRating {
  nrFfe: string;
  printedName: string;
  elo: number;
  // "fide" when the FFE registry marks the Elo as FIDE-published (F),
  // "ffe" for national (N) or estimated (E) ratings.
  source: Extract<RatingSource, "fide" | "ffe">;
}

export interface FfePlayerRatingProvider {
  fetchPlayerRating(playerName: string): Promise<FetchedFfePlayerRating>;
}
