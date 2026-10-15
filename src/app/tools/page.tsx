import type { Metadata } from "next";
import { ToolsGrid } from "@/components/home/tools-grid";
import { AiStatusPill } from "@/components/tools/tool-header";

export const metadata: Metadata = {
  title: "الأدوات",
  description: "اختر الأداة المناسبة لمهمتك الإعلامية.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-sm font-semibold text-teal-600">مساحة العمل</span>
          <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">اختر الأداة المناسبة لمهمتك</h1>
          <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">
            كل أداة تعمل باستقلالية: أدخل البيانات، نفّذ المهمة، ثم عدّل النتيجة واحفظها كمسودة أو صدّرها بصيغة PDF.
          </p>
        </div>
        <AiStatusPill />
      </div>
      <div className="mt-10">
        <ToolsGrid withHeading={false} />
      </div>
    </div>
  );
}
