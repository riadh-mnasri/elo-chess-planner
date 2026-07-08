"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { ExternalApiSource } from "@/application/ports/external-rating-provider";
import {
  syncExternalGamesAction,
  type ImportGamesFormState,
} from "@/app/[locale]/players/[id]/import/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses } from "@/presentation/components/ui/input";

const initialState: ImportGamesFormState = { error: null, importedCount: null };

export function SyncExternalGamesForm({
  playerId,
  source,
}: {
  playerId: string;
  source: ExternalApiSource;
}) {
  const t = useTranslations("ImportPage");
  const [state, formAction, isPending] = useActionState(
    syncExternalGamesAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="source" value={source} />

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
          {source === "chesscom" ? "chess.com" : "lichess"} {t("usernameLabel")}
          <input name="username" required className={inputClasses} />
        </label>

        <Button type="submit" variant="secondary" disabled={isPending}>
          {source === "chesscom" ? t("syncChesscomButton") : t("syncLichessButton")}
        </Button>
      </div>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.importedCount !== null ? (
        <p className="text-sm text-accent">
          {t("importSuccess", { count: state.importedCount })}
        </p>
      ) : null}
    </form>
  );
}
