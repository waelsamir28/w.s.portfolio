import { db } from "@/db";
import { projects, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";
import { parseProjectBody, uniqueSlug } from "../route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });
  const rows = await db
    .select({ p: projects, categoryName: categories.name })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(eq(projects.id, id))
    .limit(1);
  if (!rows[0]) return Response.json({ error: "غير موجود" }, { status: 404 });
  return Response.json({ project: { ...rows[0]!.p, categoryName: rows[0]!.categoryName ?? "" } });
}

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });

    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing[0]) return Response.json({ error: "غير موجود" }, { status: 404 });

    const body = (await req.json()) as Record<string, unknown>;
    const data = parseProjectBody(body);
    if (!data.title) return Response.json({ error: "اسم المشروع مطلوب." }, { status: 400 });

    const requestedSlug = data.slug;
    const currentSlug = existing[0]!.slug;
    const slugChanged = requestedSlug && requestedSlug !== currentSlug;
    const finalSlug = slugChanged ? await uniqueSlug(requestedSlug, id) : currentSlug;

    await db
      .update(projects)
      .set({ ...data, slug: finalSlug, updatedAt: new Date() })
      .where(eq(projects.id, id));

    await logActivity(auth.id, "تعديل مشروع", `${data.title} (${finalSlug})`);
    return Response.json({ ok: true, slug: finalSlug });
  } catch (err) {
    console.error("[projects.update]", err);
    return Response.json({ error: "فشل الحفظ." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });
    const existing = await db.select({ title: projects.title }).from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing[0]) return Response.json({ error: "غير موجود" }, { status: 404 });
    await db.delete(projects).where(eq(projects.id, id));
    await logActivity(auth.id, "حذف مشروع", existing[0]!.title);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[projects.delete]", err);
    return Response.json({ error: "فشل الحذف." }, { status: 500 });
  }
}
