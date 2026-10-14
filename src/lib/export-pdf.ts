"use client";

import type { GenerationMode, ResultDocument } from "@/lib/ai/types";
import { safeFilename } from "@/lib/clipboard";

/**
 * Arabic-safe PDF export.
 * The document is laid out as real DOM (so the browser handles Arabic shaping & RTL),
 * rasterised with html2canvas, then paginated on block boundaries into an A4 PDF.
 */

const PAGE_W = 794; // A4 width in CSS px @96dpi
const PAGE_H = 1123; // A4 height in CSS px @96dpi
const MARGIN_Y = 48;
const CONTENT_H = PAGE_H - MARGIN_Y * 2;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function buildMarkup(doc: ResultDocument, meta: { toolName: string; mode: GenerationMode; date: string }) {
  const notice =
    meta.mode === "demo"
      ? "نتيجة تجريبية مُعدّة بقوالب وقواعد ثابتة — ليست مولّدة بالذكاء الاصطناعي."
      : "مسودة مولّدة بالذكاء الاصطناعي — تخضع للمراجعة التحريرية.";

  const sections = doc.sections
    .map((s) => {
      const paragraphs = (s.body ?? "")
        .split(/\n{2,}|\n/)
        .filter((p) => p.trim())
        .map((p) => `<p data-block style="margin:0 0 10px;font-size:14.5px;line-height:2;color:#1f2a4a;">${esc(p)}</p>`)
        .join("");
      const items = (s.items ?? [])
        .map(
          (i) =>
            `<div data-block style="display:flex;gap:10px;margin:0 0 8px;font-size:14px;line-height:1.9;color:#1f2a4a;"><span style="flex:none;margin-top:11px;width:6px;height:6px;border-radius:9px;background:#14b8a6;"></span><span>${esc(i)}</span></div>`
        )
        .join("");
      return `<div data-block style="margin:22px 0 10px;padding-bottom:8px;border-bottom:1px solid #e3e8f2;font-size:16px;font-weight:700;color:#0b1a45;">${esc(s.heading)}</div>${paragraphs}${items}`;
    })
    .join("");

  return `
  <div data-block style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-radius:16px;background:linear-gradient(120deg,#0b1a45,#13306e);color:#fff;">
    <div style="font-size:15px;font-weight:700;">مختبر الإعلام الذكي</div>
    <div style="font-size:12px;opacity:.8;direction:ltr;">AI Media Lab</div>
  </div>
  <div data-block style="margin-top:26px;font-size:12px;color:#0f766e;font-weight:600;">${esc(meta.toolName)} · ${esc(meta.date)}</div>
  <div data-block style="margin-top:6px;font-size:24px;line-height:1.6;font-weight:700;color:#0b1a45;">${esc(doc.title)}</div>
  ${doc.subtitle ? `<div data-block style="margin-top:2px;font-size:14px;color:#5b6787;">${esc(doc.subtitle)}</div>` : ""}
  <div data-block style="margin-top:14px;padding:10px 14px;border-radius:12px;background:${meta.mode === "demo" ? "#fff7e6" : "#e6faf7"};color:${meta.mode === "demo" ? "#92400e" : "#0f766e"};font-size:12.5px;line-height:1.8;">${notice}</div>
  ${sections}`;
}

export async function exportDocumentToPdf(
  doc: ResultDocument,
  meta: { toolName: string; mode: GenerationMode }
) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

  const date = new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(new Date());
  const host = document.createElement("div");
  host.setAttribute("dir", "rtl");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    top: "0",
    left: "-12000px",
    width: `${PAGE_W}px`,
    padding: "0 56px",
    boxSizing: "border-box",
    background: "#ffffff",
    fontFamily: '"IBM Plex Sans Arabic", system-ui, sans-serif',
    textAlign: "right",
  } satisfies Partial<CSSStyleDeclaration>);
  host.innerHTML = buildMarkup(doc, { ...meta, date });
  document.body.appendChild(host);

  try {
    await document.fonts?.ready;

    // Compute page breaks on block boundaries.
    const hostTop = host.getBoundingClientRect().top;
    const blocks = Array.from(host.querySelectorAll<HTMLElement>("[data-block]")).map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - hostTop, bottom: r.bottom - hostTop };
    });
    const totalH = host.scrollHeight;
    const breaks: number[] = [0];
    let pageStart = 0;
    for (const b of blocks) {
      while (b.bottom - pageStart > CONTENT_H) {
        // Break before the block if it fits on a page; otherwise hard-slice it.
        const next = b.top > pageStart && b.bottom - b.top <= CONTENT_H ? b.top - 4 : pageStart + CONTENT_H;
        breaks.push(next);
        pageStart = next;
      }
    }
    breaks.push(totalH);

    const scale = 2;
    const canvas = await html2canvas(host, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: PAGE_W,
    });

    const pdf = new jsPDF({ unit: "px", format: [PAGE_W, PAGE_H], orientation: "portrait", hotfixes: ["px_scaling"] });
    const pages = breaks.length - 1;

    for (let i = 0; i < pages; i++) {
      const start = breaks[i];
      const end = breaks[i + 1];
      const sliceH = Math.max(1, end - start);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.ceil(sliceH * scale);
      const ctx = pageCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, Math.floor(start * scale), canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);

      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "portrait");
      pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, MARGIN_Y, PAGE_W, sliceH);

      pdf.setFontSize(9);
      pdf.setTextColor(140, 150, 175);
      pdf.text(`${i + 1} / ${pages}`, 56, PAGE_H - 22);
      pdf.text("AI Media Lab", PAGE_W - 56, PAGE_H - 22, { align: "right" });
    }

    pdf.setProperties({ title: doc.title, creator: "AI Media Lab" });
    pdf.save(`${safeFilename(doc.title)}.pdf`);
  } finally {
    host.remove();
  }
}
