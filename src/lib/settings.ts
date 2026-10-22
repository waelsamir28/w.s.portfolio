import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { SiteSettingsDoc } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SECTION_IDS, SECTION_LABELS, SOCIAL_KEYS } from "@/lib/constants";

export { SECTION_IDS, SECTION_LABELS, SOCIAL_KEYS };

export const defaultSettings: SiteSettingsDoc = {
  brand: {
    name: "WAEL SAMIR",
    nameAr: "وائل سمير",
    title: "Graphic Designer & Creative Designer",
    tagline: "تصميمات إبداعية، إعلانات مؤثرة، وهويات بصرية تجمع بين الجمال والهدف التسويقي.",
  },
  hero: {
    title: "أحوّل الأفكار إلى تصاميم تصنع الفرق.",
    subtitle:
      "أنا وائل سمير، مصمم جرافيك ومبدع إعلاني، أعمل على تحويل الأفكار إلى تصميمات بصرية مؤثرة تجمع بين الإبداع والهدف التسويقي، بدايةً من الهوية البصرية والإعلانات وحتى الموشن جرافيك والمشاريع الرقمية.",
    btnWorks: "استكشف أعمالي",
    btnRequest: "اطلب تصميمك",
    btnContact: "تواصل معي",
  },
  featured: {
    title: "أعمال مميزة",
    subtitle: "مختارات من المشاريع التي أفتخر بها — من الهوية البصرية إلى الموشن جرافيك.",
  },
  services: {
    title: "خدماتي",
    subtitle: "حلول تصميمية متكاملة تخدم هدفك التسويقي من الفكرة حتى التسليم.",
    items: [
      {
        id: "graphic",
        title: "تصميم الجرافيك",
        description: "تصميمات بصرية احترافية تجمع بين الجمال والرسالة.",
        icon: "palette",
      },
      {
        id: "social-ads",
        title: "إعلانات السوشيال ميديا",
        description: "منشورات وإعلانات مصممة لتزيد التفاعل وتوقف السكرول.",
        icon: "megaphone",
      },
      {
        id: "identity",
        title: "الهوية البصرية والشعارات",
        description: "شعار وهوية متكاملة تعبر عن شخصيتك وتبقى في الأذهان.",
        icon: "badge",
      },
      {
        id: "print",
        title: "تصميم المطبوعات",
        description: "كروت، بروشورات، وفواتير جاهزة للطباعة بجودة عالية.",
        icon: "printer",
      },
      {
        id: "signs",
        title: "اليفط والبنرات والاستيكرات",
        description: "لافتات وبنرات واستيكرات تلفت الانتباه لعلامتك.",
        icon: "sign",
      },
      {
        id: "motion",
        title: "إعلانات الفيديو والموشن جرافيك",
        description: "موشن جرافيك وإعلانات فيديو تحكي قصة علامتك بديناميكية.",
        icon: "film",
      },
      {
        id: "reels",
        title: "الريلز والمحتوى الإعلاني",
        description: "محتوى ريلز وإعلاني قصير مصمم للمواضع الحديثة.",
        icon: "reels",
      },
      {
        id: "uiux",
        title: "واجهات المواقع والتطبيقات",
        description: "تجارب رقمية واضحة وسهلة الاستخدام تخدم أهداف مشروعك.",
        icon: "ui",
      },
      {
        id: "marketing",
        title: "المواد التسويقية",
        description: "حزمة تصميمات تسويقية متكاملة للشركات والمحلات.",
        icon: "store",
      },
    ],
  },
  about: {
    title: "نبذة عني",
    body: "أنا وائل سمير، مصمم جرافيك ومهتم بصناعة المحتوى الإعلاني والتصميمات البصرية التي تجمع بين الجمال والوضوح والهدف التسويقي. أعمل على تطوير الأفكار وتحويلها إلى تصميمات تساعد العلامات التجارية والمشروعات على تقديم نفسها بصورة احترافية.",
    imageUrl: "",
  },
  skills: {
    title: "المهارات والتخصصات",
    subtitle: "مجالات أعمل فيها يوميًا وأنميها باستمرار.",
    items: [
      "Graphic Design",
      "Advertising Design",
      "Visual Identity",
      "Motion Graphics",
      "Video Ads",
      "Print Design",
      "UI/UX Design",
      "AI-Assisted Creative Production",
    ],
  },
  process: {
    title: "آلية العمل",
    subtitle: "خطوات واضحة من الفكرة حتى التسليم.",
    steps: [
      { title: "فهم الفكرة", body: "استماع لاحتياجات العميل وفهم طبيعة المشروع والجمهور." },
      { title: "تحديد الهدف", body: "تحديد الهدف من التصميم والجمهور المستهدف بوضوح." },
      { title: "تطوير الفكرة", body: "اقتراح التوجه البصري والأفكار المناسبة للمشروع." },
      { title: "التنفيذ والمراجعة", body: "تنفيذ التصميم ومراجعته مع العميل حتى الرضا." },
      { title: "التسليم", body: "تسليم الملفات النهائية بجودة عالية وفق المتفق عليه." },
    ],
  },
  cta: {
    title: "عندك فكرة؟ خلّينا نحوّلها لتصميم مميز.",
    body: "سواء كنت محتاج تصميم إعلان، هوية بصرية، فيديو دعائي أو مشروع إبداعي متكامل، ابعتلي تفاصيل فكرتك ونبدأ نشتغل عليها.",
    btnRequest: "اطلب تصميمك",
    btnWhatsapp: "تواصل عبر WhatsApp",
    btnMore: "شاهد المزيد من الأعمال",
  },
  portfolio: {
    title: "معرض الأعمال",
    subtitle: "تصفح مشاريعي حسب التصنيف أو ابحث بالاسم — كل عمل يعكس هدفًا تسويقيًا واضحًا.",
  },
  contact: {
    title: "تواصل معي",
    subtitle: "أخبرني عن مشروعك وسأعود إليك بأفضل خطة تصميمية.",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
  },
  social: {
    facebook: "",
    instagram: "",
    behance: "",
    dribbble: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  },
  footer: {
    about:
      "مصمم جرافيك ومبدع إعلاني أحوّل الأفكار إلى تصاميم بصرية مؤثرة تخدم الهدف التسويقي لعلامتك.",
    privacyTitle: "سياسة الخصوصية",
    privacyBody:
      "يتم استخدام البيانات المقدمة عبر نموذج التواصل (الاسم، البريد الإلكتروني، وتفاصيل المشروع) فقط لغرض الرد على طلبك وتقديم الخدمة المطلوبة.\n\nلا يتم مشاركة بياناتك مع أي طرف ثالث، ولا يتم استخدامها لأغراض تسويقية دون موافقتك. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معي مباشرة.",
  },
  sections: {
    order: ["hero", "featured", "services", "about", "skills", "process", "cta"],
    visibility: {
      hero: true,
      featured: true,
      services: true,
      about: true,
      skills: true,
      process: true,
      cta: true,
    },
  },
  design: {
    theme: "dark",
    colors: {
      primary: "#c6a15b",
      accent: "#8e7440",
      bg: "#0c0c0f",
      surface: "#15151a",
      text: "#f3f0e8",
      muted: "#a49e92",
      button: "#c6a15b",
      buttonText: "#151309",
      link: "#c6a15b",
    },
    fonts: { arabic: "cairo", latin: "grotesk" },
    headingScale: "lg",
    radius: 14,
    shadow: "soft",
    grid: "featured",
    animations: true,
  },
};

export function mergeSettings(doc?: Partial<SiteSettingsDoc> | null): SiteSettingsDoc {
  const d = defaultSettings;
  if (!doc) return structuredClone(d);
  return {
    brand: { ...d.brand, ...doc.brand },
    hero: { ...d.hero, ...doc.hero },
    featured: { ...d.featured, ...doc.featured },
    services: {
      ...d.services,
      ...(doc.services ?? {}),
      items: doc.services?.items ?? d.services.items,
    },
    about: { ...d.about, ...doc.about },
    skills: { ...d.skills, ...doc.skills, items: doc.skills?.items ?? d.skills.items },
    process: { ...d.process, ...doc.process, steps: doc.process?.steps ?? d.process.steps },
    cta: { ...d.cta, ...doc.cta },
    portfolio: { ...d.portfolio, ...doc.portfolio },
    contact: { ...d.contact, ...doc.contact },
    social: { ...d.social, ...doc.social },
    footer: { ...d.footer, ...doc.footer },
    sections: {
      order:
        doc.sections?.order && doc.sections.order.length > 0
          ? doc.sections.order
          : d.sections.order,
      visibility: { ...d.sections.visibility, ...(doc.sections?.visibility ?? {}) },
    },
    design: {
      ...d.design,
      ...(doc.design ?? {}),
      colors: { ...d.design.colors, ...(doc.design?.colors ?? {}) },
      fonts: { ...d.design.fonts, ...(doc.design?.fonts ?? {}) },
    },
  };
}

async function readRow() {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return rows[0] ?? null;
}

export async function getPublishedSettings(): Promise<SiteSettingsDoc> {
  const row = await readRow();
  return mergeSettings(row?.published);
}

export async function getDraftSettings(): Promise<SiteSettingsDoc> {
  const row = await readRow();
  return mergeSettings(row?.draft);
}

export async function saveDraft(doc: SiteSettingsDoc): Promise<void> {
  const now = new Date();
  const row = await readRow();
  if (row) {
    await db
      .update(siteSettings)
      .set({ draft: doc, updatedAt: now })
      .where(eq(siteSettings.id, 1));
  } else {
    await db.insert(siteSettings).values({
      id: 1,
      draft: doc,
      published: doc,
      updatedAt: now,
    });
  }
}

export async function publishDraft(): Promise<void> {
  const row = await readRow();
  if (!row) return;
  await db
    .update(siteSettings)
    .set({ published: row.draft, updatedAt: new Date() })
    .where(eq(siteSettings.id, 1));
}

export async function restoreDefaults(): Promise<void> {
  const now = new Date();
  const clone = structuredClone(defaultSettings);
  const row = await readRow();
  if (row) {
    await db
      .update(siteSettings)
      .set({
        draft: clone,
        published: clone,
        updatedAt: now,
      })
      .where(eq(siteSettings.id, 1));
  } else {
    await db.insert(siteSettings).values({
      id: 1,
      draft: clone,
      published: clone,
      updatedAt: now,
    });
  }
}
