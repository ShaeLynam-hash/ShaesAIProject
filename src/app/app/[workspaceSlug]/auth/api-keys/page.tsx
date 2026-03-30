"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

const SCOPES = [
  { id: "crm:read",       label: "CRM Read" },
  { id: "crm:write",      label: "CRM Write" },
  { id: "email:send",     label: "Email Send" },
  { id: "sms:send",       label: "SMS Send" },
  { id: "payments:read",  label: "Payments Read" },
  { id: "payments:write", label: "Payments Write" },
  { id: "storage:read",   label: "Storage Read" },
  { id: "storage:write",  label: "Storage Write" },
  { id: "*",              label: "Full Access" },
];

export default function ApiKeysPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["*"]);
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    const res = await fetch(`/api/auth/api-keys?workspace=${workspaceSlug}`);
    if (res.ok) setKeys((await res.json()).keys);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) { toast.error("Enter a key name"); return; }
    setCreating(true);
    const res = await fetch("/api/auth/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, name: newKeyName, scopes: selectedScopes }),
    });
    if (res.ok) {
      const { key, apiKey } = await res.json();
      setRevealedKey(key);
      setKeys((prev) => [apiKey, ...prev]);
      setNewKeyName("");
      setOpen(false);
      toast.success("Key created — copy it now");
    } else toast.error("Failed to create key");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/auth/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) { setKeys((p) => p.filter((k) => k.id !== id)); toast.success("Key revoked"); }
    else toast.error("Failed to revoke key");
    setDeletingId(null);
  };

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); toast.success("Copied!"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>API Keys</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Authenticate your apps with scoped API keys</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New API Key
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--obs-text)" }}>Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Key Name</Label>
                <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Production App"
                  style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Scopes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SCOPES.map((scope) => (
                    <button key={scope.id}
                      onClick={() => setSelectedScopes((p) =>
                        p.includes(scope.id) ? p.filter((s) => s !== scope.id) : [...p, scope.id]
                      )}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors"
                      style={{
                        background: selectedScopes.includes(scope.id) ? "var(--obs-accent)" : "var(--obs-elevated)",
                        borderColor: selectedScopes.includes(scope.id) ? "var(--obs-accent)" : "var(--obs-border)",
                        color: selectedScopes.includes(scope.id) ? "#fff" : "var(--obs-muted)",
                      }}>
                      <Key size={11} /> {scope.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Create Key"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {revealedKey && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: "#22C55E10", borderColor: "#22C55E40" }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--obs-success)" }}>
              Copy your key — it won&apos;t be shown again
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono px-3 py-1.5 rounded-lg flex-1 truncate"
                style={{ background: "var(--obs-elevated)", color: "var(--obs-text)" }}>{revealedKey}</code>
              <button onClick={() => copyKey(revealedKey)} className="p-1.5 rounded-lg hover:bg-white/10">
                <Copy size={14} style={{ color: "var(--obs-success)" }} />
              </button>
            </div>
          </div>
          <button onClick={() => setRevealedKey(null)} className="text-xs hover:opacity-70"
            style={{ color: "var(--obs-muted)" }}>Dismiss</button>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_2fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Name</span><span>Prefix</span><span>Scopes</span><span>Last Used</span><span />
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center">
            <Key size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No API keys yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create a key to authenticate your apps</p>
          </div>
        ) : keys.map((key) => (
          <div key={key.id}
            className="grid grid-cols-[2fr_1fr_2fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{key.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>
                {new Date(key.createdAt).toLocaleDateString()}
              </p>
            </div>
            <code className="text-xs font-mono px-2 py-1 rounded inline-block"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-accent-2)" }}>
              {key.keyPrefix}…
            </code>
            <div className="flex flex-wrap gap-1">
              {key.scopes.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>{s}</span>
              ))}
              {key.scopes.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>+{key.scopes.length - 2}</span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
              {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
            </p>
            <button onClick={() => handleDelete(key.id)} disabled={deletingId === key.id}
              className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
