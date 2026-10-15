"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import type { NewsroomInput } from "@/lib/ai/types";
import { NEWS_AUDIENCES, NEWS_TYPES } from "@/lib/labels";
import { checkNewsCompleteness } from "@/lib/newsroom-check";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChoiceGroup, Field, FormSection } from "../field";
import { ToolWorkspace } from "../tool-workspace";
import { cn } from "@/lib/utils";

type Values = NewsroomInput;

const INITIAL: Values = {
  what: "",
  who: "",
  when: "",
  where: "",
  why: "",
  how: "",
  source: "",
  quote: "",
  extra: "",
  newsType: "hard",
  audience: "general",
};

const EXAMPLE: Partial<Values> = {
  what: "أطلقت مكتبة المدينة العامة منصة رقمية لإعارة الكتب الإلكترونية",
  who: "مكتبة المدينة العامة",
  when: "صباح يوم الأحد",
  where: "مقر المكتبة الرئيس",
  why: "تيسير وصول القراء إلى مصادر المعرفة من أي مكان",
  how: "تتيح المنصة للمشتركين استعارة الكتب الإلكترونية عبر تطبيق للهواتف الذكية باستخدام بطاقة العضوية",
  source: "",
  quote: "",
  extra: "",
  newsType: "hard",
  audience: "general",
};

const ELEMENTS: Array<{ key: keyof Values; label: string }> = [
  { key: "what", label: "ماذا" },
  { key: "who", label: "مَن" },
  { key: "when", label: "متى" },
  { key: "where", label: "أين" },
  { key: "why", label: "لماذا" },
  { key: "how", label: "كيف" },
  { key: "source", label: "المصدر" },
];

function CompletenessMeter({ values }: { values: Values }) {
  const filled = ELEMENTS.filter((e) => String(values[e.key] ?? "").trim().length >= 2).length;
  const pct = Math.round((filled / ELEMENTS.length) * 100);
  const missing = checkNewsCompleteness(values);
  const required = missing.filter((m) => m.level === "required");

  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">اكتمال عناصر الخبر</p>
        <span className={cn("text-sm font-bold tabular-nums", pct === 100 ? "text-teal-600" : "text-muted-foreground")}>
          {filled.toLocaleString("ar")} / {ELEMENTS.length.toLocaleString("ar")}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", required.length ? "bg-amber-400" : "bg-teal-500")}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {ELEMENTS.map((e) => {
          const ok = String(values[e.key] ?? "").trim().length >= 2;
          return (
            <li
              key={e.key}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                ok ? "bg-accent-soft text-teal-800" : "bg-muted text-muted-foreground"
              )}
            >
              {ok ? <CheckCircle2 className="size-3" /> : <CircleDashed className="size-3" />}
              {e.label}
            </li>
          );
        })}
      </ul>
      {required.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-amber-800">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          معلومات أساسية ناقصة: {required.map((r) => r.label.split(" ")[0]).join("، ")}. ستُترك مواضعها في المسودة لتستكملها.
        </p>
      )}
    </div>
  );
}

export function NewsroomForm() {
  return (
    <ToolWorkspace<Values>
      tool="newsroom"
      initial={INITIAL}
      example={EXAMPLE}
      submitLabel="أنشئ مسودة الخبر"
      emptyHint="أدخل المعلومات الأساسية للحدث، وحدد نوع الخبر والجمهور المستهدف، ثم اضغط «أنشئ مسودة الخبر»."
      preflight={(v) => {
        const req = checkNewsCompleteness(v).filter((m) => m.level === "required");
        return req.length ? `تنبيه: ينقص الخبر ${req.length === 1 ? "عنصر أساسي" : `${req.length} عناصر أساسية`}. ستظهر مواضعها في المسودة.` : null;
      }}
      renderAside={(v) => <CompletenessMeter values={v} />}
      renderForm={({ values, set, errors }) => (
        <>
          <FormSection title="نوع الخبر والجمهور">
            <Field id="f-newsType" label="نوع الخبر">
              <ChoiceGroup name="newsType" ariaLabel="نوع الخبر" value={values.newsType} onChange={(v) => set("newsType", v)} options={NEWS_TYPES} />
            </Field>
            <Field id="f-audience" label="الجمهور المستهدف">
              <ChoiceGroup name="audience" ariaLabel="الجمهور المستهدف" value={values.audience} onChange={(v) => set("audience", v)} options={NEWS_AUDIENCES} columns={2} />
            </Field>
          </FormSection>

          <Separator />

          <FormSection title="عناصر الحدث">
            <Field id="f-what" label="ماذا حدث؟" required error={errors.what} hint="اكتب الحدث في جملة واحدة واضحة تبدأ بالفعل إن أمكن.">
              <Textarea
                id="f-what"
                value={values.what}
                onChange={(e) => set("what", e.target.value)}
                aria-invalid={!!errors.what}
                placeholder="مثال: افتتحت الجهة مركزًا جديدًا لخدمة المستفيدين"
                className="min-h-[80px]"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="f-who" label="مَن؟ (الجهة أو الأشخاص)">
                <Input id="f-who" value={values.who} onChange={(e) => set("who", e.target.value)} placeholder="اسم الجهة أو المسؤول" />
              </Field>
              <Field id="f-when" label="متى؟">
                <Input id="f-when" value={values.when} onChange={(e) => set("when", e.target.value)} placeholder="مثال: صباح اليوم الاثنين" />
              </Field>
              <Field id="f-where" label="أين؟">
                <Input id="f-where" value={values.where} onChange={(e) => set("where", e.target.value)} placeholder="المدينة أو المقر" />
              </Field>
              <Field id="f-source" label="مصدر المعلومة">
                <Input id="f-source" value={values.source} onChange={(e) => set("source", e.target.value)} placeholder="مثال: بيان صادر عن الجهة" />
              </Field>
            </div>
            <Field id="f-why" label="لماذا؟ (الهدف أو السبب)">
              <Input id="f-why" value={values.why} onChange={(e) => set("why", e.target.value)} placeholder="مثال: تسريع إنجاز المعاملات" />
            </Field>
            <Field id="f-how" label="كيف؟ (آلية الحدث أو تفاصيله)">
              <Textarea id="f-how" value={values.how} onChange={(e) => set("how", e.target.value)} className="min-h-[72px]" placeholder="التفاصيل الإجرائية أو طريقة التنفيذ" />
            </Field>
          </FormSection>

          <Separator />

          <FormSection title="عناصر داعمة (اختيارية)">
            <Field id="f-quote" label="تصريح أو اقتباس" hint="انقل التصريح كما ورد حرفيًا؛ لن تُختلق تصريحات غير موجودة.">
              <Textarea id="f-quote" value={values.quote} onChange={(e) => set("quote", e.target.value)} className="min-h-[72px]" placeholder="نص التصريح دون علامات تنصيص" />
            </Field>
            <Field id="f-extra" label="معلومات خلفية إضافية" counter={{ value: values.extra.length, max: 3000 }} error={errors.extra}>
              <Textarea id="f-extra" value={values.extra} onChange={(e) => set("extra", e.target.value)} className="min-h-[72px]" placeholder="سياق، أرقام موثقة، أحداث سابقة ذات صلة" />
            </Field>
          </FormSection>
        </>
      )}
    />
  );
}
