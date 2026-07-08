import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuthSettingsRepository } from "@/application/ports/auth-settings-repository";

interface StoredAuthSettings {
  passwordHash: string | null;
}

function isFileNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export class JsonFileAuthSettingsRepository implements AuthSettingsRepository {
  constructor(private readonly filePath: string) {}

  private async read(): Promise<StoredAuthSettings> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as StoredAuthSettings;
    } catch (error) {
      if (isFileNotFound(error)) {
        return { passwordHash: null };
      }
      throw error;
    }
  }

  async getPasswordHash(): Promise<string | null> {
    const settings = await this.read();
    return settings.passwordHash;
  }

  async setPasswordHash(hash: string): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify({ passwordHash: hash }, null, 2), "utf-8");
  }
}
