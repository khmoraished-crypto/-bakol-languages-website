"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CornerDownLeft } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";
import type { ToolId } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

/** Illustrative walkthroughs (clearly labelled as examples, not live output). */
const SCENES: Record<ToolId, { input: Array<[string, string]>; steps: string[]; output: { title: string; lines: string[] } }> = {
  newsroom: {
    input: [
      ["ماذا", "افتتاح معرض للكتاب"],
      ["أين", "مركز المعارض"],
      ["الجمهور", "الجمهور العام"],
    ],
    steps: ["فحص العناصر الستة", "بناء الهرم المقلوب", "صياغة العنوان والمقدمة"],
    output: { title: "مسودة خبر", lines: ["العنوان الرئيسي", "المقدمة", "المتن", "تنبيه: المصدر غير محدد"] },
  },
  editor: {
    input: [
      ["المهمة", "تدقيق لغوي"],
      ["النص", "فقرة صحفية من 120 كلمة"],
    ],
    steps: ["رصد الأخطاء الإملائية", "ضبط علامات الترقيم", "ملاحظات أسلوبية"],
    output: { title: "نص مدقق", lines: ["النص بعد التدقيق", "قائمة التصويبات", "ملاحظات أسلوبية"] },
  },
  studio: {
    input: [
      ["القالب", "فيديو تفسيري"],
      ["المنصة", "يوتيوب"],
      ["المدة", "90 ثانية"],
    ],
    steps: ["تقسيم المشاهد", "اختيار زوايا التصوير", "كتابة التعليق الصوتي"],
    output: { title: "سيناريو", lines: ["بطاقة الإنتاج", "المشهد 1 – 00:00", "قائمة اللقطات", "نص التعليق الكامل"] },
  },
  training: {
    input: [
      ["الفئة", "منسوبو إدارة الاتصال"],
      ["المستوى", "متوسط"],
      ["المدة", "يومان"],
    ],
    steps: ["صياغة الأهداف السلوكية", "بناء المحاور", "تحديد مؤشرات القياس"],
    output: { title: "برنامج تدريبي", lines: ["الهدف العام", "الأهداف التفصيلية", "المحاور والأنشطة", "منهجية التقييم"] },
  },
  ideas: {
    input: [
      ["الموضوع", "ترشيد استهلاك المياه"],
      ["المنصات", "تيك توك، إنستغرام"],
      ["الغرض", "تغيير السلوك"],
    ],
    steps: ["مواءمة المنصة والجمهور", "ربط الأفكار بالغرض", "اقتراح مؤشرات الأداء"],
    output: { title: "بنك أفكار", lines: ["تحدٍّ تشاركي", "سلسلة صح أم خطأ", "تصنيف حسب المنصة"] },
  },
};

const ROTATE_MS = 5200;

export function CapabilityShowcase() {
  const [active, setActive] = useState<ToolId>("newsroom");
  const [paused, setPaused] = useState(false);
  const tool = TOOLS.find((t) => t.id === active)!;
  const scene = SCENES[active];

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      const idx = TOOLS.findIndex((x) => x.id === active);
      setActive(TOOLS[(idx + 1) % TOOLS.length].id);
    }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-teal-400/20 via-transparent to-indigo-500/20 blur-2xl" aria-hidden />
      <div className="glass relative overflow-hidden rounded-3xl shadow-2xl shadow-black/40">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
          </div>
          <span className="text-[11px] text-slate-400">مثال توضيحي لمسار العمل</span>
        </div>

        <div className="grid grid-cols-[auto_1fr]">
          {/* Tool rail */}
          <div role="tablist" aria-label="أدوات المنصة" aria-orientation="vertical" className="flex flex-col gap-1.5 border-e border-white/10 p-2.5 sm:p-3">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === active}
                aria-label={t.name}
                onClick={() => setActive(t.id)}
                className={cn(
                  "group relative flex size-10 items-center justify-center rounded-xl transition-all sm:size-11",
                  t.id === active ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
                )}
              >
                {t.id === active && (
                  <motion.span layoutId="rail-active" className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-90", t.gradient)} />
                )}
                <t.icon className="relative size-[18px]" />
              </button>
            ))}
          </div>

          {/* Stage */}
          <div className="min-h-[360px] p-4 sm:p-5" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-teal-300">{tool.tagline}</p>
                    <h3 className="mt-0.5 text-base font-semibold">{tool.name}</h3>
                  </div>
                  <Link
                    href={tool.href}
                    className="hidden shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/15 sm:inline-flex"
                  >
                    جرّبها
                    <ArrowLeft className="size-3.5" />
                  </Link>
                </div>

                {/* Input */}
                <div className="mt-4 space-y-2">
                  {scene.input.map(([k, v], i) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.12 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs"
                    >
                      <span className="text-slate-400">{k}</span>
                      <span className="truncate text-slate-100">{v}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Steps */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {scene.steps.map((s, i) => (
                    <motion.span
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.25 }}
                      className="inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2.5 py-1 text-[11px] text-teal-200"
                    >
                      <Check className="size-3" />
                      {s}
                    </motion.span>
                  ))}
                </div>

                {/* Output */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="mt-4 rounded-2xl bg-white p-4 text-navy-900 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{scene.output.title}</span>
                    <CornerDownLeft className="size-3.5 text-teal-600" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {scene.output.lines.map((l, i) => (
                      <div key={l} className="flex items-center gap-2">
                        <span className={cn("h-1.5 rounded-full", i === 0 ? "w-1.5 bg-teal-500" : "w-1.5 bg-slate-300")} />
                        <span className="text-[12px] text-slate-600">{l}</span>
                        <motion.span
                          className="h-1.5 flex-1 rounded-full bg-slate-100"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          style={{ transformOrigin: "right" }}
                          transition={{ delay: 1.5 + i * 0.12, duration: 0.5 }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress */}
        <div className="h-0.5 w-full bg-white/5">
          {!paused && (
            <motion.div
              key={active}
              className="h-full bg-teal-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
