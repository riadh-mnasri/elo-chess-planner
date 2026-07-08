"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction, type LoginFormState } from "@/app/[locale]/login/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses, labelClasses } from "@/presentation/components/ui/input";

const initialState: LoginFormState = { error: null };

export function LoginForm({ locale, from }: { locale: string; from: string }) {
  const t = useTranslations("LoginPage");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="from" value={from} />

      <label className={labelClasses}>
        {t("passwordLabel")}
        <input
          type="password"
          name="password"
          required
          autoFocus
          className={inputClasses}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {t("errorMessage")}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {t("submitButton")}
      </Button>
    </form>
  );
}
