import type { Round } from "./tournament";

// Bye pairings are inherently complete: only real, two-player pairings need
// a recorded result before the round counts as finished.
export function isRoundComplete(round: Round): boolean {
  return round.pairings.every(
    (pairing) => pairing.blackPlayerId === null || pairing.result !== null,
  );
}
