import type { Rating } from "./rating";

export type PlayerType = "family" | "guest";

export interface ExternalIds {
  fide?: string;
  ffe?: string;
  chesscom?: string;
  lichess?: string;
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  birthDate: Date | null;
  officialRating: Rating;
  // Rating derived from home tournament results only, kept separate from
  // officialRating since home tournaments are not FIDE-rated.
  homeElo: number | null;
  externalIds: ExternalIds;
}
