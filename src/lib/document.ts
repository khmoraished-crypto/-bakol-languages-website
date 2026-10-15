import type { ResultDocument } from "@/lib/ai/types";

/** Plain-text rendering used for copy & .txt export. */
export function documentToText(doc: ResultDocument): string {
  const out: string[] = [doc.title];
  if (doc.subtitle) out.push(doc.subtitle);
  out.push("");
  for (const s of doc.sections) {
    out.push(`■ ${s.heading}`);
    if (s.body) out.push(s.body);
    if (s.items?.length) out.push(...s.items.map((i) => `• ${i}`));
    out.push("");
  }
  return out.join("\n").trim();
}

/** Markdown rendering used for .md export. */
export function documentToMarkdown(doc: ResultDocument): string {
  const out: string[] = [`# ${doc.title}`];
  if (doc.subtitle) out.push(`_${doc.subtitle}_`);
  out.push("");
  for (const s of doc.sections) {
    out.push(`## ${s.heading}`, "");
    if (s.body) out.push(s.body, "");
    if (s.items?.length) out.push(...s.items.map((i) => `- ${i}`), "");
  }
  return out.join("\n").trim() + "\n";
}

export function sectionToText(section: ResultDocument["sections"][number]) {
  return [section.heading, section.body, ...(section.items ?? []).map((i) => `• ${i}`)]
    .filter(Boolean)
    .join("\n");
}
