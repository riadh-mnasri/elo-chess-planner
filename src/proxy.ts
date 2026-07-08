import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { AUTH_COOKIE_NAME } from "./infrastructure/auth/auth-cookie";
import { getCurrentPasswordHashUseCase } from "./infrastructure/composition-root";

const intlMiddleware = createMiddleware(routing);
const LOGIN_PATH_PATTERN = /\/login\/?$/;

// A shared-password gate for the whole app. The current password is
// resolved by GetCurrentPasswordHashUseCase: a password changed in-app
// (stored via JsonFileAuthSettingsRepository) always wins over the
// APP_PASSWORD environment variable, which only serves as the initial
// bootstrap value. If neither is set (e.g. local dev), the app is fully
// open. This is intentionally minimal - a single shared password, not
// per-user accounts - since the app is only meant to be used by one family.
// Proxy runs on the Node.js runtime by default in Next.js 16, so it can
// read the same JSON file store as the rest of the app.
export async function proxy(request: NextRequest) {
  if (LOGIN_PATH_PATTERN.test(request.nextUrl.pathname)) {
    return intlMiddleware(request);
  }

  const expectedHash = await getCurrentPasswordHashUseCase.execute(
    process.env.APP_PASSWORD ?? null,
  );

  if (!expectedHash) {
    return intlMiddleware(request);
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (cookieValue !== expectedHash) {
    const locale = request.nextUrl.pathname.startsWith("/fr") ? "fr" : "en";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
