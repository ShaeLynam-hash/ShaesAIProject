"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Globe, Plus, Trash2, Eye, ExternalLink, ChevronUp, ChevronDown, X, ToggleLeft, ToggleRight, BarChart2, Users } from "lucide-react";

type BlockType = "hero" | "features" | "text" | "image" | "cta" | "form" | "testimonials" | "pricing" | "faq" | "video" | "spacer" | "divider";
interface Block { id: string; type: BlockType; data: Record<string, unknown>; }
interface PageMeta { id: string; name: string; slug: string; published: boolean; viewCount: number; leadCount: number; updatedAt: string; }
interface Page extends PageMeta { blocks: Block[]; seoTitle?: string; seoDesc?: string; customCss?: string; }

const BLOCK_TYPES: { type: BlockType; label: string; emoji: string }[] = [
  { type: "hero",         label: "Hero",         emoji: "🏠" },
  { type: "features",     label: "Features",     emoji: "⚡" },
  { type: "text",         label: "Text",         emoji: "📝" },
  { type: "image",        label: "Image",        emoji: "🖼️" },
  { type: "cta",          label: "CTA",          emoji: "🎯" },
  { type: "form",         label: "Form",         emoji: "📋" },
  { type: "testimonials", label: "Testimonials", emoji: "💬" },
  { type: "pricing",      label: "Pricing",      emoji: "💰" },
  { type: "faq",          label: "FAQ",          emoji: "❓" },
  { type: "video",        label: "Video",        emoji: "🎬" },
  { type: "spacer",       label: "Spacer",       emoji: "↕️" },
  { type: "divider",      label: "Divider",      emoji: "─" },
];

const DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  hero:         { headline: "Your Headline Here", subheadline: "A compelling subheadline that converts.", ctaText: "Get Started", ctaUrl: "#", bgColor: "#1a1a2e" },
  features:     { heading: "Features", items: [{ icon: "⚡", title: "Fast", desc: "Lightning fast performance" }, { icon: "🔒", title: "Secure", desc: "Enterprise security" }, { icon: "📊", title: "Analytics", desc: "Deep insights" }] },
  text:         { content: "Your content here. Click to edit." },
  image:        { src: "", alt: "", caption: "" },
  cta:          { headline: "Ready to get started?", ctaText: "Start Free Trial", ctaUrl: "#", bgColor: "#6366F1" },
  form:         { heading: "Get in Touch", fields: ["name", "email"], submitText: "Submit" },
  testimonials: { heading: "What Customers Say", items: [{ name: "Jane Smith", role: "CEO, Acme Corp", quote: "This product completely transformed how we work." }, { name: "John Doe", role: "Founder, TechCo", quote: "Best decision we made for our business." }] },
  pricing:      { heading: "Simple Pricing", tiers: [{ name: "Starter", price: "$29", features: ["Feature 1", "Feature 2", "Feature 3"], cta: "Get Started", highlighted: false }, { name: "Pro", price: "$79", features: ["Everything in Starter", "Feature 4", "Feature 5", "Priority Support"], cta: "Start Pro", highlighted: true }] },
  faq:          { heading: "Frequently Asked Questions", items: [{ q: "How do I get started?", a: "Simply sign up and follow the onboarding wizard." }, { q: "Is there a free trial?", a: "Yes, we offer a 14-day free trial with no credit card required." }] },
  video:        { url: "", caption: "" },
  spacer:       { height: 40 },
  divider:      {},
};

function newBlock(type: BlockType): Block {
  return { id: crypto.randomUUID(), type, data: { ...DEFAULTS[type] } };
}

// ─── Block Property Editors ────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}
const inp = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--obs-border)", background: "var(--obs-bg)", color: "var(--obs-text)", fontSize: 13, boxSizing: "border-box" as const };
const textareaStyle = { ...inp, resize: "vertical" as const, minHeight: 80 };

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = (key: string, val: unknown) => onChange({ ...block, data: { ...block.data, [key]: val } });
  const d = block.data;

  if (block.type === "hero") return (
    <div>
      <Field label="Headline"><input style={inp} value={String(d.headline ?? "")} onChange={e => set("headline", e.target.value)} /></Field>
      <Field label="Subheadline"><textarea style={textareaStyle} value={String(d.subheadline ?? "")} onChange={e => set("subheadline", e.target.value)} /></Field>
      <Field label="CTA Text"><input style={inp} value={String(d.ctaText ?? "")} onChange={e => set("ctaText", e.target.value)} /></Field>
      <Field label="CTA URL"><input style={inp} value={String(d.ctaUrl ?? "")} onChange={e => set("ctaUrl", e.target.value)} /></Field>
      <Field label="Background Color">
        <div style={{ display: "flex", gap: 8 }}>
          <input type="color" value={String(d.bgColor ?? "#1a1a2e")} onChange={e => set("bgColor", e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, cursor: "pointer", border: "1px solid var(--obs-border)" }} />
          <input style={{ ...inp, flex: 1, fontFamily: "monospace" }} value={String(d.bgColor ?? "")} onChange={e => set("bgColor", e.target.value)} />
        </div>
      </Field>
      <Field label="BG Image URL"><input style={inp} value={String(d.bgImageUrl ?? "")} onChange={e => set("bgImageUrl", e.target.value)} placeholder="https://…" /></Field>
    </div>
  );

  if (block.type === "text") return (
    <Field label="Content"><textarea style={{ ...textareaStyle, minHeight: 160 }} value={String(d.content ?? "")} onChange={e => set("content", e.target.value)} /></Field>
  );

  if (block.type === "image") return (
    <div>
      <Field label="Image URL"><input style={inp} value={String(d.src ?? "")} onChange={e => set("src", e.target.value)} placeholder="https://…" /></Field>
      <Field label="Alt Text"><input style={inp} value={String(d.alt ?? "")} onChange={e => set("alt", e.target.value)} /></Field>
      <Field label="Caption"><input style={inp} value={String(d.caption ?? "")} onChange={e => set("caption", e.target.value)} /></Field>
    </div>
  );

  if (block.type === "cta") return (
    <div>
      <Field label="Headline"><input style={inp} value={String(d.headline ?? "")} onChange={e => set("headline", e.target.value)} /></Field>
      <Field label="Button Text"><input style={inp} value={String(d.ctaText ?? "")} onChange={e => set("ctaText", e.target.value)} /></Field>
      <Field label="Button URL"><input style={inp} value={String(d.ctaUrl ?? "")} onChange={e => set("ctaUrl", e.target.value)} /></Field>
      <Field label="Background Color">
        <div style={{ display: "flex", gap: 8 }}>
          <input type="color" value={String(d.bgColor ?? "#6366F1")} onChange={e => set("bgColor", e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, cursor: "pointer", border: "1px solid var(--obs-border)" }} />
          <input style={{ ...inp, flex: 1, fontFamily: "monospace" }} value={String(d.bgColor ?? "")} onChange={e => set("bgColor", e.target.value)} />
        </div>
      </Field>
    </div>
  );

  if (block.type === "features") {
    const items = (d.items as Array<{ icon: string; title: string; desc: string }>) ?? [];
    return (
      <div>
        <Field label="Heading"><input style={inp} value={String(d.heading ?? "")} onChange={e => set("heading", e.target.value)} /></Field>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: "1px solid var(--obs-border)", background: "var(--obs-elevated)" }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Emoji icon" value={item.icon} onChange={e => { const n = [...items]; n[i] = { ...n[i], icon: e.target.value }; set("items", n); }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Title" value={item.title} onChange={e => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; set("items", n); }} />
            <input style={inp} placeholder="Description" value={item.desc} onChange={e => { const n = [...items]; n[i] = { ...n[i], desc: e.target.value }; set("items", n); }} />
            <button onClick={() => set("items", items.filter((_, j) => j !== i))} style={{ marginTop: 6, fontSize: 11, color: "var(--obs-danger)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
          </div>
        ))}
        <button onClick={() => set("items", [...items, { icon: "✨", title: "Feature", desc: "Description" }])} style={{ fontSize: 12, color: "var(--obs-accent)", background: "none", border: "none", cursor: "pointer" }}>+ Add Feature</button>
      </div>
    );
  }

  if (block.type === "form") {
    const fields = (d.fields as string[]) ?? [];
    return (
      <div>
        <Field label="Heading"><input style={inp} value={String(d.heading ?? "")} onChange={e => set("heading", e.target.value)} /></Field>
        <Field label="Fields">
          {["name", "email", "phone"].map(f => (
            <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--obs-text)", cursor: "pointer" }}>
              <input type="checkbox" checked={fields.includes(f)} onChange={e => set("fields", e.target.checked ? [...fields, f] : fields.filter(x => x !== f))} />
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </label>
          ))}
        </Field>
        <Field label="Submit Button Text"><input style={inp} value={String(d.submitText ?? "")} onChange={e => set("submitText", e.target.value)} /></Field>
      </div>
    );
  }

  if (block.type === "faq") {
    const items = (d.items as Array<{ q: string; a: string }>) ?? [];
    return (
      <div>
        <Field label="Heading"><input style={inp} value={String(d.heading ?? "")} onChange={e => set("heading", e.target.value)} /></Field>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: "1px solid var(--obs-border)", background: "var(--obs-elevated)" }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Question" value={item.q} onChange={e => { const n = [...items]; n[i] = { ...n[i], q: e.target.value }; set("items", n); }} />
            <textarea style={textareaStyle} placeholder="Answer" value={item.a} onChange={e => { const n = [...items]; n[i] = { ...n[i], a: e.target.value }; set("items", n); }} />
            <button onClick={() => set("items", items.filter((_, j) => j !== i))} style={{ marginTop: 6, fontSize: 11, color: "var(--obs-danger)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
          </div>
        ))}
        <button onClick={() => set("items", [...items, { q: "Question?", a: "Answer." }])} style={{ fontSize: 12, color: "var(--obs-accent)", background: "none", border: "none", cursor: "pointer" }}>+ Add FAQ</button>
      </div>
    );
  }

  if (block.type === "video") return (
    <div>
      <Field label="Video URL (YouTube or Vimeo)"><input style={inp} value={String(d.url ?? "")} onChange={e => set("url", e.target.value)} placeholder="https://youtube.com/watch?v=…" /></Field>
      <Field label="Caption"><input style={inp} value={String(d.caption ?? "")} onChange={e => set("caption", e.target.value)} /></Field>
    </div>
  );

  if (block.type === "spacer") return (
    <Field label="Height (px)"><input type="number" style={inp} value={Number(d.height ?? 40)} onChange={e => set("height", Number(e.target.value))} /></Field>
  );

  if (block.type === "testimonials") {
    const items = (d.items as Array<{ name: string; role: string; quote: string }>) ?? [];
    return (
      <div>
        <Field label="Heading"><input style={inp} value={String(d.heading ?? "")} onChange={e => set("heading", e.target.value)} /></Field>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: "1px solid var(--obs-border)", background: "var(--obs-elevated)" }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Name" value={item.name} onChange={e => { const n = [...items]; n[i] = { ...n[i], name: e.target.value }; set("items", n); }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Role / Company" value={item.role} onChange={e => { const n = [...items]; n[i] = { ...n[i], role: e.target.value }; set("items", n); }} />
            <textarea style={textareaStyle} placeholder="Quote" value={item.quote} onChange={e => { const n = [...items]; n[i] = { ...n[i], quote: e.target.value }; set("items", n); }} />
            <button onClick={() => set("items", items.filter((_, j) => j !== i))} style={{ marginTop: 6, fontSize: 11, color: "var(--obs-danger)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
          </div>
        ))}
        <button onClick={() => set("items", [...items, { name: "Name", role: "Role", quote: "Great product!" }])} style={{ fontSize: 12, color: "var(--obs-accent)", background: "none", border: "none", cursor: "pointer" }}>+ Add Testimonial</button>
      </div>
    );
  }

  if (block.type === "pricing") {
    const tiers = (d.tiers as Array<{ name: string; price: string; features: string[]; cta: string; highlighted?: boolean }>) ?? [];
    return (
      <div>
        <Field label="Heading"><input style={inp} value={String(d.heading ?? "")} onChange={e => set("heading", e.target.value)} /></Field>
        {tiers.map((tier, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: `1px solid ${tier.highlighted ? "var(--obs-accent)" : "var(--obs-border)"}`, background: "var(--obs-elevated)" }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Tier Name" value={tier.name} onChange={e => { const n = [...tiers]; n[i] = { ...n[i], name: e.target.value }; set("tiers", n); }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Price (e.g. $29)" value={tier.price} onChange={e => { const n = [...tiers]; n[i] = { ...n[i], price: e.target.value }; set("tiers", n); }} />
            <textarea style={{ ...textareaStyle, marginBottom: 6 }} placeholder="Features (one per line)" value={tier.features.join("\n")} onChange={e => { const n = [...tiers]; n[i] = { ...n[i], features: e.target.value.split("\n") }; set("tiers", n); }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="CTA Button Text" value={tier.cta} onChange={e => { const n = [...tiers]; n[i] = { ...n[i], cta: e.target.value }; set("tiers", n); }} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--obs-text)", cursor: "pointer" }}>
              <input type="checkbox" checked={!!tier.highlighted} onChange={e => { const n = [...tiers]; n[i] = { ...n[i], highlighted: e.target.checked }; set("tiers", n); }} /> Highlight this tier
            </label>
          </div>
        ))}
        <button onClick={() => set("tiers", [...tiers, { name: "Tier", price: "$0", features: ["Feature"], cta: "Get Started", highlighted: false }])} style={{ fontSize: 12, color: "var(--obs-accent)", background: "none", border: "none", cursor: "pointer" }}>+ Add Tier</button>
      </div>
    );
  }

  return <p style={{ fontSize: 13, color: "var(--obs-muted)" }}>No properties for this block.</p>;
}

// ─── Canvas Block Preview ──────────────────────────────────────────────────

function BlockPreview({ block }: { block: Block }) {
  const d = block.data;
  const acc = "var(--obs-accent)";
  switch (block.type) {
    case "hero": return (
      <div style={{ padding: "32px 24px", background: String(d.bgColor ?? "#1a1a2e"), color: "#fff", textAlign: "center", borderRadius: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{String(d.headline ?? "")}</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 16 }}>{String(d.subheadline ?? "")}</div>
        {!!d.ctaText && <div style={{ display: "inline-block", padding: "8px 20px", background: "#F59E0B", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "#fff" }}>{String(d.ctaText)}</div>}
      </div>
    );
    case "features": {
      const items = (d.items as Array<{ icon: string; title: string }>) ?? [];
      return (
        <div style={{ padding: "20px 16px", background: "var(--obs-elevated)", borderRadius: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--obs-text)" }}>{String(d.heading ?? "Features")}</div>
          <div style={{ display: "flex", gap: 12 }}>{items.slice(0, 3).map((it, i) => <div key={i} style={{ flex: 1, background: "var(--obs-surface)", borderRadius: 8, padding: "12px 10px", textAlign: "center" }}><div style={{ fontSize: 22 }}>{it.icon}</div><div style={{ fontSize: 12, fontWeight: 600, color: "var(--obs-text)", marginTop: 6 }}>{it.title}</div></div>)}</div>
        </div>
      );
    }
    case "text": return <div style={{ padding: "16px", color: "var(--obs-muted)", fontSize: 13, lineHeight: 1.6, borderRadius: 8, background: "var(--obs-elevated)" }}>{String(d.content ?? "").slice(0, 120)}…</div>;
    case "image": return (
      <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8, textAlign: "center" }}>
        {d.src ? <img src={String(d.src)} alt="" style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 6, objectFit: "cover" }} /> : <div style={{ height: 80, background: "var(--obs-border)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--obs-muted)", fontSize: 12 }}>No image set</div>}
      </div>
    );
    case "cta": return (
      <div style={{ padding: "24px", background: String(d.bgColor ?? "#6366F1"), color: "#fff", textAlign: "center", borderRadius: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{String(d.headline ?? "")}</div>
        {!!d.ctaText && <div style={{ display: "inline-block", padding: "8px 20px", background: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600, color: String(d.bgColor ?? "#6366F1") }}>{String(d.ctaText)}</div>}
      </div>
    );
    case "form": return (
      <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--obs-text)" }}>{String(d.heading ?? "Form")}</div>
        {(d.fields as string[] ?? []).map(f => <div key={f} style={{ height: 28, background: "var(--obs-border)", borderRadius: 4, marginBottom: 8 }} />)}
        <div style={{ height: 32, background: acc, borderRadius: 6 }} />
      </div>
    );
    case "testimonials": return (
      <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--obs-text)" }}>{String(d.heading ?? "Testimonials")}</div>
        <div style={{ display: "flex", gap: 8 }}>{((d.items as Array<{ name: string }>) ?? []).slice(0, 2).map((t, i) => <div key={i} style={{ flex: 1, background: "var(--obs-surface)", borderRadius: 8, padding: 10 }}><div style={{ fontSize: 11, color: "var(--obs-muted)" }}>"{t.name}"</div></div>)}</div>
      </div>
    );
    case "pricing": return (
      <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--obs-text)" }}>{String(d.heading ?? "Pricing")}</div>
        <div style={{ display: "flex", gap: 8 }}>{((d.tiers as Array<{ name: string; price: string; highlighted?: boolean }>) ?? []).slice(0, 3).map((t, i) => <div key={i} style={{ flex: 1, background: t.highlighted ? acc : "var(--obs-surface)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 700, color: t.highlighted ? "#fff" : "var(--obs-text)" }}>{t.name}</div><div style={{ fontSize: 14, fontWeight: 800, color: t.highlighted ? "#fff" : "var(--obs-text)" }}>{t.price}</div></div>)}</div>
      </div>
    );
    case "faq": return (
      <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--obs-text)" }}>{String(d.heading ?? "FAQ")}</div>
        {((d.items as Array<{ q: string }>) ?? []).slice(0, 3).map((item, i) => <div key={i} style={{ fontSize: 12, color: "var(--obs-muted)", padding: "4px 0", borderBottom: "1px solid var(--obs-border)" }}>{item.q}</div>)}
      </div>
    );
    case "video": return <div style={{ padding: 16, background: "var(--obs-elevated)", borderRadius: 8, textAlign: "center" }}><div style={{ height: 80, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>▶</div>{!!d.caption && <div style={{ fontSize: 12, color: "var(--obs-muted)", marginTop: 8 }}>{String(d.caption)}</div>}</div>;
    case "spacer": return <div style={{ height: Math.min(Number(d.height ?? 40), 60), background: "repeating-linear-gradient(45deg, var(--obs-border) 0, var(--obs-border) 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px", borderRadius: 4, opacity: 0.4 }} />;
    case "divider": return <hr style={{ border: "none", borderTop: "1px solid var(--obs-border)", margin: "8px 0" }} />;
    default: return null;
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function PagesPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [pages, setPages] = useState<PageMeta[]>([]);
  const [selected, setSelected] = useState<Page | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [sideTab, setSideTab] = useState<"pages" | "blocks">("pages");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragType = useRef<BlockType | null>(null);
  const dragIdx = useRef<number | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/pages?workspace=${workspaceSlug}`);
    const data = await res.json();
    setPages(data.pages ?? []);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const openPage = async (meta: PageMeta) => {
    const res = await fetch(`/api/pages/${meta.id}`);
    const data = await res.json();
    setSelected(data.page);
    setSelectedBlockId(null);
  };

  const autoSave = useCallback((page: Page) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: page.blocks, name: page.name, seoTitle: page.seoTitle, seoDesc: page.seoDesc, customCss: page.customCss }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 900);
  }, []);

  const updatePage = useCallback((updater: (p: Page) => Page) => {
    setSelected(prev => { if (!prev) return prev; const next = updater(prev); autoSave(next); return next; });
  }, [autoSave]);

  const togglePublish = async () => {
    if (!selected) return;
    const newVal = !selected.published;
    await fetch(`/api/pages/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: newVal }) });
    setSelected(p => p ? { ...p, published: newVal } : p);
    setPages(ps => ps.map(p => p.id === selected.id ? { ...p, published: newVal } : p));
  };

  const createPage = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, name: newName }) });
    const data = await res.json();
    setCreating(false);
    setShowCreate(false);
    setNewName("");
    fetchPages();
    if (data.page) { setSelected(data.page); setSideTab("blocks"); }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchPages();
  };

  const addBlock = (type: BlockType) => {
    const block = newBlock(type);
    updatePage(p => ({ ...p, blocks: [...p.blocks, block] }));
    setSelectedBlockId(block.id);
  };

  const removeBlock = (id: string) => {
    updatePage(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    updatePage(p => {
      if (next < 0 || next >= p.blocks.length) return p;
      const b = [...p.blocks]; [b[idx], b[next]] = [b[next], b[idx]]; return { ...p, blocks: b };
    });
  };

  const updateBlock = (updated: Block) => {
    updatePage(p => ({ ...p, blocks: p.blocks.map(b => b.id === updated.id ? updated : b) }));
  };

  const selectedBlock = selected?.blocks.find(b => b.id === selectedBlockId) ?? null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", gap: 0 }}>
      {/* Left panel */}
      <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid var(--obs-border)", background: "var(--obs-surface)", display: "flex", flexDirection: "column" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--obs-border)" }}>
          {(["pages", "blocks"] as const).map(t => (
            <button key={t} onClick={() => setSideTab(t)} style={{ flex: 1, padding: "10px 4px", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", background: sideTab === t ? "var(--obs-elevated)" : "transparent", color: sideTab === t ? "var(--obs-accent)" : "var(--obs-muted)", borderBottom: sideTab === t ? "2px solid var(--obs-accent)" : "2px solid transparent" }}>
              {t}
            </button>
          ))}
        </div>

        {sideTab === "pages" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            <button onClick={() => setShowCreate(true)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px dashed var(--obs-border)", background: "none", color: "var(--obs-accent)", fontSize: 12, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={12} /> New Page
            </button>
            {loading ? <p style={{ fontSize: 12, color: "var(--obs-muted)", textAlign: "center", padding: 16 }}>Loading…</p> : pages.map(p => (
              <div key={p.id} onClick={() => openPage(p)} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: selected?.id === p.id ? "var(--obs-elevated)" : "transparent", border: `1px solid ${selected?.id === p.id ? "var(--obs-accent)" : "transparent"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--obs-text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <button onClick={e => { e.stopPropagation(); deletePage(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 2, flexShrink: 0 }}><Trash2 size={11} /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: p.published ? "#10B98120" : "var(--obs-border)", color: p.published ? "#10B981" : "var(--obs-muted)" }}>{p.published ? "Live" : "Draft"}</span>
                  <span style={{ fontSize: 10, color: "var(--obs-muted)" }}>{p.viewCount} views</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {sideTab === "blocks" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {!selected ? (
              <p style={{ fontSize: 11, color: "var(--obs-muted)", textAlign: "center", padding: "24px 8px" }}>Open a page first</p>
            ) : (
              BLOCK_TYPES.map(({ type, label, emoji }) => (
                <button key={type} onClick={() => addBlock(type)}
                  draggable onDragStart={() => { dragType.current = type; }}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--obs-border)", background: "var(--obs-elevated)", color: "var(--obs-text)", fontSize: 12, cursor: "grab", marginBottom: 4, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span> {label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Center: Canvas */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "var(--obs-bg)" }}
        onDragOver={e => e.preventDefault()}
        onDrop={() => { if (dragType.current) { addBlock(dragType.current); dragType.current = null; } }}>
        {!selected ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <Globe size={48} style={{ color: "var(--obs-muted)" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--obs-text)" }}>Select a page to edit</p>
            <p style={{ fontSize: 13, color: "var(--obs-muted)" }}>or create a new one from the left panel</p>
            <button onClick={() => setShowCreate(true)} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--obs-accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> New Page
            </button>
          </div>
        ) : (
          <div>
            {/* Page top bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "var(--obs-surface)", borderRadius: 12, border: "1px solid var(--obs-border)" }}>
              <input value={selected.name} onChange={e => updatePage(p => ({ ...p, name: e.target.value }))}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "var(--obs-text)" }} />
              <span style={{ fontSize: 11, color: "var(--obs-muted)" }}>/{selected.slug}</span>
              {saveStatus === "saving" && <span style={{ fontSize: 11, color: "var(--obs-muted)" }}>Saving…</span>}
              {saveStatus === "saved" && <span style={{ fontSize: 11, color: "#10B981" }}>Saved</span>}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--obs-muted)" }}>{selected.published ? "Live" : "Draft"}</span>
                <button onClick={togglePublish} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {selected.published ? <ToggleRight size={24} style={{ color: "#10B981" }} /> : <ToggleLeft size={24} style={{ color: "var(--obs-muted)" }} />}
                </button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--obs-muted)" }}><BarChart2 size={12} />{selected.viewCount}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--obs-muted)" }}><Users size={12} />{selected.leadCount}</div>
              </div>
              <a href={`/p/${workspaceSlug}/${selected.slug}`} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--obs-border)", color: "var(--obs-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                <ExternalLink size={12} /> Preview
              </a>
            </div>

            {/* Blocks */}
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              {selected.blocks.length === 0 && (
                <div style={{ border: "2px dashed var(--obs-border)", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}
                  onDragOver={e => e.preventDefault()} onDrop={() => { if (dragType.current) { addBlock(dragType.current); dragType.current = null; } }}>
                  <p style={{ color: "var(--obs-muted)", fontSize: 13 }}>Drag blocks here or click in the "Blocks" tab to add</p>
                </div>
              )}
              {selected.blocks.map((block, idx) => (
                <div key={block.id}
                  draggable onDragStart={() => { dragIdx.current = idx; }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx.current !== null && dragIdx.current !== idx) {
                      updatePage(p => { const b = [...p.blocks]; const [m] = b.splice(dragIdx.current!, 1); b.splice(idx, 0, m); return { ...p, blocks: b }; });
                    } else if (dragType.current) { addBlock(dragType.current); dragType.current = null; }
                    dragIdx.current = null;
                  }}
                  onClick={() => setSelectedBlockId(block.id)}
                  style={{ marginBottom: 8, borderRadius: 10, border: `2px solid ${selectedBlockId === block.id ? "var(--obs-accent)" : "var(--obs-border)"}`, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                  {/* Block controls */}
                  <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4, zIndex: 10, background: "var(--obs-surface)", borderRadius: 6, padding: 2 }}>
                    <button onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 3 }}><ChevronUp size={13} /></button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(idx, 1); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 3 }}><ChevronDown size={13} /></button>
                    <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-danger)", padding: 3 }}><X size={13} /></button>
                  </div>
                  <BlockPreview block={block} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Properties */}
      <div style={{ width: 260, flexShrink: 0, borderLeft: "1px solid var(--obs-border)", background: "var(--obs-surface)", overflowY: "auto", padding: 16 }}>
        {selectedBlock ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--obs-muted)", marginBottom: 14 }}>{selectedBlock.type} Settings</p>
            <BlockEditor block={selectedBlock} onChange={updateBlock} />
          </>
        ) : selected ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--obs-muted)", marginBottom: 14 }}>Page Settings</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 5 }}>SLUG</label>
              <input style={inp} value={selected.slug} onChange={e => updatePage(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} />
              <p style={{ fontSize: 10, color: "var(--obs-muted)", marginTop: 4 }}>/p/{workspaceSlug}/{selected.slug}</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 5 }}>SEO TITLE</label>
              <input style={inp} value={selected.seoTitle ?? ""} onChange={e => updatePage(p => ({ ...p, seoTitle: e.target.value }))} placeholder="Page title for search engines" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 5 }}>SEO DESCRIPTION</label>
              <textarea style={textareaStyle} value={selected.seoDesc ?? ""} onChange={e => updatePage(p => ({ ...p, seoDesc: e.target.value }))} placeholder="Short description for search results" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--obs-muted)", marginBottom: 5 }}>CUSTOM CSS</label>
              <textarea style={{ ...textareaStyle, fontFamily: "monospace", fontSize: 11, minHeight: 120 }} value={selected.customCss ?? ""} onChange={e => updatePage(p => ({ ...p, customCss: e.target.value }))} placeholder="/* custom styles */" />
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: "var(--obs-muted)", textAlign: "center", marginTop: 32 }}>Select a page and block to edit</p>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--obs-surface)", borderRadius: 16, padding: 24, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--obs-text)", marginBottom: 16 }}>New Landing Page</h2>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPage()}
              placeholder="Page name…" style={{ ...inp, marginBottom: 16 }} autoFocus />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--obs-border)", background: "none", color: "var(--obs-muted)", cursor: "pointer" }}>Cancel</button>
              <button onClick={createPage} disabled={creating || !newName.trim()} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "var(--obs-accent)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, opacity: creating ? 0.7 : 1 }}>
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
