"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}
    >
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
        <span className="h-px w-6 bg-teal-500" />
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold leading-snug tracking-tight text-primary sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-8 text-muted-foreground">{description}</p>}
    </motion.div>
  );
}
