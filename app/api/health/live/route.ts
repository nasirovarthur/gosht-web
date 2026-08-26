export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "gosht-web-uz",
      release: process.env.RELEASE_COMMIT || "development",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
