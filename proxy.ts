import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["uz", "ru", "en"];
const DEFAULT_LANGUAGE = "uz";
const DEV_HOST = "dev.gosht.uz";
const DEV_AUTH_LOGIN = "admin";
const DEV_AUTH_PASSWORD = "admin111";

function extractLanguageFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/(uz|ru|en)(?=\/|$)/);
  return match ? match[1] : null;
}

function safeParsePathname(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];

  if (host === DEV_HOST) {
    const authorization = request.headers.get("authorization");
    const expectedToken = btoa(`${DEV_AUTH_LOGIN}:${DEV_AUTH_PASSWORD}`);
    const providedToken = authorization?.startsWith("Basic ")
      ? authorization.slice("Basic ".length).trim()
      : "";

    if (providedToken !== expectedToken) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="dev.gosht.uz", charset="UTF-8"',
        },
      });
    }
  }

  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const pathnameHasLanguage = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (pathnameHasLanguage || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const referer = request.headers.get("referer");
  const refererPathname = referer ? safeParsePathname(referer) : null;
  const refererLanguage = refererPathname
    ? extractLanguageFromPathname(refererPathname)
    : null;
  const preferredLanguage = request.cookies.get("preferredLanguage")?.value;

  const resolvedLanguage = SUPPORTED_LANGUAGES.includes(refererLanguage || "")
    ? refererLanguage!
    : SUPPORTED_LANGUAGES.includes(preferredLanguage || "")
      ? preferredLanguage!
      : DEFAULT_LANGUAGE;

  if (!pathnameHasLanguage && pathname === "/") {
    return NextResponse.redirect(new URL(`/${resolvedLanguage}`, request.url));
  }

  if (!pathnameHasLanguage && pathname !== "/" && !pathname.startsWith("/api")) {
    return NextResponse.redirect(
      new URL(`/${resolvedLanguage}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest|pdf|doc|docx)).*)",
    "/(api|trpc)(.*)",
  ],
};
