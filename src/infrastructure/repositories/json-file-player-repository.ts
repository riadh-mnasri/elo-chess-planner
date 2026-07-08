import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Player } from "@/domain/player/player";
import type { PlayerRepository } from "@/application/ports/player-repository";

// A record shaped exactly like Player but with the birth date serialized to
// an ISO string, since JSON has no native Date type.
type StoredPlayer = Omit<Player, "birthDate"> & { birthDate: string | null };

function toStored(player: Player): StoredPlayer {
  return {
    ...player,
    birthDate: player.birthDate ? player.birthDate.toISOString() : null,
  };
}

function fromStored(stored: StoredPlayer): Player {
  return {
    ...stored,
    birthDate: stored.birthDate ? new Date(stored.birthDate) : null,
  };
}

function isFileNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

// Persists players as a human-readable JSON file, so local data survives
// server restarts and can be backed up or inspected by simply copying the
// file. Not suitable for concurrent multi-instance deployments (Vercel
// serverless) - a database-backed adapter is needed for that.
export class JsonFilePlayerRepository implements PlayerRepository {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<Player[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const stored = JSON.parse(raw) as StoredPlayer[];
      return stored.map(fromStored);
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }
      throw error;
    }
  }

  private async writeAll(players: Player[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const stored = players.map(toStored);
    await writeFile(this.filePath, JSON.stringify(stored, null, 2), "utf-8");
  }

  async save(player: Player): Promise<void> {
    const players = await this.readAll();
    const index = players.findIndex((p) => p.id === player.id);
    if (index === -1) {
      players.push(player);
    } else {
      players[index] = player;
    }
    await this.writeAll(players);
  }

  async findById(id: string): Promise<Player | null> {
    const players = await this.readAll();
    return players.find((p) => p.id === id) ?? null;
  }

  async findAll(): Promise<Player[]> {
    return this.readAll();
  }

  async remove(id: string): Promise<void> {
    const players = await this.readAll();
    await this.writeAll(players.filter((p) => p.id !== id));
  }
}
