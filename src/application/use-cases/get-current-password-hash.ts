import { hashPassword } from "@/domain/auth/hash-password";
import type { AuthSettingsRepository } from "@/application/ports/auth-settings-repository";

// Resolves the hash a submitted password must match: a password changed
// in-app always takes priority over the APP_PASSWORD environment variable,
// which only acts as the initial/bootstrap value.
export class GetCurrentPasswordHashUseCase {
  constructor(private readonly settings: AuthSettingsRepository) {}

  async execute(fallbackPassword: string | null): Promise<string | null> {
    const stored = await this.settings.getPasswordHash();
    if (stored) {
      return stored;
    }
    if (fallbackPassword) {
      return hashPassword(fallbackPassword);
    }
    return null;
  }
}
