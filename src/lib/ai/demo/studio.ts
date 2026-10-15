import type { StudioInput, ResultDocument, DocSection } from "@/lib/ai/types";
import { VIDEO_FORMATS, VIDEO_PLATFORMS, VIDEO_TONES } from "@/lib/labels";
import { splitList } from "@/lib/utils";
import { ensureEndPunct, formatTimecode, pick, stripEndPunct, wordCount } from "./text";

type Role = "hook" | "context" | "point" | "evidence" | "turn" | "close" | "cta";

interface Blueprint {
  role: Role;
  name: string;
  weight: number;
}

const STRUCTURES: Record<StudioInput["format"], Blueprint[]> = {
  report: [
    { role: "hook", name: "الافتتاحية", weight: 0.8 },
    { role: "context", name: "الحدث وسياقه", weight: 1.2 },
    { role: "point", name: "التفاصيل", weight: 1.4 },
    { role: "evidence", name: "الأثر والآراء", weight: 1.2 },
    { role: "close", name: "الخاتمة", weight: 0.7 },
  ],
  explainer: [
    { role: "hook", name: "السؤال الافتتاحي", weight: 0.8 },
    { role: "context", name: "التعريف بالموضوع", weight: 1.1 },
    { role: "point", name: "كيف يعمل؟", weight: 1.4 },
    { role: "evidence", name: "أمثلة تطبيقية", weight: 1.2 },
    { role: "close", name: "الخلاصة", weight: 0.8 },
  ],
  promo: [
    { role: "hook", name: "الخطاف البصري", weight: 0.7 },
    { role: "context", name: "الحاجة أو التحدي", weight: 1 },
    { role: "point", name: "الحل المقدَّم", weight: 1.3 },
    { role: "evidence", name: "المزايا", weight: 1.2 },
    { role: "cta", name: "الدعوة إلى الإجراء", weight: 0.7 },
  ],
  documentary: [
    { role: "hook", name: "المشهد التأسيسي", weight: 1 },
    { role: "context", name: "السياق والخلفية", weight: 1.2 },
    { role: "point", name: "الشخصيات والقصة", weight: 1.4 },
    { role: "turn", name: "التحدي ونقطة التحول", weight: 1.3 },
    { role: "evidence", name: "الشواهد", weight: 1.1 },
    { role: "close", name: "الخاتمة", weight: 0.9 },
  ],
  reel: [
    { role: "hook", name: "خطاف الثواني الأولى", weight: 0.5 },
    { role: "point", name: "الفكرة الرئيسية", weight: 1.3 },
    { role: "evidence", name: "الدليل أو المثال", weight: 1 },
    { role: "cta", name: "الختام والدعوة", weight: 0.6 },
  ],
};

const SHOTS: Record<Role, Array<{ angle: string; move: string; visual: string }>> = {
  hook: [
    { angle: "لقطة قريبة جدًا (Extreme Close-up)", move: "دخول سريع بالتقريب (Push-in)", visual: "تفصيلة بصرية لافتة تختزل الموضوع" },
    { angle: "لقطة جوية واسعة (Aerial)", move: "انزلاق أمامي بطيء", visual: "مشهد عام يؤسس للمكان" },
  ],
  context: [
    { angle: "لقطة واسعة تأسيسية (Wide Shot)", move: "تحريك أفقي هادئ (Pan)", visual: "المكان والأشخاص في بيئتهم الطبيعية" },
    { angle: "لقطة متوسطة (Medium Shot)", move: "ثابتة على حامل", visual: "عناصر توضح خلفية الموضوع" },
  ],
  point: [
    { angle: "لقطة متوسطة قريبة (Medium Close-up)", move: "ثابتة مع تبديل الزوايا", visual: "حديث مباشر أو عرض للعنصر الرئيسي" },
    { angle: "لقطة من فوق الكتف (Over-the-shoulder)", move: "تتبع خفيف باليد", visual: "تفاعل الأشخاص مع الموضوع" },
    { angle: "لقطة علوية (Top Shot)", move: "ثابتة", visual: "عرض تفصيلي للخطوات أو الأدوات" },
  ],
  evidence: [
    { angle: "لقطات تفصيلية (Insert Shots)", move: "انزلاق جانبي (Slider)", visual: "شواهد ومشاهد داعمة ورسوم معلوماتية" },
    { angle: "لقطة متوسطة لمقابلة (Interview Setup)", move: "كاميرتان: أمامية وجانبية بزاوية 45°", visual: "تصريح من مختص أو مستفيد" },
  ],
  turn: [
    { angle: "لقطة منخفضة الزاوية (Low Angle)", move: "رفع الكاميرا (Tilt up)", visual: "لحظة التحول أو مواجهة التحدي" },
  ],
  close: [
    { angle: "لقطة واسعة ختامية", move: "سحب للخلف (Pull-out)", visual: "مشهد يلخص الرحلة ويترك أثرًا" },
  ],
  cta: [
    { angle: "لقطة متوسطة مباشرة للكاميرا", move: "ثابتة", visual: "الشعار وعنوان التواصل أو رابط الخدمة" },
  ],
};

const SOUND: Record<Role, string> = {
  hook: "مؤثر صوتي افتتاحي قصير مع بداية الموسيقى",
  context: "موسيقى خلفية منخفضة مع أصوات المكان الطبيعية",
  point: "خفض الموسيقى لإبراز التعليق الصوتي",
  evidence: "الصوت الطبيعي للمقابلة أو المشهد",
  turn: "تصاعد موسيقي تدريجي",
  close: "ذروة موسيقية هادئة ثم تلاشٍ",
  cta: "مؤثر ختامي مع ظهور الشعار",
};

const ASPECT: Record<StudioInput["platform"], string> = {
  youtube: "16:9 أفقي",
  tv: "16:9 أفقي (بدقة بث تلفزيوني)",
  website: "16:9 أفقي",
  instagram: "9:16 عمودي (أو 4:5 للمنشورات)",
  tiktok: "9:16 عمودي",
  x: "16:9 أو 1:1",
};

const ORDINALS = ["أولًا،", "ثانيًا،", "ثالثًا،", "رابعًا،", "خامسًا،", "سادسًا،", "سابعًا،", "ثامنًا،", "تاسعًا،", "عاشرًا،"];

/** Arabic narration averages roughly 2–2.5 words per second. */
const WORDS_PER_SECOND = 2.2;

function narrationFor(role: Role, input: StudioInput, point: string | undefined, idx: number): string {
  const topic = stripEndPunct(input.topic);
  const goal = input.goal ? stripEndPunct(input.goal) : "";
  switch (role) {
    case "hook":
      if (/^(كيف|ماذا|لماذا|هل|متى|أين|ما|من)\s/u.test(topic)) return `${topic}؟ في هذا الفيديو نجيب خطوة بخطوة.`;
      return input.format === "explainer"
        ? `هل تساءلت يومًا عن ${topic}؟ في الدقائق القادمة نبسّط لك الصورة.`
        : input.format === "promo" || input.format === "reel"
          ? `${topic}… فكرة تستحق أن تتوقف عندها.`
          : `${topic}. قصة نتابع تفاصيلها في هذا ${input.format === "documentary" ? "الفيلم" : "التقرير"}.`;
    case "context":
      return point
        ? ensureEndPunct(`${pick(ORDINALS, idx)} ${point}`)
        : `لفهم ${topic}، لا بد أن نعود إلى السياق الذي انطلق منه.`;
    case "point":
    case "evidence":
    case "turn":
      if (point) return ensureEndPunct(`${pick(ORDINALS, idx)} ${point}`);
      return role === "evidence"
        ? "[أضف هنا شاهدًا أو مثالًا أو تصريحًا يدعم الفكرة]"
        : "[أضف هنا النقطة الرئيسية لهذا المشهد]";
    case "close":
      return goal ? ensureEndPunct(`وفي المحصلة، ${goal}`) : `هكذا تتشكل ملامح ${topic}، والقصة لا تزال مستمرة.`;
    case "cta":
      return goal ? ensureEndPunct(`${goal}. ابدأ الآن`) : "تابعونا لمعرفة المزيد، وشاركوا المقطع مع من يهمه الأمر.";
  }
}

export function demoStudio(input: StudioInput): { document: ResultDocument; warnings: string[] } {
  const blueprint = [...STRUCTURES[input.format]];
  const points = splitList(input.keyPoints);

  // Expand the middle of the structure to fit longer videos or extra key points.
  const desiredScenes = Math.min(
    12,
    Math.max(
      blueprint.length,
      input.duration <= 45 ? blueprint.length : Math.round(input.duration / 40) + 2,
      points.length + 2
    )
  );
  while (blueprint.length < desiredScenes) {
    const insertAt = blueprint.length - 1;
    const pointCount = blueprint.filter((b) => b.role === "point").length;
    blueprint.splice(insertAt, 0, { role: "point", name: pointCount ? "تفصيل إضافي" : "التفاصيل", weight: 1.2 });
  }

  const totalWeight = blueprint.reduce((a, b) => a + b.weight, 0);
  const middleRoles: Role[] = ["context", "point", "evidence", "turn"];
  let pointCursor = 0;
  let cursor = 0;
  const fullNarration: string[] = [];
  const shotList: string[] = [];

  const sceneSections: DocSection[] = blueprint.map((b, i) => {
    const seconds = Math.max(3, Math.round((b.weight / totalWeight) * input.duration));
    const start = cursor;
    const end = i === blueprint.length - 1 ? input.duration : Math.min(input.duration, cursor + seconds);
    cursor = end;
    const point = middleRoles.includes(b.role) ? points[pointCursor++] : undefined;
    const shot = pick(SHOTS[b.role], i);
    const narration = narrationFor(b.role, input, point, pointCursor - 1);
    fullNarration.push(narration);
    shotList.push(`المشهد ${i + 1}: ${shot.angle} — ${shot.visual}`);
    const budget = Math.round((end - start) * WORDS_PER_SECOND);

    return {
      heading: `المشهد ${i + 1}: ${b.name} (${formatTimecode(start)} – ${formatTimecode(end)})`,
      body: narration,
      items: [
        `المشهد البصري: ${shot.visual}${point ? ` يجسّد: ${stripEndPunct(point)}` : ""}`,
        `زاوية التصوير: ${shot.angle}`,
        `حركة الكاميرا: ${shot.move}`,
        `الصوت: ${SOUND[b.role]}`,
        `النص على الشاشة: ${b.role === "hook" ? stripEndPunct(input.topic) : point ? stripEndPunct(point).split(" ").slice(0, 6).join(" ") : "—"}`,
        `السعة التقريبية للتعليق: نحو ${budget} كلمة (الحالي: ${wordCount(narration)})`,
      ],
    };
  });

  const warnings: string[] = [];
  if (!points.length) warnings.push("لم تُدخل نقاطًا رئيسية؛ تُركت مواضع المحتوى في المشاهد الوسطى لتستكملها.");
  if (points.length > pointCursor) warnings.push(`لم تتسع المشاهد لكل النقاط (${points.length - pointCursor} نقطة لم تُدرج). زد مدة الفيديو أو ادمج النقاط.`);

  const sections: DocSection[] = [
    {
      heading: "بطاقة الإنتاج",
      items: [
        `الموضوع: ${stripEndPunct(input.topic)}`,
        `القالب: ${VIDEO_FORMATS[input.format]}`,
        `المنصة: ${VIDEO_PLATFORMS[input.platform]} — نسبة العرض: ${ASPECT[input.platform]}`,
        `المدة المستهدفة: ${formatTimecode(input.duration)} (${input.duration} ثانية)`,
        `النبرة: ${VIDEO_TONES[input.tone]}`,
        ...(input.audience ? [`الجمهور: ${input.audience}`] : []),
        ...(input.goal ? [`الهدف: ${stripEndPunct(input.goal)}`] : []),
        `عدد المشاهد: ${blueprint.length}`,
      ],
    },
    ...sceneSections,
    { heading: "نص التعليق الصوتي الكامل", body: fullNarration.join("\n\n") },
    { heading: "قائمة اللقطات", items: shotList },
    {
      heading: "ملاحظات للمونتاج",
      items: [
        input.platform === "tiktok" || input.platform === "instagram" || input.format === "reel"
          ? "اجعل الثواني الثلاث الأولى بصرية خالصة مع نص على الشاشة، فكثير من المشاهدين يتابعون دون صوت."
          : "أضف ترجمة نصية مدمجة لتسهيل المشاهدة دون صوت وتعزيز إمكانية الوصول.",
        "حافظ على تزامن القطع مع إيقاع الموسيقى ونهاية الجمل في التعليق الصوتي.",
        "راجع حقوق استخدام الموسيقى والصور الأرشيفية قبل النشر.",
      ],
    },
  ];

  return {
    document: {
      title: `سيناريو: ${stripEndPunct(input.topic)}`,
      subtitle: `${VIDEO_FORMATS[input.format]} · ${VIDEO_PLATFORMS[input.platform]} · ${formatTimecode(input.duration)}`,
      sections,
    },
    warnings,
  };
}
