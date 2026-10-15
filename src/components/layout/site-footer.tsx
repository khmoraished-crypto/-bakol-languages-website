import Link from "next/link";
import { Logo } from "./logo";
import { TOOLS } from "@/lib/tools-config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            منصة عربية تجمع أدوات العمل الإعلامي في مساحة واحدة: من صياغة الخبر إلى السيناريو والبرامج التدريبية وأفكار الحملات.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">الأدوات</h2>
          <ul className="mt-4 space-y-2.5">
            {TOOLS.map((t) => (
              <li key={t.id}>
                <Link href={t.href} className="text-sm text-muted-foreground transition-colors hover:text-accent">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">المنصة</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/tools" className="text-sm text-muted-foreground hover:text-accent">جميع الأدوات</Link></li>
            <li><Link href="/drafts" className="text-sm text-muted-foreground hover:text-accent">مسوداتي</Link></li>
            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-accent">عن المنصة والخصوصية</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} مختبر الإعلام الذكي. جميع الحقوق محفوظة.</p>
          <p>المخرجات مسودات تخضع للمراجعة التحريرية قبل النشر.</p>
        </div>
      </div>
    </footer>
  );
}
