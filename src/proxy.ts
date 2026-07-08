import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { hashPassword } from "./infrastructure/auth/hash-password";
import { AUTH_COOKIE_NAME } from "./infrastructure/auth/auth-cookie";

const intlMiddleware = createMiddleware(routing);
const LOGIN_PATH_PATTERN = /\/login\/?$/;

// A shared-password gate for the whole app: if APP_PASSWORD is not set
// (e.g. local dev), the app is fully open. If it is set (e.g. on the
// deployed Vercel instance), every request must carry a cookie matching a
// hash of that password, or it is redirected to the login page. This is
// intentionally minimal - a single shared password, not per-user accounts -
// since the app is only meant to be used by one family.
export async function proxy(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || LOGIN_PATH_PATTERN.test(request.nextUrl.pathname)) {
    return intlMiddleware(request);
  }

  const expectedHash = await hashPassword(appPassword);
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
