"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "الرئيسية", icon: "▦", exact: true },
  { href: "/admin/projects", label: "المشاريع", icon: "◇" },
  { href: "/admin/categories", label: "التصنيفات", icon: "≡" },
  { href: "/admin/requests", label: "طلبات العملاء", icon: "↗" },
  { href: "/admin/content", label: "محتوى الموقع", icon: "¶" },
  { href: "/admin/design", label: "التصميم والهوية", icon: "✦" },
];

export default function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex flex-col gap-1 p-3" aria-label="تنقل لوحة التحكم">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className="admin-sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              color: active ? "#c6a15b" : "rgba(255,255,255,.6)",
              background: active ? "rgba(198,161,91,.1)" : "transparent",
            }}
          >
            <span className="text-base" aria-hidden>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
