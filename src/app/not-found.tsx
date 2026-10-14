import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="ltr-chunk text-7xl font-bold text-gradient [background-image:linear-gradient(120deg,#0b1a45,#14b8a6)]">404</span>
      <h1 className="mt-6 text-2xl font-bold text-primary">الصفحة غير موجودة</h1>
      <p className="mt-3 leading-8 text-muted-foreground">ربما نُقلت الصفحة أو أن الرابط غير صحيح.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="accent">
          <Link href="/">العودة إلى الرئيسية</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tools">تصفح الأدوات</Link>
        </Button>
      </div>
    </div>
  );
}
