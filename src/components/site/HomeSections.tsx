import Link from "next/link";
import Reveal from "./Reveal";
import {
  SERVICE_ICONS,
  IconArrow,
  IconCheck,
  IconSpark,
  IconWhatsApp,
} from "./icons";
import type { SiteSettingsDoc, GalleryImage } from "@/db/schema";

export type PublicProject = {
  id: number;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  categoryName: string;
  categoryId?: number | null;
  tags: string[];
  gallery: GalleryImage[];
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  animate,
  align = "start",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  animate: boolean;
  align?: "start" | "center";
}) {
  return (
    <Reveal animate={animate} className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      {kicker && <p className={`kicker mb-4 ${align === "center" ? "justify-center" : ""}`}>{kicker}</p>}
      <h2 className="h2 mb-4">{title}</h2>
      {subtitle && (
        <p className={`max-w-2xl leading-8 ${align === "center" ? "mx-auto" : ""}`} style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/* ===== الأعمال المميزة ===== */

export function ProjectCard({ p, animate, big = false }: { p: PublicProject; animate: boolean; big?: boolean }) {
  return (
    <Reveal animate={animate} className={big ? "md:col-span-2" : ""}>
      <Link
        href={`/projects/${p.slug}`}
        className="group/card card card-hover overflow-hidden block"
      >
        <div className="relative overflow-hidden">
          {p.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverImage}
              alt={p.title}
              loading="lazy"
              className="work-img"
              style={big ? { aspectRatio: "16/9" } : undefined}
            />
          ) : (
            <div className="grid place-items-center" style={{ aspectRatio: "4/3", background: "var(--surface-2)" }}>
              <span className="font-en text-4xl font-bold" style={{ color: "color-mix(in srgb, var(--primary) 40%, transparent)" }}>
                {p.title.slice(0, 1)}
              </span>
            </div>
          )}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, color-mix(in srgb, var(--bg) 70%, transparent))", opacity: 0, transition: "opacity .4s" }} />
          <span className="chip absolute top-4 start-4" style={{ background: "color-mix(in srgb, var(--bg) 75%, transparent)", backdropFilter: "blur(6px)" }}>
            {p.categoryName || "أعمال متنوعة"}
          </span>
        </div>
        <div className="p-5 md:p-6">
          <h3 className="text-lg font-extrabold mb-1.5 transition-colors group-hover/card:text-[var(--primary)]">{p.title}</h3>
          <p className="text-sm leading-6 line-clamp-2 mb-4" style={{ color: "var(--muted)" }}>
            {p.description}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--primary)" }}>
            عرض المشروع
            <IconArrow className="w-4 h-4 transition-transform group-hover/card:-translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function FeaturedSection({
  s,
  projects,
  animate,
}: {
  s: SiteSettingsDoc;
  projects: PublicProject[];
  animate: boolean;
}) {
  return (
    <section className="section-pad" id="featured">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading kicker="Portfolio" title={s.featured.title} subtitle={s.featured.subtitle} animate={animate} />
          <Reveal animate={animate} delay={150} className="hidden sm:block">
            <Link href="/portfolio" className="btn btn-outline btn-sm">
              كل الأعمال
              <IconArrow className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        {projects.length === 0 ? (
          <Reveal animate={animate}>
            <div className="card p-10 md:p-16 text-center" style={{ borderStyle: "dashed" }}>
              <IconSpark className="w-10 h-10 mx-auto mb-5" style={{ color: "var(--primary)" }} />
              <h3 className="text-xl font-extrabold mb-3">معرضي جاهز لاستقبال أعمالي</h3>
              <p className="max-w-md mx-auto leading-7 text-sm" style={{ color: "var(--muted)" }}>
                لم أضف مشاريع حقيقية بعد. من لوحة التحكم يمكنني رفع أعمالي (الغلاف، الصور، الوصف، التصنيف)
                ونشرها لتظهر هنا وللموقع مباشرة.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} p={p} animate={animate} big={s.design.grid === "featured" && i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ===== الخدمات ===== */

export function ServicesSection({ s, animate }: { s: SiteSettingsDoc; animate: boolean }) {
  return (
    <section className="section-pad" id="services" style={{ background: "var(--surface)" }}>
      <div className="container-x">
        <SectionHeading
          kicker="Services"
          title={s.services.title}
          subtitle={s.services.subtitle}
          animate={animate}
          align="center"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {s.services.items.map((item, i) => {
            const Icon = SERVICE_ICONS[item.icon] ?? SERVICE_ICONS.palette!;
            return (
              <Reveal key={item.id || i} animate={animate} delay={(i % 3) * 90}>
                <div className="card card-hover p-6 h-full">
                  <div
                    className="w-12 h-12 grid place-items-center mb-5"
                    style={{
                      color: "var(--primary)",
                      background: "color-mix(in srgb, var(--primary) 11%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                      borderRadius: "calc(var(--radius) * .8)",
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold mb-2">{item.title}</h3>
                  <p className="text-sm leading-7" style={{ color: "var(--muted)" }}>
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===== نبذة عني ===== */

export function AboutSection({ s, animate }: { s: SiteSettingsDoc; animate: boolean }) {
  const hasImage = Boolean(s.about.imageUrl?.trim());
  return (
    <section className="section-pad" id="about">
      <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal animate={animate} className="order-2 lg:order-1">
          <div
            className="relative max-w-md mx-auto lg:mx-start"
            style={{ borderRadius: "calc(var(--radius) * 1.2)", border: "1px solid var(--border)", overflow: "hidden" }}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.about.imageUrl} alt={s.brand.nameAr} loading="lazy" className="w-full h-auto block" style={{ aspectRatio: "4/4.6", objectFit: "cover" }} />
            ) : (
              <div
                className="w-full grid place-items-center"
                style={{
                  aspectRatio: "4/4.6",
                  background:
                    "radial-gradient(120% 90% at 50% 10%, color-mix(in srgb, var(--primary) 14%, var(--surface)), var(--surface) 60%)",
                }}
              >
                <div className="text-center px-8">
                  <span
                    className="font-en text-6xl md:text-7xl font-bold tracking-tight block mb-4"
                    style={{ color: "var(--primary)" }}
                  >
                    {s.brand.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <p className="font-en text-sm tracking-[0.3em] mb-2" style={{ color: "var(--text)" }}>
                    {s.brand.name}
                  </p>
                  <p className="text-xs leading-6" style={{ color: "var(--muted)" }}>
                    {s.brand.title}
                  </p>
                  <div className="gold-line w-24 mx-auto my-5" />
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    صورة شخصية أو صورة من بيئة العمل يمكن إضافتها من لوحة التحكم
                  </p>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading kicker="About Me" title={s.about.title} animate={animate} />
          <Reveal animate={animate} delay={140}>
            <p className="leading-9 text-base md:text-lg mb-8" style={{ color: "var(--muted)" }}>
              {s.about.body}
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {["هوية بصرية وإعلانات", "موشن جرافيك وفيديو", "مطبوعات وواجهات رقمية"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm font-semibold">
                  <span
                    className="grid place-items-center w-5 h-5 shrink-0"
                    style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 12%, transparent)", borderRadius: "999px" }}
                  >
                    <IconCheck className="w-3 h-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-primary">
              لنعمل معًا
              <IconArrow className="w-4.5 h-4.5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ===== المهارات ===== */

export function SkillsSection({ s, animate }: { s: SiteSettingsDoc; animate: boolean }) {
  return (
    <section className="section-pad" id="skills" style={{ background: "var(--surface)" }}>
      <div className="container-x">
        <SectionHeading kicker="Skills" title={s.skills.title} subtitle={s.skills.subtitle} animate={animate} align="center" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {s.skills.items.map((item, i) => (
            <Reveal key={item + i} animate={animate} delay={i * 60}>
              <div
                className="card card-hover px-5 py-5 flex items-center gap-3"
                style={{ background: "var(--bg)" }}
              >
                <span
                  className="grid place-items-center w-9 h-9 shrink-0"
                  style={{
                    color: "var(--primary)",
                    background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                    borderRadius: "calc(var(--radius) * .6)",
                  }}
                >
                  <IconSpark className="w-4.5 h-4.5" />
                </span>
                <span className="font-en font-semibold text-sm md:text-base" dir="ltr" style={{ textAlign: "end" }}>
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== آلية العمل ===== */

export function ProcessSection({ s, animate }: { s: SiteSettingsDoc; animate: boolean }) {
  return (
    <section className="section-pad" id="process">
      <div className="container-x">
        <SectionHeading kicker="My Process" title={s.process.title} subtitle={s.process.subtitle} animate={animate} align="center" />
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {s.process.steps.map((step, i) => (
            <Reveal key={step.title + i} animate={animate} delay={i * 100}>
              <div className="relative card p-6 h-full">
                <span
                  aria-hidden
                  className="font-en absolute -top-3 end-4 text-5xl font-bold select-none"
                  style={{ color: "color-mix(in srgb, var(--primary) 22%, transparent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="inline-block font-en text-xs font-bold tracking-widest mb-3 mt-4"
                  style={{ color: "var(--primary)" }}
                >
                  STEP {i + 1}
                </span>
                <h3 className="font-extrabold mb-2">{step.title}</h3>
                <p className="text-sm leading-7" style={{ color: "var(--muted)" }}>
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== الدعوة للتواصل ===== */

export function CTASection({ s, animate }: { s: SiteSettingsDoc; animate: boolean }) {
  const whatsapp = s.contact.whatsapp?.trim();
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : "";
  return (
    <section className="section-pad" id="cta">
      <div className="container-x">
        <Reveal animate={animate}>
          <div
            className="relative overflow-hidden text-center px-6 py-16 md:px-16 md:py-20"
            style={{
              borderRadius: "calc(var(--radius) * 1.6)",
              background:
                "radial-gradient(90% 120% at 50% 0%, color-mix(in srgb, var(--primary) 16%, var(--surface)), var(--surface) 65%)",
              border: "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
            }}
          >
            <div aria-hidden className="absolute -top-24 start-1/2 -translate-x-1/2 w-[36rem] h-64" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--primary) 20%, transparent), transparent)", filter: "blur(20px)" }} />
            <h2 className="h2 max-w-3xl mx-auto mb-5 relative">{s.cta.title}</h2>
            <p className="max-w-2xl mx-auto leading-8 mb-9 relative" style={{ color: "var(--muted)" }}>
              {s.cta.body}
            </p>
            <div className="flex flex-wrap justify-center gap-3.5 relative">
              <Link href="/contact" className="btn btn-primary">
                {s.cta.btnRequest}
                <IconArrow className="w-4.5 h-4.5" />
              </Link>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <IconWhatsApp className="w-4.5 h-4.5" />
                  {s.cta.btnWhatsapp}
                </a>
              )}
              <Link href="/portfolio" className="btn btn-ghost">
                {s.cta.btnMore}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
