import type { NextRequest } from "next/server";

type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

type OriginOptions = {
  requireBrowserHeaders?: boolean;
  requireStudioReferer?: boolean;
};

type RateLimitStore = Map<string, RateLimitState>;

const RATE_LIMIT_STORE_KEY = "__goshtRateLimitStore__";
const RATE_LIMIT_LAST_CLEANUP_KEY = "__goshtRateLimitLastCleanup__";
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60 * 1000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;

function getStore(): RateLimitStore {
  const globalObject = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_KEY]?: RateLimitStore;
  };

  if (!globalObject[RATE_LIMIT_STORE_KEY]) {
    globalObject[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitState>();
  }

  return globalObject[RATE_LIMIT_STORE_KEY];
}

function maybeCleanupStore(store: RateLimitStore, now: number): void {
  const globalObject = globalThis as typeof globalThis & {
    [RATE_LIMIT_LAST_CLEANUP_KEY]?: number;
  };

  const lastCleanup = globalObject[RATE_LIMIT_LAST_CLEANUP_KEY] ?? 0;
  if (store.size <= RATE_LIMIT_MAX_ENTRIES && now - lastCleanup < RATE_LIMIT_CLEANUP_INTERVAL_MS) {
    return;
  }

  for (const [storeKey, state] of store.entries()) {
    if (state.resetAt <= now) {
      store.delete(storeKey);
    }
  }

  if (store.size > RATE_LIMIT_MAX_ENTRIES) {
    const items = [...store.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    const removeCount = store.size - RATE_LIMIT_MAX_ENTRIES;
    for (let index = 0; index < removeCount; index += 1) {
      const keyToDelete = items[index]?.[0];
      if (keyToDelete) {
        store.delete(keyToDelete);
      }
    }
  }

  globalObject[RATE_LIMIT_LAST_CLEANUP_KEY] = now;
}

function parseAllowedOrigins(runtimeOrigin: string): Set<string> {
  const envOrigins = (process.env.ALLOWED_APP_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const origins = new Set([runtimeOrigin, ...envOrigins]);

  try {
    const runtimeUrl = new URL(runtimeOrigin);
    const port = runtimeUrl.port ? `:${runtimeUrl.port}` : "";
    const protocol = runtimeUrl.protocol;

    if (runtimeUrl.hostname === "localhost") {
      origins.add(`${protocol}//127.0.0.1${port}`);
    }

    if (runtimeUrl.hostname === "127.0.0.1") {
      origins.add(`${protocol}//localhost${port}`);
    }
  } catch {
    // Ignore invalid runtime origin and keep base set.
  }

  return origins;
}

function parseUrlOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitConfig): {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const store = getStore();
  maybeCleanupStore(store, now);
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function isTrustedOriginRequest(
  request: NextRequest,
  options: OriginOptions = {}
): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = parseAllowedOrigins(request.nextUrl.origin);

  if (options.requireBrowserHeaders && !origin && !referer) {
    return false;
  }

  if (origin && !allowedOrigins.has(origin)) {
    return false;
  }

  if (referer) {
    const refererOrigin = parseUrlOrigin(referer);
    if (!refererOrigin || !allowedOrigins.has(refererOrigin)) {
      return false;
    }

    if (options.requireStudioReferer) {
      let refererPath = "";
      try {
        refererPath = new URL(referer).pathname;
      } catch {
        return false;
      }

      if (!refererPath.includes("/studio")) {
        return false;
      }
    }
  } else if (options.requireStudioReferer) {
    return false;
  }

  return true;
}
