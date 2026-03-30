"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Upload, HardDrive, Trash2, File, Image, FileText, Film, Music } from "lucide-react";

interface StorageFile { id: string; name: string; key: string; size: number; mimeType: string; url: string; folder: string | null; createdAt: string; }

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <Image size={16} style={{ color: "#6366F1" }} />;
  if (mime.startsWith("video/")) return <Film size={16} style={{ color: "#EC4899" }} />;
  if (mime.startsWith("audio/")) return <Music size={16} style={{ color: "#F59E0B" }} />;
  if (mime.includes("pdf") || mime.includes("text")) return <FileText size={16} style={{ color: "#22C55E" }} />;
  return <File size={16} style={{ color: "var(--obs-muted)" }} />;
}

export default function StoragePage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    const res = await fetch(`/api/storage/files?workspace=${workspaceSlug}`);
    if (res.ok) setFiles((await res.json()).files);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceSlug", workspaceSlug);
    const res = await fetch("/api/storage/upload", { method: "POST", body: formData });
    if (res.ok) { const { file: newFile } = await res.json(); setFiles((p) => [newFile, ...p]); toast.success("File uploaded"); }
    else toast.error("Upload failed — configure R2 in Settings");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/storage/files/${id}`, { method: "DELETE" });
    if (res.ok) { setFiles((p) => p.filter((f) => f.id !== id)); toast.success("Deleted"); }
    setDeletingId(null);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Storage</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{files.length} files · {formatBytes(totalSize)} used</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--obs-accent)" }}>
            <Upload size={15} /> {uploading ? "Uploading…" : "Upload File"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>File</span><span>Type</span><span>Size</span><span>Uploaded</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : files.length === 0 ? (
          <div className="py-16 text-center">
            <HardDrive size={32} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No files yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Upload your first file to get started</p>
          </div>
        ) : files.map((f) => (
          <div key={f.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--obs-elevated)" }}>
                <FileIcon mime={f.mimeType} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{f.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--obs-muted)" }}>{f.key}</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{f.mimeType.split("/")[1]?.toUpperCase()}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{formatBytes(f.size)}</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{new Date(f.createdAt).toLocaleDateString()}</p>
            <button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
