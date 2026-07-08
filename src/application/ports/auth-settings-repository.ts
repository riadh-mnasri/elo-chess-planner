export interface AuthSettingsRepository {
  getPasswordHash(): Promise<string | null>;
  setPasswordHash(hash: string): Promise<void>;
}
