import type { TrainingInput, ResultDocument, DocSection } from "@/lib/ai/types";
import { DELIVERY, LEVELS, SECTORS } from "@/lib/labels";
import { splitList } from "@/lib/utils";
import { arCount, DAYS, HOURS, pick, stripEndPunct } from "./text";

const VERBS: Record<TrainingInput["level"], string[]> = {
  beginner: ["يشرح", "يحدّد", "يميّز", "يصف", "يستوعب"],
  intermediate: ["يطبّق", "يوظّف", "يحلّل", "يستخدم", "يختار"],
  advanced: ["يقيّم", "يطوّر", "يصوغ", "يقود", "يتبنّى"],
};

const OBJECT_FRAME: Record<TrainingInput["level"], string> = {
  beginner: "المفاهيم والأسس الرئيسية في",
  intermediate: "الأساليب والأدوات العملية في",
  advanced: "الاستراتيجيات والممارسات المتقدمة في",
};

const SECTOR_CONTEXT: Record<TrainingInput["sector"], string> = {
  government: "حالات تطبيقية من بيئة العمل الحكومي والاتصال المؤسسي",
  media: "نماذج من غرف الأخبار وبيئات الإنتاج الإعلامي",
  education: "مواقف من البيئة التعليمية والأكاديمية",
  health: "سيناريوهات من القطاع الصحي والتوعية الصحية",
  private: "حالات من بيئة الأعمال وخدمة العملاء",
  nonprofit: "تجارب من العمل المجتمعي والتطوعي",
};

const ACTIVITIES: Record<TrainingInput["delivery"], string[]> = {
  "in-person": [
    "ورشة عمل جماعية لتحليل حالة دراسية",
    "لعب أدوار ومحاكاة لموقف عملي",
    "تمرين فردي تطبيقي يتبعه تغذية راجعة من المدرب",
    "نقاش موجّه بأسلوب الحوض الزجاجي (Fishbowl)",
    "جولة أفكار بين مجموعات العمل (Gallery Walk)",
  ],
  online: [
    "نشاط في غرف فرعية لتحليل حالة دراسية",
    "استطلاع مباشر يتبعه نقاش موجّه",
    "تمرين تطبيقي على لوحة تعاونية رقمية",
    "محاكاة عملية يقدمها المشاركون عبر مشاركة الشاشة",
    "اختبار قصير تفاعلي لقياس الفهم",
  ],
  hybrid: [
    "تعلّم ذاتي مسبق عبر محتوى رقمي قصير يتبعه نقاش حضوري",
    "ورشة عمل مختلطة تجمع الحاضرين والمتصلين في فرق مشتركة",
    "تمرين تطبيقي يُسلَّم عبر منصة التعلم",
    "محاكاة لموقف عملي مع تغذية راجعة فورية",
    "مشروع مصغّر يُستكمل بين الجلسات",
  ],
};

const OUTPUTS = [
  "خطة عمل مكتوبة قابلة للتطبيق في بيئة العمل",
  "نموذج تطبيقي منجز يقيَّم وفق قائمة معايير",
  "تحليل مكتوب لحالة دراسية",
  "عرض تقديمي قصير لحل مقترح",
  "قائمة تحقق إجرائية يعدّها المشارك",
];

export function demoTraining(input: TrainingInput): { document: ResultDocument; warnings: string[] } {
  const needs = splitList(input.needs).slice(0, 8);
  const warnings: string[] = [];
  if (splitList(input.needs).length > 8) warnings.push("اقتصر البرنامج على أول ثمانية احتياجات؛ يُفضَّل تقسيم البقية على برنامج لاحق.");

  const totalHours = input.days * input.hoursPerDay;
  const verbs = VERBS[input.level];
  const frame = OBJECT_FRAME[input.level];
  const activities = ACTIVITIES[input.delivery];

  // Reserve opening and closing time, then split the remainder across modules.
  const sessionMinutes = 90;
  const totalMinutes = totalHours * 60;
  const reserved = Math.min(60, Math.round(totalMinutes * 0.1));
  const perModule = Math.max(30, Math.floor((totalMinutes - reserved) / Math.max(needs.length, 1) / 15) * 15);

  const objectives = needs.map(
    (need, i) => `أن ${pick(verbs, i)} المشارك ${frame} ${stripEndPunct(need)}، وفق معايير الأداء المحددة في التقييم التطبيقي.`
  );

  const modules: DocSection[] = needs.map((need, i) => ({
    heading: `المحور ${i + 1}: ${stripEndPunct(need)}`,
    items: [
      `المدة المقترحة: ${perModule} دقيقة`,
      `الهدف: ${objectives[i]}`,
      `المحتوى: ${frame} ${stripEndPunct(need)} مع ${SECTOR_CONTEXT[input.sector]}`,
      `النشاط: ${pick(activities, i)}`,
      `المخرج القابل للقياس: ${pick(OUTPUTS, i)}`,
      `مؤشر القياس: استيفاء معايير قائمة التقييم الخاصة بالمحور، ومقارنة نتيجة الاختبار القبلي بالبعدي`,
    ],
  }));

  // Daily agenda: fill each day's capacity, splitting a module across days when needed.
  const agenda: string[] = [];
  const dayCapacity = input.hoursPerDay * 60;
  const opening = Math.min(30, Math.round(reserved / 2));
  const closing = reserved - opening;
  type Slot = { label: string; minutes: number };
  const queue: Slot[] = [
    { label: "الافتتاح والتعارف والاختبار القبلي", minutes: opening },
    ...needs.map((need, i) => ({ label: `المحور ${i + 1} (${stripEndPunct(need)})`, minutes: perModule })),
    { label: "الاختبار البعدي وتقييم البرنامج والختام", minutes: Math.max(closing, 15) },
  ];
  let day = 1;
  let used = 0;
  let dayItems: string[] = [];
  const started = new Set<string>();
  for (const slot of queue) {
    let remaining = slot.minutes;
    while (remaining > 0) {
      const free = dayCapacity - used;
      if (free < 15) {
        agenda.push(`اليوم ${day}: ${dayItems.join(" ← ")}`);
        day += 1;
        used = 0;
        dayItems = [];
        continue;
      }
      const take = Math.min(free, remaining);
      dayItems.push(`${slot.label}${started.has(slot.label) ? " — تتمة" : ""} (${take} د)`);
      started.add(slot.label);
      used += take;
      remaining -= take;
    }
  }
  if (dayItems.length) agenda.push(`اليوم ${day}: ${dayItems.join(" ← ")}`);
  if (day > input.days) {
    warnings.push(`المحاور تحتاج إلى ${arCount(day, DAYS)} تقريبًا بينما المدة المحددة ${arCount(input.days, DAYS)}؛ قلّل المحاور أو زد عدد الساعات.`);
  }

  const sections: DocSection[] = [
    {
      heading: "بطاقة البرنامج",
      items: [
        `الجهة: ${input.organization}`,
        `القطاع: ${SECTORS[input.sector]}`,
        `الفئة المستهدفة: ${input.targetGroup}`,
        `مستوى المتدربين: ${LEVELS[input.level]}`,
        `المدة: ${arCount(input.days, DAYS)} × ${arCount(input.hoursPerDay, HOURS)} يوميًا — إجمالي الساعات التدريبية: ${totalHours}`,
        `أسلوب التنفيذ: ${DELIVERY[input.delivery]}`,
        `مدة الجلسة المقترحة: ${sessionMinutes} دقيقة مع استراحة بين الجلسات`,
      ],
    },
    {
      heading: "الهدف العام",
      body: `تمكين ${input.targetGroup} في ${input.organization} من ${needs.map((n) => stripEndPunct(n)).join("، و")}، بما ينعكس على جودة الأداء في بيئة العمل.`,
    },
    { heading: "الأهداف التفصيلية", items: objectives },
    ...modules,
    { heading: "الجدول الزمني المقترح", items: agenda },
    {
      heading: "منهجية التقييم (نموذج كيركباتريك)",
      items: [
        "المستوى الأول — رد الفعل: استبانة رضا في نهاية كل يوم تدريبي.",
        "المستوى الثاني — التعلم: اختبار قبلي وبعدي مبني على الأهداف التفصيلية.",
        "المستوى الثالث — السلوك: متابعة تطبيق المخرجات في بيئة العمل بعد البرنامج بفترة يحددها الرئيس المباشر.",
        "المستوى الرابع — النتائج: ربط مخرجات البرنامج بمؤشرات أداء الجهة ذات الصلة.",
      ],
    },
    {
      heading: "متطلبات التنفيذ",
      items:
        input.delivery === "online"
          ? ["منصة اجتماعات تدعم الغرف الفرعية", "لوحة تعاونية رقمية", "نموذج إلكتروني للاختبارات والاستبانات"]
          : input.delivery === "hybrid"
            ? ["قاعة مجهزة بكاميرا ونظام صوت للربط عن بُعد", "منصة تعلم إلكترونية لنشر المواد", "شاشة عرض ولوح تفاعلي"]
            : ["قاعة تدريب بترتيب مجموعات", "شاشة عرض وسبورة ورقية", "مواد مطبوعة لأوراق العمل"],
    },
  ];

  return {
    document: {
      title: `برنامج تدريبي مقترح: ${needs.length === 1 ? stripEndPunct(needs[0]) : `تطوير قدرات ${input.targetGroup}`}`,
      subtitle: `${input.organization} · ${SECTORS[input.sector]} · مستوى ${LEVELS[input.level]}`,
      sections,
    },
    warnings,
  };
}
