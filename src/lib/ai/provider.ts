import "server-only";
import { resultDocumentSchema, type ResultDocument } from "@/lib/ai/types";

/**
 * Server-only adapter for AI providers.
 * Keys are read from process.env at request time and never leave the server.
 */

export type ProviderName = "anthropic" | "openai";

interface ProviderConfig {
  name: ProviderName;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const DEFAULT_MODELS: Record<ProviderName, string> = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4o-mini",
};

const DEFAULT_BASE: Record<ProviderName, string> = {
  anthropic: "https://api.anthropic.com/v1",
  openai: "https://api.openai.com/v1",
};

export function getProviderConfig(): ProviderConfig | null {
  const name = (process.env.AI_PROVIDER ?? "none").trim().toLowerCase();
  const apiKey = process.env.AI_API_KEY?.trim();
  if ((name !== "anthropic" && name !== "openai") || !apiKey) return null;
  return {
    name,
    apiKey,
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODELS[name],
    baseUrl: (process.env.AI_BASE_URL?.trim() || DEFAULT_BASE[name]).replace(/\/$/, ""),
  };
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status = 502
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 60_000;

async function callAnthropic(cfg: ProviderConfig, system: string, user: string, signal: AbortSignal) {
  const res = await fetch(`${cfg.baseUrl}/messages`, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new ProviderError(`Anthropic API error ${res.status}`, res.status === 429 ? 429 : 502);
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

async function callOpenAI(cfg: ProviderConfig, system: string, user: string, signal: AbortSignal) {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new ProviderError(`OpenAI API error ${res.status}`, res.status === 429 ? 429 : 502);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Extract the first JSON object from a model reply (tolerates code fences). */
function parseJsonDocument(raw: string): ResultDocument {
  const fenced = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1) throw new ProviderError("Model reply did not contain JSON");
  let parsed: unknown;
  try {
    parsed = JSON.parse(fenced.slice(start, end + 1));
  } catch {
    throw new ProviderError("Model reply was not valid JSON");
  }
  const result = resultDocumentSchema.safeParse(parsed);
  if (!result.success) throw new ProviderError("Model reply did not match the document schema");
  return result.data;
}

export async function generateWithProvider(
  cfg: ProviderConfig,
  system: string,
  user: string
): Promise<ResultDocument> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const raw =
      cfg.name === "anthropic"
        ? await callAnthropic(cfg, system, user, controller.signal)
        : await callOpenAI(cfg, system, user, controller.signal);
    return parseJsonDocument(raw);
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    if ((err as Error).name === "AbortError") throw new ProviderError("Provider request timed out", 504);
    throw new ProviderError("Provider request failed");
  } finally {
    clearTimeout(timer);
  }
}
