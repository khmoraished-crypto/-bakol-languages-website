"use client";

import { motion } from "framer-motion";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DocSection, ResultDocument } from "@/lib/ai/types";
import { copyText } from "@/lib/clipboard";
import { sectionToText } from "@/lib/document";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/** Highlights "[يُستكمل: ...]" placeholders so missing info stands out. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[يُستكمل:[^\]]*\]|\[أضف[^\]]*\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[(يُستكمل|أضف)/.test(p) ? (
          <mark key={i} className="rounded-md bg-amber-100 px-1 py-0.5 text-amber-800">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function DocumentView({ doc }: { doc: ResultDocument }) {
  const copySection = async (s: DocSection) => {
    const ok = await copyText(sectionToText(s));
    if (ok) toast.success(`نُسخ قسم «${s.heading}»`);
    else toast.error("تعذّر النسخ. انسخ النص يدويًا.");
  };

  return (
    <article className="space-y-1">
      <header className="pb-4">
        <h2 className="text-xl font-bold leading-relaxed text-primary sm:text-2xl">
          <RichText text={doc.title} />
        </h2>
        {doc.subtitle && <p className="mt-1 text-sm text-muted-foreground">{doc.subtitle}</p>}
      </header>
      {doc.sections.map((s, i) => (
        <motion.section
          key={`${i}-${s.heading}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.6), duration: 0.35 }}
          className="group relative rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-background/60"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-primary">
              <span className="h-4 w-1 rounded-full bg-accent" />
              {s.heading}
            </h3>
            <button
              type="button"
              onClick={() => copySection(s)}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`نسخ قسم ${s.heading}`}
            >
              <Copy className="size-4" />
            </button>
          </div>
          {s.body && (
            <div className="mt-2.5 space-y-3 text-[15px] leading-8 text-foreground/90">
              {s.body
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((p, j) => (
                  <p key={j} className="whitespace-pre-line">
                    <RichText text={p} />
                  </p>
                ))}
            </div>
          )}
          {s.items && s.items.length > 0 && (
            <ul className="mt-2.5 space-y-2">
              {s.items.map((item, j) => (
                <li key={j} className="flex gap-2.5 text-sm leading-7 text-foreground/85">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>
                    <RichText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      ))}
    </article>
  );
}

export function DocumentEditor({ doc, onChange }: { doc: ResultDocument; onChange: (d: ResultDocument) => void }) {
  const updateSection = (index: number, patch: Partial<DocSection>) =>
    onChange({ ...doc, sections: doc.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="doc-title" className="text-xs font-semibold text-muted-foreground">
          العنوان
        </label>
        <Input id="doc-title" value={doc.title} onChange={(e) => onChange({ ...doc, title: e.target.value })} className="text-base font-semibold" />
      </div>
      {doc.sections.map((s, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <Input
              aria-label={`عنوان القسم ${i + 1}`}
              value={s.heading}
              onChange={(e) => updateSection(i, { heading: e.target.value })}
              className="h-9 font-semibold"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`حذف القسم ${s.heading}`}
              onClick={() => onChange({ ...doc, sections: doc.sections.filter((_, j) => j !== i) })}
              disabled={doc.sections.length <= 1}
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
          {s.body !== undefined && (
            <Textarea
              aria-label={`نص القسم ${s.heading}`}
              value={s.body}
              onChange={(e) => updateSection(i, { body: e.target.value })}
              className="min-h-[120px]"
            />
          )}
          {s.items !== undefined && (
            <div className="space-y-1.5">
              <Textarea
                aria-label={`بنود القسم ${s.heading}`}
                value={s.items.join("\n")}
                onChange={(e) => updateSection(i, { items: e.target.value.split("\n") })}
                className="min-h-[110px] text-[13.5px]"
              />
              <p className="text-[11px] text-muted-foreground">كل سطر يمثل بندًا مستقلًا.</p>
            </div>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => onChange({ ...doc, sections: [...doc.sections, { heading: "قسم جديد", body: "" }] })}
      >
        <Plus />
        إضافة قسم
      </Button>
    </div>
  );
}

/** Drop blank bullet lines produced while editing. */
export function cleanDocument(doc: ResultDocument): ResultDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      items: s.items?.map((i) => i.trim()).filter(Boolean),
    })),
  };
}
