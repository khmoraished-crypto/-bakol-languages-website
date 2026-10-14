import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="aml-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1A45" />
          <stop offset="1" stopColor="#13306E" />
        </linearGradient>
        <linearGradient id="aml-t" x1="8" y1="30" x2="32" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#67E8F9" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#aml-g)" />
      <path d="M11 27V13l9 8 9-8v14" fill="none" stroke="url(#aml-t)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="29" r="2.4" fill="#5EEAD4" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="مختبر الإعلام الذكي — الصفحة الرئيسية">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[15px] font-bold", light ? "text-white" : "text-primary")}>مختبر الإعلام الذكي</span>
        <span className={cn("ltr-chunk mt-1 text-[10.5px] font-medium tracking-[0.18em]", light ? "text-teal-200/80" : "text-muted-foreground")}>
          AI MEDIA LAB
        </span>
      </span>
    </Link>
  );
}
