"use client";
import { useState } from "react";
import {
  CheckCircle2, ExternalLink, Plug, Receipt, Calendar, CalendarCheck,
  Mail, MessageSquare, FileText, Headphones, Users, BarChart3,
  BookOpen, Zap, Copy, X,
} from "lucide-react";

interface Integration {
  name: string;
  description: string;
  icon: React.ElementType;
  replaces?: string;
  status: "connected" | "optional" | "coming_soon";
  href?: string;
  configHref?: string;
}

const NATIVE: Integration[] = [
  { name: "Accounting", description: "Invoices, expenses, P&L reports — like QuickBooks, built in.", icon: Receipt, replaces: "QuickBooks", status: "connected", href: "payments" },
  { name: "Calendar", description: "Schedule and view all appointments with .ical export.", icon: Calendar, replaces: "Google Calendar", status: "connected", href: "calendar" },
  { name: "Booking", description: "Let clients self-schedule via your shareable booking link.", icon: CalendarCheck, replaces: "Calendly", status: "connected", href: "booking" },
  { name: "Email Marketing", description: "Create and send campaigns to your contact list.", icon: Mail, replaces: "Mailchimp", status: "connected", href: "email" },
  { name: "CRM", description: "Contacts, deals, and pipeline management.", icon: Users, replaces: "HubSpot", status: "connected", href: "crm" },
  { name: "Forms", description: "Build and embed custom forms anywhere.", icon: FileText, replaces: "Typeform", status: "connected", href: "forms" },
  { name: "SMS Campaigns", description: "Send texts to customers via Twilio.", icon: MessageSquare, replaces: "Twilio", status: "connected", href: "sms" },
  { name: "Support & Helpdesk", description: "Manage customer tickets in one place.", icon: Headphones, replaces: "Zendesk", status: "connected", href: "support" },
  { name: "Documents", description: "Team knowledge base and document editor.", icon: BookOpen, replaces: "Notion", status: "connected", href: "documents" },
  { name: "Analytics", description: "Track events and user behavior on your platform.", icon: BarChart3, replaces: "Mixpanel", status: "connected", href: "analytics" },
  { name: "Automations", description: "Trigger workflows when events happen.", icon: Zap, replaces: "Zapier", status: "connected", href: "automations" },
];

const EXTERNAL: Integration[] = [
  { name: "Google Calendar Sync", description: "Subscribe to your Stactoro calendar in Google Calendar using an .ical link.", icon: Calendar, status: "optional" },
  { name: "Stripe Payments", description: "Accept card payments and subscriptions from your customers.", icon: Receipt, status: "connected" },
  { name: "QuickBooks Import", description: "Import existing QuickBooks data via CSV export.", icon: Receipt, status: "coming_soon" },
  { name: "Slack Notifications", description: "Get alerts in Slack when new bookings or payments come in.", icon: Plug, status: "coming_soon" },
  { name: "Zapier", description: "Connect Stactoro to 6,000+ apps via Zapier.", icon: Zap, status: "coming_soon" },
  { name: "Xero Accounting", description: "Sync invoices and expenses with Xero.", icon: Receipt, status: "coming_soon" },
];

function StatusBadge({ status }: { status: Integration["status"] }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#16a34a18", color: "#16a34a" }}>
      <CheckCircle2 size={11} /> Connected
    </span>
  );
  if (status === "coming_soon") return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
      Coming Soon
    </span>
  );
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
      Optional
    </span>
  );
}

export default function IntegrationsPage() {
  const [icalModal, setIcalModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get workspaceSlug from URL
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[2] : "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
  const icalUrl = `${baseUrl}/api/calendar/${slug}/ical`;

  function copyIcal() {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getHref(int: Integration) {
    if (int.href) return `/app/${slug}/${int.href}`;
    return "#";
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Integrations</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Everything your business needs — all built in, no extra subscriptions.
        </p>
      </div>

      {/* Native modules */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={15} style={{ color: "#16a34a" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Built-in Modules</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#16a34a18", color: "#16a34a" }}>
            {NATIVE.length} included
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {NATIVE.map((int) => {
            const Icon = int.icon;
            return (
              <div key={int.name} className="p-4 rounded-xl border flex flex-col gap-3"
                style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--obs-elevated)" }}>
                    <Icon size={18} style={{ color: "var(--obs-accent)" }} />
                  </div>
                  <StatusBadge status={int.status} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{int.name}</p>
                  {int.replaces && (
                    <p className="text-xs font-medium mb-1" style={{ color: "#F59E0B" }}>Replaces {int.replaces}</p>
                  )}
                  <p className="text-xs leading-relaxed" style={{ color: "var(--obs-muted)" }}>{int.description}</p>
                </div>
                {int.href && (
                  <a href={getHref(int)}
                    className="text-xs font-semibold flex items-center gap-1 mt-auto hover:opacity-80"
                    style={{ color: "var(--obs-accent)" }}>
                    Open module <ExternalLink size={11} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* External integrations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plug size={15} style={{ color: "var(--obs-muted)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>External Connections</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {EXTERNAL.map((int) => {
            const Icon = int.icon;
            const isGcal = int.name === "Google Calendar Sync";
            const isStripe = int.name === "Stripe Payments";
            return (
              <div key={int.name} className="p-4 rounded-xl border flex flex-col gap-3"
                style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--obs-elevated)" }}>
                    <Icon size={18} style={{ color: "var(--obs-muted)" }} />
                  </div>
                  <StatusBadge status={int.status} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{int.name}</p>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--obs-muted)" }}>{int.description}</p>
                </div>
                {isGcal && (
                  <button onClick={() => setIcalModal(true)}
                    className="text-xs font-semibold flex items-center gap-1 mt-auto hover:opacity-80"
                    style={{ color: "#F59E0B" }}>
                    Get .ical link <ExternalLink size={11} />
                  </button>
                )}
                {isStripe && (
                  <a href={`/app/${slug}/settings/billing`}
                    className="text-xs font-semibold flex items-center gap-1 mt-auto hover:opacity-80"
                    style={{ color: "var(--obs-accent)" }}>
                    Manage billing <ExternalLink size={11} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* iCal Modal */}
      {icalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setIcalModal(false)}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--obs-text)" }}>Google Calendar Sync</h3>
              <button onClick={() => setIcalModal(false)} style={{ color: "var(--obs-muted)" }}><X size={16} /></button>
            </div>
            <p className="text-sm" style={{ color: "var(--obs-muted)" }}>
              Copy this link and add it to Google Calendar via <strong>+ Other calendars → From URL</strong>.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg border text-xs font-mono break-all"
              style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
              {icalUrl}
            </div>
            <button onClick={copyIcal}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "var(--obs-accent)" }}>
              <Copy size={14} /> {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
