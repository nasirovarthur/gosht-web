import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRestaurantBranchesData } from "@/lib/getRestaurantBranches";
import {
  checkRateLimit,
  getClientIp,
  isTrustedOriginRequest,
} from "@/lib/serverSecurity";
import type { LocalizedOptional } from "@/types/i18n";

export const runtime = "nodejs";

type RestaurantOption = {
  id: string;
  name: LocalizedOptional;
};

export async function GET(request: NextRequest) {
  if (!isTrustedOriginRequest(request, { requireBrowserHeaders: true })) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `feedback-restaurants:${ip}`,
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    const data = await getRestaurantBranchesData();

    const restaurants: RestaurantOption[] = data.projects.map((project) => ({
      id: project.id,
      name: project.name,
    }));

    return NextResponse.json(
      { restaurants },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Feedback restaurants fetch failed:", error);
    return NextResponse.json({ restaurants: [] }, { status: 200 });
  }
}
