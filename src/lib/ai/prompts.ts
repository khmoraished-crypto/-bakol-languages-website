import "server-only";
import type { ToolId, ToolInputMap } from "@/lib/ai/types";
import {
  DELIVERY,
  EDITOR_ACTIONS,
  EDITOR_TONES,
  IDEA_AUDIENCES,
  IDEA_PLATFORMS,
  IDEA_PURPOSES,
  LEVELS,
  NEWS_AUDIENCES,
  NEWS_TYPES,
  SECTORS,
  SHORTEN_LENGTHS,
  VIDEO_FORMATS,
  VIDEO_PLATFORMS,
  VIDEO_TONES,
} from "@/lib/labels";

const OUTPUT_CONTRACT = `
أعد النتيجة بصيغة JSON صالحة فقط، دون أي نص قبلها أو بعدها، ودون أسوار Markdown، وفق البنية التالية:
{
  "title": "عنوان النتيجة",
  "subtitle": "سطر وصفي اختياري",
  "sections": [
    { "heading": "عنوان القسم", "body": "فقرة أو فقرات مفصولة بسطر فارغ (اختياري)", "items": ["بند", "بند"] }
  ]
}
- كل قسم يحتوي body أو items أو كليهما.
- اكتب بالعربية الفصحى السليمة، وتجنب اختلاق أرقام أو إحصاءات أو أسماء أو تصريحات غير واردة في المدخلات.
- إذا نقصت معلومة ضرورية فضع مكانها: [يُستكمل: وصف المعلومة].`;

const SYSTEM_BASE = `أنت مساعد تحريري محترف ضمن منصة "مختبر الإعلام الذكي" للإعلاميين العرب. تلتزم بالدقة والحياد والمعايير المهنية والأخلاقية للعمل الصحفي.`;

type PromptBuilder<T extends ToolId> = (input: ToolInputMap[T]) => { system: string; user: string };

const field = (label: string, value: string | number | undefined) =>
  value === undefined || value === "" ? `${label}: (غير متوفر)` : `${label}: ${value}`;

const builders: { [K in ToolId]: PromptBuilder<K> } = {
  newsroom: (i) => ({
    system: `${SYSTEM_BASE}
مهمتك: كتابة مسودة خبر صحفي وفق بناء الهرم المقلوب.
الأقسام المطلوبة بالترتيب: "العنوان الرئيسي"، "العنوان الفرعي"، "المقدمة" (تجيب عن أهم الأسئلة الستة في جملة أو جملتين)، "المتن" (فقرات مترابطة)، "توجيهات تحريرية" (بنود)، ثم "عناصر تحتاج إلى استكمال" (بنود) إن وجدت نواقص.
${OUTPUT_CONTRACT}`,
    user: [
      `نوع الخبر: ${NEWS_TYPES[i.newsType]}`,
      `الجمهور المستهدف: ${NEWS_AUDIENCES[i.audience]}`,
      field("ماذا حدث", i.what),
      field("من", i.who),
      field("متى", i.when),
      field("أين", i.where),
      field("لماذا", i.why),
      field("كيف", i.how),
      field("المصدر", i.source),
      field("تصريح", i.quote),
      field("معلومات إضافية", i.extra),
    ].join("\n"),
  }),

  editor: (i) => {
    const task = {
      rephrase: `أعد صياغة النص بنبرة "${EDITOR_TONES[i.tone]}" مع الحفاظ التام على المعنى والمعلومات. الأقسام: "النص بعد إعادة الصياغة"، "التعديلات المطبقة" (بنود).`,
      shorten: `اختصر النص ${SHORTEN_LENGTHS[i.length]} مع الحفاظ على المعلومات الجوهرية. الأقسام: "النص المختصر"، "تفاصيل الاختصار" (بنود تتضمن ما حُذف ولماذا).`,
      proofread: `دقق النص لغويًا وإملائيًا ونحويًا وترقيميًا. الأقسام: "النص بعد التدقيق"، "التصويبات" (بنود بصيغة: الخطأ ← الصواب: السبب)، "ملاحظات أسلوبية" (بنود).`,
      headlines: `اقترح خمسة عناوين صحفية بديلة ومتنوعة الأسلوب (مباشر، سؤال، تفسيري، مقتبس، رقمي أو رقمي-منصاتي). القسم الأول "العناوين المقترحة" يحتوي خمسة بنود بالضبط بصيغة: العنوان — (الأسلوب). ثم "معايير المفاضلة بين العناوين".`,
    }[i.action];
    return {
      system: `${SYSTEM_BASE}\nمهمتك: ${EDITOR_ACTIONS[i.action]}. ${task}\n${OUTPUT_CONTRACT}`,
      user: `النص:\n"""\n${i.text}\n"""`,
    };
  },

  studio: (i) => ({
    system: `${SYSTEM_BASE}
مهمتك: إعداد سيناريو فيديو احترافي مقسّم إلى مشاهد.
الأقسام: "بطاقة الإنتاج" (بنود)، ثم قسم لكل مشهد بعنوان "المشهد N: الاسم (00:00 – 00:10)" يحتوي body = نص التعليق الصوتي العربي للمشهد، وitems = [المشهد البصري، زاوية التصوير، حركة الكاميرا، الصوت، النص على الشاشة]. ثم "نص التعليق الصوتي الكامل"، "قائمة اللقطات"، "ملاحظات للمونتاج".
راعِ أن يتناسب طول التعليق مع مدة كل مشهد (نحو كلمتين في الثانية).
${OUTPUT_CONTRACT}`,
    user: [
      field("الموضوع", i.topic),
      field("الهدف", i.goal),
      `القالب: ${VIDEO_FORMATS[i.format]}`,
      `المنصة: ${VIDEO_PLATFORMS[i.platform]}`,
      `المدة بالثواني: ${i.duration}`,
      `النبرة: ${VIDEO_TONES[i.tone]}`,
      field("الجمهور", i.audience),
      field("النقاط الرئيسية", i.keyPoints),
    ].join("\n"),
  }),

  training: (i) => ({
    system: `${SYSTEM_BASE} ولديك خبرة في التصميم التعليمي (ADDIE وتصنيف بلوم ونموذج كيركباتريك).
مهمتك: تصميم برنامج تدريبي متكامل.
الأقسام: "بطاقة البرنامج"، "الهدف العام"، "الأهداف التفصيلية" (أهداف سلوكية قابلة للقياس بأفعال بلوم المناسبة للمستوى)، قسم لكل محور بعنوان "المحور N: ..." يتضمن بنود (المدة، الهدف، المحتوى، النشاط، المخرج القابل للقياس، مؤشر القياس)، "الجدول الزمني المقترح"، "منهجية التقييم"، "متطلبات التنفيذ".
${OUTPUT_CONTRACT}`,
    user: [
      field("الجهة", i.organization),
      `القطاع: ${SECTORS[i.sector]}`,
      field("الفئة المستهدفة", i.targetGroup),
      `المستوى: ${LEVELS[i.level]}`,
      field("الاحتياجات التدريبية", i.needs),
      `عدد الأيام: ${i.days}`,
      `الساعات اليومية: ${i.hoursPerDay}`,
      `أسلوب التنفيذ: ${DELIVERY[i.delivery]}`,
    ].join("\n"),
  }),

  ideas: (i) => ({
    system: `${SYSTEM_BASE}
مهمتك: توليد أفكار مبتكرة وغير تقليدية للحملات الإعلامية والمحتوى الرقمي.
الأقسام: "ملخص الموجز الإبداعي"، ثم ${i.count} أقسام بعنوان "الفكرة N: اسم الفكرة" يحتوي body = وصف الفكرة، وitems = [المنصات الأنسب، الجمهور، الغرض الاتصالي، صيغة التنفيذ، مؤشر الأداء المقترح]، ثم "تصنيف الأفكار حسب المنصة"، و"خطوات التحويل إلى خطة تنفيذ".
${OUTPUT_CONTRACT}`,
    user: [
      field("الموضوع", i.subject),
      field("الجهة", i.organization),
      `المنصات: ${i.platforms.map((p) => IDEA_PLATFORMS[p]).join("، ")}`,
      `الجمهور: ${IDEA_AUDIENCES[i.audience]}`,
      `الغرض الاتصالي: ${IDEA_PURPOSES[i.purpose]}`,
      `عدد الأفكار: ${i.count}`,
      field("ملاحظات", i.notes),
    ].join("\n"),
  }),
};

export function buildPrompt<T extends ToolId>(tool: T, input: ToolInputMap[T]) {
  return (builders[tool] as PromptBuilder<T>)(input);
}
