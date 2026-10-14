"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Copy,
  Download,
  Eye,
  FileDown,
  FileText,
  Info,
  Loader2,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
  CircleAlert,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { GenerationMode, ResultDocument } from "@/lib/ai/types";
import type { GenerateState } from "@/hooks/use-generate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentEditor, DocumentView, cleanDocument } from "./document-view";
import { copyText, downloadBlob, safeFilename } from "@/lib/clipboard";
import { documentToMarkdown, documentToText } from "@/lib/document";
import { cn } from "@/lib/utils";

const LOADING_STEPS = ["تحليل المدخلات", "بناء هيكل النتيجة", "إعداد المسودة"];

function LoadingState() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="p-6 sm:p-8" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-xl bg-accent-soft">
          <Loader2 className="size-5 animate-spin text-teal-600" />
        </span>
        <div>
          <p className="font-semibold text-primary">جارٍ التنفيذ…</p>
          <p className="text-sm text-muted-foreground">{LOADING_STEPS[step]}</p>
        </div>
      </div>
      <ol className="mt-6 space-y-2.5">
        {LOADING_STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border transition-colors",
                i < step ? "border-accent bg-accent text-white" : i === step ? "border-accent" : "border-border"
              )}
            >
              {i < step ? <Check className="size-3" /> : i === step ? <span className="size-1.5 animate-pulse rounded-full bg-accent" /> : null}
            </span>
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8 space-y-3" aria-hidden>
        {[90, 70, 100, 85, 60].map((w, i) => (
          <div key={i} className="h-3 animate-pulse rounded-full bg-muted" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-white shadow-soft"
      >
        <Sparkles className="size-7 text-teal-600" />
      </motion.div>
      <h3 className="mt-5 font-bold text-primary">ستظهر النتيجة هنا</h3>
      <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">{hint}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center" role="alert">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-rose-50">
        <CircleAlert className="size-7 text-destructive" />
      </span>
      <h3 className="mt-5 font-bold text-primary">تعذّر إكمال العملية</h3>
      <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-5" onClick={onRetry}>
        <RotateCcw />
        إعادة المحاولة
      </Button>
    </div>
  );
}

export function ModeBadge({ mode }: { mode: GenerationMode }) {
  return mode === "ai" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-teal-800">
      <Sparkles className="size-3.5" />
      مولّد بالذكاء الاصطناعي
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-amber-800">
      <Info className="size-3.5" />
      نتيجة تجريبية (قوالب)
    </span>
  );
}

export function ResultPanel({
  state,
  doc,
  onDocChange,
  toolName,
  emptyHint,
  onRetry,
  onSave,
  saved,
  onNew,
}: {
  state: GenerateState;
  doc: ResultDocument | null;
  onDocChange: (d: ResultDocument) => void;
  toolName: string;
  emptyHint: string;
  onRetry: () => void;
  onSave: () => void;
  saved: boolean;
  onNew: () => void;
}) {
  const [tab, setTab] = useState<"view" | "edit">("view");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (state.status === "loading") setTab("view");
  }, [state.status]);

  const data = state.status === "success" ? state.data : null;

  const handleCopy = async () => {
    if (!doc) return;
    const ok = await copyText(documentToText(cleanDocument(doc)));
    if (ok) toast.success("نُسخت النتيجة كاملة إلى الحافظة");
    else toast.error("تعذّر النسخ. جرّب تحديد النص ونسخه يدويًا.");
  };

  const handlePdf = async () => {
    if (!doc || !data) return;
    setExporting(true);
    const id = toast.loading("جارٍ إعداد ملف PDF…");
    try {
      const { exportDocumentToPdf } = await import("@/lib/export-pdf");
      await exportDocumentToPdf(cleanDocument(doc), { toolName, mode: data.mode });
      toast.success("تم تصدير ملف PDF", { id });
    } catch (err) {
      console.error(err);
      toast.error("تعذّر إنشاء ملف PDF. حاول مجددًا.", { id });
    } finally {
      setExporting(false);
    }
  };

  const handleMarkdown = () => {
    if (!doc) return;
    downloadBlob(documentToMarkdown(cleanDocument(doc)), `${safeFilename(doc.title)}.md`, "text/markdown;charset=utf-8");
    toast.success("تم تنزيل الملف النصي");
  };

  return (
    <Card className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "loading" ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingState />
          </motion.div>
        ) : state.status === "error" ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState message={state.message} onRetry={onRetry} />
          </motion.div>
        ) : data && doc ? (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "view" | "edit")}>
              {/* Toolbar */}
              <div className="flex flex-col gap-3 border-b border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="view">
                      <Eye />
                      معاينة
                    </TabsTrigger>
                    <TabsTrigger value="edit">
                      <PencilLine />
                      تحرير
                    </TabsTrigger>
                  </TabsList>
                  <ModeBadge mode={data.mode} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy />
                    نسخ
                  </Button>
                  <Button size="sm" variant={saved ? "secondary" : "outline"} onClick={onSave}>
                    {saved ? <Check className="text-teal-600" /> : <Save />}
                    {saved ? "محفوظة" : "حفظ مسودة"}
                  </Button>
                  <Button size="sm" variant="default" onClick={handlePdf} disabled={exporting}>
                    {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
                    PDF
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleMarkdown} aria-label="تنزيل كملف نصي Markdown" title="تنزيل كملف نصي (Markdown)">
                    <Download />
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {data.notice && (
                  <div
                    className={cn(
                      "mb-4 flex gap-2.5 rounded-xl px-3.5 py-3 text-[13px] leading-6",
                      data.mode === "demo" ? "bg-warning-soft text-amber-900" : "bg-accent-soft text-teal-900"
                    )}
                  >
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <p>{data.notice}</p>
                  </div>
                )}
                {data.warnings && data.warnings.length > 0 && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                      <AlertTriangle className="size-4" />
                      تنبيهات
                    </p>
                    <ul className="mt-1.5 space-y-1 ps-6 text-[13px] leading-6 text-amber-900/90">
                      {data.warnings.map((w) => (
                        <li key={w} className="list-disc">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <TabsContent value="view" className="mt-0">
                  <DocumentView doc={doc} />
                </TabsContent>
                <TabsContent value="edit" className="mt-0">
                  <DocumentEditor doc={doc} onChange={onDocChange} />
                </TabsContent>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" />
                    راجع المسودة وتحقق من المعلومات قبل النشر.
                  </p>
                  <Button size="sm" variant="ghost" onClick={onNew}>
                    <RotateCcw />
                    مهمة جديدة
                  </Button>
                </div>
              </div>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState hint={emptyHint} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
