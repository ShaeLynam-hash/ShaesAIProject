"use client";
import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Type, Image, Minus, Square, AlignLeft, AlignCenter, AlignRight,
  Trash2, ChevronUp, ChevronDown, Plus, Eye, Code, Download, Send,
  Copy, Palette, Link as LinkIcon
} from "lucide-react";

// ─── Block types ────────────────────────────────────────────────────────────

type BlockType = "text" | "heading" | "image" | "button" | "divider" | "spacer" | "columns" | "html";

interface BaseBlock {
  id: string;
  type: BlockType;
}
interface TextBlock extends BaseBlock { type: "text"; text: string; align: "left" | "center" | "right"; fontSize: number; color: string; }
interface HeadingBlock extends BaseBlock { type: "heading"; text: string; level: 1 | 2 | 3; align: "left" | "center" | "right"; color: string; }
interface ImageBlock extends BaseBlock { type: "image"; src: string; alt: string; width: number; link?: string; }
interface ButtonBlock extends BaseBlock { type: "button"; text: string; href: string; bgColor: string; textColor: string; align: "left" | "center" | "right"; }
interface DividerBlock extends BaseBlock { type: "divider"; color: string; }
interface SpacerBlock extends BaseBlock { type: "spacer"; height: number; }
interface ColumnsBlock extends BaseBlock { type: "columns"; left: string; right: string; }
interface HtmlBlock extends BaseBlock { type: "html"; code: string; }

type Block = TextBlock | HeadingBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock | ColumnsBlock | HtmlBlock;

// ─── HTML generation ────────────────────────────────────────────────────────

function blockToHtml(block: Block): string {
  switch (block.type) {
    case "heading": {
      const sizes: Record<number, string> = { 1: "28px", 2: "22px", 3: "18px" };
      return `<h${block.level} style="font-family:sans-serif;margin:0 0 16px;font-size:${sizes[block.level]};color:${block.color};text-align:${block.align};">${block.text}</h${block.level}>`;
    }
    case "text":
      return `<p style="font-family:sans-serif;margin:0 0 16px;font-size:${block.fontSize}px;color:${block.color};text-align:${block.align};line-height:1.6;">${block.text.replace(/\n/g, "<br>")}</p>`;
    case "image": {
      const img = `<img src="${block.src}" alt="${block.alt}" style="max-width:100%;width:${block.width}%;display:block;margin:0 auto 16px;" />`;
      return block.link ? `<a href="${block.link}">${img}</a>` : img;
    }
    case "button":
      return `<div style="text-align:${block.align};margin:0 0 16px;"><a href="${block.href}" style="display:inline-block;padding:12px 28px;background:${block.bgColor};color:${block.textColor};text-decoration:none;border-radius:6px;font-family:sans-serif;font-weight:600;font-size:15px;">${block.text}</a></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${block.color};margin:16px 0;" />`;
    case "spacer":
      return `<div style="height:${block.height}px;"></div>`;
    case "columns":
      return `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tr><td style="width:50%;padding-right:12px;vertical-align:top;">${block.left}</td><td style="width:50%;padding-left:12px;vertical-align:top;">${block.right}</td></tr></table>`;
    case "html":
      return block.code;
    default:
      return "";
  }
}

function generateEmailHtml(blocks: Block[], subject: string, bgColor: string, contentBg: string): string {
  const body = blocks.map(blockToHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:${bgColor};font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${contentBg};border-radius:12px;overflow:hidden;">
      <tr><td style="padding:32px 40px;">
        ${body}
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

function newBlock(type: BlockType): Block {
  const id = Math.random().toString(36).slice(2);
  switch (type) {
    case "heading":    return { id, type, text: "Your Heading Here", level: 2, align: "left", color: "#111111" };
    case "text":       return { id, type, text: "Your content goes here. Write something compelling!", align: "left", fontSize: 15, color: "#555555" };
    case "image":      return { id, type, src: "https://via.placeholder.com/600x300", alt: "Image", width: 100 };
    case "button":     return { id, type, text: "Click Here", href: "https://", bgColor: "#F59E0B", textColor: "#ffffff", align: "center" };
    case "divider":    return { id, type, color: "#e5e7eb" };
    case "spacer":     return { id, type, height: 24 };
    case "columns":    return { id, type, left: "<p>Left column content</p>", right: "<p>Right column content</p>" };
    case "html":       return { id, type, code: "<!-- Custom HTML -->" };
  }
}

const BLOCK_PALETTE: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "heading",  icon: Type,      label: "Heading" },
  { type: "text",     icon: AlignLeft, label: "Text" },
  { type: "image",    icon: Image,     label: "Image" },
  { type: "button",   icon: Square,    label: "Button" },
  { type: "divider",  icon: Minus,     label: "Divider" },
  { type: "spacer",   icon: ChevronDown, label: "Spacer" },
  { type: "columns",  icon: Copy,      label: "Columns" },
  { type: "html",     icon: Code,      label: "HTML" },
];

// ─── BlockEditor ────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const inp = (key: string, value: unknown) => onChange({ ...block, [key]: value } as Block);

  const label = (text: string) => (
    <label style={{ display: "block", fontSize: 11, color: "var(--obs-muted)", marginBottom: 4, fontWeight: 600 }}>{text}</label>
  );
  const input = (key: string, val: string | number, type = "text") => (
    <input type={type} value={val as string} onChange={e => inp(key, type === "number" ? Number(e.target.value) : e.target.value)}
      className="w-full px-2 py-1.5 rounded border text-xs mb-3"
      style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
  );
  const alignButtons = (key: string, val: string) => (
    <div className="flex gap-1 mb-3">
      {(["left", "center", "right"] as const).map(a => {
        const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
        return <button key={a} onClick={() => inp(key, a)} className="p-1.5 rounded" style={{ background: val === a ? "var(--obs-accent)" : "var(--obs-elevated)", color: val === a ? "#fff" : "var(--obs-muted)" }}><Icon size={13} /></button>;
      })}
    </div>
  );

  if (block.type === "heading") return (
    <div>{label("Text")}{input("text", block.text)}{label("Level")}
      <div className="flex gap-1 mb-3">{([1, 2, 3] as const).map(l => <button key={l} onClick={() => inp("level", l)} className="px-3 py-1 rounded text-xs font-bold" style={{ background: block.level === l ? "var(--obs-accent)" : "var(--obs-elevated)", color: block.level === l ? "#fff" : "var(--obs-muted)" }}>H{l}</button>)}</div>
      {label("Align")}{alignButtons("align", block.align)}
      {label("Color")}<div className="flex gap-2 mb-3"><input type="color" value={block.color} onChange={e => inp("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={block.color} onChange={e => inp("color", e.target.value)} className="flex-1 px-2 py-1 rounded border text-xs font-mono" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div>
    </div>
  );

  if (block.type === "text") return (
    <div>
      {label("Content")}
      <textarea value={block.text} onChange={e => inp("text", e.target.value)} rows={5} className="w-full px-2 py-1.5 rounded border text-xs mb-3 resize-y" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
      {label("Font Size")}{input("fontSize", block.fontSize, "number")}
      {label("Align")}{alignButtons("align", block.align)}
      {label("Color")}<div className="flex gap-2 mb-3"><input type="color" value={block.color} onChange={e => inp("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={block.color} onChange={e => inp("color", e.target.value)} className="flex-1 px-2 py-1 rounded border text-xs font-mono" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div>
    </div>
  );

  if (block.type === "image") return (
    <div>{label("Image URL")}{input("src", block.src)}{label("Alt Text")}{input("alt", block.alt)}{label("Width %")}{input("width", block.width, "number")}{label("Link (optional)")}{input("link", block.link ?? "")}</div>
  );

  if (block.type === "button") return (
    <div>
      {label("Button Text")}{input("text", block.text)}
      {label("Link URL")}{input("href", block.href)}
      {label("Align")}{alignButtons("align", block.align)}
      {label("Background Color")}<div className="flex gap-2 mb-3"><input type="color" value={block.bgColor} onChange={e => inp("bgColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={block.bgColor} onChange={e => inp("bgColor", e.target.value)} className="flex-1 px-2 py-1 rounded border text-xs font-mono" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div>
      {label("Text Color")}<div className="flex gap-2 mb-3"><input type="color" value={block.textColor} onChange={e => inp("textColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={block.textColor} onChange={e => inp("textColor", e.target.value)} className="flex-1 px-2 py-1 rounded border text-xs font-mono" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div>
    </div>
  );

  if (block.type === "divider") return (
    <div>{label("Color")}<div className="flex gap-2 mb-3"><input type="color" value={block.color} onChange={e => inp("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={block.color} onChange={e => inp("color", e.target.value)} className="flex-1 px-2 py-1 rounded border text-xs font-mono" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div></div>
  );

  if (block.type === "spacer") return (
    <div>{label("Height (px)")}{input("height", block.height, "number")}</div>
  );

  if (block.type === "columns") return (
    <div>
      {label("Left Column HTML")}<textarea value={block.left} onChange={e => inp("left", e.target.value)} rows={4} className="w-full px-2 py-1.5 rounded border text-xs mb-3 font-mono resize-y" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
      {label("Right Column HTML")}<textarea value={block.right} onChange={e => inp("right", e.target.value)} rows={4} className="w-full px-2 py-1.5 rounded border text-xs mb-3 font-mono resize-y" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
    </div>
  );

  if (block.type === "html") return (
    <div>{label("HTML Code")}<textarea value={block.code} onChange={e => inp("code", e.target.value)} rows={8} className="w-full px-2 py-1.5 rounded border text-xs mb-3 font-mono resize-y" style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} /></div>
  );

  return null;
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function EmailBuilderPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "heading", text: "Hello {{first_name}}! 👋", level: 1, align: "center", color: "#111111" },
    { id: "2", type: "text", text: "We have some exciting news to share with you. Keep reading to learn more about what we've been working on.", align: "left", fontSize: 15, color: "#555555" },
    { id: "3", type: "button", text: "Learn More", href: "https://", bgColor: "#F59E0B", textColor: "#ffffff", align: "center" },
    { id: "4", type: "divider", color: "#e5e7eb" },
    { id: "5", type: "text", text: "Thanks for being a valued subscriber.\n\n— The Team", align: "left", fontSize: 14, color: "#888888" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("Your email subject here");
  const [bgColor, setBgColor] = useState("#f3f4f6");
  const [contentBg, setContentBg] = useState("#ffffff");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [sendTo, setSendTo] = useState("");
  const [sending, setSending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const dragIdx = useRef<number | null>(null);

  const selected = blocks.find(b => b.id === selectedId) ?? null;

  const updateBlock = useCallback((updated: Block) => {
    setBlocks(bs => bs.map(b => b.id === updated.id ? updated : b));
  }, []);

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const b = [...blocks];
    [b[idx], b[next]] = [b[next], b[idx]];
    setBlocks(b);
  };

  const removeBlock = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addBlock = (type: BlockType) => {
    const b = newBlock(type);
    setBlocks(bs => [...bs, b]);
    setSelectedId(b.id);
  };

  const html = generateEmailHtml(blocks, subject, bgColor, contentBg);

  const downloadHtml = () => {
    const a = document.createElement("a");
    a.href = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    a.download = "email.html";
    a.click();
  };

  const sendTest = async () => {
    if (!sendTo) return;
    setSending(true);
    await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, to: sendTo, subject, html }),
    });
    setSending(false);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  // Drag reorder
  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDrop = (idx: number) => {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const b = [...blocks];
    const [moved] = b.splice(dragIdx.current, 1);
    b.splice(idx, 0, moved);
    setBlocks(b);
    dragIdx.current = null;
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line…"
          className="flex-1 px-3 py-1.5 rounded-lg border text-sm bg-transparent"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-text)", minWidth: 0 }} />

        {/* BG colors */}
        <div className="flex items-center gap-1.5">
          <Palette size={13} style={{ color: "var(--obs-muted)" }} />
          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" title="Email BG" />
          <input type="color" value={contentBg} onChange={e => setContentBg(e.target.value)} className="w-7 h-7 rounded cursor-pointer" title="Content BG" />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--obs-border)" }}>
          {(["edit", "preview", "code"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} className="px-3 py-1.5 text-xs font-medium capitalize"
              style={{ background: viewMode === v ? "var(--obs-accent)" : "var(--obs-elevated)", color: viewMode === v ? "#fff" : "var(--obs-muted)" }}>
              {v}
            </button>
          ))}
        </div>

        <button onClick={downloadHtml} className="p-2 rounded-lg" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }} title="Download HTML">
          <Download size={14} />
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Block palette */}
        <div className="flex flex-col gap-1 p-3 border-r flex-shrink-0" style={{ width: 100, borderColor: "var(--obs-border)", background: "var(--obs-surface)", overflowY: "auto" }}>
          <p className="text-xs font-semibold mb-1 px-1" style={{ color: "var(--obs-muted)" }}>BLOCKS</p>
          {BLOCK_PALETTE.map(({ type, icon: Icon, label }) => (
            <button key={type} onClick={() => addBlock(type)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-colors hover:bg-opacity-50"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
              <Icon size={16} />
              <span style={{ fontSize: 10 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto p-6" style={{ background: bgColor }}>
          {viewMode === "edit" && (
            <div style={{ maxWidth: 600, margin: "0 auto", background: contentBg, borderRadius: 12, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              {blocks.map((block, idx) => (
                <div key={block.id} draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(idx)}
                  onClick={() => setSelectedId(block.id)}
                  className="group relative cursor-pointer rounded transition-all"
                  style={{ outline: selectedId === block.id ? `2px solid var(--obs-accent)` : "2px solid transparent", marginBottom: 4 }}>
                  {/* Block controls */}
                  <div className="absolute -right-10 top-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} className="p-1 rounded text-white" style={{ background: "var(--obs-muted)", fontSize: 10 }}><ChevronUp size={11} /></button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(idx, 1); }} className="p-1 rounded text-white" style={{ background: "var(--obs-muted)", fontSize: 10 }}><ChevronDown size={11} /></button>
                    <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 rounded" style={{ background: "var(--obs-danger)", color: "#fff", fontSize: 10 }}><Trash2 size={11} /></button>
                  </div>

                  {/* Rendered preview */}
                  <div dangerouslySetInnerHTML={{ __html: blockToHtml(block) }} />
                </div>
              ))}

              {blocks.length === 0 && (
                <div className="text-center py-16" style={{ color: "#ccc", fontSize: 14 }}>
                  Click a block in the left panel to add it
                </div>
              )}
            </div>
          )}

          {viewMode === "preview" && (
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <iframe srcDoc={html} style={{ width: "100%", height: "calc(100vh - 180px)", border: "none", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} />
            </div>
          )}

          {viewMode === "code" && (
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <pre className="rounded-xl p-4 text-xs overflow-auto" style={{ background: "#0d0d10", color: "#e5e7eb", maxHeight: "calc(100vh - 180px)", fontFamily: "monospace" }}>
                {html}
              </pre>
              <button onClick={() => navigator.clipboard.writeText(html)} className="mt-3 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--obs-accent)", color: "#fff" }}>
                Copy HTML
              </button>
            </div>
          )}
        </div>

        {/* Right: Property panel */}
        <div className="flex-shrink-0 border-l overflow-y-auto" style={{ width: 240, borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
          {selected ? (
            <div className="p-3">
              <p className="text-xs font-semibold uppercase mb-3" style={{ color: "var(--obs-muted)" }}>{selected.type}</p>
              <BlockEditor block={selected} onChange={updateBlock} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--obs-muted)" }}>SEND TEST EMAIL</p>
                <input value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="test@example.com" type="email"
                  className="w-full px-2 py-1.5 rounded border text-xs mb-2"
                  style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                <button onClick={sendTest} disabled={sending || !sendTo}
                  className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                  style={{ background: "var(--obs-accent)", color: "#fff", opacity: sending || !sendTo ? 0.6 : 1 }}>
                  <Send size={11} /> {sending ? "Sending…" : saveStatus === "saved" ? "Sent!" : "Send Test"}
                </button>
              </div>
              <div style={{ borderTop: "1px solid var(--obs-border)", paddingTop: 16 }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--obs-muted)" }}>PERSONALIZATION</p>
                {["{{first_name}}", "{{last_name}}", "{{email}}"].map(t => (
                  <button key={t} onClick={() => navigator.clipboard.writeText(t)}
                    className="block w-full text-left px-2 py-1.5 rounded mb-1 text-xs font-mono"
                    style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Click a block to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
