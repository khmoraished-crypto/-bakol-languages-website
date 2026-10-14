import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/tools/tool-header";
import { IdeasForm } from "@/components/tools/forms/ideas-form";
import { TOOLS_BY_ID } from "@/lib/tools-config";

export const metadata: Metadata = {
  title: TOOLS_BY_ID.ideas.name,
  description: TOOLS_BY_ID.ideas.description,
};

export default function Page() {
  return (
    <ToolPageShell tool="ideas">
      <Suspense>
        <IdeasForm />
      </Suspense>
    </ToolPageShell>
  );
}
