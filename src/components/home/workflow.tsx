"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lightbulb, Newspaper, PenLine, Clapperboard, UserCheck, ArrowLeft } from "lucide-react";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    icon: Lightbulb,
    title: "الفكرة والتخطيط",
    text: "حدد الموضوع والجمهور والغرض الاتصالي، واستكشف زوايا وأفكارًا مصنفة حسب المنصة.",
    tool: { label: "مختبر الأفكار", href: "/tools/ideas" },
  },
  {
    icon: Newspaper,
    title: "جمع المعلومات والصياغة الأولى",
    text: "أدخل عناصر الحدث الأساسية؛ تنبهك المنصة إلى النواقص قبل بناء المسودة.",
    tool: { label: "غرفة الأخبار", href: "/tools/newsroom" },
  },
  {
    icon: PenLine,
    title: "التحرير والتدقيق",
    text: "أعد الصياغة واختصر النص ودقّقه لغويًا، واختر عنوانًا من بدائل متنوعة.",
    tool: { label: "المحرر الصحفي", href: "/tools/editor" },
  },
  {
    icon: Clapperboard,
    title: "الإنتاج المرئي",
    text: "حوّل المحتوى إلى سيناريو بمشاهد وتوقيتات وزوايا تصوير وتعليق صوتي.",
    tool: { label: "استوديو الإنتاج", href: "/tools/studio" },
  },
  {
    icon: UserCheck,
    title: "المراجعة البشرية والنشر",
    text: "عدّل النتيجة مباشرة، ثم انسخها أو صدّرها. القرار التحريري النهائي يبقى للإنسان دائمًا.",
    tool: { label: "مسوداتي", href: "/drafts" },
  },
];

export function Workflow() {
  return (
    <section>
      <SectionHeading
        eyebrow="مسار العمل"
        title="مراحل صناعة المحتوى بالذكاء الاصطناعي"
        description="الذكاء الاصطناعي يسرّع كل مرحلة، لكنه لا يحل محل الحس التحريري. هكذا تتكامل أدوات المنصة في رحلة واحدة."
      />

      <div className="relative mt-14">
        {/* Connector line (desktop) */}
        <div className="absolute inset-x-[10%] top-7 hidden h-px bg-border lg:block" aria-hidden>
          <motion.div
            className="h-full origin-right bg-gradient-to-l from-teal-400 to-indigo-400"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border bg-white shadow-soft">
                <step.icon className="size-6 text-primary" />
                <span className="absolute -end-2 -top-2 flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {(i + 1).toLocaleString("ar")}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.text}</p>
              <Link
                href={step.tool.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                {step.tool.label}
                <ArrowLeft className="size-3.5" />
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
