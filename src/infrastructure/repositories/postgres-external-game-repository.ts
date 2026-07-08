import type { Sql } from "postgres";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";

type StoredGame = Omit<ExternalGameImport, "date"> & { date: string };

function toStored(game: ExternalGameImport): StoredGame {
  return { ...game, date: game.date.toISOString() };
}

function fromStored(stored: StoredGame): ExternalGameImport {
  return { ...stored, date: new Date(stored.date) };
}

export class PostgresExternalGameRepository implements ExternalGameRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(private readonly sql: Sql) {}

  private ensureSchema(): Promise<void> {
    if (!this.schemaReady) {
      this.schemaReady = this.sql`
        CREATE TABLE IF NOT EXISTS external_games (
          id TEXT PRIMARY KEY,
          player_id TEXT NOT NULL,
          data JSONB NOT NULL
        )
      `
        .then(
          () => this.sql`
            CREATE INDEX IF NOT EXISTS external_games_player_id_idx
            ON external_games (player_id)
          `,
        )
        .then(() => undefined);
    }
    return this.schemaReady;
  }

  async saveMany(games: ExternalGameImport[]): Promise<void> {
    await this.ensureSchema();
    if (games.length === 0) return;

    const rows = games.map((game) => ({
      id: game.id,
      player_id: game.playerId,
      data: JSON.parse(JSON.stringify(toStored(game))),
    }));
    await this.sql`
      INSERT INTO external_games ${this.sql(rows, "id", "player_id", "data")}
    `;
  }

  async findByPlayerId(playerId: string): Promise<ExternalGameImport[]> {
    await this.ensureSchema();
    const rows = await this.sql<{ data: StoredGame }[]>`
      SELECT data FROM external_games WHERE player_id = ${playerId}
    `;
    return rows.map((row) => fromStored(row.data));
  }
}
