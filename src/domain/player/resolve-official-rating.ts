import type { Rating, RatingCandidates } from "./rating";

// FIDE is the internationally recognized rating; FFE and chess.com are
// accepted fallbacks in that order for players without a FIDE rating yet
// (typically children starting out).
export function resolveOfficialRating(candidates: RatingCandidates): Rating {
  if (candidates.fide !== undefined) {
    return { value: candidates.fide, source: "fide" };
  }
  if (candidates.ffe !== undefined) {
    return { value: candidates.ffe, source: "ffe" };
  }
  if (candidates.chesscom !== undefined) {
    return { value: candidates.chesscom, source: "chesscom" };
  }
  return { value: null, source: "unrated" };
}
