"use client";

import { Repeat2, Scissors, SpellCheck2, Heading } from "lucide-react";
import type { EditorInput } from "@/lib/ai/types";
import { EDITOR_ACTIONS, EDITOR_TONES, SHORTEN_LENGTHS } from "@/lib/labels";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceGroup, Field, FormSection } from "../field";
import { ToolWorkspace } from "../tool-workspace";
import { cn } from "@/lib/utils";

type Values = EditorInput;

const INITIAL: Values = { text: "", action: "rephrase", tone: "neutral", length: "half" };

const EXAMPLE: Partial<Values> = {
  action: "proofread",
  text:
    "تم إطلاق المبادرة الجديدة في الوقت الحالي من أجل تعزيز الوعي الاعلامي لدى الشباب , وذلك من خلال سلسلة من الورش التدريبية التي سوف تقام في العديد من المدن . و يعتبر هذا المشروع خطوة مهمة جدا في في مجال التثقيف الاعلامي ، حيث يهدف الى تمكين المشاركين من التحقق من الاخبار قبل نشرها .",
};

const ACTION_ICONS = { rephrase: Repeat2, shorten: Scissors, proofread: SpellCheck2, headlines: Heading } as const;

const ACTION_HINTS: Record<Values["action"], string> = {
  rephrase: "صياغة جديدة بالنبرة التي تختارها مع الحفاظ على المعنى.",
  shorten: "اختصار النص مع الإبقاء على المعلومات الجوهرية.",
  proofread: "تصويب الأخطاء الإملائية والترقيمية وملاحظات أسلوبية.",
  headlines: "خمسة عناوين صحفية بديلة بأساليب متنوعة.",
};

export function EditorForm() {
  return (
    <ToolWorkspace<Values>
      tool="editor"
      initial={INITIAL}
      example={EXAMPLE}
      submitLabel="نفّذ المهمة"
      emptyHint="الصق النص، واختر المهمة: إعادة صياغة، أو اختصار، أو تدقيق لغوي، أو اقتراح عناوين."
      renderForm={({ values, set, errors }) => (
        <>
          <FormSection title="المهمة">
            <div role="radiogroup" aria-label="المهمة" className="grid grid-cols-2 gap-2">
              {(Object.keys(EDITOR_ACTIONS) as Array<Values["action"]>).map((key) => {
                const Icon = ACTION_ICONS[key];
                const active = values.action === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("action", key)}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-start transition-all",
                      active
                        ? "border-accent bg-accent-soft shadow-[0_0_0_3px_rgb(20_184_166_/_0.12)]"
                        : "border-input bg-white hover:border-accent/40"
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-teal-700" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-semibold", active ? "text-teal-900" : "text-foreground")}>{EDITOR_ACTIONS[key]}</span>
                    <span className="text-[11.5px] leading-5 text-muted-foreground">{ACTION_HINTS[key]}</span>
                  </button>
                );
              })}
            </div>
          </FormSection>

          {values.action === "rephrase" && (
            <Field id="f-tone" label="النبرة">
              <ChoiceGroup name="tone" ariaLabel="النبرة" value={values.tone} onChange={(v) => set("tone", v)} options={EDITOR_TONES} columns={4} />
            </Field>
          )}
          {values.action === "shorten" && (
            <Field id="f-length" label="الطول المطلوب">
              <ChoiceGroup name="length" ariaLabel="الطول المطلوب" value={values.length} onChange={(v) => set("length", v)} options={SHORTEN_LENGTHS} />
            </Field>
          )}

          <Field
            id="f-text"
            label="النص"
            required
            error={errors.text}
            counter={{ value: values.text.length, max: 8000 }}
          >
            <Textarea
              id="f-text"
              value={values.text}
              onChange={(e) => set("text", e.target.value)}
              aria-invalid={!!errors.text}
              placeholder="الصق النص الصحفي هنا…"
              className="min-h-[260px] text-[15px] leading-8"
            />
          </Field>
        </>
      )}
    />
  );
}
