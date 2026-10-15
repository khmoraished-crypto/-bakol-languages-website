"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Info, Sparkles } from "lucide-react";
import type { ToolId } from "@/lib/ai/types";
import { TOOLS, TOOLS_BY_ID } from "@/lib/tools-config";
import { useAiStatus } from "@/hooks/use-ai-status";
import { cn } from "@/lib/utils";

export function AiStatusPill() {
  const status = useAiStatus();
  if (!status) return <span className="inline-block h-7 w-40 animate-pulse rounded-full bg-muted" />;
  return status.aiEnabled ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-accent-soft px-3 py-1 text-xs font-medium text-teal-800">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
      </span>
      متصل بنموذج ذكاء اصطناعي
    </span>
  ) : (
    <Link
      href="/about#modes"
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-warning-soft px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
    >
      <Info className="size-3.5" />
      الوضع التجريبي: النتائج قائمة على القوالب
    </Link>
  );
}

export function ToolSwitcher({ active }: { active: ToolId }) {
  return (
    <nav aria-label="التنقل بين الأدوات" className="-mx-4 overflow-x-auto px-4 scrollbar-thin sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5 rounded-2xl border border-border bg-white p-1.5 shadow-soft">
        {TOOLS.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              aria-current={t.id === active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                t.id === active ? "text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.id === active && (
                <motion.span layoutId="tool-switch" className="absolute inset-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <t.icon className="relative size-4" />
              <span className="relative whitespace-nowrap">{t.shortName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ToolHeader({ tool }: { tool: ToolId }) {
  const meta = TOOLS_BY_ID[tool];
  return (
    <div className="space-y-6">
      <nav aria-label="مسار التنقل" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">الرئيسية</Link>
        <ChevronLeft className="size-3.5" />
        <Link href="/tools" className="hover:text-foreground">الأدوات</Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-foreground">{meta.name}</span>
      </nav>

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
          <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", meta.gradient)}>
            <meta.icon className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">{meta.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-7 text-muted-foreground">{meta.description}</p>
          </div>
        </motion.div>
        <div className="flex items-center gap-2">
          <Sparkles className="hidden size-4 text-teal-500 md:block" />
          <AiStatusPill />
        </div>
      </div>

      <ToolSwitcher active={tool} />
    </div>
  );
}

export function ToolPageShell({ tool, children }: { tool: ToolId; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6 lg:px-8">
      <ToolHeader tool={tool} />
      {children}
    </div>
  );
}
