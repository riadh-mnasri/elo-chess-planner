import type { PlayerStanding } from "./compute-standings";

type ColorPreference = "white" | "black" | null;

// A positive balance means the player has played white more often than
// black, so they are "owed" black next (and vice versa). With no imbalance,
// the player prefers to alternate away from their last color.
function colorPreference(standing: PlayerStanding): ColorPreference {
  const balance = standing.whiteCount - standing.blackCount;
  if (balance > 0) return "black";
  if (balance < 0) return "white";
  if (standing.lastColor === "white") return "black";
  if (standing.lastColor === "black") return "white";
  return null;
}

export interface ColorAssignment {
  whitePlayerId: string;
  blackPlayerId: string;
}

// Assigns colors for a pairing between a higher-ranked and a lower-ranked
// player. When both players are owed the same color, the higher-ranked
// player's preference wins and the other player takes the opposite color.
export function decideColors(
  higherRanked: PlayerStanding,
  lowerRanked: PlayerStanding,
): ColorAssignment {
  const preferHigher = colorPreference(higherRanked);
  const preferLower = colorPreference(lowerRanked);

  const higherWantsWhite =
    preferHigher === "white" ||
    (preferHigher === null && preferLower !== "white");

  return higherWantsWhite
    ? { whitePlayerId: higherRanked.playerId, blackPlayerId: lowerRanked.playerId }
    : { whitePlayerId: lowerRanked.playerId, blackPlayerId: higherRanked.playerId };
}
