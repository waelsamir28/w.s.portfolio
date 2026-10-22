import { db } from "@/db";
import { projects, categories } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings, SECTION_IDS } from "@/lib/settings";
import Hero from "@/components/site/Hero";
import {
  CTASection,
  FeaturedSection,
  ProcessSection,
  AboutSection,
  ServicesSection,
  SkillsSection,
  type PublicProject,
} from "@/components/site/HomeSections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const s = await getPublishedSettings();

  const rows = await db
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
      featured: projects.featured,
      sortOrder: projects.sortOrder,
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(and(eq(projects.status, "published"), eq(projects.hidden, false)))
    .orderBy(asc(projects.sortOrder));

  const all: PublicProject[] = rows.map((r) => ({
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

  const featured = all.filter((p) => {
    const row = rows.find((r) => r.id === p.id);
    return row?.featured;
  });
  const featuredShown: PublicProject[] = featured.length > 0 ? featured.slice(0, 6) : all.slice(0, 6);

  const animate = s.design.animations;

  const order = s.sections.order.filter((id) =>
    (SECTION_IDS as readonly string[]).includes(id)
  );
  for (const id of SECTION_IDS) if (!order.includes(id)) order.push(id);

  const visible = (id: string) => s.sections.visibility[id] !== false;

  return (
    <>
      {order.map((id) => {
        if (!visible(id)) return null;
        switch (id) {
          case "hero":
            return (
              <Hero
                key="hero"
                title={s.hero.title}
                subtitle={s.hero.subtitle}
                btnWorks={s.hero.btnWorks}
                btnRequest={s.hero.btnRequest}
                btnContact={s.hero.btnContact}
                brandName={s.brand.name}
                brandTitle={s.brand.title}
                animate={animate}
              />
            );
          case "featured":
            return (
              <FeaturedSection key="featured" s={s} projects={featuredShown} animate={animate} />
            );
          case "services":
            return <ServicesSection key="services" s={s} animate={animate} />;
          case "about":
            return <AboutSection key="about" s={s} animate={animate} />;
          case "skills":
            return <SkillsSection key="skills" s={s} animate={animate} />;
          case "process":
            return <ProcessSection key="process" s={s} animate={animate} />;
          case "cta":
            return <CTASection key="cta" s={s} animate={animate} />;
          default:
            return null;
        }
      })}
    </>
  );
}
