"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Users, Trash2, Mail, Phone, Building2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Contact {
  id: string; firstName: string; lastName: string | null; email: string | null;
  phone: string | null; company: string | null; title: string | null;
  status: string; source: string | null; createdAt: string;
}

const STATUSES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"];
const SOURCES = ["Website", "Referral", "LinkedIn", "Cold Outreach", "Event", "Other"];

export default function ContactsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", title: "", status: "LEAD", source: "Website" });

  const fetchContacts = useCallback(async () => {
    const res = await fetch(`/api/crm/contacts?workspace=${workspaceSlug}`);
    if (res.ok) setContacts((await res.json()).contacts);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleCreate = async () => {
    if (!form.firstName.trim()) { toast.error("First name required"); return; }
    setCreating(true);
    const res = await fetch("/api/crm/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceSlug, ...form }) });
    if (res.ok) { const { contact } = await res.json(); setContacts((p) => [contact, ...p]); setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", title: "", status: "LEAD", source: "Website" }); setOpen(false); toast.success("Contact added"); }
    else toast.error("Failed to add contact");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
    if (res.ok) { setContacts((p) => p.filter((c) => c.id !== id)); toast.success("Contact deleted"); }
    else toast.error("Failed to delete");
    setDeletingId(null);
  };

  const filtered = contacts.filter((c) =>
    `${c.firstName} ${c.lastName ?? ""} ${c.email ?? ""} ${c.company ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = { LEAD: "#6366F1", PROSPECT: "#F59E0B", CUSTOMER: "#22C55E", CHURNED: "#EF4444" };
  const iStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Contacts</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
            <Search size={13} style={{ color: "var(--obs-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent text-xs outline-none w-40" style={{ color: "var(--obs-text)" }} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
              <Plus size={15} /> New Contact
            </DialogTrigger>
            <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
              <DialogHeader><DialogTitle style={{ color: "var(--obs-text)" }}>Add Contact</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Jane" style={iStyle} /></div>
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Smith" style={iStyle} /></div>
                </div>
                <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@acme.com" style={iStyle} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Phone</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" style={iStyle} /></div>
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Company</Label><Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." style={iStyle} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Status</Label>
                    <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5"><Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Source</Label>
                    <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={iStyle}>
                      {SOURCES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleCreate} disabled={creating} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--obs-accent)" }}>
                  {creating ? "Adding…" : "Add Contact"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Contact</span><span>Company</span><span>Status</span><span>Source</span><span />
        </div>
        {loading ? <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{search ? "No matches" : "No contacts yet"}</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0 cursor-pointer hover:bg-white/[0.02]" style={{ borderColor: "var(--obs-border)" }}
            onClick={(e) => { if ((e.target as HTMLElement).closest("button")) return; router.push(`/app/${workspaceSlug}/crm/contacts/${c.id}`); }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.firstName} {c.lastName ?? ""}</p>
              {c.email && <div className="flex items-center gap-1 mt-0.5"><Mail size={10} style={{ color: "var(--obs-muted)" }} /><p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.email}</p></div>}
              {c.phone && <div className="flex items-center gap-1"><Phone size={10} style={{ color: "var(--obs-muted)" }} /><p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.phone}</p></div>}
            </div>
            <div>
              {c.company && <div className="flex items-center gap-1"><Building2 size={11} style={{ color: "var(--obs-muted)" }} /><p className="text-sm" style={{ color: "var(--obs-text)" }}>{c.company}</p></div>}
              {c.title && <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.title}</p>}
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block" style={{ background: `${statusColor[c.status] ?? "#6366F1"}18`, color: statusColor[c.status] ?? "#6366F1" }}>{c.status}</span>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.source ?? "—"}</p>
            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
