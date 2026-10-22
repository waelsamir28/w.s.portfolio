import type { Metadata } from "next";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import ContactForm from "@/components/site/ContactForm";
import { SectionHeading } from "@/components/site/HomeSections";
import { IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/site/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تواصل معي",
  description: "اطلب تصميمك — أرسل تفاصيل مشروعك وسأعود إليك بخطة تصميمية واضحة.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  await ensureSeeded();
  const s = await getPublishedSettings();
  const { service } = await searchParams;
  const animate = s.design.animations;
  const waHref = s.contact.whatsapp ? `https://wa.me/${s.contact.whatsapp.replace(/[^0-9]/g, "")}` : "";

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container-x">
        <SectionHeading
          kicker="Contact"
          title={s.contact.title}
          subtitle={s.contact.subtitle}
          animate={animate}
          align="center"
        />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <ContactForm
            serviceOptions={s.services.items.map((i) => i.title)}
            whatsapp={s.contact.whatsapp}
            whatsappLabel={s.cta.btnWhatsapp}
            initialService={service ?? ""}
          />

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-extrabold mb-5">بيانات التواصل المباشر</h3>
              <ul className="space-y-4 text-sm">
                {s.contact.email && (
                  <li>
                    <a href={`mailto:${s.contact.email}`} className="flex items-center gap-3 group">
                      <span className="grid place-items-center w-10 h-10 shrink-0" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "calc(var(--radius)*.6)" }}>
                        <IconMail className="w-5 h-5" />
                      </span>
                      <span>
                        <span className="block mb-0.5" style={{ color: "var(--muted)" }}>البريد الإلكتروني</span>
                        <span className="font-en group-hover:text-[var(--primary)] transition-colors" dir="ltr">{s.contact.email}</span>
                      </span>
                    </a>
                  </li>
                )}
                {s.contact.phone && (
                  <li>
                    <a href={`tel:${s.contact.phone}`} className="flex items-center gap-3 group">
                      <span className="grid place-items-center w-10 h-10 shrink-0" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "calc(var(--radius)*.6)" }}>
                        <IconPhone className="w-5 h-5" />
                      </span>
                      <span>
                        <span className="block mb-0.5" style={{ color: "var(--muted)" }}>الهاتف</span>
                        <span className="font-en group-hover:text-[var(--primary)] transition-colors" dir="ltr">{s.contact.phone}</span>
                      </span>
                    </a>
                  </li>
                )}
                {waHref && (
                  <li>
                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                      <span className="grid place-items-center w-10 h-10 shrink-0" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "calc(var(--radius)*.6)" }}>
                        <IconWhatsApp className="w-5 h-5" />
                      </span>
                      <span>
                        <span className="block mb-0.5" style={{ color: "var(--muted)" }}>WhatsApp</span>
                        <span className="group-hover:text-[var(--primary)] transition-colors">مراسلة مباشرة وسريعة</span>
                      </span>
                    </a>
                  </li>
                )}
                {s.contact.location && (
                  <li className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 shrink-0" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "calc(var(--radius)*.6)" }}>
                      <IconPin className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block mb-0.5" style={{ color: "var(--muted)" }}>الموقع</span>
                      {s.contact.location}
                    </span>
                  </li>
                )}
                {!s.contact.email && !s.contact.phone && !s.contact.location && !waHref && (
                  <li className="leading-7" style={{ color: "var(--muted)" }}>
                    استخدم النموذج المجاور وسأصلك على بريدك الإلكتروني.
                  </li>
                )}
              </ul>
            </div>

            <div
              className="p-6 text-sm leading-7"
              style={{
                borderRadius: "calc(var(--radius)*1.1)",
                border: "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
                background: "color-mix(in srgb, var(--primary) 6%, var(--surface))",
                color: "var(--muted)",
              }}
            >
              جميع البيانات التي ترسلها عبر النموذج تُستخدم فقط للرد على طلبك،
              ولا تتم مشاركتها مع أي طرف ثالث.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
