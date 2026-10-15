"use client";

import type { IdeasInput } from "@/lib/ai/types";
import { IDEA_AUDIENCES, IDEA_PLATFORMS, IDEA_PURPOSES } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChoiceGroup, Field, FormSection, MultiChoice } from "../field";
import { ToolWorkspace } from "../tool-workspace";
import { cn } from "@/lib/utils";

type Values = IdeasInput;

const INITIAL: Values = {
  subject: "",
  organization: "",
  platforms: ["instagram", "x"],
  audience: "general",
  purpose: "awareness",
  count: 6,
  notes: "",
};

const EXAMPLE: Partial<Values> = {
  subject: "ترشيد استهلاك المياه في المنازل",
  organization: "",
  platforms: ["tiktok", "instagram", "x"],
  audience: "families",
  purpose: "behavior",
  count: 6,
  notes: "نرغب في نبرة إيجابية بعيدة عن التخويف",
};

const COUNTS = [3, 6, 9, 12];

export function IdeasForm() {
  return (
    <ToolWorkspace<Values>
      tool="ideas"
      initial={INITIAL}
      example={EXAMPLE}
      submitLabel="ولّد الأفكار"
      emptyHint="حدد موضوع الحملة أو المحتوى، واختر المنصات والجمهور والغرض الاتصالي، لتحصل على أفكار مصنفة وجاهزة للتطوير."
      renderForm={({ values, set, errors }) => (
        <>
          <FormSection title="الموجز">
            <Field id="f-subject" label="موضوع الحملة أو المحتوى" required error={errors.subject}>
              <Input id="f-subject" value={values.subject} onChange={(e) => set("subject", e.target.value)} aria-invalid={!!errors.subject} placeholder="مثال: التوعية بالأمن السيبراني" />
            </Field>
            <Field id="f-organization" label="الجهة (اختياري)">
              <Input id="f-organization" value={values.organization} onChange={(e) => set("organization", e.target.value)} placeholder="الجهة صاحبة الحملة" />
            </Field>
          </FormSection>

          <Separator />

          <FormSection title="التصنيف">
            <Field id="f-platforms" label="المنصات الإعلامية" required error={errors.platforms}>
              <MultiChoice ariaLabel="المنصات الإعلامية" value={values.platforms} onChange={(v) => set("platforms", v)} options={IDEA_PLATFORMS} />
            </Field>
            <Field id="f-audience" label="الجمهور">
              <ChoiceGroup name="audience" ariaLabel="الجمهور" value={values.audience} onChange={(v) => set("audience", v)} options={IDEA_AUDIENCES} />
            </Field>
            <Field id="f-purpose" label="الغرض الاتصالي">
              <ChoiceGroup name="purpose" ariaLabel="الغرض الاتصالي" value={values.purpose} onChange={(v) => set("purpose", v)} options={IDEA_PURPOSES} />
            </Field>
            <Field id="f-count" label="عدد الأفكار">
              <div role="radiogroup" aria-label="عدد الأفكار" className="flex gap-2">
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={values.count === c}
                    onClick={() => set("count", c)}
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-sm font-semibold tabular-nums transition",
                      values.count === c ? "border-accent bg-accent-soft text-teal-800" : "border-input bg-white text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    {c.toLocaleString("ar")}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="f-notes" label="ملاحظات إضافية" counter={{ value: values.notes.length, max: 1500 }} error={errors.notes}>
              <Textarea id="f-notes" value={values.notes} onChange={(e) => set("notes", e.target.value)} className="min-h-[72px]" placeholder="قيود، نبرة مفضلة، أفكار سابقة تريد تجنبها…" />
            </Field>
          </FormSection>
        </>
      )}
    />
  );
}
