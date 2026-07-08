"use server";

import { cookies } from "next/headers";
import { hashPassword } from "@/domain/auth/hash-password";
import { AUTH_COOKIE_NAME } from "@/infrastructure/auth/auth-cookie";
import { changePasswordUseCase } from "@/infrastructure/composition-root";

export interface ChangePasswordFormState {
  error: string | null;
  success: boolean;
}

export async function changePasswordAction(
  _previousState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match", success: false };
  }

  const outcome = await changePasswordUseCase.execute({
    currentPassword,
    newPassword,
    fallbackPassword: process.env.APP_PASSWORD ?? null,
  });

  if (!outcome.success) {
    return { error: outcome.error, success: false };
  }

  // Refresh the session cookie so the current browser stays signed in with
  // the new password instead of being logged out.
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, await hashPassword(newPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { error: null, success: true };
}
