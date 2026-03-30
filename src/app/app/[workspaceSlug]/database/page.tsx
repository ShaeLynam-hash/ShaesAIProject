import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Database, Table, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default async function DatabasePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) redirect("/onboarding");

  // Show workspace's data tables as a database browser
  const tables = [
    { name: "contacts",      label: "Contacts",       count: await prisma.contact.count({ where: { workspaceId: workspace.id } }),      cols: ["id","firstName","lastName","email","phone","company","status","createdAt"] },
    { name: "deals",         label: "Deals",          count: await prisma.deal.count({ where: { workspaceId: workspace.id } }),          cols: ["id","title","value","stage","probability","closeDate"] },
    { name: "customers",     label: "Customers",      count: await prisma.customer.count({ where: { workspaceId: workspace.id } }),      cols: ["id","name","email","phone","company","country"] },
    { name: "invoices",      label: "Invoices",       count: await prisma.invoice.count({ where: { workspaceId: workspace.id } }),       cols: ["id","number","status","total","dueDate","paidAt"] },
    { name: "products",      label: "Products",       count: await prisma.product.count({ where: { workspaceId: workspace.id } }),       cols: ["id","name","price","type","interval","active"] },
    { name: "expenses",      label: "Expenses",       count: await prisma.expense.count({ where: { workspaceId: workspace.id } }),       cols: ["id","description","amount","category","date","vendor"] },
    { name: "storage_files", label: "Storage Files",  count: await prisma.storageFile.count({ where: { workspaceId: workspace.id } }),   cols: ["id","name","key","size","mimeType","url"] },
    { name: "analytics",     label: "Analytics Events",count: await prisma.analyticsEvent.count({ where: { workspaceId: workspace.id } }),cols: ["id","event","properties","userId","sessionId","createdAt"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Database</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Browse and query your workspace data</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tables.map(({ name, label, count, cols }) => (
          <div key={name} className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--obs-elevated)" }}>
                  <Table size={13} style={{ color: "var(--obs-accent)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{label}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--obs-muted)" }}>{name}</p>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--obs-text)" }}>{count.toLocaleString()} rows</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {cols.map((col) => (
                <span key={col} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>{col}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl border" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Database size={15} style={{ color: "var(--obs-accent)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Direct Database Access</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--obs-muted)" }}>Connect directly using your PostgreSQL connection string from Settings</p>
        <div className="flex flex-wrap gap-2">
          {["pgAdmin", "TablePlus", "DBeaver", "Postico"].map((tool) => (
            <span key={tool} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>{tool}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
