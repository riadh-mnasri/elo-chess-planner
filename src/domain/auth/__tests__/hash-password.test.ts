import { describe, expect, it } from "vitest";
import { hashPassword } from "../hash-password";

describe("hashPassword", () => {
  it("produces a stable, hex-encoded SHA-256 hash for the same input", async () => {
    const hash1 = await hashPassword("family-secret");
    const hash2 = await hashPassword("family-secret");

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await hashPassword("secret-one");
    const hash2 = await hashPassword("secret-two");

    expect(hash1).not.toBe(hash2);
  });
});
