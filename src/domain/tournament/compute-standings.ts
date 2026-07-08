import type { Round, TournamentParticipant } from "./tournament";

export interface PlayerStanding {
  playerId: string;
  score: number;
  opponentIds: string[];
  whiteCount: number;
  blackCount: number;
  lastColor: "white" | "black" | null;
  hadBye: boolean;
}

const BYE_POINTS = 1;

function emptyStanding(playerId: string): PlayerStanding {
  return {
    playerId,
    score: 0,
    opponentIds: [],
    whiteCount: 0,
    blackCount: 0,
    lastColor: null,
    hadBye: false,
  };
}

export function computeStandings(
  participants: TournamentParticipant[],
  rounds: Round[],
): PlayerStanding[] {
  const standings = new Map<string, PlayerStanding>(
    participants.map((p) => [p.playerId, emptyStanding(p.playerId)]),
  );

  for (const round of rounds) {
    for (const pairing of round.pairings) {
      const white = standings.get(pairing.whitePlayerId);
      if (!white) continue;

      if (pairing.blackPlayerId === null) {
        white.score += BYE_POINTS;
        white.hadBye = true;
        continue;
      }

      const black = standings.get(pairing.blackPlayerId);
      if (!black) continue;

      white.opponentIds.push(black.playerId);
      black.opponentIds.push(white.playerId);
      white.whiteCount += 1;
      black.blackCount += 1;
      white.lastColor = "white";
      black.lastColor = "black";

      if (pairing.result === "white") {
        white.score += 1;
      } else if (pairing.result === "black") {
        black.score += 1;
      } else if (pairing.result === "draw") {
        white.score += 0.5;
        black.score += 0.5;
      }
    }
  }

  return Array.from(standings.values());
}
