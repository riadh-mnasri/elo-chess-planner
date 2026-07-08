"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/infrastructure/auth/hash-password";
import { AUTH_COOKIE_NAME } from "@/infrastructure/auth/auth-cookie";

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
  const expectedPassword = process.env.APP_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    return { error: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, await hashPassword(expectedPassword), {
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
