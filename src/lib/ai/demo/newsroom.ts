import type { NewsroomInput, ResultDocument, DocSection } from "@/lib/ai/types";
import { NEWS_AUDIENCES, NEWS_TYPES } from "@/lib/labels";
import { checkNewsCompleteness } from "@/lib/newsroom-check";
import { ensureEndPunct, stripEndPunct, stripLeading, truncateWords, splitSentences } from "./text";

const gap = (label: string) => `[يُستكمل: ${label}]`;

const AUDIENCE_GUIDANCE: Record<NewsroomInput["audience"], string[]> = {
  general: [
    "استخدم جملًا قصيرة ومفردات متداولة، وتجنب المصطلحات التخصصية أو اشرحها عند ورودها.",
    "قدّم الأثر المباشر للحدث على حياة الناس في الفقرة الثانية.",
  ],
  specialists: [
    "يمكن توظيف المصطلحات المهنية بدقة مع ذكر الأرقام والمرجعيات التنظيمية عند توفرها.",
    "أضف فقرة تحليلية تربط الحدث بالسياق المهني أو التشريعي.",
  ],
  youth: [
    "اعتمد إيقاعًا سريعًا وجملًا مباشرة، وأبرز ما يمكن للقارئ فعله أو المشاركة فيه.",
    "يُستحسن إرفاق عناصر بصرية (صورة، إنفوجرافيك، مقطع قصير) مع النشر الرقمي.",
  ],
  officials: [
    "قدّم الخلاصة والانعكاسات على السياسات في المقدمة، ثم التفاصيل الإجرائية.",
    "احرص على دقة المسميات الرسمية والتواريخ والمرجعيات.",
  ],
  internal: [
    "خاطب منسوبي الجهة بلغة مؤسسية دافئة، ووضّح ما يترتب على الخبر بالنسبة لهم.",
    "اختم بجهة التواصل أو الرابط الداخلي للاستفسارات.",
  ],
};

const TYPE_GUIDANCE: Record<NewsroomInput["newsType"], string> = {
  hard: "اعتمد بناء الهرم المقلوب: الأهم فالمهم، مع الحفاظ على الحياد وتجنب الصفات التقييمية.",
  breaking: "اقتصر على المؤكد من المعلومات، وانشر التحديثات تباعًا مع الإشارة إلى وقت آخر تحديث.",
  feature: "ابدأ بمشهد أو شخصية تجسد الحدث، ثم انتقل إلى المعلومات الأساسية والسياق.",
  press: "يُكتب البيان بصوت الجهة، ويُختتم بنبذة تعريفية عنها وبيانات التواصل الإعلامي.",
  event: "ركّز على أبرز ما شهدته الفعالية ومخرجاتها، لا على تسلسل البرنامج.",
};

function buildHeadline(input: NewsroomInput) {
  const core = truncateWords(stripEndPunct(input.what), 14);
  const withPlace =
    input.where && !core.includes(input.where.trim()) && core.split(/\s+/).length < 11
      ? `${core} في ${stripLeading(input.where, ["في "])}`
      : core;
  switch (input.newsType) {
    case "breaking":
      return `عاجل | ${withPlace}`;
    case "press":
      return input.who ? `${input.who.trim()}: ${withPlace}` : withPlace;
    default:
      return withPlace;
  }
}

function buildSubheadline(input: NewsroomInput) {
  if (input.how) return ensureEndPunct(truncateWords(stripEndPunct(input.how), 18));
  if (input.why) return ensureEndPunct(`بهدف ${stripLeading(input.why, ["بهدف", "من أجل", "لأجل"])}`);
  return undefined;
}

function buildLead(input: NewsroomInput) {
  const place = input.where ? `${stripLeading(input.where, ["في "])} — ` : `${gap("مكان الحدث")} — `;
  const parts: string[] = [stripEndPunct(input.what)];
  if (input.who && !input.what.includes(input.who.trim())) parts.push(`وذلك من قِبل ${input.who.trim()}`);
  parts.push(input.when ? input.when.trim() : gap("زمن الحدث"));
  let lead = `${place}${parts.join("، ")}`;
  if (input.source) lead += `، بحسب ${input.source.trim()}`;
  else if (input.newsType !== "press") lead += `، بحسب ${gap("مصدر المعلومة")}`;
  return ensureEndPunct(lead);
}

function buildBody(input: NewsroomInput): string[] {
  const paragraphs: string[] = [];

  if (input.why) {
    paragraphs.push(ensureEndPunct(`ويأتي ذلك بهدف ${stripLeading(input.why, ["بهدف", "من أجل", "لأجل"])}`));
  } else {
    paragraphs.push(`ويأتي ذلك بهدف ${gap("الهدف أو السبب")}.`);
  }

  if (input.how) {
    paragraphs.push(ensureEndPunct(`وعن آلية التنفيذ، ${stripEndPunct(input.how)}`));
  }

  if (input.quote) {
    const speaker = input.source || input.who || gap("اسم صاحب التصريح وصفته");
    const quote = stripEndPunct(input.quote.replace(/^[«"“]|[»"”]$/g, ""));
    paragraphs.push(`وفي تصريح بهذه المناسبة، قال ${speaker.trim()}: «${quote}».`);
  }

  if (input.extra) {
    const sentences = splitSentences(input.extra);
    if (sentences.length) {
      paragraphs.push(`وفي سياق متصل، ${sentences.map((s) => ensureEndPunct(s)).join(" ")}`);
    }
  }

  if (input.newsType === "press") {
    paragraphs.push(`نبذة عن ${input.who?.trim() || gap("اسم الجهة")}: ${gap("نبذة تعريفية مختصرة عن الجهة")}`);
    paragraphs.push(`للتواصل الإعلامي: ${gap("الاسم، البريد الإلكتروني، رقم الهاتف")}`);
  }

  return paragraphs;
}

export function demoNewsroom(input: NewsroomInput): { document: ResultDocument; warnings: string[] } {
  const missing = checkNewsCompleteness(input);
  const sections: DocSection[] = [
    { heading: "العنوان الرئيسي", body: buildHeadline(input) },
  ];

  const sub = buildSubheadline(input);
  if (sub) sections.push({ heading: "العنوان الفرعي", body: sub });

  sections.push({ heading: "المقدمة", body: buildLead(input) });
  sections.push({ heading: "المتن", body: buildBody(input).join("\n\n") });

  sections.push({
    heading: "توجيهات تحريرية",
    items: [TYPE_GUIDANCE[input.newsType], ...AUDIENCE_GUIDANCE[input.audience]],
  });

  if (missing.length) {
    sections.push({
      heading: "عناصر تحتاج إلى استكمال",
      items: missing.map((m) => `${m.label} — ${m.hint}`),
    });
  }

  return {
    document: {
      title: buildHeadline(input),
      subtitle: `${NEWS_TYPES[input.newsType]} · موجّه إلى: ${NEWS_AUDIENCES[input.audience]}`,
      sections,
    },
    warnings: missing.map((m) =>
      m.level === "required" ? `معلومة أساسية ناقصة: ${m.label}` : `يُستحسن إضافة: ${m.label}`
    ),
  };
}
