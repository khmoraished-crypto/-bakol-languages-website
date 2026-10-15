/** Lightweight Arabic text helpers used by the rule-based demo engines. */

export const AR_STOPWORDS = new Set(
  (
    "في من على إلى الى عن مع هذا هذه ذلك تلك التي الذي الذين اللذين اللتين هو هي هم هن نحن أنا أنت " +
    "كان كانت يكون تكون كما أن إن أنه أنها إنه إنها لا لم لن ما ماذا قد كل بعض بين خلال عند عندما " +
    "حيث حتى ثم أو او أم بل لكن لكنه غير سوى منذ نحو لدى لدي عبر ضمن وفق وفقا وفقًا أي أيضا أيضًا " +
    "وقد وفي ومن وعلى وإلى وعن ومع وهذا وهذه وذلك والتي والذي وهو وهي وكان وكانت وأن وإن ولا ولم " +
    "به بها له لها فيه فيها منه منها عليه عليها إليه إليها عنه عنها بعد قبل فوق تحت أكثر أقل جدا جدًا " +
    "يتم تم كذلك هناك هنا الآن اليوم وذلك بذلك لذلك فإن فقد بأن لأن ليس ليست"
  ).split(/\s+/)
);

export function normalizeSpaces(text: string) {
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function stripEndPunct(text: string) {
  return text.trim().replace(/[.。،,؛;:!؟?]+$/u, "").trim();
}

export function ensureEndPunct(text: string) {
  const t = text.trim();
  if (!t) return t;
  return /[.!؟?…»"]$/u.test(t) ? t : `${t}.`;
}

/** Split Arabic text into sentences while keeping their terminal punctuation. */
export function splitSentences(text: string): string[] {
  const cleaned = normalizeSpaces(text);
  const parts = cleaned.match(/[^.!؟?\n]+[.!؟?]*/gu) ?? [];
  return parts.map((s) => s.trim()).filter((s) => s.replace(/[.!؟?]/gu, "").trim().length > 1);
}

export function words(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function contentWords(text: string): string[] {
  return words(text).filter((w) => w.length > 2 && !AR_STOPWORDS.has(w));
}

/** Rough root-insensitive key: strips the definite article and common prefixes. */
export function stem(word: string) {
  return word.replace(/^(وال|بال|كال|فال|لل|ال|و|ب|ف)(?=\p{L}{3,})/u, "");
}

export function wordFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of contentWords(text)) {
    const k = stem(w);
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }
  return freq;
}

export function truncateWords(text: string, maxWords: number) {
  const ws = text.trim().split(/\s+/);
  if (ws.length <= maxWords) return text.trim();
  return `${ws.slice(0, maxWords).join(" ")}…`;
}

export function truncateChars(text: string, maxChars: number) {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** The most frequent adjacent pair of content words (a cheap "topic" detector). */
export function topPhrase(text: string): string | null {
  const ws = words(text);
  const counts = new Map<string, { n: number; phrase: string }>();
  for (let i = 0; i < ws.length - 1; i++) {
    const a = ws[i];
    const b = ws[i + 1];
    if (a.length < 3 || b.length < 3 || AR_STOPWORDS.has(a) || AR_STOPWORDS.has(b)) continue;
    const key = `${stem(a)} ${stem(b)}`;
    const entry = counts.get(key) ?? { n: 0, phrase: `${a} ${b}` };
    entry.n += 1;
    counts.set(key, entry);
  }
  let best: { n: number; phrase: string } | null = null;
  for (const v of counts.values()) if (!best || v.n > best.n) best = v;
  return best?.phrase ?? null;
}

export function wordCount(text: string) {
  return words(text).length;
}

/** Remove leading connective phrases the user may have typed (e.g. "بهدف"). */
export function stripLeading(text: string, prefixes: string[]) {
  let t = text.trim();
  for (const p of prefixes) {
    if (t.startsWith(p)) {
      t = t.slice(p.length).trim();
      break;
    }
  }
  return t;
}

export function formatTimecode(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function pick<T>(list: readonly T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length];
}

/** Arabic count phrase: arCount(3, ["ساعة","ساعتان","ساعات","ساعة"]) → "3 ساعات". */
export function arCount(n: number, [one, two, few, many]: [string, string, string, string]) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

export const HOURS: [string, string, string, string] = ["ساعة واحدة", "ساعتان", "ساعات", "ساعة"];
export const DAYS: [string, string, string, string] = ["يوم واحد", "يومان", "أيام", "يومًا"];
