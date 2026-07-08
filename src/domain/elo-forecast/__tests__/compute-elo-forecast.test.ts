import { describe, expect, it } from "vitest";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import { computeEloForecast } from "../compute-elo-forecast";

function aGame(overrides: Partial<ExternalGameImport>): ExternalGameImport {
  return {
    id: "g",
    playerId: "p1",
    source: "chesscom",
    date: new Date("2026-01-01"),
    opponent: "Bob",
    result: "win",
    eloBefore: 1500,
    eloAfter: 1510,
    importBatchId: "batch",
    ...overrides,
  };
}

describe("computeEloForecast", () => {
  it("projects a monthly delta from a consistent recent trend and game rate", () => {
    // Given four games, 10 days apart, each gaining exactly 10 points
    const games = [
      aGame({ date: new Date("2026-01-01"), eloBefore: 1500, eloAfter: 1510 }),
      aGame({ date: new Date("2026-01-11"), eloBefore: 1510, eloAfter: 1520 }),
      aGame({ date: new Date("2026-01-21"), eloBefore: 1520, eloAfter: 1530 }),
      aGame({ date: new Date("2026-01-31"), eloBefore: 1530, eloAfter: 1540 }),
    ];

    // When computing the forecast
    const forecast = computeEloForecast({
      games,
      birthDate: null,
      fallbackRating: null,
      referenceDate: new Date("2026-02-01"),
    });

    // Then the game rate is 4 games per the 30-day span, the trend is +10
    // per game with no variance, so the projection is a tight +40 band
    expect(forecast.basis).toBe("statistical");
    expect(forecast.currentRating).toBe(1540);
    expect(forecast.gamesPerMonthEstimate).toBe(4);
    expect(forecast.projectedDeltaMedian).toBe(40);
    expect(forecast.projectedDeltaMin).toBe(40);
    expect(forecast.projectedDeltaMax).toBe(40);
    expect(forecast.kFactor).toBe(20);
  });

  it("widens the range when the recent results are less consistent", () => {
    // Given games with varying deltas (+20, -10, +10, +20)
    const games = [
      aGame({ date: new Date("2026-01-01"), eloBefore: 1500, eloAfter: 1520 }),
      aGame({ date: new Date("2026-01-11"), eloBefore: 1520, eloAfter: 1510 }),
      aGame({ date: new Date("2026-01-21"), eloBefore: 1510, eloAfter: 1520 }),
      aGame({ date: new Date("2026-01-31"), eloBefore: 1520, eloAfter: 1540 }),
    ];

    // When computing the forecast
    const forecast = computeEloForecast({
      games,
      birthDate: null,
      fallbackRating: null,
      referenceDate: new Date("2026-02-01"),
    });

    // Then the range is wider than a single point (min < median < max)
    expect(forecast.projectedDeltaMin).toBeLessThan(forecast.projectedDeltaMedian);
    expect(forecast.projectedDeltaMax).toBeGreaterThan(forecast.projectedDeltaMedian);
  });

  it("reports insufficient data when fewer than two games are known", () => {
    // Given a single imported game
    const games = [aGame({})];

    // When computing the forecast
    const forecast = computeEloForecast({
      games,
      birthDate: null,
      fallbackRating: 1400,
      referenceDate: new Date("2026-02-01"),
    });

    // Then no statistical projection is made
    expect(forecast.basis).toBe("insufficient-data");
    expect(forecast.projectedDeltaMedian).toBe(0);
  });

  it("falls back to the player's official rating when there is no game history", () => {
    // Given no imported games at all
    const forecast = computeEloForecast({
      games: [],
      birthDate: null,
      fallbackRating: 1450,
      referenceDate: new Date("2026-02-01"),
    });

    // Then the current rating comes from the fallback
    expect(forecast.currentRating).toBe(1450);
    expect(forecast.basis).toBe("insufficient-data");
  });

  it("applies the junior K-factor based on age and current rating", () => {
    // Given a 15-year-old player rated well below 2300
    const games = [
      aGame({ date: new Date("2026-01-01"), eloBefore: 1200, eloAfter: 1210 }),
      aGame({ date: new Date("2026-01-15"), eloBefore: 1210, eloAfter: 1220 }),
    ];

    // When computing the forecast for a player born in 2011
    const forecast = computeEloForecast({
      games,
      birthDate: new Date("2011-05-01"),
      fallbackRating: null,
      referenceDate: new Date("2026-02-01"),
    });

    // Then the junior K-factor is used
    expect(forecast.kFactor).toBe(40);
  });
});
