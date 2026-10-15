import {
  Newspaper,
  PenLine,
  Clapperboard,
  GraduationCap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { ToolId } from "@/lib/ai/types";

export interface ToolMeta {
  id: ToolId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the tool's accent tile. */
  gradient: string;
  capabilities: string[];
}

export const TOOLS: ToolMeta[] = [
  {
    id: "newsroom",
    name: "غرفة الأخبار الذكية",
    shortName: "غرفة الأخبار",
    tagline: "من معلومات الحدث إلى مسودة خبر متكاملة",
    description:
      "أدخل عناصر الحدث الأساسية وحدد نوع الخبر والجمهور، لتحصل على مسودة بعنوان ومقدمة ومتن وفق بناء الهرم المقلوب، مع تنبيه فوري عند نقص المعلومات.",
    href: "/tools/newsroom",
    icon: Newspaper,
    gradient: "from-teal-400 to-cyan-500",
    capabilities: ["فحص العناصر الستة للخبر", "عنوان ومقدمة ومتن", "مواءمة الأسلوب مع الجمهور"],
  },
  {
    id: "editor",
    name: "المحرر الصحفي الذكي",
    shortName: "المحرر الصحفي",
    tagline: "صياغة أدق، نص أقصر، لغة أسلم",
    description:
      "أعد صياغة النصوص بالنبرة المناسبة، واختصرها دون الإخلال بالمعنى، ودقّقها لغويًا، واحصل على خمسة عناوين صحفية بديلة.",
    href: "/tools/editor",
    icon: PenLine,
    gradient: "from-sky-400 to-indigo-500",
    capabilities: ["إعادة الصياغة", "الاختصار", "التدقيق اللغوي", "خمسة عناوين بديلة"],
  },
  {
    id: "studio",
    name: "استوديو الإنتاج الإعلامي",
    shortName: "استوديو الإنتاج",
    tagline: "سيناريو مقسّم إلى مشاهد جاهز للتصوير",
    description:
      "أعدّ سيناريو الفيديو، وقسّمه إلى مشاهد بتوقيتات واضحة، مع اقتراح زوايا التصوير ونص تعليق صوتي عربي متناسق مع مدة كل مشهد.",
    href: "/tools/studio",
    icon: Clapperboard,
    gradient: "from-violet-400 to-fuchsia-500",
    capabilities: ["تقسيم المشاهد", "زوايا التصوير", "نص التعليق الصوتي"],
  },
  {
    id: "training",
    name: "مصمم البرامج التدريبية",
    shortName: "البرامج التدريبية",
    tagline: "برنامج تدريبي بأهداف ومخرجات قابلة للقياس",
    description:
      "أدخل بيانات الجهة والفئة المستهدفة ومستوى المتدربين واحتياجاتهم، لتحصل على برنامج متكامل بالأهداف والمحاور والأنشطة والمخرجات القابلة للقياس.",
    href: "/tools/training",
    icon: GraduationCap,
    gradient: "from-amber-400 to-orange-500",
    capabilities: ["أهداف سلوكية", "محاور وجدول زمني", "أنشطة تطبيقية", "مؤشرات قياس"],
  },
  {
    id: "ideas",
    name: "مختبر الأفكار الإعلامية",
    shortName: "مختبر الأفكار",
    tagline: "أفكار حملات ومحتوى مصنفة وجاهزة للتنفيذ",
    description:
      "احصل على أفكار مبتكرة للحملات الإعلامية والمحتوى الرقمي، مصنفة حسب المنصة والجمهور والغرض الاتصالي، مع صيغة التنفيذ المقترحة لكل فكرة.",
    href: "/tools/ideas",
    icon: Lightbulb,
    gradient: "from-emerald-400 to-teal-500",
    capabilities: ["تصنيف حسب المنصة", "مواءمة مع الجمهور", "ربط بالغرض الاتصالي"],
  },
];

export const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolMeta>;
