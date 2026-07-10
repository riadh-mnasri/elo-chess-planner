"use server";

import { revalidatePath } from "next/cache";
import type { ExternalApiSource } from "@/application/ports/external-rating-provider";
import {
  importExternalGamesFromCsvUseCase,
  importFfeTournamentGamesUseCase,
  syncExternalGamesUseCase,
} from "@/infrastructure/composition-root";

export interface ImportGamesFormState {
  error: string | null;
  importedCount: number | null;
}

export async function importCsvAction(
  _previousState: ImportGamesFormState,
  formData: FormData,
): Promise<ImportGamesFormState> {
  const playerId = String(formData.get("playerId") ?? "");
  const csv = String(formData.get("csv") ?? "");

  const outcome = await importExternalGamesFromCsvUseCase.execute({ playerId, csv });
  if (outcome.errors.length > 0) {
    return { error: outcome.errors.join(" / "), importedCount: null };
  }

  revalidatePath("/[locale]/players/[id]/import", "page");
  return { error: null, importedCount: outcome.importedCount };
}

export async function importFfeTournamentAction(
  _previousState: ImportGamesFormState,
  formData: FormData,
): Promise<ImportGamesFormState> {
  const playerId = String(formData.get("playerId") ?? "");
  const tournamentUrl = String(formData.get("tournamentUrl") ?? "");
  const playerName = String(formData.get("playerName") ?? "");

  try {
    const outcome = await importFfeTournamentGamesUseCase.execute({
      playerId,
      tournamentUrl,
      playerName,
    });
    revalidatePath("/[locale]/players/[id]/import", "page");
    return { error: null, importedCount: outcome.importedCount };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      importedCount: null,
    };
  }
}

export async function syncExternalGamesAction(
  _previousState: ImportGamesFormState,
  formData: FormData,
): Promise<ImportGamesFormState> {
  const playerId = String(formData.get("playerId") ?? "");
  const source = String(formData.get("source") ?? "") as ExternalApiSource;
  const username = String(formData.get("username") ?? "");

  try {
    const outcome = await syncExternalGamesUseCase.execute({ playerId, source, username });
    revalidatePath("/[locale]/players/[id]/import", "page");
    return { error: null, importedCount: outcome.importedCount };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      importedCount: null,
    };
  }
}
