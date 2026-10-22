import type { Metadata } from "next";
import { db } from "@/db";
import { projects, categories } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import PortfolioGrid from "@/components/site/PortfolioGrid";
import { SectionHeading, type PublicProject } from "@/components/site/HomeSections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "معرض الأعمال",
  description: "معرض أعمال وائل سمير: هويات بصرية، إعلانات، موشن جرافيك، مطبوعات، وواجهات رقمية.",
};

export default async function PortfolioPage() {
  await ensureSeeded();
  const s = await getPublishedSettings();

  const [rows, cats] = await Promise.all([
    db
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        description: projects.description,
        coverImage: projects.coverImage,
        categoryName: categories.name,
        categoryId: projects.categoryId,
        tags: projects.tags,
        gallery: projects.gallery,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(and(eq(projects.status, "published"), eq(projects.hidden, false)))
      .orderBy(asc(projects.sortOrder)),
    db
      .select()
      .from(categories)
      .where(eq(categories.visible, true))
      .orderBy(asc(categories.sortOrder)),
  ]);

  const items: PublicProject[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    coverImage: r.coverImage,
    categoryName: r.categoryName ?? "",
    categoryId: r.categoryId,
    tags: r.tags ?? [],
    gallery: r.gallery ?? [],
  }));

  const animate = s.design.animations;

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container-x">
        <SectionHeading
          kicker="Portfolio"
          title={s.portfolio.title}
          subtitle={s.portfolio.subtitle}
          animate={animate}
          align="center"
        />
        <PortfolioGrid
          items={items}
          categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          animate={animate}
        />
      </div>
    </div>
  );
}
