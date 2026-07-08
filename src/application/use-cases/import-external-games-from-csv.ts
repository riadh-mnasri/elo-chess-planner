import { randomUUID } from "node:crypto";
import { parseExternalGamesCsv } from "@/domain/external-import/parse-external-games-csv";
import type { ExternalGameImport } from "@/domain/external-import/external-game";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";

export interface ImportExternalGamesFromCsvInput {
  playerId: string;
  csv: string;
}

export interface ImportExternalGamesFromCsvOutcome {
  importedCount: number;
  errors: string[];
}

export class ImportExternalGamesFromCsvUseCase {
  constructor(private readonly games: ExternalGameRepository) {}

  async execute(
    input: ImportExternalGamesFromCsvInput,
  ): Promise<ImportExternalGamesFromCsvOutcome> {
    const { rows, errors } = parseExternalGamesCsv(input.csv);

    if (errors.length > 0) {
      return { importedCount: 0, errors };
    }
    if (rows.length === 0) {
      return { importedCount: 0, errors: ["No rows found in the pasted CSV"] };
    }

    const importBatchId = randomUUID();
    const records: ExternalGameImport[] = rows.map((row) => ({
      id: randomUUID(),
      playerId: input.playerId,
      source: row.source,
      date: row.date,
      opponent: row.opponent,
      result: row.result,
      eloBefore: row.eloBefore,
      eloAfter: row.eloAfter,
      importBatchId,
    }));

    await this.games.saveMany(records);
    return { importedCount: records.length, errors: [] };
  }
}
