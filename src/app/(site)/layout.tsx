import type { ReactNode } from "react";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ViewTracker from "@/components/site/ViewTracker";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const settings = await getPublishedSettings();

  return (
    <>
      <Navbar brandName={settings.brand.name} ctaLabel={settings.hero.btnRequest} />
      <main>{children}</main>
      <Footer settings={settings} />
      <ViewTracker />
    </>
  );
}
