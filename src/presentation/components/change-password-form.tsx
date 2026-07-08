"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  changePasswordAction,
  type ChangePasswordFormState,
} from "@/app/[locale]/settings/password/actions";
import { Button } from "@/presentation/components/ui/button";
import { inputClasses, labelClasses } from "@/presentation/components/ui/input";

const initialState: ChangePasswordFormState = { error: null, success: false };

export function ChangePasswordForm() {
  const t = useTranslations("ChangePasswordPage");
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className={labelClasses}>
        {t("currentPasswordLabel")}
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        {t("newPasswordLabel")}
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        {t("confirmPasswordLabel")}
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className={inputClasses}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-accent">{t("successMessage")}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {t("submitButton")}
      </Button>
    </form>
  );
}
