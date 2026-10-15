"use client";

import { useEffect, useState } from "react";

export interface AiStatus {
  aiEnabled: boolean;
  provider: string | null;
}

let cache: AiStatus | null = null;
let inflight: Promise<AiStatus> | null = null;

function fetchStatus(): Promise<AiStatus> {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch("/api/status", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<AiStatus>) : { aiEnabled: false, provider: null }))
    .catch(() => ({ aiEnabled: false, provider: null }))
    .then((s) => (cache = s));
  return inflight;
}

export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus | null>(cache);
  useEffect(() => {
    let alive = true;
    fetchStatus().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);
  return status;
}
