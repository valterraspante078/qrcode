import { buildScheduledMediumDraft, DEFAULT_SITE_URL } from "@/lib/medium-drafts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const draft = buildScheduledMediumDraft(new Date(), { siteUrl });

  return Response.json({
    ok: true,
    mode: "safe_prepare_only",
    message:
      "Scheduled Medium draft payload prepared. Computer Use publishing must run locally with human confirmation before sending content to Medium.",
    schedule: draft.schedule,
    post: draft.post,
    summary: draft.summary,
    warnings: draft.warnings,
  });
}
