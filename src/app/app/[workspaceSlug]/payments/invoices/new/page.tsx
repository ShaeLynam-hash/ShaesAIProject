"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Customer { id: string; name: string; email: string }
interface LineItem { description: string; quantity: string; unitPrice: string }

export default function NewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: "1", unitPrice: "" }]);
  const [creating, setCreating] = useState(false);

  const fetchCustomers = useCallback(async () => {
    const res = await fetch(`/api/payments/customers?workspace=${workspaceSlug}`);
    if (res.ok) setCustomers((await res.json()).customers);
  }, [workspaceSlug]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const addItem = () => setItems((p) => [...p, { description: "", quantity: "1", unitPrice: "" }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, val: string) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const tax = parseFloat(taxRate) || 0;
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const handleCreate = async () => {
    const validItems = items.filter((i) => i.description.trim() && parseFloat(i.unitPrice) > 0);
    if (validItems.length === 0) { toast.error("Add at least one line item"); return; }
    setCreating(true);
    const res = await fetch("/api/payments/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        customerId: customerId || null,
        dueDate,
        taxRate: parseFloat(taxRate) || 0,
        notes,
        lineItems: validItems.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity) || 1,
          unitPrice: parseFloat(i.unitPrice) || 0,
        })),
      }),
    });
    if (res.ok) {
      toast.success("Invoice created");
      router.push(`/app/${workspaceSlug}/payments/invoices`);
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Failed to create invoice");
    }
    setCreating(false);
  };

  const inputStyle = {
    background: "var(--obs-elevated)",
    borderColor: "var(--obs-border)",
    color: "var(--obs-text)",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-white/5"
          style={{ color: "var(--obs-muted)" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>New Invoice</h2>
          <p className="text-xs" style={{ color: "var(--obs-muted)" }}>Fill in the details below</p>
        </div>
      </div>

      {/* Customer + dates */}
      <div className="p-5 rounded-xl border space-y-4"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Invoice Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Customer</Label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={inputStyle}>
              <option value="">No customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Tax Rate (%)</Label>
            <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0" style={inputStyle} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: "var(--obs-muted)", fontSize: "12px" }}>Notes</Label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={2} placeholder="Payment terms, thank you note…"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
            style={inputStyle} />
        </div>
      </div>

      {/* Line items */}
      <div className="p-5 rounded-xl border space-y-4"
        style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Line Items</h3>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[3fr_1fr_1fr_32px] gap-2 items-center">
              <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="Description" style={inputStyle} />
              <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)}
                placeholder="Qty" min="0" style={inputStyle} />
              <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                placeholder="Price" min="0" step="0.01" style={inputStyle} />
              <button onClick={() => removeItem(i)} disabled={items.length === 1}
                className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-30">
                <Trash2 size={13} style={{ color: "var(--obs-danger)" }} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--obs-accent)" }}>
          <Plus size={13} /> Add line item
        </button>

        {/* Totals */}
        <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--obs-border)" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--obs-muted)" }}>Subtotal</span>
            <span style={{ color: "var(--obs-text)" }}>{fmt(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--obs-muted)" }}>Tax ({tax}%)</span>
              <span style={{ color: "var(--obs-text)" }}>{fmt(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t"
            style={{ borderColor: "var(--obs-border)" }}>
            <span style={{ color: "var(--obs-text)" }}>Total</span>
            <span style={{ color: "var(--obs-text)" }}>{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold border"
          style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>
          Cancel
        </button>
        <button onClick={handleCreate} disabled={creating}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--obs-accent)" }}>
          {creating ? "Creating…" : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
