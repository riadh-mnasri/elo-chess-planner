import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import type { ExternalGameRepository } from "@/application/ports/external-game-repository";
import { ImportExternalGamesFromCsvUseCase } from "../import-external-games-from-csv";

describe("ImportExternalGamesFromCsvUseCase", () => {
  it("parses the CSV and saves one record per valid row for the given player", async () => {
    // Given a repository mock and a valid two-row CSV
    const repository = mock<ExternalGameRepository>();
    const useCase = new ImportExternalGamesFromCsvUseCase(repository);
    const csv = [
      "date,opponent,result,eloBefore,eloAfter,source",
      "2026-06-01,Jean Dupont,win,1450,1458,ffe",
      "2026-06-08,Marie Petit,loss,1458,1450,chesscom",
    ].join("\n");

    // When importing the CSV for a player
    const outcome = await useCase.execute({ playerId: "p1", csv });

    // Then two games are saved for that player, sharing an import batch id
    expect(outcome.errors).toEqual([]);
    expect(outcome.importedCount).toBe(2);
    expect(repository.saveMany).toHaveBeenCalledTimes(1);
    const savedGames = repository.saveMany.mock.calls[0][0];
    expect(savedGames).toHaveLength(2);
    expect(savedGames[0].playerId).toBe("p1");
    expect(savedGames[0].importBatchId).toBe(savedGames[1].importBatchId);
  });

  it("reports parse errors and saves nothing when the CSV is invalid", async () => {
    // Given a repository mock and an invalid CSV row
    const repository = mock<ExternalGameRepository>();
    const useCase = new ImportExternalGamesFromCsvUseCase(repository);

    // When importing the malformed CSV
    const outcome = await useCase.execute({
      playerId: "p1",
      csv: "2026-06-01,Jean Dupont,not-a-result,1450,1458,ffe",
    });

    // Then errors are reported and nothing is saved
    expect(outcome.errors.length).toBeGreaterThan(0);
    expect(outcome.importedCount).toBe(0);
    expect(repository.saveMany).not.toHaveBeenCalled();
  });
});
