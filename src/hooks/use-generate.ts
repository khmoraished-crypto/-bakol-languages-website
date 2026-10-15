"use client";

import { useCallback, useRef, useState } from "react";
import type { ApiError, GenerateResponse, ToolId } from "@/lib/ai/types";

export type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: GenerateResponse }
  | { status: "error"; message: string; fields?: Record<string, string> };

export function useGenerate(tool: ToolId) {
  const [state, setState] = useState<GenerateState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (input: Record<string, unknown>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tool, input }),
          signal: controller.signal,
        });
        const body = (await res.json().catch(() => null)) as GenerateResponse | ApiError | null;
        if (!res.ok || !body || "error" in body) {
          const err = (body as ApiError | null) ?? { error: "حدث خطأ غير متوقع." };
          const next: GenerateState = { status: "error", message: err.error, fields: err.fields };
          setState(next);
          return next;
        }
        const next: GenerateState = { status: "success", data: body as GenerateResponse };
        setState(next);
        return next;
      } catch (err) {
        if ((err as Error).name === "AbortError") return null;
        const next: GenerateState = {
          status: "error",
          message: "تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
        };
        setState(next);
        return next;
      }
    },
    [tool]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  /** Restore a previously saved result (e.g. from drafts). */
  const restore = useCallback((data: GenerateResponse) => setState({ status: "success", data }), []);

  return { state, generate, reset, restore };
}
