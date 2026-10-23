import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionAdmin } from "@/lib/auth";
import SideNav from "@/components/admin/SideNav";
import TopBar from "@/components/admin/TopBar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="admin-shell min-h-screen" dir="rtl">
      <div className="flex min-h-screen">
        <aside
          className="w-60 shrink-0 border-l border-white/[0.06] sticky top-0 h-screen hidden md:flex flex-col"
          style={{ background: "#0e0e12" }}
        >
          <div className="px-5 py-5 border-b border-white/[0.06]">
            <p className="font-en font-bold tracking-[0.2em] text-xs text-[#c6a15b]">WAEL SAMIR</p>
            <p className="text-[11px] text-white/35 mt-1">إدارة الموقع</p>
          </div>
          <SideNav />
          <div className="mt-auto p-4 text-[11px] text-white/25 leading-5">
            جميع التغييرات تُحفظ كمسودة ثم تُنشر لتظهر على الموقع.
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-0 z-30" style={{ background: "rgba(11,11,14,.9)", backdropFilter: "blur(10px)" }}>
            <TopBar username={admin.username} />
            {/* تنقل سفلي للموبايل */}
            <div className="md:hidden flex overflow-x-auto px-2 pb-2 gap-1">
              {[
                { href: "/admin", label: "الرئيسية" },
                { href: "/admin/projects", label: "المشاريع" },
                { href: "/admin/categories", label: "التصنيفات" },
                { href: "/admin/requests", label: "الطلبات" },
                { href: "/admin/content", label: "المحتوى" },
                { href: "/admin/design", label: "التصميم" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/60"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
