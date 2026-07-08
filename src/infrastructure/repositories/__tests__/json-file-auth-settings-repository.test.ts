import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { JsonFileAuthSettingsRepository } from "../json-file-auth-settings-repository";

describe("JsonFileAuthSettingsRepository", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "elo-chess-auth-"));
    filePath = path.join(dir, "auth.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns null when no password hash has been set yet", async () => {
    // Given a repository pointing to a file that was never written
    const repository = new JsonFileAuthSettingsRepository(filePath);

    // When reading the password hash
    // Then it is null
    expect(await repository.getPasswordHash()).toBeNull();
  });

  it("persists a password hash to disk and reloads it", async () => {
    // Given a repository
    const repository = new JsonFileAuthSettingsRepository(filePath);

    // When setting a password hash and reading it back through a fresh instance
    await repository.setPasswordHash("abc123");
    const reloaded = new JsonFileAuthSettingsRepository(filePath);

    // Then the hash survives the round trip
    expect(await reloaded.getPasswordHash()).toBe("abc123");
  });

  it("overwrites the previous hash when set again", async () => {
    // Given a repository with a stored hash
    const repository = new JsonFileAuthSettingsRepository(filePath);
    await repository.setPasswordHash("first-hash");

    // When setting a new hash
    await repository.setPasswordHash("second-hash");

    // Then only the latest hash is stored
    expect(await repository.getPasswordHash()).toBe("second-hash");
  });
});
