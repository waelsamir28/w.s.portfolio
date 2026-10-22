import { db } from "@/db";
import { pageViews } from "@/db/schema";

export const dynamic = "force-dynamic";

/** عداد زيارات حقيقي — يُستدعى مرة واحدة لكل جلسة متصفح. */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const p = String(body.path ?? "").slice(0, 200);
    if (!p.startsWith("/")) return Response.json({ ok: false });
    if (p.startsWith("/api") || p.startsWith("/admin")) return Response.json({ ok: false });
    await db.insert(pageViews).values({ path: p });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
