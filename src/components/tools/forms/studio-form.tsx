"use client";

import type { StudioInput } from "@/lib/ai/types";
import { VIDEO_FORMATS, VIDEO_PLATFORMS, VIDEO_TONES } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChoiceGroup, Field, FormSection } from "../field";
import { ToolWorkspace } from "../tool-workspace";
import { cn } from "@/lib/utils";

type Values = Omit<StudioInput, "duration"> & { duration: number };

const INITIAL: Values = {
  topic: "",
  goal: "",
  format: "explainer",
  duration: 90,
  platform: "youtube",
  audience: "",
  keyPoints: "",
  tone: "calm",
};

const EXAMPLE: Partial<Values> = {
  topic: "كيف تتحقق من صحة الصور المتداولة على الإنترنت",
  goal: "تمكين المشاهد من كشف الصور المضللة قبل مشاركتها",
  format: "explainer",
  duration: 90,
  platform: "youtube",
  audience: "مستخدمو وسائل التواصل الاجتماعي",
  keyPoints:
    "البحث العكسي عن الصورة يكشف مصدرها الأول\nفحص بيانات الصورة الوصفية يوضح تاريخ التقاطها\nمقارنة تفاصيل المكان بخرائط الأقمار الصناعية\nالرجوع إلى منصات التحقق المعتمدة",
  tone: "calm",
};

const DURATIONS = [30, 60, 90, 180, 300];

const fmt = (s: number) => (s < 60 ? `${s} ث` : s % 60 === 0 ? `${s / 60} د` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} د`);

export function StudioForm() {
  return (
    <ToolWorkspace<Values>
      tool="studio"
      initial={INITIAL}
      example={EXAMPLE}
      submitLabel="أعدّ السيناريو"
      emptyHint="حدد موضوع الفيديو وقالبه ومنصته ومدته، وأضف النقاط الرئيسية لتحصل على سيناريو مقسّم إلى مشاهد مع زوايا التصوير والتعليق الصوتي."
      renderForm={({ values, set, errors }) => (
        <>
          <FormSection title="الموضوع">
            <Field id="f-topic" label="موضوع الفيديو" required error={errors.topic}>
              <Input id="f-topic" value={values.topic} onChange={(e) => set("topic", e.target.value)} aria-invalid={!!errors.topic} placeholder="عن ماذا يتحدث الفيديو؟" />
            </Field>
            <Field id="f-goal" label="الهدف من الفيديو">
              <Input id="f-goal" value={values.goal} onChange={(e) => set("goal", e.target.value)} placeholder="ما الذي تريد أن يعرفه المشاهد أو يفعله؟" />
            </Field>
            <Field id="f-keyPoints" label="النقاط الرئيسية" hint="نقطة في كل سطر؛ تُوزَّع على المشاهد بالترتيب." error={errors.keyPoints}>
              <Textarea id="f-keyPoints" value={values.keyPoints} onChange={(e) => set("keyPoints", e.target.value)} className="min-h-[120px]" placeholder={"النقطة الأولى\nالنقطة الثانية\nالنقطة الثالثة"} />
            </Field>
          </FormSection>

          <Separator />

          <FormSection title="الإنتاج">
            <Field id="f-format" label="القالب">
              <ChoiceGroup name="format" ariaLabel="القالب" value={values.format} onChange={(v) => set("format", v)} options={VIDEO_FORMATS} />
            </Field>
            <Field id="f-platform" label="منصة النشر">
              <ChoiceGroup name="platform" ariaLabel="منصة النشر" value={values.platform} onChange={(v) => set("platform", v)} options={VIDEO_PLATFORMS} />
            </Field>
            <Field id="f-duration" label="المدة (بالثواني)" required error={errors.duration} hint="من 15 ثانية إلى 30 دقيقة.">
              <div className="flex flex-wrap items-center gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("duration", d)}
                    aria-pressed={values.duration === d}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition",
                      values.duration === d ? "border-accent bg-accent-soft text-teal-800" : "border-input bg-white text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    {fmt(d)}
                  </button>
                ))}
                <Input
                  id="f-duration"
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={1800}
                  value={Number.isFinite(values.duration) ? values.duration : ""}
                  onChange={(e) => set("duration", e.target.value === "" ? Number.NaN : Number(e.target.value))}
                  aria-invalid={!!errors.duration}
                  className="h-9 w-24 text-center"
                  aria-label="مدة مخصصة بالثواني"
                />
              </div>
            </Field>
            <Field id="f-tone" label="النبرة">
              <ChoiceGroup name="tone" ariaLabel="النبرة" value={values.tone} onChange={(v) => set("tone", v)} options={VIDEO_TONES} columns={4} />
            </Field>
            <Field id="f-audience" label="الجمهور المستهدف">
              <Input id="f-audience" value={values.audience} onChange={(e) => set("audience", e.target.value)} placeholder="مثال: طلاب الجامعات" />
            </Field>
          </FormSection>
        </>
      )}
    />
  );
}
