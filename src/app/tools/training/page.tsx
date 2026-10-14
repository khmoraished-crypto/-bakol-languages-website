import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/tools/tool-header";
import { TrainingForm } from "@/components/tools/forms/training-form";
import { TOOLS_BY_ID } from "@/lib/tools-config";

export const metadata: Metadata = {
  title: TOOLS_BY_ID.training.name,
  description: TOOLS_BY_ID.training.description,
};

export default function Page() {
  return (
    <ToolPageShell tool="training">
      <Suspense>
        <TrainingForm />
      </Suspense>
    </ToolPageShell>
  );
}
