"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, Sparkles, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CapabilityShowcase } from "./capability-showcase";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Hero() {
  return (
    <section className="px-3 pt-2 sm:px-4">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-navy-950 text-white sm:rounded-[36px]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-40 start-[-10%] size-[520px] rounded-full bg-teal-500/25 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 end-[-5%] size-[560px] rounded-full bg-indigo-600/25 blur-[130px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-20 lg:pt-24">
          <div className="text-center lg:text-start">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-teal-100">
                <Sparkles className="size-3.5 text-teal-300" />
                منصة عربية متكاملة لأدوات الإعلام الذكي
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-6 text-4xl font-bold leading-[1.35] tracking-tight sm:text-5xl lg:text-[3.6rem]"
            >
              مستقبل <span className="text-gradient">الإعلام</span>
              <br />
              يبدأ من هنا
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0"
            >
              مختبر الإعلام الذكي مساحة عمل واحدة للصحفيين وصنّاع المحتوى ومدربي الإعلام: صِغ الخبر، وحرّر النص، وابنِ
              السيناريو، وصمّم البرنامج التدريبي، وولّد أفكار الحملات — ثم عدّل النتيجة وانسخها أو صدّرها بصيغة PDF.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                <Link href="/tools">
                  ابدأ التجربة
                  <ArrowLeft />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="w-full sm:w-auto">
                <a href="#tools">
                  <LayoutGrid />
                  استكشف الأدوات
                </a>
              </Button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start"
            >
              {["واجهة عربية بالكامل", "حفظ المسودات في متصفحك", "تصدير PDF"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-teal-400" />
                  {t}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <CapabilityShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
