import type { NewsroomInput } from "@/lib/ai/types";

export type CompletenessLevel = "required" | "recommended";

export interface MissingField {
  field: keyof NewsroomInput;
  label: string;
  level: CompletenessLevel;
  hint: string;
}

const CHECKS: Array<Omit<MissingField, "level"> & { level: (i: Partial<NewsroomInput>) => CompletenessLevel | null }> = [
  {
    field: "who",
    label: "مَن؟ (الجهة أو الأشخاص)",
    hint: "لا يكتمل الخبر دون تحديد الجهة الفاعلة.",
    level: () => "required",
  },
  {
    field: "when",
    label: "متى؟ (زمن الحدث)",
    hint: "زمن الحدث يحدد آنية الخبر وقيمته.",
    level: () => "required",
  },
  {
    field: "where",
    label: "أين؟ (مكان الحدث)",
    hint: "المكان يمنح الخبر سياقه الجغرافي.",
    level: () => "required",
  },
  {
    field: "source",
    label: "مصدر المعلومة",
    hint: "نسبة المعلومة إلى مصدر واضح شرط للمصداقية.",
    level: (i) => (i.newsType === "press" ? "recommended" : "required"),
  },
  {
    field: "why",
    label: "لماذا؟ (الهدف أو السبب)",
    hint: "يجيب عن سؤال القارئ: لماذا يهمني هذا؟",
    level: () => "recommended",
  },
  {
    field: "how",
    label: "كيف؟ (آلية الحدث)",
    hint: "التفاصيل الإجرائية تمنح المتن عمقًا.",
    level: () => "recommended",
  },
  {
    field: "quote",
    label: "تصريح أو اقتباس",
    hint: "التصريح المباشر يعزز حيوية الخبر، ويُعد أساسيًا في البيان والقصة الخبرية.",
    level: (i) => (i.newsType === "feature" || i.newsType === "press" ? "recommended" : null),
  },
];

/** Inspect the event data and list missing journalistic elements. */
export function checkNewsCompleteness(input: Partial<NewsroomInput>): MissingField[] {
  const missing: MissingField[] = [];
  for (const check of CHECKS) {
    const level = check.level(input);
    if (!level) continue;
    const value = input[check.field];
    if (typeof value !== "string" || value.trim().length < 2) {
      missing.push({ field: check.field, label: check.label, hint: check.hint, level });
    }
  }
  return missing;
}
