"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Stat, Badge } from "@/components/admin/ui";

type Stats = {
  stats: {
    published: number;
    drafts: number;
    hidden: number;
    categories: number;
    requestsByStatus: { status: string; count: number }[];
    viewsTotal: number;
    viewsWeek: number;
  };
  recent: { id: number; title: string; slug: string; status: string; coverImage: string; createdAt: string }[];
  incomplete: { id: number; title: string; slug: string }[];
  activity: { action: string; details: string; createdAt: string; username: string | null }[];
};

const STATUS_AR: Record<string, { label: string; tone: "green" | "amber" | "gray" | "red" | "blue" }> = {
  new: { label: "جديد", tone: "blue" },
  review: { label: "قيد المراجعة", tone: "amber" },
  contacted: { label: "تم التواصل", tone: "green" },
  done: { label: "مكتمل", tone: "green" },
  rejected: { label: "مرفوض", tone: "red" },
};

export default function DashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats & { error?: string }>("/api/admin/stats")
      .then((r) => (r.ok ? setData(r.data) : setError(r.data.error ?? "فشل التحميل")))
      .catch(() => setError("فشل الاتصال بالخادم"));
  }, []);

  if (error) return <p className="text-[#e08080] text-sm font-bold">{error}</p>;
  if (!data) return <p className="text-white/40 text-sm">جارٍ التحميل…</p>;

  const newRequests = data.stats.requestsByStatus.find((r) => r.status === "new")?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white/90">نظرة عامة</h1>
          <p className="text-xs text-white/40 mt-1">أرقام حقيقية من قاعدة البيانات — لا إحصائيات افتراضية.</p>
        </div>
        <Link href="/admin/projects/new" className="admin-btn">+ مشروع جديد</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="مشاريع منشورة" value={data.stats.published} />
        <Stat label="مسودات" value={data.stats.drafts} hint={`${data.stats.hidden} مخفي`} />
        <Stat label="تصنيفات" value={data.stats.categories} />
        <Stat label="طلبات جديدة" value={newRequests} hint="من إجمالي طلبات العملاء" />
        <Stat label="زيارات الموقع" value={data.stats.viewsTotal} hint={`${data.stats.viewsWeek} خلال آخر 7 أيام`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-white/85">آخر المشاريع المضافة</h2>
            <Link href="/admin/projects" className="text-xs text-[#c6a15b] font-bold hover:underline">
              إدارة الكل
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="text-sm text-white/40 py-6 text-center">لا توجد مشاريع بعد — أضف أول مشروع.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,.03)" }}>
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className="w-12 h-9 object-cover rounded-lg shrink-0" />
                  ) : (
                    <span className="w-12 h-9 rounded-lg grid place-items-center text-white/20 shrink-0" style={{ background: "rgba(255,255,255,.05)" }}>
                      ؟
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white/85 truncate">{p.title}</p>
                    <p className="text-[11px] text-white/35 font-en" dir="ltr" style={{ textAlign: "end" }}>
                      /projects/{p.slug}
                    </p>
                  </div>
                  <Badge tone={p.status === "published" ? "green" : "amber"}>
                    {p.status === "published" ? "منشور" : "مسودة"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="admin-card p-5">
            <h2 className="font-extrabold text-white/85 mb-3">مشاريع تحتاج استكمال</h2>
            {data.incomplete.length === 0 ? (
              <p className="text-sm text-white/40">كل المشاريع المنشورة مكتملة البيانات. ممتاز.</p>
            ) : (
              <ul className="space-y-2">
                {data.incomplete.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/75 font-semibold truncate">{p.title}</span>
                    <Link href={`/admin/projects/${p.id}`} className="text-xs text-[#c6a15b] font-bold shrink-0 hover:underline">
                      استكمال
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-card p-5">
            <h2 className="font-extrabold text-white/85 mb-3">سجل آخر العمليات</h2>
            {data.activity.length === 0 ? (
              <p className="text-sm text-white/40">لا توجد عمليات مسجلة بعد.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.activity.map((a, i) => (
                  <li key={i} className="text-xs leading-6" style={{ borderBottom: "1px solid rgba(255,255,255,.05)", paddingBottom: 8 }}>
                    <span className="text-[#c6a15b] font-bold">{a.action}</span>
                    <span className="text-white/60"> — {a.details}</span>
                    <span className="text-white/30">
                      {" "}({new Date(a.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                      {a.username ? ` · ${a.username}` : ""})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card p-5">
        <h2 className="font-extrabold text-white/85 mb-4">طلبات العملاء حسب الحالة</h2>
        {data.stats.requestsByStatus.length === 0 ? (
          <p className="text-sm text-white/40">
            لم تستلم طلبات بعد. عندما يرسل عميل طلبًا من صفحة التواصل سيظهر هنا.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.stats.requestsByStatus.map((r) => (
              <span key={r.status} className="admin-badge gray !text-xs !px-3.5 !py-1.5">
                {STATUS_AR[r.status]?.label ?? r.status}: <b className="text-white/85">{r.count}</b>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
