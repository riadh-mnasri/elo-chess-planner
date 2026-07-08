"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  submitPastedResultsAction,
  type SubmitResultsFormState,
} from "@/app/[locale]/tournaments/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses } from "@/presentation/components/ui/input";

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
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="roundNumber" value={roundNumber} />

      <h3 className="text-sm font-medium">{t("pasteHeading")}</h3>
      <p className="text-xs text-muted">{t("pasteHelp")}</p>
      <textarea
        name="text"
        rows={4}
        placeholder={t("pastePlaceholder")}
        className={`${inputClasses} font-mono`}
      />

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={isPending} className="self-start">
        {t("pasteSubmitButton")}
      </Button>
    </form>
  );
}
