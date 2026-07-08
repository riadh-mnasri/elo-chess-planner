"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/domain/auth/hash-password";
import { AUTH_COOKIE_NAME } from "@/infrastructure/auth/auth-cookie";
import { getCurrentPasswordHashUseCase } from "@/infrastructure/composition-root";

export interface LoginFormState {
  error: string | null;
}

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const from = String(formData.get("from") ?? `/${locale}`);

  const expectedHash = await getCurrentPasswordHashUseCase.execute(
    process.env.APP_PASSWORD ?? null,
  );
  const providedHash = await hashPassword(password);

  if (!expectedHash || providedHash !== expectedHash) {
    return { error: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, expectedHash, {
    httpOnly: true,
    // Secure cookies are silently dropped by browsers over plain HTTP,
    // which is what local dev uses; Vercel deployments are always HTTPS.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(from);
}
