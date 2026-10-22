import type { Metadata } from "next";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import { AboutSection, CTASection, ProcessSection, SkillsSection } from "@/components/site/HomeSections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نبذة عني",
  description: "تعرّف على وائل سمير — مصمم جرافيك ومبدع إعلاني، مجالات عمله وآلية العمل.",
};

export default async function AboutPage() {
  await ensureSeeded();
  const s = await getPublishedSettings();
  const animate = s.design.animations;

  return (
    <div className="pt-24 min-h-screen">
      <AboutSection s={s} animate={animate} />
      <SkillsSection s={s} animate={animate} />
      <ProcessSection s={s} animate={animate} />
      <CTASection s={s} animate={animate} />
    </div>
  );
}
