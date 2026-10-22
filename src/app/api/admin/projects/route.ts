import { db } from "@/db";
import { projects, categories } from "@/db/schema";
import { asc, desc, eq, ne, and } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function serializeSlug(input: string): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return s || `project-${Date.now().toString(36)}`;
}

export async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const latin = base.replace(/[^\x00-\x7F]/g, "") || base;
  let candidate = latin || `project-${Date.now().toString(36)}`;
  for (let i = 2; i < 20; i++) {
    const rows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        excludeId ? and(eq(projects.slug, candidate), ne(projects.id, excludeId)) : eq(projects.slug, candidate)
      )
      .limit(1);
    if (rows.length === 0) return candidate;
    candidate = `${latin}-${i}`;
  }
  return `${latin}-${Date.now().toString(36)}`;
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";

const strArr = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => str(x, 80)).filter(Boolean).slice(0, 24) : [];

export function parseProjectBody(body: Record<string, unknown>) {
  const gallery = Array.isArray(body.gallery)
    ? body.gallery
        .filter((g) => g && typeof g === "object" && typeof (g as { url?: unknown }).url === "string")
        .map((g) => ({
          url: str((g as { url: string }).url, 300),
          alt: str((g as { alt?: string }).alt, 200),
        }))
        .slice(0, 24)
    : [];

  return {
    title: str(body.title, 140),
    slug: serializeSlug(str(body.slug, 100)),
    categoryId: typeof body.categoryId === "number" ? body.categoryId : null,
    coverImage: str(body.coverImage, 300),
    gallery,
    videoUrl: str(body.videoUrl, 500),
    description: str(body.description, 8000),
    goal: str(body.goal, 3000),
    servicesDone: strArr(body.servicesDone).slice(0, 12),
    role: str(body.role, 300),
    tools: strArr(body.tools).slice(0, 12),
    projectDate: str(body.projectDate, 40),
    tags: strArr(body.tags).slice(0, 12),
    featured: body.featured === true,
    hidden: body.hidden === true,
    status: body.status === "published" ? "published" : "draft",
    sortOrder:
      typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
        ? Math.round(body.sortOrder)
        : 0,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const rows = await db
    .select({
      p: projects,
      categoryName: categories.name,
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .orderBy(asc(projects.sortOrder), desc(projects.id));
  return Response.json({
    projects: rows.map((r) => ({ ...r.p, categoryName: r.categoryName ?? "" })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data = parseProjectBody(body);
    if (!data.title) return Response.json({ error: "اسم المشروع مطلوب." }, { status: 400 });
    data.slug = await uniqueSlug(data.slug);
    const inserted = await db
      .insert(projects)
      .values(data)
      .returning({ id: projects.id, slug: projects.slug });
    await logActivity(auth.id, "إنشاء مشروع", `${data.title} (${data.slug})`);
    return Response.json({ id: inserted[0]!.id, slug: inserted[0]!.slug }, { status: 201 });
  } catch (err) {
    console.error("[projects.create]", err);
    return Response.json({ error: "فشل إنشاء المشروع." }, { status: 500 });
  }
}
