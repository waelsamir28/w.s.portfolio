import { db } from "@/db";
import { categories, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });
    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!existing[0]) return Response.json({ error: "غير موجود" }, { status: 404 });

    const body = (await req.json()) as {
      name?: string;
      description?: string;
      visible?: boolean;
      sortOrder?: number;
    };
    const name = (body.name ?? existing[0]!.name).trim().slice(0, 80);
    if (!name) return Response.json({ error: "اسم التصنيف مطلوب." }, { status: 400 });

    await db
      .update(categories)
      .set({
        name,
        description: (body.description ?? existing[0]!.description).trim().slice(0, 300),
        visible: body.visible !== undefined ? body.visible : existing[0]!.visible,
        sortOrder:
          typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
            ? Math.round(body.sortOrder)
            : existing[0]!.sortOrder,
      })
      .where(eq(categories.id, id));

    await logActivity(auth.id, "تعديل تصنيف", name);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[categories.update]", err);
    return Response.json({ error: "فشل الحفظ." }, { status: 500 });
  }
}

/**
 * حذف تصنيف.
 * إن كانت له مشاريع: يجب تمرير moveTo (تصنيف بديل) — وإلا يُرفض الحذف.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return Response.json({ error: "id غير صالح" }, { status: 400 });

    const body = (await req.json().catch(() => ({}))) as { moveTo?: number | null };
    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!existing[0]) return Response.json({ error: "غير موجود" }, { status: 404 });

    const linked = await db
      .select({ count: projects.id })
      .from(projects)
      .where(eq(projects.categoryId, id));
    const count = linked.length;

    if (count > 0) {
      if (typeof body.moveTo !== "number" || body.moveTo === id) {
        return Response.json(
          { error: `هذا التصنيف مرتبط بـ ${count} مشروع. اختر تصنيفًا بديلًا لنقلها إليه.` },
          { status: 400 }
        );
      }
      const target = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, body.moveTo)).limit(1);
      if (!target[0]) return Response.json({ error: "التصنيف البديل غير موجود." }, { status: 400 });
      await db.update(projects).set({ categoryId: body.moveTo }).where(eq(projects.categoryId, id));
    }

    await db.delete(categories).where(eq(categories.id, id));
    await logActivity(auth.id, "حذف تصنيف", existing[0]!.name + (count ? ` (نُقل ${count} مشروع)` : ""));
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[categories.delete]", err);
    return Response.json({ error: "فشل الحذف." }, { status: 500 });
  }
}
