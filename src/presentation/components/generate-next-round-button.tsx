"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  generateNextRoundAction,
  type GenerateNextRoundState,
} from "@/app/[locale]/tournaments/actions";

const initialState: GenerateNextRoundState = { error: null };

export function GenerateNextRoundButton({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const t = useTranslations("TournamentDetailPage");
  const [state, formAction, isPending] = useActionState(
    generateNextRoundAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t("generateNextRoundButton")}
      </button>
    </form>
  );
}
