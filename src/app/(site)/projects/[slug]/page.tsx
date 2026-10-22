import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { projects, categories } from "@/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import { getSessionAdmin } from "@/lib/auth";
import Lightbox from "@/components/site/Lightbox";
import GalleryOpener from "@/components/site/GalleryOpener";
import { ProjectCard, type PublicProject } from "@/components/site/HomeSections";
import { IconArrow } from "@/components/site/icons";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function ytId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await ensureSeeded();
  const [row, s] = await Promise.all([
    db
      .select({
        title: projects.title,
        description: projects.description,
        coverImage: projects.coverImage,
        categoryName: categories.name,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(eq(projects.slug, slug))
      .limit(1),
    getPublishedSettings(),
  ]);
  if (!row[0]) return { title: "مشروع غير موجود" };
  const cover = row[0]!.coverImage
    ? new URL(row[0]!.coverImage, siteUrl()).toString()
    : undefined;
  return {
    title: row[0]!.title,
    description: row[0]!.description.slice(0, 160) || s.brand.tagline,
    alternates: { canonical: `${siteUrl()}/projects/${slug}` },
    openGraph: {
      title: `${row[0]!.title} | ${s.brand.name}`,
      description: row[0]!.description.slice(0, 200) || s.brand.tagline,
      images: cover ? [{ url: cover }] : undefined,
      type: "article",
      locale: "ar_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: row[0]!.title,
      description: row[0]!.description.slice(0, 200),
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  await ensureSeeded();

  const [rows, s] = await Promise.all([
    db
      .select({ p: projects, categoryName: categories.name })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(eq(projects.slug, slug))
      .limit(1),
    getPublishedSettings(),
  ]);
  const found = rows[0];
  if (!found) notFound();
  const project = found.p;

  /* المشاريع غير المنشورة/المخفية تظهر لمدير الموقع فقط (معاينة) */
  const isPublic = project.status === "published" && !project.hidden;
  if (!isPublic) {
    const admin = await getSessionAdmin();
    if (!admin) notFound();
  }

  const similarRows = project.categoryId
    ? await db
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
        .where(
          and(
            eq(projects.status, "published"),
            eq(projects.hidden, false),
            eq(projects.categoryId, project.categoryId),
            ne(projects.id, project.id)
          )
        )
        .orderBy(asc(projects.sortOrder))
        .limit(3)
    : [];

  const similar: PublicProject[] = similarRows.map((r) => ({
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

  const gallery = project.gallery?.length ? project.gallery : project.coverImage ? [{ url: project.coverImage, alt: project.title }] : [];
  const ytid = project.videoUrl ? ytId(project.videoUrl) : null;
  const animate = s.design.animations;
  const isVimeo = /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(project.videoUrl ?? "");

  return (
    <div className="pt-28 pb-20 min-h-screen">
      {!isPublic && (
        <div className="container-x mb-6">
          <p className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2" style={{ color: "#d9b878", background: "rgba(198,161,91,.1)", border: "1px solid rgba(198,161,91,.3)", borderRadius: "10px" }}>
            معاينة — هذا المشروع غير منشور بعد، لا يراه الزوار.
          </p>
        </div>
      )}

      <div className="container-x">
        {/* رأس المشروع */}
        <nav className="mb-8 text-sm" style={{ color: "var(--muted)" }} aria-label="مسار التنقل">
          <Link href="/" className="hover:text-[var(--primary)] transition-colors">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/portfolio" className="hover:text-[var(--primary)] transition-colors">أعمالي</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--text)" }}>{project.title}</span>
        </nav>

        <div className="mb-10">
          <span className="chip mb-4">{found.categoryName || "أعمال متنوعة"}</span>
          {project.projectDate && <span className="chip ms-2">{project.projectDate}</span>}
          <h1 className="h2 mt-4 max-w-4xl">{project.title}</h1>
        </div>

        {/* الغلاف */}
        <div
          className="relative overflow-hidden mb-12"
          style={{ borderRadius: "calc(var(--radius) * 1.2)", border: "1px solid var(--border)" }}
        >
          {project.coverImage ? (
            gallery.length > 0 ? (
              <GalleryButton images={gallery} initial={0} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.coverImage} alt={project.title} className="w-full max-h-[70vh] object-cover" />
            )
          ) : (
            <div className="grid place-items-center" style={{ aspectRatio: "16/8", background: "var(--surface-2)" }}>
              <span className="font-en text-6xl font-bold" style={{ color: "color-mix(in srgb, var(--primary) 35%, transparent)" }}>
                {project.title.slice(0, 1)}
              </span>
            </div>
          )}
        </div>

        {/* المحتوى + بيانات جانبية */}
        <div className="grid lg:grid-cols-[1fr_22rem] gap-10 mb-16">
          <div className="space-y-10">
            {project.description && (
              <section>
                <h2 className="h2 !text-xl md:!text-2xl mb-4">الفكرة والوصف</h2>
                <p className="leading-9" style={{ color: "var(--muted)" }}>{project.description}</p>
              </section>
            )}

            {project.goal && (
              <section>
                <h2 className="h2 !text-xl md:!text-2xl mb-4">الهدف من التصميم</h2>
                <p className="leading-9" style={{ color: "var(--muted)" }}>{project.goal}</p>
              </section>
            )}

            {(project.servicesDone ?? []).length > 0 && (
              <section>
                <h2 className="h2 !text-xl md:!text-2xl mb-4">الخدمات المنفذة</h2>
                <div className="flex flex-wrap gap-2">
                  {(project.servicesDone ?? []).map((sv) => (
                    <span key={sv} className="chip">{sv}</span>
                  ))}
                </div>
              </section>
            )}

            {project.videoUrl && (
              <section>
                <h2 className="h2 !text-xl md:!text-2xl mb-4">عرض الفيديو</h2>
                <div style={{ borderRadius: "calc(var(--radius)*1.1)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  {ytid ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytid}`}
                      title={`فيديو: ${project.title}`}
                      className="w-full block"
                      style={{ aspectRatio: "16/9" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : isVimeo ? (
                    <iframe src={project.videoUrl} title={`فيديو: ${project.title}`} className="w-full block" style={{ aspectRatio: "16/9" }} allowFullScreen />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video controls className="w-full block bg-black" style={{ aspectRatio: "16/9" }} src={project.videoUrl} />
                  )}
                </div>
              </section>
            )}

            {gallery.length > 1 && (
              <section>
                <h2 className="h2 !text-xl md:!text-2xl mb-4">معرض صور المشروع</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((g, i) => (
                    <GalleryButton key={g.url + i} images={gallery} initial={i} small />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* بيانات جانبية */}
          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-extrabold mb-4">بطاقة المشروع</h3>
              <dl className="space-y-3.5 text-sm">
                <div>
                  <dt className="mb-1" style={{ color: "var(--muted)" }}>التصنيف</dt>
                  <dd className="font-semibold">{found.categoryName || "أعمال متنوعة"}</dd>
                </div>
                {project.role && (
                  <div>
                    <dt className="mb-1" style={{ color: "var(--muted)" }}>دوري في المشروع</dt>
                    <dd className="font-semibold leading-7">{project.role}</dd>
                  </div>
                )}
                {project.projectDate && (
                  <div>
                    <dt className="mb-1" style={{ color: "var(--muted)" }}>التاريخ</dt>
                    <dd className="font-semibold font-en" dir="ltr">{project.projectDate}</dd>
                  </div>
                )}
                {(project.tools ?? []).length > 0 && (
                  <div>
                    <dt className="mb-2" style={{ color: "var(--muted)" }}>الأدوات المستخدمة</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {(project.tools ?? []).map((t) => (
                        <span key={t} className="chip font-en" dir="ltr">{t}</span>
                      ))}
                    </dd>
                  </div>
                )}
                {(project.tags ?? []).length > 0 && (
                  <div>
                    <dt className="mb-2" style={{ color: "var(--muted)" }}>وسوم</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {(project.tags ?? []).map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div
              className="p-6 text-center"
              style={{
                borderRadius: "calc(var(--radius)*1.1)",
                background: "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--primary) 14%, var(--surface)), var(--surface))",
                border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
              }}
            >
              <h3 className="font-extrabold mb-2">تحتاج مشروعًا مشابهًا؟</h3>
              <p className="text-sm leading-7 mb-5" style={{ color: "var(--muted)" }}>
                أرسل تفاصيل فكرتك وسنبدأ من هنا.
              </p>
              <Link href={`/contact?service=${encodeURIComponent(found.categoryName ?? "")}`} className="btn btn-primary w-full">
                اطلب مشروعًا مشابهًا
                <IconArrow className="w-4.5 h-4.5" />
              </Link>
            </div>
          </aside>
        </div>

        {/* مشاريع مشابهة */}
        {similar.length > 0 && (
          <section className="mb-10">
            <h2 className="h2 mb-8">مشاريع مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((p) => (
                <ProjectCard key={p.id} p={p} animate={animate} />
              ))}
            </div>
          </section>
        )}

        <div className="text-center">
          <Link href="/portfolio" className="btn btn-outline">
            العودة لمعرض الأعمال
          </Link>
        </div>
      </div>
    </div>
  );
}

function GalleryButton({
  images,
  initial,
  small = false,
}: {
  images: { url: string; alt: string }[];
  initial: number;
  small?: boolean;
}) {
  return <GalleryOpener images={images} initial={initial} small={small} />;
}
