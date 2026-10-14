"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/tools-config";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/tools", label: "الأدوات" },
  { href: "/drafts", label: "مسوداتي" },
  { href: "/about", label: "عن المنصة" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "border-b border-border/70 bg-white/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" className="hidden sm:inline-flex">
            <Link href="/tools">
              ابدأ التجربة
              <ArrowLeft />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="!size-5" /> : <Menu className="!size-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="القائمة">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-medium",
                    isActive(item.href) ? "bg-accent-soft text-teal-800" : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground">الأدوات</div>
              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-muted"
                >
                  <span className={cn("flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", tool.gradient)}>
                    <tool.icon className="size-4" />
                  </span>
                  {tool.name}
                </Link>
              ))}
              <Button asChild variant="accent" size="lg" className="mt-6">
                <Link href="/tools">ابدأ التجربة</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
