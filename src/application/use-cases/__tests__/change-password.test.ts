import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { AuthSettingsRepository } from "@/application/ports/auth-settings-repository";
import { hashPassword } from "@/domain/auth/hash-password";
import { ChangePasswordUseCase } from "../change-password";

describe("ChangePasswordUseCase", () => {
  it("stores the new password hash when the current password is correct", async () => {
    // Given a repository with no stored hash yet and an env fallback password
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(null);
    const useCase = new ChangePasswordUseCase(settings);

    // When changing the password with the correct current (fallback) password
    const outcome = await useCase.execute({
      currentPassword: "old-secret",
      newPassword: "new-secret",
      fallbackPassword: "old-secret",
    });

    // Then the new password's hash is stored
    expect(outcome.success).toBe(true);
    expect(settings.setPasswordHash).toHaveBeenCalledWith(await hashPassword("new-secret"));
  });

  it("rejects the change when the current password is wrong", async () => {
    // Given a repository with a stored hash for "correct-password"
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(await hashPassword("correct-password"));
    const useCase = new ChangePasswordUseCase(settings);

    // When attempting to change it with the wrong current password
    const outcome = await useCase.execute({
      currentPassword: "wrong-guess",
      newPassword: "new-secret",
      fallbackPassword: null,
    });

    // Then it fails and nothing is stored
    expect(outcome.success).toBe(false);
    expect(settings.setPasswordHash).not.toHaveBeenCalled();
  });

  it("rejects a new password that is too short", async () => {
    // Given a repository with a known current password
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(await hashPassword("current"));
    const useCase = new ChangePasswordUseCase(settings);

    // When submitting a very short new password
    const outcome = await useCase.execute({
      currentPassword: "current",
      newPassword: "ab",
      fallbackPassword: null,
    });

    // Then it fails and nothing is stored
    expect(outcome.success).toBe(false);
    expect(settings.setPasswordHash).not.toHaveBeenCalled();
  });

  it("rejects when no password is configured at all", async () => {
    // Given no stored hash and no fallback password
    const settings = mock<AuthSettingsRepository>();
    settings.getPasswordHash.mockResolvedValue(null);
    const useCase = new ChangePasswordUseCase(settings);

    // When attempting to change the (nonexistent) password
    const outcome = await useCase.execute({
      currentPassword: "anything",
      newPassword: "new-secret",
      fallbackPassword: null,
    });

    // Then it fails
    expect(outcome.success).toBe(false);
  });
});
