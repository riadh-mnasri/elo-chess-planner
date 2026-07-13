"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  syncFfeRatingAction,
  type SyncFfeRatingFormState,
} from "@/app/[locale]/players/actions";

const initialState: SyncFfeRatingFormState = { error: null, syncedRating: null };

// One-click refresh of a player's official rating from the FFE member
// registry (echecs.asso.fr), matching the player by name.
export function SyncFfeRatingButton({ playerId }: { playerId: string }) {
  const t = useTranslations("PlayersPage");
  const [state, formAction, isPending] = useActionState(syncFfeRatingAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
      >
        {isPending ? t("syncFfePending") : t("syncFfeButton")}
      </button>
      {state.error ? (
        <p className="max-w-48 text-right text-xs text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
