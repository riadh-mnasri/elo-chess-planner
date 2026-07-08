"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  submitPastedResultsAction,
  type SubmitResultsFormState,
} from "@/app/[locale]/tournaments/actions";

const initialState: SubmitResultsFormState = { error: null };

export function PasteResultsForm({
  tournamentId,
  roundNumber,
}: {
  tournamentId: string;
  roundNumber: number;
}) {
  const t = useTranslations("TournamentDetailPage");
  const [state, formAction, isPending] = useActionState(
    submitPastedResultsAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="roundNumber" value={roundNumber} />

      <h3 className="text-sm font-medium">{t("pasteHeading")}</h3>
      <p className="text-xs text-foreground/60">{t("pasteHelp")}</p>
      <textarea
        name="text"
        rows={4}
        placeholder={t("pastePlaceholder")}
        className="rounded border border-foreground/20 bg-transparent px-2 py-1 font-mono text-sm"
      />

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded border border-foreground/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {t("pasteSubmitButton")}
      </button>
    </form>
  );
}
