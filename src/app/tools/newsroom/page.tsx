import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/tools/tool-header";
import { NewsroomForm } from "@/components/tools/forms/newsroom-form";
import { TOOLS_BY_ID } from "@/lib/tools-config";

export const metadata: Metadata = {
  title: TOOLS_BY_ID.newsroom.name,
  description: TOOLS_BY_ID.newsroom.description,
};

export default function Page() {
  return (
    <ToolPageShell tool="newsroom">
      <Suspense>
        <NewsroomForm />
      </Suspense>
    </ToolPageShell>
  );
}
