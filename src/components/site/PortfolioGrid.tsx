"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Lightbox from "./Lightbox";
import { ProjectCard, type PublicProject } from "./HomeSections";
import { IconArrow, IconSearch, IconSpark } from "./icons";

type CategoryLite = { id: number; name: string; slug: string };

const PAGE_SIZE = 9;

export default function PortfolioGrid({
  items,
  categories,
  animate,
}: {
  items: PublicProject[];
  categories: CategoryLite[];
  animate: boolean;
}) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const catOk =
        activeCat === "all" || (p.categoryId != null && String(p.categoryId) === activeCat);
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return catOk && qOk;
    });
  }, [items, activeCat, query]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      {/* الفلاتر */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="تصنيفات الأعمال">
          <button
            onClick={() => { setActiveCat("all"); setVisible(PAGE_SIZE); }}
            className="chip cursor-pointer transition-all hover:-translate-y-0.5"
            style={
              activeCat === "all"
                ? { background: "var(--primary)", color: "var(--btn-text)", borderColor: "var(--primary)" }
                : undefined
            }
            aria-pressed={activeCat === "all"}
          >
            جميع الأعمال
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveCat(String(c.id)); setVisible(PAGE_SIZE); }}
              className="chip cursor-pointer transition-all hover:-translate-y-0.5"
              style={
                activeCat === String(c.id)
                  ? { background: "var(--primary)", color: "var(--btn-text)", borderColor: "var(--primary)" }
                  : undefined
              }
              aria-pressed={activeCat === String(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <IconSearch className="w-4.5 h-4.5 absolute start-3.5 top-1/2 -translate-y-1/2 opacity-60" style={{ color: "var(--muted)" }} />
          <input
            type="search"
            className="field"
            style={{ paddingInlineStart: "2.6rem" }}
            placeholder="ابحث بالاسم أو التصنيف…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
            aria-label="بحث في الأعمال"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderStyle: "dashed" }}>
          <IconSpark className="w-9 h-9 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h3 className="text-lg font-extrabold mb-2">
            {query ? "لا توجد نتائج مطابقة" : "لا توجد أعمال في هذا التصنيف بعد"}
          </h3>
          <p className="text-sm leading-7 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
            {query
              ? "جرّب كلمة بحث مختلفة أو تصفح تصنيفًا آخر."
              : "سيظهر هنا كل مشروع جديد يُنشر من لوحة التحكم في هذا التصنيف."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {shown.map((p) => (
              <ProjectCard key={p.id} p={p} animate={animate} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="text-center mt-10">
              <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn btn-outline">
                عرض المزيد ({filtered.length - visible} متبقٍ)
              </button>
            </div>
          )}
        </>
      )}

      {lightbox !== null && shown[lightbox] && (
        <Lightbox
          images={[{ url: shown[lightbox]!.coverImage, alt: shown[lightbox]!.title }]}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
