"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[32px] bg-navy-900 px-6 py-14 text-center text-white sm:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-teal-500/30 blur-[100px]" />
      <div className="relative">
        <h2 className="text-3xl font-bold leading-snug sm:text-4xl">جاهز لصناعة محتواك القادم؟</h2>
        <p className="mx-auto mt-4 max-w-xl leading-8 text-slate-300">
          اختر الأداة المناسبة لمهمتك، وأدخل بياناتك، واحصل على مسودة منظمة تعدّلها وتصدّرها في دقائق.
        </p>
        <Button asChild variant="accent" size="lg" className="mt-8">
          <Link href="/tools">
            ابدأ التجربة الآن
            <ArrowLeft />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}
