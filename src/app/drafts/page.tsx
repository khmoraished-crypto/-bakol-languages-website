import type { Metadata } from "next";
import { HardDrive } from "lucide-react";
import { DraftsList } from "@/components/drafts/drafts-list";

export const metadata: Metadata = {
  title: "مسوداتي",
  description: "المسودات المحفوظة محليًا في متصفحك.",
};

export default function DraftsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-sm font-semibold text-teal-600">مساحة العمل</span>
        <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">مسوداتي</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <HardDrive className="size-4" />
          تُحفظ المسودات في هذا المتصفح فقط، ولا تُرسل إلى أي خادم.
        </p>
      </div>
      <DraftsList />
    </div>
  );
}
