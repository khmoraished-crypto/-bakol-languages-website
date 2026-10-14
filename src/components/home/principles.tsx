"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Eye, HardDrive, UserRoundCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const ITEMS = [
  {
    icon: UserRoundCheck,
    title: "الإنسان صاحب القرار",
    text: "كل مخرج مسودة قابلة للتعديل. المنصة تساعد المحرر ولا تنشر نيابة عنه.",
  },
  {
    icon: Eye,
    title: "شفافية كاملة",
    text: "نوضح لك دائمًا مصدر النتيجة: هل هي مولّدة بنموذج ذكاء اصطناعي، أم نتيجة تجريبية قائمة على القوالب.",
  },
  {
    icon: HardDrive,
    title: "مسوداتك في متصفحك",
    text: "تُحفظ المسودات محليًا على جهازك، ولا تُخزَّن في قواعد بيانات خارجية.",
  },
  {
    icon: ShieldCheck,
    title: "بنية آمنة للربط",
    text: "مفاتيح نماذج الذكاء الاصطناعي تبقى على الخادم فقط، ولا تصل إلى المتصفح أبدًا.",
  },
];

export function Principles() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-white p-6 shadow-soft sm:p-10 lg:p-14">
      <div className="pointer-events-none absolute inset-0 bg-grid-light [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <SectionHeading
          align="start"
          eyebrow="مبادئنا"
          title="ذكاء يخدم المهنة، لا يتجاوزها"
          description="بُنيت المنصة على مبادئ العمل الصحفي المسؤول: الدقة، والشفافية، وحماية الخصوصية."
          className="text-center lg:text-start"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-background/60 p-5 transition-colors hover:border-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-teal-700">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold text-primary">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
