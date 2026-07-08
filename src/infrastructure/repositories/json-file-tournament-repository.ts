import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

type StoredTournament = Omit<Tournament, "date"> & { date: string };

function toStored(tournament: Tournament): StoredTournament {
  return { ...tournament, date: tournament.date.toISOString() };
}

function fromStored(stored: StoredTournament): Tournament {
  return { ...stored, date: new Date(stored.date) };
}

function isFileNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

// Mirrors JsonFilePlayerRepository: local file persistence, fine for a
// single local instance, not for a multi-instance serverless deployment.
export class JsonFileTournamentRepository implements TournamentRepository {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<Tournament[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const stored = JSON.parse(raw) as StoredTournament[];
      return stored.map(fromStored);
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }
      throw error;
    }
  }

  private async writeAll(tournaments: Tournament[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const stored = tournaments.map(toStored);
    await writeFile(this.filePath, JSON.stringify(stored, null, 2), "utf-8");
  }

  async save(tournament: Tournament): Promise<void> {
    const tournaments = await this.readAll();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index === -1) {
      tournaments.push(tournament);
    } else {
      tournaments[index] = tournament;
    }
    await this.writeAll(tournaments);
  }

  async findById(id: string): Promise<Tournament | null> {
    const tournaments = await this.readAll();
    return tournaments.find((t) => t.id === id) ?? null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.readAll();
  }
}
