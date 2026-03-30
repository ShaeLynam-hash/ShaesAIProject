"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Users, Mail, Phone, Building2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  country: string;
  createdAt: string;
  _count?: { invoices: number };
}

export default function CustomersPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", city: "", country: "US" });

  const fetchCustomers = useCallback(async () => {
    const res = await fetch(`/api/payments/customers?workspace=${workspaceSlug}`);
    if (res.ok) setCustomers((await res.json()).customers);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email required"); return; }
    setCreating(true);
    const res = await fetch("/api/payments/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...form }),
    });
    if (res.ok) {
      const { customer } = await res.json();
      setCustomers((p) => [customer, ...p]);
      setForm({ name: "", email: "", phone: "", company: "", city: "", country: "US" });
      setOpen(false);
      toast.success("Customer added");
    } else toast.error("Failed to add customer");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/payments/customers/${id}`, { method: "DELETE" });
    if (res.ok) { setCustomers((p) => p.filter((c) => c.id !== id)); toast.success("Customer deleted"); }
    else toast.error("Failed to delete");
    setDeletingId(null);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>{label}</Label>
      <Input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Customers</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
            <Search size={13} style={{ color: "var(--obs-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="bg-transparent text-xs outline-none w-44"
              style={{ color: "var(--obs-text)" }} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "var(--obs-accent)" }}>
              <Plus size={15} /> New Customer
            </DialogTrigger>
            <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
              <DialogHeader>
                <DialogTitle style={{ color: "var(--obs-text)" }}>Add Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {field("Full Name *", "name", "Jane Smith")}
                {field("Email *", "email", "jane@acme.com")}
                {field("Phone", "phone", "+1 555 000 0000")}
                {field("Company", "company", "Acme Inc.")}
                {field("City", "city", "New York")}
                {field("Country", "country", "US")}
                <button onClick={handleCreate} disabled={creating}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "var(--obs-accent)" }}>
                  {creating ? "Adding…" : "Add Customer"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Customer</span><span>Contact</span><span>Location</span><span>Joined</span><span />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>
              {search ? "No matches found" : "No customers yet"}
            </p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Add your first customer to get started</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id}
            className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{c.name}</p>
              {c.company && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 size={10} style={{ color: "var(--obs-muted)" }} />
                  <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.company}</p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Mail size={11} style={{ color: "var(--obs-muted)" }} />
                <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.email}</p>
              </div>
              {c.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={11} style={{ color: "var(--obs-muted)" }} />
                  <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{c.phone}</p>
                </div>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
              {[c.city, c.country].filter(Boolean).join(", ")}
            </p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
              {new Date(c.createdAt).toLocaleDateString()}
            </p>
            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
              className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
