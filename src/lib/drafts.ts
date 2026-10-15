import type { GenerationMode, ResultDocument, ToolId } from "@/lib/ai/types";
import { uid } from "@/lib/utils";

export interface Draft {
  id: string;
  tool: ToolId;
  title: string;
  input: Record<string, unknown>;
  document: ResultDocument;
  mode: GenerationMode;
  createdAt: string;
  updatedAt: string;
}

const KEY = "aml:drafts:v1";
const EVENT = "aml:drafts-changed";
const MAX_DRAFTS = 100;

function read(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Draft[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(drafts: Draft[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
    window.dispatchEvent(new Event(EVENT));
  } catch (err) {
    throw new Error(
      (err as Error).name === "QuotaExceededError"
        ? "مساحة التخزين المحلي ممتلئة. احذف بعض المسودات القديمة."
        : "تعذّر الحفظ في المتصفح. تأكد من تفعيل التخزين المحلي."
    );
  }
}

export const drafts = {
  list(): Draft[] {
    return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  get(id: string): Draft | undefined {
    return read().find((d) => d.id === id);
  },
  save(data: Omit<Draft, "id" | "createdAt" | "updatedAt"> & { id?: string }): Draft {
    const all = read();
    const now = new Date().toISOString();
    const existing = data.id ? all.find((d) => d.id === data.id) : undefined;
    const draft: Draft = existing
      ? { ...existing, ...data, id: existing.id, updatedAt: now }
      : { ...data, id: uid("draft"), createdAt: now, updatedAt: now };
    write([draft, ...all.filter((d) => d.id !== draft.id)]);
    return draft;
  },
  remove(id: string) {
    write(read().filter((d) => d.id !== id));
  },
  clear() {
    write([]);
  },
  subscribe(cb: () => void) {
    const handler = (e: Event) => {
      if (e instanceof StorageEvent && e.key !== KEY) return;
      cb();
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
