import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/tools/tool-header";
import { StudioForm } from "@/components/tools/forms/studio-form";
import { TOOLS_BY_ID } from "@/lib/tools-config";

export const metadata: Metadata = {
  title: TOOLS_BY_ID.studio.name,
  description: TOOLS_BY_ID.studio.description,
};

export default function Page() {
  return (
    <ToolPageShell tool="studio">
      <Suspense>
        <StudioForm />
      </Suspense>
    </ToolPageShell>
  );
}
