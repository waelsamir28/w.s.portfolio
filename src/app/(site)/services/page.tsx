import type { Metadata } from "next";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import { CTASection, ServicesSection } from "@/components/site/HomeSections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خدماتي",
  description: "خدمات التصميم: جرافيك، إعلانات، هوية بصرية، مطبوعات، موشن جرافيك، ريلز، وواجهات رقمية.",
};

export default async function ServicesPage() {
  await ensureSeeded();
  const s = await getPublishedSettings();
  const animate = s.design.animations;

  return (
    <div className="pt-24 min-h-screen">
      <ServicesSection s={s} animate={animate} />
      <CTASection s={s} animate={animate} />
    </div>
  );
}
