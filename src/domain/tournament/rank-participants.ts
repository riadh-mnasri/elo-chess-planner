import type { TournamentParticipant } from "./tournament";

// Rated players first (highest rating first), unrated players below them,
// sorted alphabetically since there is no rating to break ties with.
export function rankParticipants(
  participants: TournamentParticipant[],
): TournamentParticipant[] {
  return [...participants].sort((a, b) => {
    if (a.seedRating !== null && b.seedRating !== null) {
      return b.seedRating - a.seedRating;
    }
    if (a.seedRating !== null) return -1;
    if (b.seedRating !== null) return 1;
    return a.name.localeCompare(b.name);
  });
}
