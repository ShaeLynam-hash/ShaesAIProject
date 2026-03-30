"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Package, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: string;
  interval: string | null;
  active: boolean;
  createdAt: string;
}

function fmt(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default function ProductsPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", type: "ONE_TIME", interval: "month",
  });

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/payments/products?workspace=${workspaceSlug}`);
    if (res.ok) setProducts((await res.json()).products);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.price) { toast.error("Name and price required"); return; }
    setCreating(true);
    const res = await fetch("/api/payments/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        ...form,
        price: parseFloat(form.price),
        interval: form.type === "RECURRING" ? form.interval : null,
      }),
    });
    if (res.ok) {
      const { product } = await res.json();
      setProducts((p) => [product, ...p]);
      setForm({ name: "", description: "", price: "", type: "ONE_TIME", interval: "month" });
      setOpen(false);
      toast.success("Product created");
    } else toast.error("Failed to create product");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/payments/products/${id}`, { method: "DELETE" });
    if (res.ok) { setProducts((p) => p.filter((x) => x.id !== id)); toast.success("Product deleted"); }
    else toast.error("Failed to delete");
    setDeletingId(null);
  };

  const inputStyle = { background: "var(--obs-elevated)", borderColor: "var(--obs-border)", color: "var(--obs-text)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Products & Pricing</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Product
          </DialogTrigger>
          <DialogContent style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "var(--obs-text)" }}>Create Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Pro Plan" style={inputStyle} />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What's included…" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Price ($) *</Label>
                  <Input type="number" min="0" step="0.01" value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="29.00" style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Type</Label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                    <option value="ONE_TIME">One-time</option>
                    <option value="RECURRING">Recurring</option>
                  </select>
                </div>
              </div>
              {form.type === "RECURRING" && (
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Billing Interval</Label>
                  <select value={form.interval} onChange={(e) => setForm((p) => ({ ...p, interval: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="week">Weekly</option>
                  </select>
                </div>
              )}
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {creating ? "Creating…" : "Create Product"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          <span>Product</span><span>Price</span><span>Type</span><span>Status</span><span />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={28} className="mx-auto mb-3" style={{ color: "var(--obs-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--obs-text)" }}>No products yet</p>
            <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Create products to attach to invoices</p>
          </div>
        ) : products.map((p) => (
          <div key={p.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 border-b items-center last:border-0"
            style={{ borderColor: "var(--obs-border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--obs-text)" }}>{p.name}</p>
              {p.description && (
                <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{p.description}</p>
              )}
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>
              {fmt(p.price, p.currency)}
              {p.type === "RECURRING" && (
                <span className="text-xs font-normal ml-1" style={{ color: "var(--obs-muted)" }}>
                  /{p.interval}
                </span>
              )}
            </p>
            <span className="text-xs px-2 py-1 rounded-md inline-block"
              style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
              {p.type === "ONE_TIME" ? "One-time" : "Recurring"}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
              style={{
                background: p.active ? "#22C55E18" : "var(--obs-elevated)",
                color: p.active ? "var(--obs-success)" : "var(--obs-muted)",
              }}>
              {p.active ? "Active" : "Inactive"}
            </span>
            <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
              className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14} style={{ color: "var(--obs-danger)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
