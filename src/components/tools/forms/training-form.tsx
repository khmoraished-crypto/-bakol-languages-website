"use client";

import { Minus, Plus } from "lucide-react";
import type { TrainingInput } from "@/lib/ai/types";
import { DELIVERY, LEVELS, SECTORS } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChoiceGroup, Field, FormSection } from "../field";
import { ToolWorkspace } from "../tool-workspace";

type Values = TrainingInput;

const INITIAL: Values = {
  organization: "",
  sector: "government",
  targetGroup: "",
  level: "intermediate",
  needs: "",
  days: 2,
  hoursPerDay: 4,
  delivery: "in-person",
};

const EXAMPLE: Partial<Values> = {
  organization: "إدارة الاتصال المؤسسي",
  sector: "government",
  targetGroup: "منسوبو إدارة الاتصال والعلاقات العامة",
  level: "intermediate",
  needs: "كتابة الأخبار والبيانات الصحفية\nإدارة حسابات التواصل الاجتماعي المؤسسية\nالتعامل مع وسائل الإعلام في الأزمات\nإنتاج المحتوى المرئي القصير",
  days: 3,
  hoursPerDay: 4,
  delivery: "hybrid",
};

function Stepper({
  id,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="إنقاص">
        <Minus />
      </Button>
      <div className="relative flex-1">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
          className="h-9 text-center"
        />
        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
      </div>
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="زيادة">
        <Plus />
      </Button>
    </div>
  );
}

export function TrainingForm() {
  return (
    <ToolWorkspace<Values>
      tool="training"
      initial={INITIAL}
      example={EXAMPLE}
      submitLabel="صمّم البرنامج التدريبي"
      emptyHint="أدخل بيانات الجهة والفئة المستهدفة ومستوى المتدربين واحتياجاتهم التدريبية، لتحصل على برنامج متكامل بالأهداف والمحاور والأنشطة والمخرجات القابلة للقياس."
      renderForm={({ values, set, errors }) => (
        <>
          <FormSection title="الجهة والمتدربون">
            <Field id="f-organization" label="اسم الجهة" required error={errors.organization}>
              <Input id="f-organization" value={values.organization} onChange={(e) => set("organization", e.target.value)} aria-invalid={!!errors.organization} placeholder="اسم الجهة المستفيدة" />
            </Field>
            <Field id="f-sector" label="القطاع">
              <ChoiceGroup name="sector" ariaLabel="القطاع" value={values.sector} onChange={(v) => set("sector", v)} options={SECTORS} />
            </Field>
            <Field id="f-targetGroup" label="الفئة المستهدفة" required error={errors.targetGroup}>
              <Input id="f-targetGroup" value={values.targetGroup} onChange={(e) => set("targetGroup", e.target.value)} aria-invalid={!!errors.targetGroup} placeholder="مثال: المتحدثون الرسميون" />
            </Field>
            <Field id="f-level" label="مستوى المتدربين">
              <ChoiceGroup name="level" ariaLabel="مستوى المتدربين" value={values.level} onChange={(v) => set("level", v)} options={LEVELS} />
            </Field>
          </FormSection>

          <Separator />

          <FormSection title="الاحتياجات والتنفيذ">
            <Field id="f-needs" label="الاحتياجات التدريبية" required error={errors.needs} hint="احتياج في كل سطر؛ يتحول كل احتياج إلى محور تدريبي (حتى ثمانية محاور).">
              <Textarea id="f-needs" value={values.needs} onChange={(e) => set("needs", e.target.value)} aria-invalid={!!errors.needs} className="min-h-[130px]" placeholder={"الاحتياج الأول\nالاحتياج الثاني"} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="f-days" label="عدد الأيام" error={errors.days}>
                <Stepper id="f-days" value={values.days} min={1} max={10} onChange={(n) => set("days", n)} suffix="يوم" />
              </Field>
              <Field id="f-hoursPerDay" label="الساعات يوميًا" error={errors.hoursPerDay}>
                <Stepper id="f-hoursPerDay" value={values.hoursPerDay} min={1} max={8} onChange={(n) => set("hoursPerDay", n)} suffix="ساعة" />
              </Field>
            </div>
            <Field id="f-delivery" label="أسلوب التنفيذ">
              <ChoiceGroup name="delivery" ariaLabel="أسلوب التنفيذ" value={values.delivery} onChange={(v) => set("delivery", v)} options={DELIVERY} />
            </Field>
          </FormSection>
        </>
      )}
    />
  );
}
