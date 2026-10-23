"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "./ui";
import ThemeToggle from "@/components/site/ThemeToggle";

export default function TopBar({ username }: { username: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await api("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="grid place-items-center w-9 h-9 font-en text-xs font-bold shrink-0"
          style={{ color: "#c6a15b", background: "rgba(198,161,91,.12)", border: "1px solid rgba(198,161,91,.35)", borderRadius: 10 }}
        >
          WS
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white/90 truncate">لوحة التحكم</p>
          <p className="text-[11px] text-white/40 truncate">مرحبًا، {username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <Link href="/" target="_blank" className="admin-btn-outline !py-2 !px-3.5 !text-xs">
          عرض الموقع ↗
        </Link>
        <button onClick={logout} className="admin-btn-danger !py-2 !px-3.5 !text-xs" disabled={loggingOut}>
          {loggingOut ? "…" : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );
}
