import { describe, expect, it } from "vitest";
import { computeKFactor } from "../compute-k-factor";

describe("computeKFactor", () => {
  it("uses K=40 for a junior under 18 rated below 2300", () => {
    expect(computeKFactor({ age: 15, rating: 1500 })).toBe(40);
  });

  it("uses K=20 for a junior under 18 once rated 2300 or above", () => {
    expect(computeKFactor({ age: 15, rating: 2350 })).toBe(20);
  });

  it("uses K=20 for an adult rated below 2400", () => {
    expect(computeKFactor({ age: 45, rating: 1800 })).toBe(20);
  });

  it("uses K=10 for a player rated 2400 or above, regardless of age", () => {
    expect(computeKFactor({ age: 16, rating: 2450 })).toBe(10);
  });

  it("defaults to the standard K=20 when the age is unknown", () => {
    expect(computeKFactor({ age: null, rating: 1600 })).toBe(20);
  });
});
