import { describe, expect, it } from "vitest";
import { computeAge } from "../compute-age";

describe("computeAge", () => {
  it("returns null when the birth date is unknown", () => {
    // Given no birth date
    // When computing the age
    // Then it is null
    expect(computeAge(null, new Date("2026-07-08"))).toBeNull();
  });

  it("computes the age when the birthday already happened this year", () => {
    // Given a birth date earlier this year's month/day
    const birthDate = new Date("2014-03-20");
    const referenceDate = new Date("2026-07-08");

    // When computing the age
    // Then it is the full number of years elapsed
    expect(computeAge(birthDate, referenceDate)).toBe(12);
  });

  it("does not count the birthday yet when it has not happened this year", () => {
    // Given a birth date later this year's month/day
    const birthDate = new Date("2014-12-20");
    const referenceDate = new Date("2026-07-08");

    // When computing the age
    // Then it is one year less than the naive year difference
    expect(computeAge(birthDate, referenceDate)).toBe(11);
  });
});
