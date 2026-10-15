import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Info, HardDrive, KeyRound, Server, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiStatusPill } from "@/components/tools/tool-header";

export const metadata: Metadata = {
  title: "عن المنصة",
  description: "كيف يعمل مختبر الإعلام الذكي، وأوضاع التشغيل، وسياسة الخصوصية.",
};

const SECTIONS = [
  {
    id: "modes",
    icon: Sparkles,
    title: "أوضاع التشغيل",
    body: [
      "تعمل المنصة في أحد وضعين، وتوضح لك كل نتيجة الوضع الذي أُنتجت به:",
    ],
    items: [
      "وضع الذكاء الاصطناعي: عند ربط المنصة بمزوّد نماذج لغوية من قِبل مشغّلها، تُرسل مدخلاتك إلى النموذج عبر خادم المنصة وتظهر النتيجة بشارة «مولّد بالذكاء الاصطناعي».",
      "الوضع التجريبي: في حال عدم الربط، تعمل الأدوات بقوالب وقواعد تحريرية ثابتة مكتوبة مسبقًا (مثل بناء الهرم المقلوب، وقواعد الإملاء والترقيم، وبنوك صيغ الأفكار). هذه النتائج مفيدة كهياكل أولية، لكنها ليست مولّدة بالذكاء الاصطناعي، وتظهر بشارة «نتيجة تجريبية».",
    ],
  },
  {
    id: "privacy",
    icon: HardDrive,
    title: "الخصوصية والمسودات",
    body: [
      "تُحفظ المسودات والمدخلات التي تكتبها في التخزين المحلي لمتصفحك فقط. لا تحتفظ المنصة بقاعدة بيانات للمستخدمين، ويمكنك حذف مسوداتك في أي وقت من صفحة «مسوداتي».",
      "في وضع الذكاء الاصطناعي، تُرسل مدخلات المهمة إلى مزوّد النموذج لمعالجتها فقط؛ لذا تجنب إدخال بيانات شخصية حساسة أو معلومات سرية.",
    ],
  },
  {
    id: "security",
    icon: KeyRound,
    title: "أمان مفاتيح الربط",
    body: [
      "تُقرأ مفاتيح واجهات النماذج من متغيرات البيئة على الخادم فقط، ولا تُضمَّن في الشيفرة التي تصل إلى المتصفح. كما تُطبَّق على واجهة التوليد قيود على حجم الطلبات وعددها، ويُتحقق من جميع المدخلات قبل معالجتها.",
    ],
  },
  {
    id: "editorial",
    icon: Info,
    title: "المسؤولية التحريرية",
    body: [
      "جميع المخرجات مسودات تساعد على تسريع العمل، ولا تغني عن التحقق من المعلومات والمراجعة اللغوية والقرار التحريري البشري. لا تختلق المنصة تصريحات أو أرقامًا، وتترك مواضع المعلومات الناقصة واضحة لتستكملها بنفسك.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold text-teal-600">عن المنصة</span>
      <h1 className="mt-2 text-3xl font-bold leading-snug text-primary sm:text-4xl">كيف يعمل مختبر الإعلام الذكي؟</h1>
      <p className="mt-4 leading-8 text-muted-foreground">
        مختبر الإعلام الذكي منصة عربية تجمع أدوات العمل الإعلامي اليومي في مساحة واحدة، وتلتزم بالشفافية حول طريقة إنتاج كل نتيجة.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">الحالة الحالية:</span>
        <AiStatusPill />
      </div>

      <div className="mt-12 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-teal-700">
                <s.icon className="size-5" />
              </span>
              <h2 className="text-xl font-bold text-primary">{s.title}</h2>
            </div>
            <div className="mt-4 space-y-3 leading-8 text-foreground/85">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {s.items && (
              <ul className="mt-3 space-y-3">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-3 leading-8 text-foreground/85">
                    <span className="mt-3 size-1.5 shrink-0 rounded-full bg-teal-500" />
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="rounded-3xl bg-navy-900 p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <Server className="size-5 text-teal-300" />
            <h2 className="text-lg font-bold">لمشغّلي المنصة: تفعيل الذكاء الاصطناعي</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            أضف متغيرات البيئة التالية على الخادم ثم أعد التشغيل. التفاصيل الكاملة في ملف README.
          </p>
          <pre dir="ltr" className="mt-4 overflow-x-auto rounded-xl bg-black/30 p-4 text-left text-[13px] leading-6 text-teal-100">
{`AI_PROVIDER=anthropic   # or: openai
AI_API_KEY=sk-...
AI_MODEL=               # optional`}
          </pre>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Button asChild variant="accent" size="lg">
          <Link href="/tools">
            ابدأ التجربة
            <ArrowLeft />
          </Link>
        </Button>
      </div>
    </div>
  );
}
