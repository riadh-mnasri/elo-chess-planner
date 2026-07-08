import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";

type StoredGame = Omit<ExternalGameImport, "date"> & { date: string };

function toStored(game: ExternalGameImport): StoredGame {
  return { ...game, date: game.date.toISOString() };
}

function fromStored(stored: StoredGame): ExternalGameImport {
  return { ...stored, date: new Date(stored.date) };
}

function isFileNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

// Mirrors the other JSON file repositories: local persistence, append-only
// history of imported/synced games per player.
export class JsonFileExternalGameRepository implements ExternalGameRepository {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<ExternalGameImport[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const stored = JSON.parse(raw) as StoredGame[];
      return stored.map(fromStored);
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }
      throw error;
    }
  }

  private async writeAll(games: ExternalGameImport[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(games.map(toStored), null, 2), "utf-8");
  }

  async saveMany(games: ExternalGameImport[]): Promise<void> {
    const existing = await this.readAll();
    await this.writeAll([...existing, ...games]);
  }

  async findByPlayerId(playerId: string): Promise<ExternalGameImport[]> {
    const games = await this.readAll();
    return games.filter((game) => game.playerId === playerId);
  }
}
