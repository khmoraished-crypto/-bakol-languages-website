import type { ResultDocument, ToolId, ToolInputMap } from "@/lib/ai/types";
import { demoNewsroom } from "./newsroom";
import { demoEditor } from "./editor";
import { demoStudio } from "./studio";
import { demoTraining } from "./training";
import { demoIdeas } from "./ideas";

export const DEMO_NOTICE =
  "نتيجة تجريبية مُعدّة بقوالب وقواعد تحريرية ثابتة، وليست مولّدة بنموذج ذكاء اصطناعي. راجعها وعدّلها قبل الاستخدام.";

type DemoResult = { document: ResultDocument; warnings: string[] };

export function runDemo<T extends ToolId>(tool: T, input: ToolInputMap[T]): DemoResult {
  switch (tool) {
    case "newsroom":
      return demoNewsroom(input as ToolInputMap["newsroom"]);
    case "editor":
      return demoEditor(input as ToolInputMap["editor"]);
    case "studio":
      return demoStudio(input as ToolInputMap["studio"]);
    case "training":
      return demoTraining(input as ToolInputMap["training"]);
    case "ideas":
      return demoIdeas(input as ToolInputMap["ideas"]);
    default:
      throw new Error(`Unknown tool: ${tool satisfies never}`);
  }
}
