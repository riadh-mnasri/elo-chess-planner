import { computeKFactor } from "@/domain/elo-forecast/compute-k-factor";
import type { GameOutcome } from "./external-game";

export interface FfeSimulationGame {
  round: number;
  result: GameOutcome;
  opponentRating: number;
}

export interface SimulatedFfeGame {
  round: number;
  result: GameOutcome;
  eloBefore: number;
  eloAfter: number;
}

export interface SimulateFfeEloProgressionInput {
  startingRating: number;
  age: number | null;
  games: FfeSimulationGame[];
}

const SCORE_BY_RESULT: Record<GameOutcome, number> = { win: 1, draw: 0.5, loss: 0 };

// FFE tournament pages only publish a player's rating going into the event,
// not a snapshot after every round - the official rating is only
// recomputed once, after the whole tournament is homologated. To still
// produce a per-game rating curve for the forecast engine, we replay the
// standard FIDE expected-score formula round by round, using the same
// K-factor rule as the rest of the app. This reconstructs how the rating
// would move game by game rather than guessing it.
export function simulateFfeEloProgression(
  input: SimulateFfeEloProgressionInput,
): SimulatedFfeGame[] {
  const sortedGames = [...input.games].sort((a, b) => a.round - b.round);
  let rating = input.startingRating;

  return sortedGames.map((game) => {
    const eloBefore = rating;
    const kFactor = computeKFactor({ age: input.age, rating });
    const expectedScore = 1 / (1 + 10 ** ((game.opponentRating - rating) / 400));
    const actualScore = SCORE_BY_RESULT[game.result];

    rating = Math.round(rating + kFactor * (actualScore - expectedScore));

    return { round: game.round, result: game.result, eloBefore, eloAfter: rating };
  });
}
