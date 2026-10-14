import type { IdeasInput, ResultDocument, DocSection } from "@/lib/ai/types";
import { IDEA_AUDIENCES, IDEA_PLATFORMS, IDEA_PURPOSES } from "@/lib/labels";
import { stripEndPunct } from "./text";

type Platform = IdeasInput["platforms"][number];
type Purpose = IdeasInput["purpose"];
type Audience = IdeasInput["audience"];

interface IdeaTemplate {
  key: string;
  title: (s: string) => string;
  concept: (s: string, org: string) => string;
  format: string;
  platforms: Platform[];
  purposes: Purpose[];
  audiences: Audience[] | "all";
  kpi: string;
}

const BANK: IdeaTemplate[] = [
  {
    key: "myth",
    title: (s) => `صح أم خطأ؟ ${s}`,
    concept: (s) => `سلسلة قصيرة تعرض في كل حلقة معلومة شائعة عن ${s} ثم تكشف صحتها بالدليل، بأسلوب بصري سريع.`,
    format: "مقاطع عمودية قصيرة (سلسلة)",
    platforms: ["tiktok", "instagram", "snapchat", "youtube", "x"],
    purposes: ["awareness", "education", "crisis"],
    audiences: "all",
    kpi: "معدل إكمال المشاهدة وعدد المشاركات",
  },
  {
    key: "behind",
    title: (s) => `خلف الكواليس: رحلة ${s}`,
    concept: (s, org) => `محتوى يأخذ الجمهور إلى ما وراء ${s}${org ? ` داخل ${org}` : ""}، ويعرّفه بالأشخاص والخطوات التي لا يراها عادة.`,
    format: "قصص يومية ومقاطع وثائقية قصيرة",
    platforms: ["instagram", "snapchat", "tiktok", "youtube", "linkedin"],
    purposes: ["engagement", "promotion", "awareness"],
    audiences: "all",
    kpi: "معدل التفاعل ونمو المتابعين",
  },
  {
    key: "challenge",
    title: (s) => `تحدي ${s}`,
    concept: (s) => `تحدٍّ تشاركي يدعو الجمهور إلى تطبيق سلوك إيجابي مرتبط ب${s} لمدة محددة، ونشر تجربتهم بوسم موحد.`,
    format: "تحدٍّ تشاركي بمحتوى ينشئه المستخدمون",
    platforms: ["tiktok", "instagram", "snapchat", "x"],
    purposes: ["behavior", "engagement"],
    audiences: ["youth", "students", "general", "families"],
    kpi: "عدد المشاركات بالوسم والمحتوى المنشأ من المستخدمين",
  },
  {
    key: "explainer",
    title: (s) => `${s} في 60 ثانية`,
    concept: (s) => `فيديو موشن جرافيك يشرح ${s} في دقيقة واحدة بلغة مبسطة ورسوم توضيحية.`,
    format: "موشن جرافيك تفسيري",
    platforms: ["youtube", "instagram", "x", "tiktok", "website", "tv"],
    purposes: ["education", "awareness"],
    audiences: "all",
    kpi: "متوسط مدة المشاهدة ومعدل الحفظ",
  },
  {
    key: "faces",
    title: (s) => `وجوه ${s}`,
    concept: (s) => `قصص إنسانية لأشخاص حقيقيين تأثروا ب${s} أو أسهموا فيه، تُروى بصوتهم وبأسلوب صحافة الحلول.`,
    format: "قصص مصورة وبورتريهات",
    platforms: ["instagram", "youtube", "linkedin", "website", "tv", "x"],
    purposes: ["awareness", "behavior", "engagement"],
    audiences: "all",
    kpi: "معدل المشاركة وجودة التعليقات",
  },
  {
    key: "expert-live",
    title: (s) => `اسأل المختص: ${s}`,
    concept: (s) => `بث مباشر دوري يجيب فيه مختص عن أسئلة الجمهور حول ${s}، مع تحويل أبرز الإجابات إلى مقاطع قصيرة.`,
    format: "بث مباشر + مقاطع مشتقة",
    platforms: ["instagram", "youtube", "x", "linkedin", "tiktok"],
    purposes: ["education", "crisis", "engagement"],
    audiences: "all",
    kpi: "عدد الأسئلة الواردة ومدة البقاء في البث",
  },
  {
    key: "thread",
    title: (s) => `سلسلة: ما لا تعرفه عن ${s}`,
    concept: (s) => `سلسلة تغريدات معلوماتية متتابعة، كل تغريدة فيها معلومة موثقة عن ${s} مع رسم بياني أو صورة داعمة.`,
    format: "سلسلة منشورات نصية مصورة",
    platforms: ["x", "linkedin"],
    purposes: ["education", "awareness", "crisis"],
    audiences: ["professionals", "decision-makers", "general"],
    kpi: "مرات الظهور ومعدل إعادة النشر",
  },
  {
    key: "data-story",
    title: (s) => `${s} بالبيانات`,
    concept: (s, org) => `قصة بيانات تفاعلية تعتمد على بيانات موثقة${org ? ` من ${org}` : ""} لتوضيح أبعاد ${s} وتطورها.`,
    format: "إنفوجرافيك تفاعلي وصفحة قصة بيانات",
    platforms: ["website", "linkedin", "x"],
    purposes: ["education", "awareness"],
    audiences: ["professionals", "decision-makers", "students"],
    kpi: "زمن البقاء في الصفحة ومرات التنزيل",
  },
  {
    key: "carousel-guide",
    title: (s) => `دليلك العملي إلى ${s}`,
    concept: (s) => `منشور شرائح (كاروسيل) يقدّم خطوات عملية مرقمة حول ${s} يمكن للجمهور حفظها والرجوع إليها.`,
    format: "منشورات شرائح متعددة",
    platforms: ["instagram", "linkedin"],
    purposes: ["education", "behavior", "promotion"],
    audiences: "all",
    kpi: "معدل الحفظ والمشاركة",
  },
  {
    key: "quiz",
    title: (s) => `اختبر معلوماتك عن ${s}`,
    concept: (s) => `اختبارات واستطلاعات تفاعلية قصيرة عن ${s} تُنشر في القصص، مع كشف الإجابات وشرحها في اليوم التالي.`,
    format: "استطلاعات واختبارات تفاعلية",
    platforms: ["instagram", "snapchat", "x", "linkedin"],
    purposes: ["engagement", "education", "awareness"],
    audiences: ["youth", "students", "general", "families"],
    kpi: "معدل المشاركة في الاستطلاعات",
  },
  {
    key: "podcast",
    title: (s) => `حوار: مستقبل ${s}`,
    concept: (s) => `حلقات حوارية مرئية تستضيف أصحاب الخبرة لمناقشة تحديات ${s} وفرصه، مع مقاطع قصيرة مقتطعة لكل منصة.`,
    format: "بودكاست مرئي",
    platforms: ["youtube", "linkedin", "website", "x"],
    purposes: ["education", "engagement", "awareness"],
    audiences: ["professionals", "decision-makers", "students", "general"],
    kpi: "عدد الاستماعات ونسبة الإكمال",
  },
  {
    key: "tv-segment",
    title: (s) => `فقرة توعوية: ${s}`,
    concept: (s) => `فقرة تلفزيونية قصيرة ضمن البرامج الصباحية تعرض ${s} بمشاركة مختص ونماذج من الواقع.`,
    format: "فقرة تلفزيونية",
    platforms: ["tv", "youtube"],
    purposes: ["awareness", "education", "crisis"],
    audiences: ["families", "general"],
    kpi: "الوصول ونسب المشاهدة المقيسة",
  },
  {
    key: "ugc-stories",
    title: (s) => `قصتي مع ${s}`,
    concept: (s) => `دعوة الجمهور لمشاركة تجاربهم الشخصية مع ${s}، واختيار أبرزها لإعادة نشرها بتصميم موحد.`,
    format: "محتوى ينشئه المستخدمون",
    platforms: ["instagram", "x", "tiktok", "snapchat", "linkedin"],
    purposes: ["engagement", "behavior", "awareness"],
    audiences: "all",
    kpi: "عدد القصص المشاركة ونسبة الإشارات الإيجابية",
  },
  {
    key: "launch-countdown",
    title: (s) => `العد التنازلي: ${s}`,
    concept: (s) => `حملة تشويقية متدرجة تكشف ملامح ${s} على مراحل حتى يوم الإطلاق.`,
    format: "حملة تشويقية متعددة المراحل",
    platforms: ["x", "instagram", "snapchat", "tiktok", "website"],
    purposes: ["promotion", "engagement"],
    audiences: "all",
    kpi: "حجم التداول خلال فترة الحملة والزيارات يوم الإطلاق",
  },
  {
    key: "decision-brief",
    title: (s) => `موجز تنفيذي: ${s}`,
    concept: (s) => `موجزات مركزة لصناع القرار تلخص ${s} في صفحة واحدة: الوضع، والخيارات، والتوصيات.`,
    format: "موجز تنفيذي رقمي ومنشور مهني",
    platforms: ["linkedin", "website"],
    purposes: ["education", "awareness", "crisis"],
    audiences: ["decision-makers", "professionals"],
    kpi: "مرات التنزيل وطلبات التواصل",
  },
  {
    key: "fact-sheet",
    title: (s) => `حقائق موثقة حول ${s}`,
    concept: (s, org) => `صفحة مرجعية تُحدَّث باستمرار تتضمن الحقائق المؤكدة حول ${s}${org ? ` صادرة عن ${org}` : ""}، لمواجهة الشائعات بسرعة.`,
    format: "صفحة مرجعية + بطاقات قابلة للمشاركة",
    platforms: ["website", "x", "instagram"],
    purposes: ["crisis", "awareness"],
    audiences: "all",
    kpi: "سرعة الاستجابة وتراجع تداول الشائعة",
  },
  {
    key: "campus",
    title: (s) => `سفراء ${s}`,
    concept: (s) => `برنامج سفراء من الطلاب والشباب ينتجون محتوى عن ${s} بلغتهم، مع تدريب قصير ودليل رسائل موحد.`,
    format: "برنامج سفراء ومحتوى مجتمعي",
    platforms: ["tiktok", "instagram", "snapchat", "x"],
    purposes: ["behavior", "engagement", "awareness"],
    audiences: ["youth", "students"],
    kpi: "عدد السفراء الفاعلين وتفاعل محتواهم",
  },
  {
    key: "family-guide",
    title: (s) => `${s}: دليل الأسرة`,
    concept: (s) => `محتوى موجّه للأسرة يقدّم أنشطة ونصائح بسيطة حول ${s} يمكن تطبيقها مع الأطفال.`,
    format: "مقاطع قصيرة وبطاقات أنشطة",
    platforms: ["instagram", "youtube", "snapchat", "tv", "tiktok"],
    purposes: ["behavior", "education", "awareness"],
    audiences: ["families"],
    kpi: "معدل الحفظ والمشاركة مع العائلة والأصدقاء",
  },
];

function score(t: IdeaTemplate, input: IdeasInput) {
  const platformHits = t.platforms.filter((p) => input.platforms.includes(p)).length;
  if (!platformHits) return Number.NEGATIVE_INFINITY;
  const purposeFit = t.purposes.indexOf(input.purpose);
  const audienceFit = t.audiences === "all" ? 1 : t.audiences.includes(input.audience) ? 2 : 0;
  return platformHits * 1.5 + (purposeFit === -1 ? 0 : 4 - purposeFit) + (audienceFit === 0 ? -3 : audienceFit * 1.5);
}

export function demoIdeas(input: IdeasInput): { document: ResultDocument; warnings: string[] } {
  const subject = stripEndPunct(input.subject);
  const org = input.organization.trim();
  const ranked = BANK.map((t) => ({ t, s: score(t, input) }))
    .filter((r) => Number.isFinite(r.s))
    .sort((a, b) => b.s - a.s)
    .slice(0, input.count);

  const warnings: string[] = [];
  if (ranked.length < input.count) {
    warnings.push(`تتوفر ${ranked.length} أفكار ملائمة للمنصات المختارة في الوضع التجريبي. أضف منصات أخرى لتوسيع الخيارات.`);
  }

  const byPlatform = new Map<Platform, string[]>();
  const ideaSections: DocSection[] = ranked.map(({ t }, i) => {
    const fitPlatforms = t.platforms.filter((p) => input.platforms.includes(p));
    fitPlatforms.forEach((p) => byPlatform.set(p, [...(byPlatform.get(p) ?? []), `${i + 1}. ${t.title(subject)}`]));
    const purposeMatch = t.purposes.includes(input.purpose);
    return {
      heading: `الفكرة ${i + 1}: ${t.title(subject)}`,
      body: t.concept(subject, org),
      items: [
        `المنصات الأنسب: ${fitPlatforms.map((p) => IDEA_PLATFORMS[p]).join("، ")}`,
        `الجمهور: ${IDEA_AUDIENCES[input.audience]}${t.audiences !== "all" && !t.audiences.includes(input.audience) ? " (تحتاج الفكرة إلى مواءمة مع هذا الجمهور)" : ""}`,
        `الغرض الاتصالي: ${purposeMatch ? IDEA_PURPOSES[input.purpose] : `${IDEA_PURPOSES[t.purposes[0]]} — يخدم هدف ${IDEA_PURPOSES[input.purpose]}`}`,
        `صيغة التنفيذ: ${t.format}`,
        `مؤشر الأداء المقترح: ${t.kpi}`,
      ],
    };
  });

  const sections: DocSection[] = [
    {
      heading: "ملخص الموجز الإبداعي",
      items: [
        `الموضوع: ${subject}`,
        ...(org ? [`الجهة: ${org}`] : []),
        `الجمهور المستهدف: ${IDEA_AUDIENCES[input.audience]}`,
        `الغرض الاتصالي: ${IDEA_PURPOSES[input.purpose]}`,
        `المنصات: ${input.platforms.map((p) => IDEA_PLATFORMS[p]).join("، ")}`,
        ...(input.notes ? [`ملاحظات: ${input.notes}`] : []),
      ],
    },
    ...ideaSections,
    {
      heading: "تصنيف الأفكار حسب المنصة",
      items: [...byPlatform.entries()].map(([p, list]) => `${IDEA_PLATFORMS[p]}: ${list.join(" | ")}`),
    },
    {
      heading: "خطوات التحويل إلى خطة تنفيذ",
      items: [
        "اختر فكرة رئيسية (Hero) وفكرتين داعمتين لضمان وحدة الرسالة.",
        "صغ رسالة محورية واحدة ووسمًا موحدًا يتكرر عبر المنصات.",
        "حدد خط الأساس للمؤشرات قبل الإطلاق لتتمكن من قياس الأثر لاحقًا.",
        "اختبر الفكرة على عينة صغيرة من الجمهور قبل التعميم.",
      ],
    },
  ];

  return {
    document: {
      title: `أفكار إعلامية: ${subject}`,
      subtitle: `${IDEA_PURPOSES[input.purpose]} · ${IDEA_AUDIENCES[input.audience]}`,
      sections,
    },
    warnings,
  };
}
