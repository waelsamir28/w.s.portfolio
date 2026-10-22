import { db } from "@/db";
import { projects, categories, clientRequests, pageViews } from "@/db/schema";
import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { requireAdmin, recentActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [published, drafts, hiddenCount, cats, reqs, viewsTotal, viewsWeek, recent, incomplete, activity] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(eq(projects.status, "published")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(eq(projects.status, "draft")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(eq(projects.hidden, true)),
      db.select({ count: sql<number>`count(*)::int` }).from(categories),
      db
        .select({ status: clientRequests.status, count: sql<number>`count(*)::int` })
        .from(clientRequests)
        .groupBy(clientRequests.status),
      db.select({ count: sql<number>`count(*)::int` }).from(pageViews),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, sevenDaysAgo)),
      db
        .select({
          id: projects.id,
          title: projects.title,
          slug: projects.slug,
          status: projects.status,
          createdAt: projects.createdAt,
          coverImage: projects.coverImage,
        })
        .from(projects)
        .orderBy(desc(projects.id))
        .limit(5),
      db
        .select({
          id: projects.id,
          title: projects.title,
          slug: projects.slug,
        })
        .from(projects)
        .where(
          and(
            eq(projects.status, "published"),
            or(eq(projects.description, ""), eq(projects.coverImage, ""))
          )
        )
        .limit(5),
      recentActivity(8),
    ]);

  return Response.json({
    stats: {
      published: published[0]!.count,
      drafts: drafts[0]!.count,
      hidden: hiddenCount[0]!.count,
      categories: cats[0]!.count,
      requestsByStatus: reqs,
      viewsTotal: viewsTotal[0]!.count,
      viewsWeek: viewsWeek[0]!.count,
    },
    recent,
    incomplete,
    activity,
  });
}
