import type { Round, TournamentParticipant } from "./tournament";
import { computeStandings, type PlayerStanding } from "./compute-standings";

type GameOutcome = "win" | "draw" | "loss";

interface GameRecord {
  opponentId: string;
  outcome: GameOutcome;
}

// Real games only (byes are excluded from both tie-break computations,
// which is the common simplification for small, informal tournaments).
function gameRecordsFor(playerId: string, rounds: Round[]): GameRecord[] {
  const records: GameRecord[] = [];
  for (const round of rounds) {
    for (const pairing of round.pairings) {
      if (pairing.blackPlayerId === null || pairing.result === null) continue;

      if (pairing.whitePlayerId === playerId) {
        records.push({
          opponentId: pairing.blackPlayerId,
          outcome:
            pairing.result === "white"
              ? "win"
              : pairing.result === "black"
                ? "loss"
                : "draw",
        });
      } else if (pairing.blackPlayerId === playerId) {
        records.push({
          opponentId: pairing.whitePlayerId,
          outcome:
            pairing.result === "black"
              ? "win"
              : pairing.result === "white"
                ? "loss"
                : "draw",
        });
      }
    }
  }
  return records;
}

export interface StandingRow extends PlayerStanding {
  buchholz: number;
  sonnebornBerger: number;
}

export function computeStandingsTable(
  participants: TournamentParticipant[],
  rounds: Round[],
): StandingRow[] {
  const standings = computeStandings(participants, rounds);
  const scoreById = new Map(standings.map((s) => [s.playerId, s.score]));

  const rows: StandingRow[] = standings.map((standing) => {
    const games = gameRecordsFor(standing.playerId, rounds);
    const buchholz = games.reduce(
      (sum, game) => sum + (scoreById.get(game.opponentId) ?? 0),
      0,
    );
    const sonnebornBerger = games.reduce((sum, game) => {
      const opponentScore = scoreById.get(game.opponentId) ?? 0;
      if (game.outcome === "win") return sum + opponentScore;
      if (game.outcome === "draw") return sum + opponentScore / 2;
      return sum;
    }, 0);
    return { ...standing, buchholz, sonnebornBerger };
  });

  return rows.sort(
    (a, b) =>
      b.score - a.score ||
      b.buchholz - a.buchholz ||
      b.sonnebornBerger - a.sonnebornBerger,
  );
}
