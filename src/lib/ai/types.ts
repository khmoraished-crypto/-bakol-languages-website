import { z } from "zod";

/* Arabic default messages for validation errors not given a custom message. */
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: issue.received === "undefined" ? "هذا الحقل مطلوب" : "قيمة غير صالحة" };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "اختر قيمة من القائمة" };
    case z.ZodIssueCode.too_small:
      return { message: issue.type === "array" ? "اختر عنصرًا واحدًا على الأقل" : "القيمة أقل من الحد المطلوب" };
    case z.ZodIssueCode.too_big:
      return { message: issue.type === "string" ? "النص أطول من الحد المسموح" : "القيمة أكبر من الحد المسموح" };
    default:
      return { message: ctx.defaultError };
  }
});

/* ─────────── Output document (shared by every tool) ─────────── */

export const docSectionSchema = z.object({
  heading: z.string().max(300),
  body: z.string().max(12000).optional(),
  items: z.array(z.string().max(2000)).max(60).optional(),
});

export const resultDocumentSchema = z.object({
  title: z.string().max(400),
  subtitle: z.string().max(600).optional(),
  sections: z.array(docSectionSchema).min(1).max(40),
});

export type DocSection = z.infer<typeof docSectionSchema>;
export type ResultDocument = z.infer<typeof resultDocumentSchema>;

export type GenerationMode = "ai" | "demo";

/* ─────────── Tool identifiers ─────────── */

export const TOOL_IDS = ["newsroom", "editor", "studio", "training", "ideas"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

const short = (max = 300) => z.string().trim().max(max);
const long = (max = 6000) => z.string().trim().max(max);

/* ─────────── Per-tool inputs ─────────── */

export const newsroomInputSchema = z.object({
  what: short(400).min(3, "صف الحدث بإيجاز"),
  who: short().default(""),
  when: short(120).default(""),
  where: short(200).default(""),
  why: short(600).default(""),
  how: short(600).default(""),
  source: short(200).default(""),
  quote: long(1000).default(""),
  extra: long(3000).default(""),
  newsType: z.enum(["hard", "feature", "press", "breaking", "event"]),
  audience: z.enum(["general", "specialists", "youth", "officials", "internal"]),
});

export const editorInputSchema = z.object({
  text: long(8000).min(20, "أدخل نصًا لا يقل عن 20 حرفًا"),
  action: z.enum(["rephrase", "shorten", "proofread", "headlines"]),
  tone: z.enum(["neutral", "formal", "simple", "engaging"]).default("neutral"),
  length: z.enum(["half", "third", "tweet"]).default("half"),
});

export const studioInputSchema = z.object({
  topic: short(300).min(3, "حدد موضوع الفيديو"),
  goal: short(400).default(""),
  format: z.enum(["report", "explainer", "promo", "documentary", "reel"]),
  duration: z.coerce.number().int().min(15, "المدة لا تقل عن 15 ثانية").max(1800, "المدة لا تتجاوز 30 دقيقة"),
  platform: z.enum(["youtube", "instagram", "tiktok", "x", "tv", "website"]),
  audience: short(200).default(""),
  keyPoints: long(3000).default(""),
  tone: z.enum(["calm", "energetic", "formal", "inspiring"]).default("calm"),
});

export const trainingInputSchema = z.object({
  organization: short(200).min(2, "أدخل اسم الجهة"),
  sector: z.enum(["government", "media", "education", "health", "private", "nonprofit"]),
  targetGroup: short(300).min(2, "حدد الفئة المستهدفة"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  needs: long(3000).min(5, "اذكر احتياجًا تدريبيًا واحدًا على الأقل"),
  days: z.coerce.number().int().min(1, "يوم واحد على الأقل").max(10, "عشرة أيام كحد أقصى"),
  hoursPerDay: z.coerce.number().int().min(1, "ساعة واحدة على الأقل").max(8, "ثماني ساعات كحد أقصى"),
  delivery: z.enum(["in-person", "online", "hybrid"]),
});

export const ideasInputSchema = z.object({
  subject: short(300).min(3, "حدد موضوع الحملة أو المحتوى"),
  organization: short(200).default(""),
  platforms: z
    .array(z.enum(["x", "instagram", "tiktok", "youtube", "linkedin", "snapchat", "website", "tv"]))
    .min(1, "اختر منصة واحدة على الأقل"),
  audience: z.enum(["general", "youth", "professionals", "families", "decision-makers", "students"]),
  purpose: z.enum(["awareness", "engagement", "behavior", "promotion", "crisis", "education"]),
  count: z.coerce.number().int().min(3).max(12).default(6),
  notes: long(1500).default(""),
});

export type NewsroomInput = z.infer<typeof newsroomInputSchema>;
export type EditorInput = z.infer<typeof editorInputSchema>;
export type StudioInput = z.infer<typeof studioInputSchema>;
export type TrainingInput = z.infer<typeof trainingInputSchema>;
export type IdeasInput = z.infer<typeof ideasInputSchema>;

export const toolInputSchemas = {
  newsroom: newsroomInputSchema,
  editor: editorInputSchema,
  studio: studioInputSchema,
  training: trainingInputSchema,
  ideas: ideasInputSchema,
} as const;

export type ToolInputMap = {
  newsroom: NewsroomInput;
  editor: EditorInput;
  studio: StudioInput;
  training: TrainingInput;
  ideas: IdeasInput;
};

export const generateRequestSchema = z.object({
  tool: z.enum(TOOL_IDS),
  input: z.record(z.unknown()),
});

export interface GenerateResponse {
  mode: GenerationMode;
  document: ResultDocument;
  /** Shown to the user under the result (e.g. demo disclaimer). */
  notice?: string;
  warnings?: string[];
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

/** Turn a zod error into a { field: message } map for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
