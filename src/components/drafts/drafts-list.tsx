"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, FileDown, FolderOpen, Search, Trash2, Inbox, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { drafts, type Draft } from "@/lib/drafts";
import { TOOLS, TOOLS_BY_ID } from "@/lib/tools-config";
import type { ToolId } from "@/lib/ai/types";
import { copyText } from "@/lib/clipboard";
import { documentToText } from "@/lib/document";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModeBadge } from "@/components/tools/result-panel";

export function DraftsList() {
  const [items, setItems] = useState<Draft[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ToolId | "all">("all");
  const [confirm, setConfirm] = useState<{ type: "one"; draft: Draft } | { type: "all" } | null>(null);

  useEffect(() => {
    const load = () => setItems(drafts.list());
    load();
    return drafts.subscribe(load);
  }, []);

  const visible = useMemo(() => {
    if (!items) return [];
    const q = query.trim();
    return items.filter(
      (d) =>
        (filter === "all" || d.tool === filter) &&
        (!q || d.title.includes(q) || d.document.sections.some((s) => s.body?.includes(q) || s.heading.includes(q)))
    );
  }, [items, query, filter]);

  const exportPdf = async (d: Draft) => {
    const id = toast.loading("جارٍ إعداد ملف PDF…");
    try {
      const { exportDocumentToPdf } = await import("@/lib/export-pdf");
      await exportDocumentToPdf(d.document, { toolName: TOOLS_BY_ID[d.tool].name, mode: d.mode });
      toast.success("تم تصدير ملف PDF", { id });
    } catch {
      toast.error("تعذّر إنشاء ملف PDF.", { id });
    }
  };

  const doDelete = () => {
    if (!confirm) return;
    try {
      if (confirm.type === "all") {
        drafts.clear();
        toast.success("حُذفت جميع المسودات");
      } else {
        drafts.remove(confirm.draft.id);
        toast.success("حُذفت المسودة");
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
    setConfirm(null);
  };

  if (items === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white px-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-soft">
          <Inbox className="size-7 text-teal-600" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-primary">لا توجد مسودات محفوظة بعد</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          بعد تنفيذ أي مهمة، اضغط «حفظ مسودة» لتجدها هنا. تُحفظ المسودات في هذا المتصفح فقط.
        </p>
        <Button asChild variant="accent" className="mt-6">
          <Link href="/tools">
            ابدأ مهمة جديدة
            <ArrowLeft />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="تصفية حسب الأداة">
          {[{ id: "all" as const, shortName: "الكل" }, ...TOOLS].map((t) => {
            const count = t.id === "all" ? items.length : items.filter((d) => d.tool === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  filter === t.id ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground hover:text-foreground"
                )}
              >
                {t.shortName}
                <span className="ms-1.5 text-xs opacity-70 tabular-nums">{count.toLocaleString("ar")}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في المسودات…" className="ps-9" aria-label="البحث في المسودات" />
          </div>
          <Button variant="outline" onClick={() => setConfirm({ type: "all" })} className="text-destructive hover:text-destructive">
            <Trash2 />
            <span className="hidden sm:inline">حذف الكل</span>
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-white py-12 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>
      ) : (
        <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {visible.map((d) => {
              const tool = TOOLS_BY_ID[d.tool];
              return (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex flex-col rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:border-accent/40 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className={cn("flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-white", tool.gradient)}>
                        <tool.icon className="size-3.5" />
                      </span>
                      {tool.shortName}
                    </span>
                    <ModeBadge mode={d.mode} />
                  </div>
                  <h3 className="mt-4 line-clamp-2 font-bold leading-7 text-primary">{d.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {d.document.sections.find((s) => s.body)?.body ?? d.document.subtitle ?? ""}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">آخر تعديل: {formatDate(d.updatedAt)}</p>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-4">
                    <Button asChild size="sm" variant="default" className="flex-1">
                      <Link href={`${tool.href}?draft=${d.id}`}>
                        <FolderOpen />
                        فتح وتعديل
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="نسخ"
                      onClick={async () => ((await copyText(documentToText(d.document))) ? toast.success("نُسخت المسودة") : toast.error("تعذّر النسخ"))}
                    >
                      <Copy />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="تصدير PDF" onClick={() => exportPdf(d)}>
                      <FileDown />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="حذف" onClick={() => setConfirm({ type: "one", draft: d })}>
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.type === "all" ? "حذف جميع المسودات؟" : "حذف المسودة؟"}</DialogTitle>
            <DialogDescription>
              {confirm?.type === "all"
                ? "ستُحذف جميع المسودات المحفوظة في هذا المتصفح نهائيًا، ولا يمكن التراجع عن ذلك."
                : `ستُحذف «${confirm?.type === "one" ? confirm.draft.title : ""}» نهائيًا.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button variant="destructive" onClick={doDelete}>
              <Trash2 />
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
