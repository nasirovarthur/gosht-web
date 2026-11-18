import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["uz", "ru", "en"];
const DEFAULT_LANGUAGE = "uz";
const PRODUCTION_HOSTS = new Set(["gosht.uz", "www.gosht.uz"]);

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
  const destination = request.nextUrl.clone();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const requestHostname = destination.hostname.toLowerCase();
  const headerHostname = request.headers.get("host")?.toLowerCase().split(":")[0];
  const forwardedHostname = forwardedHost?.toLowerCase().split(":")[0];
  const isLoopbackRequest = [requestHostname, headerHostname].some(hostname =>
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
  const hostname = [headerHostname, requestHostname].find(value => value && PRODUCTION_HOSTS.has(value))
    || (isLoopbackRequest && forwardedHostname && PRODUCTION_HOSTS.has(forwardedHostname) ? forwardedHostname : requestHostname);
  const protocol = (request.headers.get("x-forwarded-proto")?.split(",")[0].trim()
    || destination.protocol.replace(":", "")).toLowerCase();
  const isProductionHost = PRODUCTION_HOSTS.has(hostname);
  const needsCanonicalOrigin = isProductionHost && (hostname !== "gosht.uz" || protocol !== "https");

  if (isProductionHost) {
    destination.protocol = "https:";
    destination.hostname = "gosht.uz";
    destination.port = "";
  }

  const skipLanguage =
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/api" ||
    pathname.startsWith("/api/");
  const pathnameLanguage = extractLanguageFromPathname(pathname);

  if (!skipLanguage && !pathnameLanguage) {
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

    destination.pathname = pathname === "/"
      ? `/${resolvedLanguage}`
      : `/${resolvedLanguage}${pathname}`;
    return NextResponse.redirect(destination, 307);
  }

  if (needsCanonicalOrigin) {
    return NextResponse.redirect(destination, 308);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-gosht-language", pathnameLanguage || DEFAULT_LANGUAGE);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest|pdf|doc|docx)).*)",
    "/(api|trpc)(.*)",
  ],
};
