import { db } from "@/db";
import {
  admins,
  categories,
  projects,
  siteSettings,
  type GalleryImage,
} from "@/db/schema";
import { defaultSettings } from "@/lib/settings";
import { hashPassword } from "@/lib/auth";

let seeding: Promise<void> | null = null;

/** يُنفَّذ مرة واحدة فقط في كل عملية — يضمن وجود البيانات الأساسية. */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = doSeed().catch((err) => {
      seeding = null;
      console.error("[seed] failed:", err);
    });
  }
  return seeding;
}

async function doSeed() {
  /* 1) الإعدادات الافتراضية */
  const [sRow] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (!sRow) {
    await db.insert(siteSettings).values({
      id: 1,
      draft: defaultSettings,
      published: defaultSettings,
    });
  }

  /* 2) حساب المدير الأول */
  const [admin] = await db.select({ id: admins.id }).from(admins).limit(1);
  if (!admin) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "Wael@2025";
    await db.insert(admins).values({ username, passwordHash: hashPassword(password) });
  }

  /* 3) التصنيفات الافتراضية */
  const [cRow] = await db.select({ id: categories.id }).from(categories).limit(1);
  if (!cRow) {
    const cats = [
      { slug: "social-media", name: "تصميمات السوشيال ميديا", description: "منشورات وإعلانات للسوشيال ميديا" },
      { slug: "brand-identity", name: "الهوية البصرية والشعارات", description: "شعارات وهويات بصرية متكاملة" },
      { slug: "commercial-ads", name: "الإعلانات التجارية", description: "حملات إعلانية وصور دعائية" },
      { slug: "print", name: "المطبوعات", description: "كروت وبروشورات ومطبوعات" },
      { slug: "signs-banners", name: "اليفط والبنرات", description: "لافتات وبنرات واستيكرات" },
      { slug: "motion-video", name: "الموشن جرافيك والفيديو", description: "إعلانات فيديو وموشن جرافيك" },
      { slug: "web-app", name: "المواقع والتطبيقات", description: "تصميم واجهات المواقع والتطبيقات" },
      { slug: "misc", name: "أعمال متنوعة", description: "تصميمات أخرى متنوعة" },
    ];
    await db.insert(categories).values(
      cats.map((c, i) => ({ ...c, sortOrder: i + 1 }))
    );
  }

  /* 4) مشاريع نموذجية (مُعلَّمة بوضوح أنها نماذج وليست عملاء حقيقيين) */
  const [pRow] = await db.select({ id: projects.id }).from(projects).limit(1);
  if (!pRow) {
    const [brandCat, socialCat, printCat, signsCat, motionCat, webCat] = await db
      .select({ id: categories.id })
      .from(categories)
      .orderBy(categories.id);
    const sample = (
      n: number,
      p: {
        slug: string;
        title: string;
        categoryId: number;
        cover: string;
        gallery: GalleryImage[];
        description: string;
        goal: string;
        servicesDone: string[];
        tools: string[];
        featured?: boolean;
        date?: string;
      }
    ) => ({
      slug: p.slug,
      title: p.title,
      categoryId: p.categoryId,
      coverImage: p.cover,
      gallery: p.gallery,
      videoUrl: "",
      description: p.description,
      goal: p.goal,
      servicesDone: p.servicesDone,
      role: "التصميم الكامل وإعداد الملفات النهائية",
      tools: p.tools,
      projectDate: p.date ?? "",
      tags: ["نموذج تجريبي"],
      featured: p.featured ?? false,
      hidden: false,
      status: "published",
      sortOrder: n,
    });

    await db.insert(projects).values([
      sample(1, {
        slug: "sample-cafe-identity",
        title: "هوية بصرية لمقهى (نموذج)",
        categoryId: brandCat?.id ?? 1,
        cover: "/images/work-brand.jpg",
        gallery: [
          { url: "/images/work-brand.jpg", alt: "هوية بصرية لمقهى — كروت وأدوات مكتوبة" },
          { url: "/images/work-print.jpg", alt: "مطبوعات الهوية البصرية" },
        ],
        description:
          "مشروع نموذجي (تجريبي) لعرض طريقة تقديم مشروع هوية بصرية كاملة: شعار، ألوان، خطوط، وتطبيق على الكروت والأدوات المكتوبة. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "بناء هوية بصرية فاخرة وقابلة للتطبيق على كل نقاط التواصل مع العميل.",
        servicesDone: ["الهوية البصرية والشعارات", "تصميم المطبوعات", "تصميم الجرافيك"],
        tools: ["Illustrator", "Photoshop", "InDesign"],
        featured: true,
        date: "2025",
      }),
      sample(2, {
        slug: "sample-social-campaign",
        title: "حملة سوشيال ميديا (نموذج)",
        categoryId: socialCat?.id ?? 2,
        cover: "/images/work-social.jpg",
        gallery: [
          { url: "/images/work-social.jpg", alt: "تصميم إعلان سوشيال ميديا" },
        ],
        description:
          "مشروع نموذجي (تجريبي) لعرض تصميم إعلان سوشيال ميديا بقالب بصري موحّد يناسب المنصات المختلفة. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "زيادة التفاعل والوقف عن السكرول مع رسالة تسويقية واضحة.",
        servicesDone: ["إعلانات السوشيال ميديا", "تصميم الجرافيك"],
        tools: ["Photoshop", "Illustrator"],
        featured: true,
        date: "2025",
      }),
      sample(3, {
        slug: "sample-fashion-film",
        title: "فيلم إطلاق علامة أزياء (نموذج)",
        categoryId: motionCat?.id ?? 6,
        cover: "/images/work-motion.jpg",
        gallery: [{ url: "/images/work-motion.jpg", alt: "إطار من موشن جرافيك" }],
        description:
          "مشروع نموذجي (تجريبي) لعرض لوحة من تصميم موشن جرافيك لفيلم إطلاق علامة. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "إطلاق دراماتيكي للعلامة عبر فيديو قصير قوي بصريًا.",
        servicesDone: ["إعلانات الفيديو والموشن جرافيك", "الريلز والمحتوى الإعلاني"],
        tools: ["After Effects", "Premiere Pro"],
        date: "2025",
      }),
      sample(4, {
        slug: "sample-business-cards",
        title: "كروت أعمال فاخرة (نموذج)",
        categoryId: printCat?.id ?? 4,
        cover: "/images/work-print.jpg",
        gallery: [{ url: "/images/work-print.jpg", alt: "كروت أعمال فاخرة" }],
        description:
          "مشروع نموذجي (تجريبي) لعرض تصميم كروت أعمال بجودة طباعة فاخرة. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "طباعة فاخرة تنقل انطباع الاحترافية في أول نقطة تواصل.",
        servicesDone: ["تصميم المطبوعات", "تصميم الجرافيك"],
        tools: ["Illustrator", "InDesign"],
        date: "2025",
      }),
      sample(5, {
        slug: "sample-store-signs",
        title: "لافتات وبنرات متجر (نموذج)",
        categoryId: signsCat?.id ?? 5,
        cover: "/images/work-banner.jpg",
        gallery: [{ url: "/images/work-banner.jpg", alt: "لافتة متجر" }],
        description:
          "مشروع نموذجي (تجريبي) لعرض تصميم لافتة وبنرات لمتجر. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "جذب انتباه المارة وتقوية حضور المتجر البصري ليلاً ونهارًا.",
        servicesDone: ["اليفط والبنرات والاستيكرات", "تصميم الجرافيك"],
        tools: ["Photoshop", "Illustrator"],
        date: "2025",
      }),
      sample(6, {
        slug: "sample-food-app-ui",
        title: "واجهة تطبيق توصيل (نموذج)",
        categoryId: webCat?.id ?? 7,
        cover: "/images/work-ui.jpg",
        gallery: [{ url: "/images/work-ui.jpg", alt: "شاشات تطبيق" }],
        description:
          "مشروع نموذجي (تجريبي) لعرض تصميم واجهات تطبيق. استبدله بمشروعك الحقيقي من لوحة التحكم.",
        goal: "تجربة استخدام واضحة وسريعة ترفع معدل إتمام الطلب.",
        servicesDone: ["واجهات المواقع والتطبيقات", "تصميم الجرافيك"],
        tools: ["Figma"],
        date: "2025",
      }),
    ]);
  }
}
