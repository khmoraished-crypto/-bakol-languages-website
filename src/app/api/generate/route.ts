import { NextResponse, type NextRequest } from "next/server";
import {
  fieldErrors,
  generateRequestSchema,
  toolInputSchemas,
  type ApiError,
  type GenerateResponse,
  type ToolId,
  type ToolInputMap,
} from "@/lib/ai/types";
import { getProviderConfig, generateWithProvider, ProviderError } from "@/lib/ai/provider";
import { buildPrompt } from "@/lib/ai/prompts";
import { rateLimit } from "@/lib/ai/rate-limit";
import { runDemo, DEMO_NOTICE } from "@/lib/ai/demo";
import { checkNewsCompleteness } from "@/lib/newsroom-check";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;

function error(status: number, body: ApiError, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

function clientKey(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export async function POST(req: NextRequest) {
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 20;
  const rl = rateLimit(clientKey(req), limit);
  if (!rl.ok) {
    return error(
      429,
      { error: `تجاوزت الحد المسموح من الطلبات. حاول مجددًا بعد ${rl.retryAfter} ثانية.` },
      { "Retry-After": String(rl.retryAfter) }
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return error(413, { error: "حجم المدخلات أكبر من المسموح." });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return error(400, { error: "صيغة الطلب غير صالحة." });
  }

  const req1 = generateRequestSchema.safeParse(json);
  if (!req1.success) return error(400, { error: "الأداة المطلوبة غير معروفة." });

  const tool = req1.data.tool as ToolId;
  const parsed = toolInputSchemas[tool].safeParse(req1.data.input);
  if (!parsed.success) {
    return error(422, { error: "يرجى مراجعة الحقول المطلوبة.", fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data as ToolInputMap[typeof tool];

  const cfg = getProviderConfig();

  if (!cfg) {
    const { document, warnings } = runDemo(tool, input);
    const body: GenerateResponse = { mode: "demo", document, warnings, notice: DEMO_NOTICE };
    return NextResponse.json(body);
  }

  try {
    const { system, user } = buildPrompt(tool, input);
    const document = await generateWithProvider(cfg, system, user);
    const warnings =
      tool === "newsroom"
        ? checkNewsCompleteness(input as ToolInputMap["newsroom"]).map((m) =>
            m.level === "required" ? `معلومة أساسية ناقصة: ${m.label}` : `يُستحسن إضافة: ${m.label}`
          )
        : [];
    const body: GenerateResponse = {
      mode: "ai",
      document,
      warnings,
      notice: "مسودة مولّدة بنموذج ذكاء اصطناعي. تحقق من دقة المعلومات قبل النشر.",
    };
    return NextResponse.json(body);
  } catch (err) {
    const status = err instanceof ProviderError ? err.status : 500;
    // Log server-side only; never echo provider details to the client.
    console.error("[generate]", tool, (err as Error).message);
    return error(status === 429 ? 429 : 502, {
      error:
        status === 429
          ? "مزوّد الذكاء الاصطناعي مشغول حاليًا. حاول بعد قليل."
          : status === 504
            ? "استغرق التوليد وقتًا أطول من المتوقع. حاول مجددًا."
            : "تعذّر الاتصال بخدمة الذكاء الاصطناعي. حاول مجددًا لاحقًا.",
    });
  }
}
