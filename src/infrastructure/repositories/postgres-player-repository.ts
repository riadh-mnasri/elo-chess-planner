import type { JSONValue, Sql } from "postgres";
import type { Player } from "@/domain/player/player";
import type { PlayerRepository } from "@/application/ports/player-repository";

// A record shaped exactly like Player but with the birth date serialized to
// an ISO string, mirroring JsonFilePlayerRepository's approach - the whole
// entity is stored as one JSONB blob keyed by id, which keeps this adapter
// a near drop-in replacement without a normalized relational schema.
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

export class PostgresPlayerRepository implements PlayerRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(private readonly sql: Sql) {}

  private ensureSchema(): Promise<void> {
    if (!this.schemaReady) {
      this.schemaReady = this.sql`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL
        )
      `.then(() => undefined);
    }
    return this.schemaReady;
  }

  async save(player: Player): Promise<void> {
    await this.ensureSchema();
    // Round-tripping through JSON.stringify/parse gives a plain value the
    // postgres.js JSONValue type accepts unambiguously (it otherwise tries
    // to match structurally against its Date special-case).
    const stored = JSON.parse(JSON.stringify(toStored(player))) as JSONValue;
    await this
      .sql`INSERT INTO players (id, data) VALUES (${player.id}, ${this.sql.json(stored)})
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async findById(id: string): Promise<Player | null> {
    await this.ensureSchema();
    const rows = await this.sql<{ data: StoredPlayer }[]>`
      SELECT data FROM players WHERE id = ${id}
    `;
    return rows.length > 0 ? fromStored(rows[0].data) : null;
  }

  async findAll(): Promise<Player[]> {
    await this.ensureSchema();
    const rows = await this.sql<{ data: StoredPlayer }[]>`SELECT data FROM players`;
    return rows.map((row) => fromStored(row.data));
  }

  async remove(id: string): Promise<void> {
    await this.ensureSchema();
    await this.sql`DELETE FROM players WHERE id = ${id}`;
  }
}
