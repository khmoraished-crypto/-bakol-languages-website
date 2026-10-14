"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export function ToolsGrid({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section id="tools" className="scroll-mt-20">
      {withHeading && (
        <SectionHeading
          eyebrow="الأدوات"
          title="خمس أدوات، مساحة عمل واحدة"
          description="كل أداة مصممة لمهمة إعلامية محددة، بمدخلات واضحة ومخرجات منظمة قابلة للتعديل والنسخ والتصدير."
        />
      )}
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-6", withHeading && "mt-12")}>
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={cn(i < 2 ? "lg:col-span-3" : "lg:col-span-2", i === 4 && "sm:col-span-2 lg:col-span-2")}
          >
            <Link
              href={tool.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift sm:p-7"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-gradient-to-br opacity-[0.08] blur-2xl transition-opacity duration-500 group-hover:opacity-20",
                  tool.gradient
                )}
              />
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]",
                    tool.gradient
                  )}
                >
                  <tool.icon className="size-[22px]" />
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-primary">{tool.name}</h3>
              <p className="mt-1 text-sm font-medium text-teal-700">{tool.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{tool.description}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {tool.capabilities.map((c) => (
                  <span key={c} className="rounded-full bg-muted px-2.5 py-1 text-xs text-secondary-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
