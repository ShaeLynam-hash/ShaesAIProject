"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, FileText, Trash2 } from "lucide-react";

interface Document { id: string; title: string; emoji: string | null; content: string; createdAt: string; updatedAt: string; }

const EMOJIS = ["📄","📝","📋","💡","🎯","📊","🔧","⚡","🚀","💼","📌","🗂️"];

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    const res = await fetch(`/api/documents?workspace=${workspaceSlug}`);
    if (res.ok) setDocs((await res.json()).documents);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleCreate = async () => {
    setCreating(true);
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, title: "Untitled", emoji }) });
    if (res.ok) { const { document: doc } = await res.json(); router.push(`/app/${workspaceSlug}/documents/${doc.id}`); }
    else toast.error("Failed to create document");
    setCreating(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) { setDocs((p) => p.filter((d) => d.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Documents</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
          <Plus size={15} /> New Document
        </button>
      </div>

      {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
      : docs.length === 0 ? (
        <div className="py-16 text-center">
          <FileText size={32} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No documents yet</p>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create a document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} onClick={() => router.push(`/app/${workspaceSlug}/documents/${doc.id}`)}
              className="group p-4 rounded-xl border cursor-pointer hover:border-[var(--obs-accent)] transition-colors relative"
              style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
              <div className="text-2xl mb-3">{doc.emoji ?? "📄"}</div>
              <p className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: "var(--obs-text)" }}>{doc.title}</p>
              <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--obs-muted)" }}>
                {doc.content.replace(/<[^>]*>/g, "").slice(0, 80) || "No content"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--obs-muted)" }}>
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
              <button onClick={(e) => handleDelete(doc.id, e)} disabled={deletingId === doc.id}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity disabled:opacity-50">
                <Trash2 size={12} style={{ color: "var(--obs-danger)" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
