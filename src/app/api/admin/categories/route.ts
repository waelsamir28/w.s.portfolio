import { db } from "@/db";
import { categories, projects } from "@/db/schema";
import { asc, isNotNull, sql } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const [list, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id)),
    db
      .select({
        categoryId: projects.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .where(isNotNull(projects.categoryId))
      .groupBy(projects.categoryId),
  ]);

  const countMap = new Map<number, number>(counts.map((c) => [c.categoryId as number, Number(c.count)]));

  return Response.json({
    categories: list.map((c) => ({ ...c, projectCount: countMap.get(c.id) ?? 0 })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const body = (await req.json()) as { name?: string; description?: string; visible?: boolean };
    const name = (body.name ?? "").trim().slice(0, 80);
    if (!name) return Response.json({ error: "اسم التصنيف مطلوب." }, { status: 400 });
    const slug = `cat-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
    const inserted = await db
      .insert(categories)
      .values({
        slug,
        name,
        description: (body.description ?? "").trim().slice(0, 300),
        visible: body.visible !== false,
        sortOrder: 100,
      })
      .returning({ id: categories.id });
    await logActivity(auth.id, "إنشاء تصنيف", name);
    return Response.json({ id: inserted[0]!.id }, { status: 201 });
  } catch (err) {
    console.error("[categories.create]", err);
    return Response.json({ error: "فشل إنشاء التصنيف." }, { status: 500 });
  }
}
