import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { AuthSettingsRepository } from "@/application/ports/auth-settings-repository";
import { hashPassword } from "@/domain/auth/hash-password";
import { GetCurrentPasswordHashUseCase } from "../get-current-password-hash";

describe("GetCurrentPasswordHashUseCase", () => {
  it("returns the stored hash when one has been set via the app", async () => {
    // Given a settings repository with a stored password hash
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue("stored-hash");
    const useCase = new GetCurrentPasswordHashUseCase(settings);

    // When resolving the current password hash, even with a fallback given
    const hash = await useCase.execute("some-env-password");

    // Then the stored hash takes priority
    expect(hash).toBe("stored-hash");
  });

  it("falls back to hashing the given fallback password when nothing is stored", async () => {
    // Given no stored password hash
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(null);
    const useCase = new GetCurrentPasswordHashUseCase(settings);

    // When resolving with a fallback password
    const hash = await useCase.execute("env-password");

    // Then it matches a hash of that fallback password
    expect(hash).toBe(await hashPassword("env-password"));
  });

  it("returns null when there is no stored hash and no fallback", async () => {
    // Given no stored password hash and no fallback
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(null);
    const useCase = new GetCurrentPasswordHashUseCase(settings);

    // When resolving with no fallback
    const hash = await useCase.execute(null);

    // Then there is no password gate at all
    expect(hash).toBeNull();
  });
});
