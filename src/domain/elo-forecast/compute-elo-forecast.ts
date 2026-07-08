import type { ExternalGameImport } from "@/domain/external-import/external-game";
import { computeAge } from "./compute-age";
import { computeKFactor } from "./compute-k-factor";

export interface ComputeEloForecastInput {
  games: ExternalGameImport[];
  birthDate: Date | null;
  // Used as the current rating when there is no game history to derive it
  // from (e.g. the player's official FIDE/FFE/chess.com rating).
  fallbackRating: number | null;
  referenceDate: Date;
}

export type EloForecastBasis = "statistical" | "insufficient-data";

export interface EloForecastResult {
  currentRating: number | null;
  kFactor: number;
  gamesPerMonthEstimate: number;
  projectedDeltaMin: number;
  projectedDeltaMedian: number;
  projectedDeltaMax: number;
  basis: EloForecastBasis;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_GAMES_PER_MONTH = 4;

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = average(values.map((v) => (v - mean) ** 2));
  return Math.sqrt(variance);
}

// Estimates how many games the player tends to play per month, from the
// span between their first and last known game. Falls back to a default
// assumption when there is not enough history to measure a cadence.
function estimateGamesPerMonth(dates: Date[]): number {
  if (dates.length < 2) return DEFAULT_GAMES_PER_MONTH;

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const spanDays = (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / DAY_MS;
  const months = Math.max(spanDays / 30, 1 / 30);
  const rate = dates.length / months;

  return Math.min(Math.max(rate, 1), 30);
}

// Purely statistical monthly Elo forecast: extrapolates the player's recent
// per-game rating trend and playing cadence. No specific upcoming
// opponents or tournaments are assumed. The range (min/max) reflects how
// consistent recent results have been - a volatile recent record produces
// a wider range than a steady one.
export function computeEloForecast(input: ComputeEloForecastInput): EloForecastResult {
  const sortedGames = [...input.games].sort((a, b) => a.date.getTime() - b.date.getTime());
  const gamesWithKnownBefore = sortedGames.filter((g) => g.eloBefore !== null);

  const currentRating =
    sortedGames.length > 0
      ? sortedGames[sortedGames.length - 1].eloAfter
      : input.fallbackRating;

  const age = computeAge(input.birthDate, input.referenceDate);
  const kFactor = computeKFactor({ age, rating: currentRating ?? 1500 });

  if (gamesWithKnownBefore.length < 2) {
    return {
      currentRating,
      kFactor,
      gamesPerMonthEstimate: 0,
      projectedDeltaMin: 0,
      projectedDeltaMedian: 0,
      projectedDeltaMax: 0,
      basis: "insufficient-data",
    };
  }

  const deltas = gamesWithKnownBefore.map((g) => g.eloAfter - (g.eloBefore as number));
  const meanDelta = average(deltas);
  const deltaStdDev = standardDeviation(deltas, meanDelta);
  const gamesPerMonth = estimateGamesPerMonth(sortedGames.map((g) => g.date));

  const medianDelta = Math.round(meanDelta * gamesPerMonth);
  const spread = Math.round(deltaStdDev * Math.sqrt(gamesPerMonth));

  return {
    currentRating,
    kFactor,
    gamesPerMonthEstimate: Math.round(gamesPerMonth * 10) / 10,
    projectedDeltaMin: medianDelta - spread,
    projectedDeltaMedian: medianDelta,
    projectedDeltaMax: medianDelta + spread,
    basis: "statistical",
  };
}
