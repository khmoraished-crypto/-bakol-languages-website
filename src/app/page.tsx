import { Hero } from "@/components/home/hero";
import { ToolsGrid } from "@/components/home/tools-grid";
import { Workflow } from "@/components/home/workflow";
import { Principles } from "@/components/home/principles";
import { CallToAction } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-7xl space-y-28 px-4 pt-24 sm:px-6 lg:px-8">
        <ToolsGrid />
        <Workflow />
        <Principles />
        <CallToAction />
      </div>
    </>
  );
}
