import type { EditorInput, ResultDocument, DocSection } from "@/lib/ai/types";
import { EDITOR_TONES, SHORTEN_LENGTHS } from "@/lib/labels";
import {
  contentWords,
  ensureEndPunct,
  normalizeSpaces,
  splitSentences,
  stem,
  stripEndPunct,
  topPhrase,
  truncateChars,
  truncateWords,
  wordCount,
  wordFrequencies,
} from "./text";

/* ───────────────────────── Rephrase ───────────────────────── */

type Rule = { from: RegExp; to: string; note: string };

const PASSIVE_TAMMA: Array<[string, string]> = [
  ["إطلاق", "أُطلق"],
  ["افتتاح", "افتُتح"],
  ["توقيع", "وُقّع"],
  ["تنظيم", "نُظّم"],
  ["الإعلان عن", "أُعلن عن"],
  ["اعتماد", "اعتُمد"],
  ["تنفيذ", "نُفّذ"],
  ["تطوير", "طُوّر"],
  ["إنشاء", "أُنشئ"],
  ["تقديم", "قُدّم"],
  ["عقد", "عُقد"],
  ["تدشين", "دُشّن"],
  ["تكريم", "كُرّم"],
  ["إقرار", "أُقرّ"],
  ["تعيين", "عُيّن"],
  ["استعراض", "استُعرض"],
];

/** «تم إطلاق المبادرة» → «أُطلقت المبادرة»: add feminine ت when the next noun is feminine. */
function passiveReplace(text: string, notes: Set<string>) {
  let out = text;
  for (const [masdar, verb] of PASSIVE_TAMMA) {
    const re = new RegExp(`(^|[\\s،.])تم(?:ت)?\\s+${masdar}(\\s+(\\p{L}+))?`, "gu");
    out = out.replace(re, (_m, pre: string, rest: string | undefined, next: string | undefined) => {
      notes.add(`استبدال «تم ${masdar}» بالفعل المبني للمجهول «${verb}» لتقوية الجملة`);
      const isPrep = masdar.endsWith(" عن");
      const feminine = !isPrep && !!next && /(ة|ات)$/u.test(next);
      return `${pre}${verb}${feminine ? "ت" : ""}${rest ?? ""}`;
    });
  }
  return out;
}

const COMMON_RULES: Rule[] = [
  { from: /سوف\s+(?=[يتنأ])/gu, to: "س", note: "اختصار «سوف» إلى السين للدلالة على المستقبل القريب" },
  { from: /بالإضافة إلى ذلك/gu, to: "فضلًا عن ذلك", note: "تنويع أدوات الربط" },
  { from: /بالإضافة إلى/gu, to: "إلى جانب", note: "تنويع أدوات الربط" },
  { from: /في الوقت الحالي/gu, to: "حاليًا", note: "اختصار العبارة" },
  { from: /في الوقت الراهن/gu, to: "حاليًا", note: "اختصار العبارة" },
  { from: /على سبيل المثال/gu, to: "مثلًا", note: "اختصار العبارة" },
  { from: /وذلك من أجل/gu, to: "بهدف", note: "حذف الحشو" },
  { from: /من أجل أن/gu, to: "كي", note: "اختصار العبارة" },
  { from: /العديد من/gu, to: "كثير من", note: "صياغة أدق" },
  { from: /(?<=\s|^)يعتبر(?=\s)/gu, to: "يُعدّ", note: "«يُعدّ» أدق من «يعتبر» في سياق التصنيف" },
  { from: /(?<=\s|^)تعتبر(?=\s)/gu, to: "تُعدّ", note: "«تُعدّ» أدق من «تعتبر» في سياق التصنيف" },
  { from: /في نهاية المطاف/gu, to: "في المحصلة", note: "تنويع الأسلوب" },
  { from: /بشكل واضح/gu, to: "بوضوح", note: "اختصار الصياغة" },
  { from: /بشكل كبير/gu, to: "إلى حد بعيد", note: "صياغة أكثر رصانة" },
  { from: /بشكل مستمر/gu, to: "باستمرار", note: "اختصار الصياغة" },
  { from: /بشكل سريع/gu, to: "بسرعة", note: "اختصار الصياغة" },
  { from: /بشكل عام/gu, to: "عمومًا", note: "اختصار الصياغة" },
  { from: /من جهة أخرى/gu, to: "في المقابل", note: "تنويع أدوات الربط" },
  { from: /كما تجدر الإشارة إلى أن/gu, to: "ويُذكر أن", note: "حذف الحشو" },
  { from: /تجدر الإشارة إلى أن/gu, to: "يُذكر أن", note: "حذف الحشو" },
  { from: /مما لا شك فيه أن/gu, to: "لا شك أن", note: "حذف الحشو" },
];

const FORMAL_RULES: Rule[] = [
  { from: /(?<=\s|^)لكن(?=\s)/gu, to: "غير أن", note: "صياغة رسمية لأداة الاستدراك" },
  { from: /(?<=\s|^)كمان(?=\s)/gu, to: "أيضًا", note: "استبدال العامية بالفصحى" },
  { from: /(?<=\s|^)مهم جدًا|مهم جدا/gu, to: "بالغ الأهمية", note: "صياغة رسمية" },
];

const SIMPLE_RULES: Rule[] = [
  { from: /غير أن/gu, to: "لكن", note: "تبسيط أداة الاستدراك" },
  { from: /بالغ الأهمية/gu, to: "مهم جدًا", note: "تبسيط التعبير" },
  { from: /إلى حد بعيد/gu, to: "كثيرًا", note: "تبسيط التعبير" },
];

function applyRules(text: string, rules: Rule[], notes: Set<string>) {
  let out = text;
  for (const r of rules) {
    const next = out.replace(r.from, r.to);
    if (next !== out) notes.add(r.note);
    out = next;
  }
  return out;
}

/** Split very long sentences at the first "، و" after the midpoint. */
function splitLongSentences(text: string, notes: Set<string>, maxWords = 28) {
  return text
    .split(/\n/)
    .map((para) =>
      splitSentences(para)
        .map((s) => {
          if (wordCount(s) <= maxWords) return s;
          const mid = Math.floor(s.length / 2);
          const idx = s.indexOf("، و", mid);
          if (idx === -1) return s;
          notes.add("تقسيم الجمل الطويلة إلى جمل أقصر لتسهيل القراءة");
          const first = ensureEndPunct(s.slice(0, idx));
          const second = s.slice(idx + 3);
          return `${first} و${second}`;
        })
        .join(" ")
    )
    .join("\n");
}

function rephrase(input: EditorInput): DocSection[] {
  const notes = new Set<string>();
  let text = normalizeSpaces(input.text);
  text = passiveReplace(text, notes);
  text = applyRules(text, COMMON_RULES, notes);
  if (input.tone === "formal") text = applyRules(text, FORMAL_RULES, notes);
  if (input.tone === "simple") {
    text = applyRules(text, SIMPLE_RULES, notes);
    text = splitLongSentences(text, notes, 20);
  } else {
    text = splitLongSentences(text, notes);
  }
  text = text.replace(/ {2,}/g, " ");

  const sections: DocSection[] = [{ heading: "النص بعد إعادة الصياغة", body: text }];
  sections.push({
    heading: "التعديلات المطبقة",
    items: notes.size
      ? [...notes]
      : ["لم تُرصد في النص أنماط تستدعي التعديل وفق قواعد الوضع التجريبي. جرّب نصًا أطول أو فعّل الربط بنموذج ذكاء اصطناعي لإعادة صياغة شاملة."],
  });
  if (input.tone === "engaging") {
    sections.push({
      heading: "اقتراحات لنبرة أكثر جاذبية",
      items: [
        "افتتح النص بسؤال أو مشهد أو معلومة لافتة بدلًا من التمهيد العام.",
        "استخدم الأفعال المضارعة والجمل الفعلية لإضفاء الحيوية.",
        "اختم بدعوة واضحة لما يمكن للقارئ فعله.",
      ],
    });
  }
  return sections;
}

/* ───────────────────────── Shorten ───────────────────────── */

function rankSentences(text: string) {
  const sentences = splitSentences(text);
  const freq = wordFrequencies(text);
  return sentences.map((s, i) => {
    const ws = contentWords(s);
    const score = ws.reduce((acc, w) => acc + (freq.get(stem(w)) ?? 0), 0) / Math.max(ws.length, 1);
    const positionBoost = i === 0 ? 1.6 : i === 1 ? 1.15 : 1;
    return { s, i, score: score * positionBoost, len: s.length };
  });
}

function shorten(input: EditorInput): DocSection[] {
  const original = normalizeSpaces(input.text);
  const ranked = rankSentences(original);
  let result: string;

  if (input.length === "tweet") {
    const best = [...ranked].sort((a, b) => b.score - a.score);
    const chosen: typeof ranked = [];
    let total = 0;
    for (const r of best) {
      if (total + r.len + 1 <= 280) {
        chosen.push(r);
        total += r.len + 1;
      }
    }
    result = chosen.length
      ? chosen.sort((a, b) => a.i - b.i).map((r) => r.s).join(" ")
      : truncateChars(ranked[0]?.s ?? original, 280);
  } else {
    const ratio = input.length === "half" ? 0.5 : 0.34;
    const target = Math.max(original.length * ratio, 60);
    const best = [...ranked].sort((a, b) => b.score - a.score);
    const chosen: typeof ranked = [];
    let total = 0;
    for (const r of best) {
      if (total >= target) break;
      chosen.push(r);
      total += r.len;
    }
    result = chosen.sort((a, b) => a.i - b.i).map((r) => ensureEndPunct(r.s)).join(" ");
  }

  const before = wordCount(original);
  const after = wordCount(result);
  return [
    { heading: "النص المختصر", body: result },
    {
      heading: "تفاصيل الاختصار",
      items: [
        `الطول المستهدف: ${SHORTEN_LENGTHS[input.length]}`,
        `عدد الكلمات قبل الاختصار: ${before} — بعده: ${after}`,
        `عدد الأحرف بعد الاختصار: ${result.length}`,
        "منهجية الوضع التجريبي: اختصار استخلاصي يحتفظ بالجمل الأعلى صلة بالموضوع وفق تكرار الكلمات المفتاحية وموقع الجملة، دون توليد صياغات جديدة.",
      ],
    },
  ];
}

/* ───────────────────────── Proofread ───────────────────────── */

type Fix = { from: RegExp; to: string; reason: string };

const SPELLING: Array<[string, string]> = [
  ["إنشاء الله", "إن شاء الله"],
  ["انشاء الله", "إن شاء الله"],
  ["لاكن", "لكن"],
  ["هاذا", "هذا"],
  ["هاذه", "هذه"],
  ["ذالك", "ذلك"],
  ["مسؤل", "مسؤول"],
  ["مسئول", "مسؤول"],
  ["شئ", "شيء"],
  ["الى", "إلى"],
  ["حتي", "حتى"],
  ["متي", "متى"],
  ["اذا", "إذا"],
  ["او", "أو"],
  ["لان", "لأن"],
  ["امام", "أمام"],
  ["اكثر", "أكثر"],
  ["اقل", "أقل"],
  ["اول", "أول"],
  ["الاول", "الأول"],
  ["الاولى", "الأولى"],
  ["اخرى", "أخرى"],
  ["الاخرى", "الأخرى"],
  ["اهمية", "أهمية"],
  ["اعلن", "أعلن"],
  ["اعلنت", "أعلنت"],
  ["اكد", "أكد"],
  ["اكدت", "أكدت"],
  ["ايضا", "أيضًا"],
  ["أيضا", "أيضًا"],
  ["جدا", "جدًا"],
  ["دائما", "دائمًا"],
  ["احيانا", "أحيانًا"],
  ["أحيانا", "أحيانًا"],
  ["سابقا", "سابقًا"],
  ["لاحقا", "لاحقًا"],
  ["حاليا", "حاليًا"],
];

const HAMZAT_WASL = ["إست", "إجت", "إقت", "إبت", "إخت", "إعت", "إلت", "إحت", "إنط", "إنتخ", "إنتش", "إنتق", "إنته", "إنتظ", "إرت"];

const HAMZAT_QAT: Array<[string, string]> = [
  ["الاعلام", "الإعلام"],
  ["اعلام", "إعلام"],
  ["الاخبار", "الأخبار"],
  ["اخبار", "أخبار"],
  ["الاعلان", "الإعلان"],
  ["الانسان", "الإنسان"],
  ["الاجراءات", "الإجراءات"],
  ["الادارة", "الإدارة"],
  ["ادارة", "إدارة"],
  ["الانتاج", "الإنتاج"],
  ["انتاج", "إنتاج"],
  ["الاطلاق", "الإطلاق"],
  ["اطلاق", "إطلاق"],
  ["الامن", "الأمن"],
  ["الاسرة", "الأسرة"],
  ["الاطفال", "الأطفال"],
  ["الانترنت", "الإنترنت"],
];

const PROOF_FIXES: Fix[] = [
  ...HAMZAT_QAT.map(([wrong, right]) => ({
    from: new RegExp(`(?<=^|[\\s«(]|[وبفل])${wrong}(?=(ي|ية|يين|يون|يات|ات)?(?:$|[\\s.،؛:!؟»)]))`, "gu"),
    to: right,
    reason: `«${wrong}» ← «${right}»: همزة قطع`,
  })),
  { from: /(?<=^|\s)و\s+(?=\p{L})/gu, to: "و", reason: "حذف المسافة بعد واو العطف" },
  ...SPELLING.map(([wrong, right]) => ({
    from: new RegExp(`(?<=^|[\\s«(])${wrong}(?=$|[\\s.،؛:!؟»)])`, "gu"),
    to: right,
    reason: `«${wrong}» ← «${right}»: تصويب إملائي`,
  })),
  ...HAMZAT_WASL.map((prefix) => ({
    from: new RegExp(`(?<=^|[\\s«(]|[وبفل])${prefix}(?=\\p{L}{2,})`, "gu"),
    to: `ا${prefix.slice(1)}`,
    reason: `مصادر الأفعال الخماسية والسداسية تبدأ بهمزة وصل: «${prefix}…» ← «ا${prefix.slice(1)}…»`,
  })),
  { from: /(?<=\p{Script=Arabic}\s?),/gu, to: "،", reason: "استخدام الفاصلة العربية «،» بدل اللاتينية" },
  { from: /(?<=\p{Script=Arabic}\s?)\?/gu, to: "؟", reason: "استخدام علامة الاستفهام العربية «؟»" },
  { from: /(?<=\p{Script=Arabic}\s?);/gu, to: "؛", reason: "استخدام الفاصلة المنقوطة العربية «؛»" },
  { from: /\s+([،.؛:!؟])/gu, to: "$1", reason: "حذف المسافة قبل علامة الترقيم" },
  { from: /([،؛:!؟])(?=[\p{Script=Arabic}])/gu, to: "$1 ", reason: "إضافة مسافة بعد علامة الترقيم" },
  { from: /\.(?=[\p{Script=Arabic}])/gu, to: ". ", reason: "إضافة مسافة بعد النقطة" },
  { from: /(?<=^|\s)(\p{L}+)(\s+\1)+(?=[\s.،؛:!؟]|$)/gu, to: "$1", reason: "حذف كلمة مكررة" },
  { from: /([!؟]){2,}/gu, to: "$1", reason: "تجنب تكرار علامات التعجب والاستفهام في النص الصحفي" },
  { from: / {2,}/g, to: " ", reason: "حذف المسافات المزدوجة" },
];

function proofread(input: EditorInput): DocSection[] {
  let text = input.text.replace(/\r/g, "");
  const found = new Map<string, number>();
  for (const fix of PROOF_FIXES) {
    const matches = text.match(fix.from);
    if (matches?.length) {
      found.set(fix.reason, (found.get(fix.reason) ?? 0) + matches.length);
      text = text.replace(fix.from, fix.to);
    }
  }
  text = text.trim();

  const style: string[] = [];
  const longOnes = splitSentences(text).filter((s) => wordCount(s) > 35);
  if (longOnes.length) {
    style.push(
      `توجد ${longOnes.length === 1 ? "جملة طويلة" : `${longOnes.length} جمل طويلة`} تتجاوز 35 كلمة، يُستحسن تقسيمها. تبدأ الأولى بـ: «${truncateWords(longOnes[0], 8)}»`
    );
  }
  if (/تم\s+\p{L}+/u.test(text)) style.push("يكثر في النص استخدام «تم + مصدر»؛ يُفضَّل استخدام الفعل المبني للمجهول مباشرة (أداة إعادة الصياغة تعالج ذلك).");
  if (/(?<=\s|^)(قام|قامت)\s+ب/u.test(text)) style.push("عبارة «قام بـ» غالبًا زائدة؛ استخدم الفعل الدال على الحدث مباشرة.");
  if (!/[.!؟]$/u.test(text)) style.push("النص لا ينتهي بعلامة ترقيم ختامية.");

  return [
    { heading: "النص بعد التدقيق", body: text },
    {
      heading: "التصويبات",
      items: found.size
        ? [...found.entries()].map(([reason, n]) => (n > 1 ? `${reason} (${n} مواضع)` : reason))
        : ["لم تُرصد أخطاء ضمن القواعد التي يغطيها التدقيق في الوضع التجريبي."],
    },
    ...(style.length ? [{ heading: "ملاحظات أسلوبية", items: style }] : []),
    {
      heading: "حدود التدقيق الآلي",
      body: "يعتمد الوضع التجريبي على قواعد إملائية وترقيمية محددة، ولا يغطي الأخطاء النحوية والدلالية المعقدة. تبقى مراجعة المدقق اللغوي ضرورية قبل النشر.",
    },
  ];
}

/* ───────────────────────── Headlines ───────────────────────── */

function headlines(input: EditorInput): DocSection[] {
  const text = normalizeSpaces(input.text);
  const sentences = splitSentences(text);
  const first = stripEndPunct(sentences[0] ?? text);
  const leadClause = passiveReplace(stripEndPunct(first.split("،")[0]), new Set()).replace(/^و(?=\p{L}{3,})/u, "");
  const topic = topPhrase(text) ?? truncateWords(leadClause, 3).replace("…", "");
  const quote = text.match(/[«"“]([^»"”]{8,120})[»"”]/u)?.[1];
  const numberSentence = sentences.find((x) => /[\d٠-٩]/u.test(x));
  const number = text.match(/(?<!\p{L})([\d٠-٩][\d٠-٩,.]*\s*(?:%|٪|مليون|مليار|ألف)?)/u)?.[1];

  const list: Array<[string, string]> = [
    ["عنوان إخباري مباشر", truncateWords(leadClause, 11)],
    ["عنوان بصيغة السؤال", `ما الذي يعنيه ${topic} للجمهور؟`],
    ["عنوان تفسيري", `${topic}: ما الذي نعرفه حتى الآن؟`],
    quote
      ? ["عنوان مقتبس", `«${truncateWords(stripEndPunct(quote), 10)}»`]
      : ["عنوان بصيغة النقطتين", `${topic}.. التفاصيل الكاملة`],
    number && numberSentence
      ? ["عنوان يبرز الرقم", truncateWords(stripEndPunct(numberSentence.split("،")[0]).replace(/^و(?=\p{L}{3,})/u, ""), 11)]
      : ["عنوان للمنصات الرقمية", `${topic} في سطور`],
  ];

  return [
    { heading: "العناوين المقترحة", items: list.map(([style, h]) => `${h} — (${style})`) },
    {
      heading: "معايير المفاضلة بين العناوين",
      items: [
        "الدقة: أن يعكس العنوان مضمون النص دون مبالغة.",
        "الإيجاز: يُفضّل ألا يتجاوز العنوان الرئيسي 10–12 كلمة.",
        "الفعل في البداية: الجملة الفعلية تمنح العنوان حيوية في الأخبار المباشرة.",
        "ملاءمة المنصة: العناوين التفسيرية والسؤالية أنسب للمنصات الرقمية.",
      ],
    },
  ];
}

/* ───────────────────────── Entry ───────────────────────── */

const ACTION_TITLES: Record<EditorInput["action"], string> = {
  rephrase: "إعادة الصياغة",
  shorten: "اختصار النص",
  proofread: "التدقيق اللغوي",
  headlines: "خمسة عناوين صحفية بديلة",
};

export function demoEditor(input: EditorInput): { document: ResultDocument; warnings: string[] } {
  const builders = { rephrase, shorten, proofread, headlines } as const;
  const sections = builders[input.action](input);
  const warnings: string[] = [];
  if (input.action === "shorten" && splitSentences(input.text).length < 3) {
    warnings.push("النص قصير ويتكون من جمل قليلة؛ قد لا يختلف الاختصار كثيرًا عن الأصل.");
  }
  return {
    document: {
      title: ACTION_TITLES[input.action],
      subtitle:
        input.action === "rephrase"
          ? `النبرة: ${EDITOR_TONES[input.tone]}`
          : input.action === "shorten"
            ? SHORTEN_LENGTHS[input.length]
            : undefined,
      sections,
    },
    warnings,
  };
}
