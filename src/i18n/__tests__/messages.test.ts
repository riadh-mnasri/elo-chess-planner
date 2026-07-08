import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "object" && value !== null
      ? collectKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe("translation catalogs", () => {
  it("keeps the English and French message keys in sync", () => {
    // Given the English and French message catalogs
    const englishKeys = collectKeys(en).sort();
    const frenchKeys = collectKeys(fr).sort();

    // When comparing their key sets
    // Then every key present in one catalog must exist in the other
    expect(frenchKeys).toEqual(englishKeys);
  });
});
