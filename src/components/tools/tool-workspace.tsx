"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eraser, Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { fieldErrors, toolInputSchemas, type ResultDocument, type ToolId } from "@/lib/ai/types";
import { useGenerate } from "@/hooks/use-generate";
import { usePersistentForm } from "@/hooks/use-persistent-form";
import { drafts } from "@/lib/drafts";
import { TOOLS_BY_ID } from "@/lib/tools-config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultPanel } from "./result-panel";
import { cleanDocument } from "./document-view";

export interface FormContext<T> {
  values: T;
  set: <K extends keyof T>(field: K, value: T[K]) => void;
  errors: Record<string, string>;
}

interface ToolWorkspaceProps<T extends Record<string, unknown>> {
  tool: ToolId;
  initial: T;
  example?: Partial<T>;
  submitLabel: string;
  emptyHint: string;
  renderForm: (ctx: FormContext<T>) => ReactNode;
  /** Optional panel rendered above the submit button (e.g. completeness meter). */
  renderAside?: (values: T) => ReactNode;
  /** Called before submission; return a message to show as a warning toast. */
  preflight?: (values: T) => string | null;
}

export function ToolWorkspace<T extends Record<string, unknown>>({
  tool,
  initial,
  example,
  submitLabel,
  emptyHint,
  renderForm,
  renderAside,
  preflight,
}: ToolWorkspaceProps<T>) {
  const meta = TOOLS_BY_ID[tool];
  const router = useRouter();
  const params = useSearchParams();
  const form = usePersistentForm<T>(tool, initial);
  const { state, generate, reset, restore } = useGenerate(tool);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doc, setDoc] = useState<ResultDocument | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const loadedDraft = useRef<string | null>(null);

  // Load a draft from ?draft=<id>
  const draftParam = params.get("draft");
  const { hydrated, replace } = form;
  useEffect(() => {
    if (!hydrated || !draftParam || loadedDraft.current === draftParam) return;
    loadedDraft.current = draftParam;
    const d = drafts.get(draftParam);
    if (!d || d.tool !== tool) {
      toast.error("لم يُعثر على المسودة المطلوبة في هذا المتصفح.");
      return;
    }
    replace(d.input as Partial<T>);
    restore({ mode: d.mode, document: d.document });
    setDoc(d.document);
    setDraftId(d.id);
    setSaved(true);
    toast.success("تم فتح المسودة");
  }, [hydrated, draftParam, tool, replace, restore]);

  const set = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      form.set(field, value);
      setErrors((e) => {
        if (!e[field as string]) return e;
        const next = { ...e };
        delete next[field as string];
        return next;
      });
    },
    [form]
  );

  const submit = useCallback(async () => {
    const parsed = toolInputSchemas[tool].safeParse(form.values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      toast.error("يرجى استكمال الحقول المطلوبة");
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`f-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    const warning = preflight?.(form.values);
    if (warning) toast.warning(warning);

    const result = await generate(form.values);
    if (!result) return;
    if (result.status === "success") {
      setDoc(result.data.document);
      setDraftId(null);
      setSaved(false);
      toast.success("اكتملت المهمة بنجاح");
      if (window.innerWidth < 1024) {
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    } else if (result.status === "error") {
      if (result.fields) setErrors(result.fields);
      toast.error(result.message);
    }
  }, [form.values, generate, preflight, tool]);

  // Ctrl/Cmd + Enter submits
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && state.status !== "loading") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, state.status]);

  const handleSave = () => {
    if (!doc || state.status !== "success") return;
    try {
      const d = drafts.save({
        id: draftId ?? undefined,
        tool,
        title: doc.title || meta.name,
        input: form.values,
        document: cleanDocument(doc),
        mode: state.data.mode,
      });
      setDraftId(d.id);
      setSaved(true);
      toast.success("حُفظت المسودة في متصفحك", {
        action: { label: "عرض المسودات", onClick: () => router.push("/drafts") },
      });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleNew = () => {
    reset();
    setDoc(null);
    setDraftId(null);
    setSaved(false);
    if (draftParam) router.replace(meta.href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loading = state.status === "loading";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <Card className="p-5 sm:p-6">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-primary">المدخلات</h2>
            <div className="flex items-center gap-1">
              {example && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    form.replace(example);
                    setErrors({});
                    toast.info("عُبّئت الحقول بمثال توضيحي يمكنك تعديله");
                  }}
                >
                  <WandSparkles />
                  املأ بمثال
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  form.reset();
                  setErrors({});
                }}
              >
                <Eraser />
                مسح
              </Button>
            </div>
          </div>

          {renderForm({ values: form.values, set, errors })}

          {renderAside?.(form.values)}

          <div className="space-y-2 pt-1">
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <ArrowLeft />}
              {loading ? "جارٍ التنفيذ…" : submitLabel}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              تُحفظ مدخلاتك تلقائيًا في متصفحك · <span className="ltr-chunk">Ctrl + Enter</span> للتنفيذ السريع
            </p>
          </div>
        </form>
      </Card>

      <div ref={resultRef} className="scroll-mt-20 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-2xl scrollbar-thin">
        <ResultPanel
          state={state}
          doc={doc}
          onDocChange={(d) => {
            setDoc(d);
            setSaved(false);
          }}
          toolName={meta.name}
          emptyHint={emptyHint}
          onRetry={submit}
          onSave={handleSave}
          saved={saved}
          onNew={handleNew}
        />
      </div>
    </div>
  );
}
