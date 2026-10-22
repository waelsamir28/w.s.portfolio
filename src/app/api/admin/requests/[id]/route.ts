import { db } from "@/db";
import { clientRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "review", "contacted", "done", "rejected"] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });
    const existing = await db.select().from(clientRequests).where(eq(clientRequests.id, id)).limit(1);
    if (!existing[0]) return Response.json({ error: "غير موجود" }, { status: 404 });

    const body = (await req.json()) as { status?: string; adminNotes?: string };
    const status = STATUSES.includes(body.status as (typeof STATUSES)[number])
      ? (body.status as string)
      : existing[0]!.status;
    const adminNotes =
      typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 2000) : existing[0]!.adminNotes;

    await db
      .update(clientRequests)
      .set({ status, adminNotes })
      .where(eq(clientRequests.id, id));

    await logActivity(auth.id, "تحديث طلب عميل", `#${id} → ${status}`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[requests.update]", err);
    return Response.json({ error: "فشل الحفظ." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });
    await db.delete(clientRequests).where(eq(clientRequests.id, id));
    await logActivity(auth.id, "حذف طلب عميل", `#${id}`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "فشل الحذف." }, { status: 500 });
  }
}
