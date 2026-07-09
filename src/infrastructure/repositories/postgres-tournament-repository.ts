import type { JSONValue, Sql } from "postgres";
import type { Tournament } from "@/domain/tournament/tournament";
import type { TournamentRepository } from "@/application/ports/tournament-repository";

type StoredTournament = Omit<Tournament, "date"> & { date: string };

function toStored(tournament: Tournament): StoredTournament {
  return { ...tournament, date: tournament.date.toISOString() };
}

function fromStored(stored: StoredTournament): Tournament {
  return { ...stored, date: new Date(stored.date) };
}

export class PostgresTournamentRepository implements TournamentRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(private readonly sql: Sql) {}

  private ensureSchema(): Promise<void> {
    if (!this.schemaReady) {
      this.schemaReady = this.sql`
        CREATE TABLE IF NOT EXISTS tournaments (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL
        )
      `.then(() => undefined);
    }
    return this.schemaReady;
  }

  async save(tournament: Tournament): Promise<void> {
    await this.ensureSchema();
    const stored = JSON.parse(JSON.stringify(toStored(tournament))) as JSONValue;
    await this
      .sql`INSERT INTO tournaments (id, data) VALUES (${tournament.id}, ${this.sql.json(stored)})
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async findById(id: string): Promise<Tournament | null> {
    await this.ensureSchema();
    const rows = await this.sql<{ data: StoredTournament }[]>`
      SELECT data FROM tournaments WHERE id = ${id}
    `;
    return rows.length > 0 ? fromStored(rows[0].data) : null;
  }

  async findAll(): Promise<Tournament[]> {
    await this.ensureSchema();
    const rows = await this.sql<{ data: StoredTournament }[]>`SELECT data FROM tournaments`;
    return rows.map((row) => fromStored(row.data));
  }

  async remove(id: string): Promise<void> {
    await this.ensureSchema();
    await this.sql`DELETE FROM tournaments WHERE id = ${id}`;
  }
}
