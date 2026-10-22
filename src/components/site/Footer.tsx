import Link from "next/link";
import type { SiteSettingsDoc } from "@/db/schema";
import { SOCIAL_ICONS, IconMail, IconPhone, IconPin } from "./icons";

export default function Footer({ settings }: { settings: SiteSettingsDoc }) {
  const { brand, contact, social, footer } = settings;
  const socials = Object.entries(social).filter(([, v]) => v && v.trim());

  return (
    <footer className="relative" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className="grid place-items-center w-9 h-9 font-en font-bold"
                style={{
                  background: "color-mix(in srgb, var(--primary) 14%, transparent)",
                  color: "var(--primary)",
                  border: "1px solid color-mix(in srgb, var(--primary) 45%, transparent)",
                  borderRadius: "calc(var(--radius) * .7)",
                }}
              >
                {brand.name.slice(0, 1)}
              </span>
              <span className="font-en font-bold tracking-[0.18em] text-sm">{brand.name}</span>
            </div>
            <p className="text-sm leading-7" style={{ color: "var(--muted)" }}>
              {footer.about}
            </p>
            <p className="font-en text-xs mt-3 tracking-widest" style={{ color: "var(--primary)" }}>
              {brand.title}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: "var(--text)" }}>
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/portfolio", label: "أعمالي" },
                { href: "/services", label: "خدماتي" },
                { href: "/about", label: "نبذة عني" },
                { href: "/contact", label: "تواصل معي" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-[var(--primary)]" style={{ color: "var(--muted)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: "var(--text)" }}>
              تواصل
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: "var(--muted)" }}>
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors">
                    <IconMail className="w-4 h-4 shrink-0" />
                    <span className="font-en" dir="ltr">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors">
                    <IconPhone className="w-4 h-4 shrink-0" />
                    <span className="font-en" dir="ltr">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.location && (
                <li className="flex items-center gap-2">
                  <IconPin className="w-4 h-4 shrink-0" />
                  {contact.location}
                </li>
              )}
              {!contact.email && !contact.phone && !contact.location && (
                <li className="opacity-70">سيتم إضافة بيانات التواصل قريبًا.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold mb-4" style={{ color: "var(--text)" }}>
              تابعني
            </h3>
            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socials.map(([key, url]) => {
                  const Icon = SOCIAL_ICONS[key];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="grid place-items-center w-10 h-10 transition-all hover:-translate-y-0.5"
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "calc(var(--radius) * .7)",
                        color: "var(--muted)",
                        background: "var(--surface-2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--primary)";
                        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 50%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--muted)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      {Icon ? <Icon className="w-4.5 h-4.5" /> : null}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm opacity-70" style={{ color: "var(--muted)" }}>
                سيتم إضافة حساباتي على المنصات هنا.
              </p>
            )}
          </div>
        </div>

        <div className="gold-line my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--muted)" }}>
          <p>
            © {new Date().getFullYear()} {brand.name} — جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/admin" className="hover:text-[var(--primary)] transition-colors">
              الدخول
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
