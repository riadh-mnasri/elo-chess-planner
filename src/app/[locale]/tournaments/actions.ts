"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { GameResult } from "@/domain/tournament/tournament";
import {
  createTournamentUseCase,
  generateNextRoundUseCase,
  removeTournamentUseCase,
  submitPastedRoundResultsUseCase,
  submitRoundResultsUseCase,
} from "@/infrastructure/composition-root";

export interface CreateTournamentFormState {
  error: string | null;
}

export async function createTournamentAction(
  _previousState: CreateTournamentFormState,
  formData: FormData,
): Promise<CreateTournamentFormState> {
  const locale = String(formData.get("locale") ?? "en");
  const name = String(formData.get("name") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const roundsPlanned = Number(formData.get("roundsPlanned") ?? 0);
  const playerIds = formData.getAll("playerIds").map(String);

  let tournamentId: string;
  try {
    const tournament = await createTournamentUseCase.execute({
      name,
      date: dateValue ? new Date(dateValue) : new Date(),
      roundsPlanned,
      playerIds,
    });
    tournamentId = tournament.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  revalidatePath("/[locale]/tournaments", "page");
  redirect(`/${locale}/tournaments/${tournamentId}`);
}

export interface SubmitResultsFormState {
  error: string | null;
}

export async function submitRoundResultsAction(
  _previousState: SubmitResultsFormState,
  formData: FormData,
): Promise<SubmitResultsFormState> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const roundNumber = Number(formData.get("roundNumber") ?? 0);

  const results: { board: number; result: GameResult }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("result-") && typeof value === "string" && value !== "") {
      results.push({
        board: Number(key.slice("result-".length)),
        result: value as GameResult,
      });
    }
  }

  try {
    await submitRoundResultsUseCase.execute({ tournamentId, roundNumber, results });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  revalidatePath("/[locale]/tournaments/[id]", "page");
  return { error: null };
}

export async function submitPastedResultsAction(
  _previousState: SubmitResultsFormState,
  formData: FormData,
): Promise<SubmitResultsFormState> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const roundNumber = Number(formData.get("roundNumber") ?? 0);
  const text = String(formData.get("text") ?? "");

  const outcome = await submitPastedRoundResultsUseCase.execute({
    tournamentId,
    roundNumber,
    text,
  });

  if (outcome.errors.length > 0) {
    return { error: outcome.errors.join(" / ") };
  }

  revalidatePath("/[locale]/tournaments/[id]", "page");
  return { error: null };
}

export interface GenerateNextRoundState {
  error: string | null;
}

export async function generateNextRoundAction(
  _previousState: GenerateNextRoundState,
  formData: FormData,
): Promise<GenerateNextRoundState> {
  const tournamentId = String(formData.get("tournamentId") ?? "");

  try {
    await generateNextRoundUseCase.execute(tournamentId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  revalidatePath("/[locale]/tournaments/[id]", "page");
  return { error: null };
}

export async function removeTournamentAction(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await removeTournamentUseCase.execute(tournamentId);
  revalidatePath("/[locale]/tournaments", "page");
}
