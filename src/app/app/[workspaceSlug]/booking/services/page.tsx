"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Video,
  PhoneCall,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Link,
  Check,
  X,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
  meetingType: string;
  meetingLink: string | null;
  availableDays: string[];
  startTime: string | null;
  endTime: string | null;
  active: boolean;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#22C55E", "#3B82F6", "#EF4444"];
const MEETING_TYPES = [
  { value: "in_person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "custom", label: "Custom Link" },
];
const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const LINK_REQUIRES_MEETING_TYPES = ["zoom", "google_meet", "custom"];

const surface: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#F2F2F5",
  padding: "8px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(242,242,245,0.45)",
  marginBottom: 5,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function MeetingIcon({ type, size = 14 }: { type: string; size?: number }) {
  if (type === "zoom" || type === "google_meet" || type === "custom") return <Video size={size} />;
  if (type === "phone") return <PhoneCall size={size} />;
  return <MapPin size={size} />;
}

function meetingLabel(type: string) {
  return MEETING_TYPES.find((m) => m.value === type)?.label ?? type;
}

export default function ServicesPage() {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    color: "#6366F1",
    meetingType: "in_person",
    meetingLink: "",
    availableDays: ["MON", "TUE", "WED", "THU", "FRI"],
    startTime: "09:00",
    endTime: "17:00",
  });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/booking/services?workspace=${workspaceSlug}`);
    const data = await res.json();
    setServices(data.services ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug]);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      color: "#6366F1",
      meetingType: "in_person",
      meetingLink: "",
      availableDays: ["MON", "TUE", "WED", "THU", "FRI"],
      startTime: "09:00",
      endTime: "17:00",
    });
  }

  async function createService() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/booking/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        name: form.name,
        description: form.description || null,
        duration: form.duration,
        price: form.price,
        color: form.color,
        meetingType: form.meetingType,
        meetingLink: LINK_REQUIRES_MEETING_TYPES.includes(form.meetingType)
          ? form.meetingLink || null
          : null,
        availableDays: form.availableDays,
        startTime: form.startTime,
        endTime: form.endTime,
      }),
    });
    setSaving(false);
    setOpen(false);
    resetForm();
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/booking/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    await fetch(`/api/booking/services/${id}`, { method: "DELETE" });
    load();
  }

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));
  }

  function copyBookingLink() {
    const link = `${window.location.origin}/book/${workspaceSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ color: "#F2F2F5", minHeight: "100%", background: "#111114" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F2F2F5", margin: 0 }}>
            Services
          </h2>
          <p style={{ fontSize: 13, color: "rgba(242,242,245,0.4)", margin: "4px 0 0" }}>
            Manage bookable services offered to clients
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={copyBookingLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: copied ? "#22c55e" : "rgba(242,242,245,0.7)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            {copied ? <Check size={14} /> : <Link size={14} />}
            {copied ? "Copied!" : "Share Booking Link"}
          </button>
          <button
            onClick={() => setOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#F59E0B",
              border: "none",
              color: "#111114",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> New Service
          </button>
        </div>
      </div>

      {/* Service list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "rgba(242,242,245,0.3)", textAlign: "center", paddingTop: 60 }}>
          Loading services...
        </p>
      ) : services.length === 0 ? (
        <div
          style={{
            ...surface,
            textAlign: "center",
            padding: "64px 24px",
          }}
        >
          <p style={{ fontSize: 14, color: "rgba(242,242,245,0.3)", margin: 0 }}>
            No services yet. Create your first bookable service.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {services.map((s) => (
            <div
              key={s.id}
              style={{
                ...surface,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: s.active ? 1 : 0.55,
                transition: "opacity 0.2s",
              }}
            >
              {/* Color bar */}
              <div
                style={{
                  width: 4,
                  height: 44,
                  borderRadius: 4,
                  background: s.color,
                  flexShrink: 0,
                }}
              />

              {/* Service info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F5" }}>
                    {s.name}
                  </span>
                  {/* Meeting type badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(242,242,245,0.6)",
                    }}
                  >
                    <MeetingIcon type={s.meetingType} size={11} />
                    {meetingLabel(s.meetingType)}
                  </span>
                  {/* Active badge */}
                  {!s.active && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 20,
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Inactive
                    </span>
                  )}
                </div>
                {s.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(242,242,245,0.4)",
                      margin: "0 0 5px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.description}
                  </p>
                )}
                {/* Availability days */}
                {s.availableDays && s.availableDays.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {DAYS_OF_WEEK.map((d) => (
                      <span
                        key={d}
                        style={{
                          fontSize: 10,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: s.availableDays.includes(d)
                            ? s.color + "25"
                            : "rgba(255,255,255,0.03)",
                          color: s.availableDays.includes(d)
                            ? s.color
                            : "rgba(242,242,245,0.2)",
                          fontWeight: 500,
                        }}
                      >
                        {d}
                      </span>
                    ))}
                    {s.startTime && s.endTime && (
                      <span style={{ fontSize: 10, color: "rgba(242,242,245,0.3)", marginLeft: 4 }}>
                        {s.startTime} – {s.endTime}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(242,242,245,0.5)", fontSize: 13 }}>
                  <Clock size={13} />
                  {s.duration} min
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(242,242,245,0.5)", fontSize: 13 }}>
                  <DollarSign size={13} />
                  {s.price.toFixed(2)}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleActive(s.id, s.active)}
                  title={s.active ? "Deactivate" : "Activate"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: s.active ? "#22c55e" : "rgba(242,242,245,0.3)",
                  }}
                >
                  {s.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteService(s.id)}
                  title="Delete service"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(239,68,68,0.6)",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create service modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#1a1a1f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F2F2F5", margin: 0 }}>
                New Service
              </h3>
              <button
                onClick={() => { setOpen(false); resetForm(); }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: 8,
                  padding: 6,
                  cursor: "pointer",
                  color: "rgba(242,242,245,0.5)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 30-Minute Consultation"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Describe this service..."
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* Duration + Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                    style={{ ...inputStyle, appearance: "none" }}
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: c,
                        border: form.color === c ? "2px solid #F2F2F5" : "2px solid transparent",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: form.color === c ? `3px solid ${c}40` : "none",
                        outlineOffset: 1,
                        transition: "border 0.15s, outline 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Meeting type */}
              <div>
                <label style={labelStyle}>Meeting Type</label>
                <select
                  value={form.meetingType}
                  onChange={(e) => setForm((f) => ({ ...f, meetingType: e.target.value }))}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  {MEETING_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Meeting link (conditional) */}
              {LINK_REQUIRES_MEETING_TYPES.includes(form.meetingType) && (
                <div>
                  <label style={labelStyle}>Meeting Link</label>
                  <input
                    type="url"
                    value={form.meetingLink}
                    onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                    placeholder="https://zoom.us/j/..."
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Available days */}
              <div>
                <label style={labelStyle}>Available Days</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS_OF_WEEK.map((day) => {
                    const active = form.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1px solid",
                          borderColor: active ? form.color : "rgba(255,255,255,0.1)",
                          background: active ? form.color + "20" : "rgba(255,255,255,0.03)",
                          color: active ? form.color : "rgba(242,242,245,0.4)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start / End time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button
                onClick={() => { setOpen(false); resetForm(); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(242,242,245,0.6)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createService}
                disabled={saving || !form.name}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: "#F59E0B",
                  border: "none",
                  color: "#111114",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving || !form.name ? 0.5 : 1,
                }}
              >
                {saving ? "Creating..." : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
