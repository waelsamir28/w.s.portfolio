"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconSpark } from "./icons";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/portfolio", label: "أعمالي" },
  { href: "/services", label: "خدماتي" },
  { href: "/about", label: "نبذة عني" },
  { href: "/contact", label: "تواصل معي" },
];

export default function Navbar({
  brandName,
  ctaLabel,
}: {
  brandName: string;
  ctaLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl border-b"
            : ""
        }`}
        style={
          scrolled
            ? {
                background: "color-mix(in srgb, var(--bg) 82%, transparent)",
                borderColor: "var(--border)",
              }
            : { background: "transparent" }
        }
      >
        <div className="container-x flex items-center justify-between" style={{ height: scrolled ? "3.9rem" : "4.8rem", transition: "height .3s" }}>
          <Link href="/" className="group flex items-center gap-2.5" aria-label="الرئيسية">
            <span
              className="grid place-items-center w-9 h-9 font-en font-bold"
              style={{
                background: "color-mix(in srgb, var(--primary) 14%, transparent)",
                color: "var(--primary)",
                border: "1px solid color-mix(in srgb, var(--primary) 45%, transparent)",
                borderRadius: "calc(var(--radius) * .7)",
              }}
            >
              {brandName.slice(0, 1)}
            </span>
            <span className="font-en font-bold tracking-[0.18em] text-sm md:text-base" style={{ color: "var(--text)" }}>
              {brandName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="التنقل الرئيسي">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3.5 py-2 text-sm font-semibold rounded-full transition-colors"
                  style={{
                    color: active ? "var(--primary)" : "var(--muted)",
                    background: active ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active ? "var(--primary)" : "var(--muted)")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
              <IconSpark className="w-4 h-4" />
              {ctaLabel}
            </Link>
            <button
              className="lg:hidden grid place-items-center w-10 h-10"
              style={{ border: "1px solid var(--border)", borderRadius: "calc(var(--radius)*.7)", color: "var(--text)" }}
              onClick={() => setOpen(!open)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
            >
              {open ? (
                <IconClose className="w-5 h-5" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 7h16M4 12h10M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* قائمة الموبايل */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "color-mix(in srgb, var(--bg) 92%, black)" }}
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col justify-center px-8 gap-2">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-3 text-2xl font-extrabold transition-all"
              style={{
                color: pathname === l.href ? "var(--primary)" : "var(--text)",
                transform: open ? "none" : "translateY(16px)",
                opacity: open ? 1 : 0,
                transition: `all .4s ${i * 60 + 100}ms`,
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="btn btn-primary mt-6 text-lg"
            style={{
              transform: open ? "none" : "translateY(16px)",
              opacity: open ? 1 : 0,
              transition: "all .4s 480ms",
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
