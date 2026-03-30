"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const docId = params?.docId as string;
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📄");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDoc = useCallback(async () => {
    const res = await fetch(`/api/documents/${docId}`);
    if (res.ok) { const { document: doc } = await res.json(); setTitle(doc.title); setContent(doc.content); setEmoji(doc.emoji ?? "📄"); }
  }, [docId]);

  useEffect(() => { fetchDoc(); }, [fetchDoc]);

  const save = useCallback(async (t: string, c: string) => {
    setSaving(true);
    await fetch(`/api/documents/${docId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: t, content: c }) });
    setLastSaved(new Date());
    setSaving(false);
  }, [docId]);

  const handleContentChange = (val: string) => {
    setContent(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(title, val), 1500);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(val, content), 1500);
  };

  const handleManualSave = async () => { await save(title, content); toast.success("Saved"); };

  return (
    <div className="max-w-3xl mx-auto space-y-0">
      <div className="flex items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: "var(--obs-border)" }}>
        <button onClick={() => router.push(`/app/${workspaceSlug}/documents`)} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--obs-muted)" }}>
          <ArrowLeft size={14} /> Documents
        </button>
        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Saved {lastSaved.toLocaleTimeString()}</span>}
          <button onClick={handleManualSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50" style={{ background: "var(--obs-elevated)", color: "var(--obs-text)" }}>
            <Save size={12} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="text-4xl mb-4 cursor-pointer">{emoji}</div>

      <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full text-3xl font-bold bg-transparent outline-none mb-6"
        style={{ color: "var(--obs-text)" }}
        placeholder="Untitled" />

      <textarea value={content} onChange={(e) => handleContentChange(e.target.value)}
        className="w-full min-h-[60vh] bg-transparent outline-none resize-none text-sm leading-7"
        style={{ color: "var(--obs-text)" }}
        placeholder="Start writing…" />
    </div>
  );
}
