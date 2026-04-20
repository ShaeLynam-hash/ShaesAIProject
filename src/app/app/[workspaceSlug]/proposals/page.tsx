"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { FileText, Plus, Send, Eye, Check, X, Clock, Copy, ExternalLink, Trash2, PenLine, DollarSign, AlignLeft, List, Minus } from "lucide-react";

interface Block {
  type: "heading" | "text" | "lineItems" | "signature" | "divider";
  data: Record<string, unknown>;
}

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  total: number;
  validUntil?: string;
  publicToken: string;
  signedAt?: string;
  signedBy?: string;
  signatureData?: string;
  sentAt?: string;
  viewedAt?: string;
  createdAt: string;
  updatedAt: string;
  content: Block[];
  contact?: { id: string; firstName: string; lastName: string; email: string };
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:    { bg: "rgba(255,255,255,0.08)", color: "var(--obs-muted)", label: "Draft" },
  SENT:     { bg: "#3B82F622", color: "#3B82F6", label: "Sent" },
  VIEWED:   { bg: "#F59E0B22", color: "#F59E0B", label: "Viewed" },
  SIGNED:   { bg: "#10B98122", color: "#10B981", label: "Signed" },
  DECLINED: { bg: "#EF444422", color: "#EF4444", label: "Declined" },
  EXPIRED:  { bg: "rgba(255,255,255,0.06)", color: "var(--obs-muted)", label: "Expired" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ProposalsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/proposals?workspace=${workspaceSlug}`);
    const data = await res.json();
    setProposals(data.proposals ?? []);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  // Auto-save selected proposal
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSave = useCallback(async (p: Proposal) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/proposals/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: p.content, total: p.total, title: p.title }),
      });
      setSaving(false);
    }, 800);
  }, []);

  const updateSelected = useCallback((updater: (p: Proposal) => Proposal) => {
    setSelected(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      autoSave(next);
      return next;
    });
  }, [autoSave]);

  const createProposal = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, title: newTitle }),
    });
    const data = await res.json();
    setCreating(false);
    setShowCreate(false);
    setNewTitle("");
    fetchProposals();
    setSelected(data.proposal);
  };

  const sendProposal = async (id: string) => {
    await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT", sentAt: new Date().toISOString() }),
    });
    fetchProposals();
    if (selected?.id === id) setSelected(p => p ? { ...p, status: "SENT", sentAt: new Date().toISOString() } : p);
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchProposals();
  };

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/proposals/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Block editing helpers
  const updateBlock = (idx: number, data: Partial<Block["data"]>) => {
    updateSelected(p => {
      const content = [...p.content];
      content[idx] = { ...content[idx], data: { ...content[idx].data, ...data } };
      // Recalculate total if line items
      const liBlock = content.find(b => b.type === "lineItems");
      const items = (liBlock?.data?.items as LineItem[]) ?? [];
      const total = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      return { ...p, content, total };
    });
  };

  const updateLineItem = (blockIdx: number, itemIdx: number, field: keyof LineItem, value: string | number) => {
    updateSelected(p => {
      const content = [...p.content];
      const block = { ...content[blockIdx], data: { ...content[blockIdx].data } };
      const items = [...(block.data.items as LineItem[])];
      items[itemIdx] = { ...items[itemIdx], [field]: field === "description" ? value : Number(value) };
      block.data = { ...block.data, items };
      content[blockIdx] = block;
      const total = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      return { ...p, content, total };
    });
  };

  const addLineItem = (blockIdx: number) => {
    updateSelected(p => {
      const content = [...p.content];
      const block = { ...content[blockIdx], data: { ...content[blockIdx].data } };
      const items = [...(block.data.items as LineItem[]), { description: "", qty: 1, unitPrice: 0 }];
      block.data = { ...block.data, items };
      content[blockIdx] = block;
      return { ...p, content };
    });
  };

  const removeLineItem = (blockIdx: number, itemIdx: number) => {
    updateSelected(p => {
      const content = [...p.content];
      const block = { ...content[blockIdx], data: { ...content[blockIdx].data } };
      const items = (block.data.items as LineItem[]).filter((_, i) => i !== itemIdx);
      block.data = { ...block.data, items };
      content[blockIdx] = block;
      const total = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      return { ...p, content, total };
    });
  };

  const addBlock = (type: Block["type"]) => {
    const defaults: Record<Block["type"], Block["data"]> = {
      heading: { text: "Section Title", level: 2 },
      text: { text: "Enter your text here..." },
      lineItems: { items: [{ description: "Service", qty: 1, unitPrice: 0 }] },
      signature: { label: "Client Signature" },
      divider: {},
    };
    updateSelected(p => ({
      ...p,
      content: [...p.content, { type, data: defaults[type] }],
    }));
  };

  const removeBlock = (idx: number) => {
    updateSelected(p => ({ ...p, content: p.content.filter((_, i) => i !== idx) }));
  };

  const filteredProposals = filter === "ALL" ? proposals : proposals.filter(p => p.status === filter);

  return (
    <div className="flex gap-6 h-full" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Left: List */}
      <div className="flex flex-col" style={{ width: 320, flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-bold" style={{ color: "var(--obs-text)" }}>Proposals</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--obs-accent)", color: "#fff" }}>
            <Plus size={12} /> New
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1 flex-wrap mb-3">
          {["ALL", "DRAFT", "SENT", "VIEWED", "SIGNED", "DECLINED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-1 rounded text-xs font-medium capitalize"
              style={{ background: filter === f ? "var(--obs-accent)" : "var(--obs-surface)", color: filter === f ? "#fff" : "var(--obs-muted)" }}>
              {f === "ALL" ? "All" : STATUS_STYLES[f]?.label ?? f}
            </button>
          ))}
        </div>

        <div className="space-y-2 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-xs text-center py-8" style={{ color: "var(--obs-muted)" }}>Loading…</div>
          ) : filteredProposals.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
              <FileText size={28} style={{ color: "var(--obs-muted)", margin: "0 auto 8px" }} />
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>No proposals yet</p>
            </div>
          ) : (
            filteredProposals.map(p => {
              const s = STATUS_STYLES[p.status] ?? STATUS_STYLES.DRAFT;
              return (
                <div key={p.id} onClick={() => setSelected(p)}
                  className="rounded-xl border p-3 cursor-pointer transition-all"
                  style={{ background: selected?.id === p.id ? "var(--obs-elevated)" : "var(--obs-surface)", borderColor: selected?.id === p.id ? "var(--obs-accent)" : "var(--obs-border)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--obs-text)" }}>{p.title}</p>
                      {p.contact && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--obs-muted)" }}>{p.contact.firstName} {p.contact.lastName}</p>}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--obs-text)" }}>{fmt(p.total)}</span>
                    <span className="text-xs" style={{ color: "var(--obs-muted)" }}>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Editor */}
      {selected ? (
        <div className="flex-1 min-w-0 rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--obs-border)" }}>
            <div className="flex-1">
              <input
                value={selected.title}
                onChange={e => updateSelected(p => ({ ...p, title: e.target.value }))}
                className="text-base font-bold bg-transparent border-0 outline-none w-full"
                style={{ color: "var(--obs-text)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              {saving && <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Saving…</span>}
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: STATUS_STYLES[selected.status]?.bg, color: STATUS_STYLES[selected.status]?.color }}>
                {STATUS_STYLES[selected.status]?.label}
              </span>
              <button onClick={() => copyLink(selected.publicToken)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied!" : "Copy Link"}
              </button>
              <a href={`/proposals/${selected.publicToken}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                <ExternalLink size={14} />
              </a>
              {selected.status === "DRAFT" && (
                <button onClick={() => sendProposal(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#3B82F6", color: "#fff" }}>
                  <Send size={12} /> Send
                </button>
              )}
              <button onClick={() => deleteProposal(selected.id)} className="p-2 rounded-lg" style={{ color: "var(--obs-danger)" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Content Blocks */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selected.content.map((block, idx) => (
              <div key={idx} className="group relative">
                {/* Remove block button */}
                <button onClick={() => removeBlock(idx)}
                  className="absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  style={{ background: "var(--obs-danger)", color: "#fff" }}>
                  <X size={10} />
                </button>

                {block.type === "heading" && (
                  <input
                    value={String(block.data.text ?? "")}
                    onChange={e => updateBlock(idx, { text: e.target.value })}
                    className="w-full bg-transparent border-0 outline-none font-bold"
                    style={{ fontSize: block.data.level === 1 ? 24 : 18, color: "var(--obs-text)" }}
                  />
                )}

                {block.type === "text" && (
                  <textarea
                    value={String(block.data.text ?? "")}
                    onChange={e => updateBlock(idx, { text: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border-0 outline-none resize-none text-sm"
                    style={{ color: "var(--obs-muted)" }}
                  />
                )}

                {block.type === "divider" && (
                  <hr style={{ borderColor: "var(--obs-border)" }} />
                )}

                {block.type === "lineItems" && (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--obs-border)" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "var(--obs-elevated)" }}>
                          <th className="text-left px-3 py-2 text-xs font-medium" style={{ color: "var(--obs-muted)" }}>Description</th>
                          <th className="text-right px-3 py-2 text-xs font-medium w-16" style={{ color: "var(--obs-muted)" }}>Qty</th>
                          <th className="text-right px-3 py-2 text-xs font-medium w-24" style={{ color: "var(--obs-muted)" }}>Unit Price</th>
                          <th className="text-right px-3 py-2 text-xs font-medium w-24" style={{ color: "var(--obs-muted)" }}>Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {(block.data.items as LineItem[]).map((item, ii) => (
                          <tr key={ii} className="border-t" style={{ borderColor: "var(--obs-border)" }}>
                            <td className="px-3 py-2">
                              <input value={item.description} onChange={e => updateLineItem(idx, ii, "description", e.target.value)}
                                className="w-full bg-transparent outline-none text-sm" style={{ color: "var(--obs-text)" }} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={item.qty} onChange={e => updateLineItem(idx, ii, "qty", e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-right" style={{ color: "var(--obs-text)" }} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" value={item.unitPrice} onChange={e => updateLineItem(idx, ii, "unitPrice", e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-right" style={{ color: "var(--obs-text)" }} />
                            </td>
                            <td className="px-3 py-2 text-right text-sm font-medium" style={{ color: "var(--obs-text)" }}>
                              {fmt(item.qty * item.unitPrice)}
                            </td>
                            <td className="px-1 py-2">
                              <button onClick={() => removeLineItem(idx, ii)} className="p-1 rounded" style={{ color: "var(--obs-muted)" }}>
                                <Minus size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t" style={{ borderColor: "var(--obs-border)" }}>
                          <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-right" style={{ color: "var(--obs-text)" }}>Total</td>
                          <td className="px-3 py-2 text-sm font-bold text-right" style={{ color: "var(--obs-accent)" }}>{fmt(selected.total)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                    <button onClick={() => addLineItem(idx)} className="w-full py-2 text-xs flex items-center justify-center gap-1.5 border-t" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                      <Plus size={11} /> Add Line Item
                    </button>
                  </div>
                )}

                {block.type === "signature" && (
                  <div className="rounded-xl border p-4" style={{ borderColor: "var(--obs-border)", background: "var(--obs-elevated)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <PenLine size={14} style={{ color: "var(--obs-accent)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{String(block.data.label ?? "Signature")}</span>
                    </div>
                    {selected.signedBy ? (
                      <div>
                        <p className="text-xs" style={{ color: "#10B981" }}><Check size={12} className="inline mr-1" />Signed by <strong>{selected.signedBy}</strong> on {new Date(selected.signedAt!).toLocaleDateString()}</p>
                        {selected.signatureData && !selected.signatureData.startsWith("data:") && (
                          <p className="text-lg mt-2 font-signature italic" style={{ color: "var(--obs-text)" }}>{selected.signatureData}</p>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: "var(--obs-border)" }}>
                        <span className="text-xs" style={{ color: "var(--obs-muted)" }}>Awaiting signature</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add block buttons */}
            <div className="flex gap-2 flex-wrap pt-2">
              {[
                { type: "heading" as const, icon: AlignLeft, label: "Heading" },
                { type: "text" as const, icon: FileText, label: "Text" },
                { type: "lineItems" as const, icon: List, label: "Line Items" },
                { type: "divider" as const, icon: Minus, label: "Divider" },
                { type: "signature" as const, icon: PenLine, label: "Signature" },
              ].map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => addBlock(type)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer stats */}
          <div className="px-6 py-3 border-t flex items-center gap-6 text-xs" style={{ borderColor: "var(--obs-border)" }}>
            {selected.viewedAt && <span style={{ color: "var(--obs-muted)" }}><Eye size={11} className="inline mr-1" />Viewed {new Date(selected.viewedAt).toLocaleDateString()}</span>}
            {selected.sentAt && <span style={{ color: "var(--obs-muted)" }}><Send size={11} className="inline mr-1" />Sent {new Date(selected.sentAt).toLocaleDateString()}</span>}
            {selected.validUntil && <span style={{ color: "var(--obs-muted)" }}><Clock size={11} className="inline mr-1" />Valid until {new Date(selected.validUntil).toLocaleDateString()}</span>}
            <span className="ml-auto font-semibold" style={{ color: "var(--obs-accent)" }}>{fmt(selected.total)}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-xl border flex items-center justify-center" style={{ borderColor: "var(--obs-border)", background: "var(--obs-surface)" }}>
          <div className="text-center">
            <FileText size={40} style={{ color: "var(--obs-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>Select a proposal to edit</p>
            <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Or create a new one</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mx-auto" style={{ background: "var(--obs-accent)", color: "#fff" }}>
              <Plus size={14} /> New Proposal
            </button>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" style={{ background: "var(--obs-surface)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>New Proposal</h2>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Proposal title…"
              onKeyDown={e => e.key === "Enter" && createProposal()}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>Cancel</button>
              <button onClick={createProposal} disabled={creating || !newTitle.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--obs-accent)", color: "#fff", opacity: creating ? 0.7 : 1 }}>
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
