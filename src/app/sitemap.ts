import type { MetadataRoute } from "next";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    await ensureSeeded();
    const rows = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(and(eq(projects.status, "published"), eq(projects.hidden, false)));
    const projectUrls: MetadataRoute.Sitemap = rows.map((r) => ({
      url: `${base}/projects/${r.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    const staticUrls: MetadataRoute.Sitemap = [
      { url: base, changeFrequency: "weekly", priority: 1 },
      { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${base}/services`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
    ];
    return [...staticUrls, ...projectUrls];
  } catch {
    return [
      { url: base, changeFrequency: "weekly", priority: 1 },
      { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.9 },
    ];
  }
}
