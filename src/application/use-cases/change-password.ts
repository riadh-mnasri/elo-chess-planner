import { hashPassword } from "@/domain/auth/hash-password";
import type { AuthSettingsRepository } from "@/application/ports/auth-settings-repository";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  fallbackPassword: string | null;
}

export interface ChangePasswordOutcome {
  success: boolean;
  error: string | null;
}

const MIN_PASSWORD_LENGTH = 4;

export class ChangePasswordUseCase {
  constructor(private readonly settings: AuthSettingsRepository) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordOutcome> {
    const storedHash = await this.settings.getPasswordHash();
    const currentHash =
      storedHash ?? (input.fallbackPassword ? await hashPassword(input.fallbackPassword) : null);

    if (!currentHash) {
      return { success: false, error: "No password is currently configured" };
    }

    const providedHash = await hashPassword(input.currentPassword);
    if (providedHash !== currentHash) {
      return { success: false, error: "Current password is incorrect" };
    }

    if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false,
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      };
    }

    await this.settings.setPasswordHash(await hashPassword(input.newPassword));
    return { success: true, error: null };
  }
}
