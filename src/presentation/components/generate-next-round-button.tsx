"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  generateNextRoundAction,
  type GenerateNextRoundState,
} from "@/app/[locale]/tournaments/actions";
import { Button } from "@/presentation/components/ui/button";

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
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {t("generateNextRoundButton")}
      </Button>
    </form>
  );
}
