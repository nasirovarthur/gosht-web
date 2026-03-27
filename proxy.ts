import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["uz", "ru", "en"];
const DEFAULT_LANGUAGE = "uz";

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
  const pathname = request.nextUrl.pathname;

  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    return NextResponse.next();
  }

  const pathnameHasLanguage = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

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
