"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  importCsvAction,
  type ImportGamesFormState,
} from "@/app/[locale]/players/[id]/import/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses } from "@/presentation/components/ui/input";

const initialState: ImportGamesFormState = { error: null, importedCount: null };

export function ImportCsvForm({ playerId }: { playerId: string }) {
  const t = useTranslations("ImportPage");
  const [state, formAction, isPending] = useActionState(importCsvAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="playerId" value={playerId} />
      <h3 className="text-sm font-medium">{t("csvHeading")}</h3>
      <p className="text-xs text-muted">{t("csvHelp")}</p>
      <textarea
        name="csv"
        rows={4}
        placeholder={t("csvPlaceholder")}
        className={`${inputClasses} font-mono`}
      />

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

      <Button type="submit" variant="secondary" disabled={isPending} className="self-start">
        {t("csvSubmitButton")}
      </Button>
    </form>
  );
}
