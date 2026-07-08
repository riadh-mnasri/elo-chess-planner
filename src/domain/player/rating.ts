export type RatingSource = "fide" | "ffe" | "chesscom" | "unrated";

export interface RatingCandidates {
  fide?: number;
  ffe?: number;
  chesscom?: number;
}

export interface Rating {
  value: number | null;
  source: RatingSource;
}
