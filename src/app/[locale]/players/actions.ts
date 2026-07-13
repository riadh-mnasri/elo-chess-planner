"use server";

import { revalidatePath } from "next/cache";
import type { PlayerType } from "@/domain/player/player";
import {
  registerPlayerUseCase,
  removePlayerUseCase,
  syncFfeRatingUseCase,
} from "@/infrastructure/composition-root";

export interface RegisterPlayerFormState {
  error: string | null;
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function registerPlayerAction(
  _previousState: RegisterPlayerFormState,
  formData: FormData,
): Promise<RegisterPlayerFormState> {
  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "guest") as PlayerType;
  const birthDateValue = formData.get("birthDate");
  const birthDate =
    typeof birthDateValue === "string" && birthDateValue !== ""
      ? new Date(birthDateValue)
      : undefined;

  try {
    await registerPlayerUseCase.execute({
      name,
      type,
      birthDate,
      ratings: {
        fide: parseOptionalNumber(formData.get("fideRating")),
        ffe: parseOptionalNumber(formData.get("ffeRating")),
        chesscom: parseOptionalNumber(formData.get("chesscomRating")),
      },
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  revalidatePath("/[locale]/players", "page");
  return { error: null };
}

export interface SyncFfeRatingFormState {
  error: string | null;
  syncedRating: number | null;
}

export async function syncFfeRatingAction(
  _previousState: SyncFfeRatingFormState,
  formData: FormData,
): Promise<SyncFfeRatingFormState> {
  const playerId = String(formData.get("playerId") ?? "");

  try {
    const outcome = await syncFfeRatingUseCase.execute(playerId);
    revalidatePath("/[locale]/players", "page");
    return { error: null, syncedRating: outcome.rating };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      syncedRating: null,
    };
  }
}

export async function removePlayerAction(formData: FormData): Promise<void> {
  const playerId = String(formData.get("playerId") ?? "");
  await removePlayerUseCase.execute(playerId);
  revalidatePath("/[locale]/players", "page");
}
