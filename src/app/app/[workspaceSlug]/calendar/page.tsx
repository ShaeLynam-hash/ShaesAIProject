"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  User,
  Mail,
  Phone,
  Video,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#22c55e",
  CANCELLED: "#ef4444",
  COMPLETED: "#6366f1",
};

interface Service {
  id: string;
  name: string;
  color: string;
  duration: number;
  meetingType?: string;
  meetingLink?: string;
  availableDays?: string[];
  startTime?: string;
  endTime?: string;
}

interface Appointment {
  id: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  notes?: string;
  status: string;
  meetingLink?: string;
  service?: Service;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isoDateStr(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function matchesDay(appt: Appointment, year: number, month: number, day: number) {
  const apptDate = new Date(appt.date);
  return (
    apptDate.getFullYear() === year &&
    apptDate.getMonth() === month &&
    apptDate.getDate() === day
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#F2F2F5",
  padding: "8px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(242,242,245,0.5)",
  marginBottom: 4,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function CalendarPage() {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  async function loadData() {
    setLoadingAppts(true);
    const [apptRes, svcRes] = await Promise.all([
      fetch(`/api/booking/appointments?workspace=${workspaceSlug}`),
      fetch(`/api/booking/services?workspace=${workspaceSlug}`),
    ]);
    const apptData = await apptRes.json();
    const svcData = await svcRes.json();
    const svcs: Service[] = svcData.services ?? [];
    const appts: Appointment[] = (apptData.appointments ?? []).map((a: Appointment) => ({
      ...a,
      service: svcs.find((s) => s.id === a.serviceId),
    }));
    setServices(svcs);
    setAppointments(appts);
    setLoadingAppts(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = Array.from(
    { length: firstDay + daysInMonth },
    (_, i) => (i < firstDay ? null : i - firstDay + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const dayAppointments = selectedDay
    ? appointments.filter((a) => matchesDay(a, year, month, selectedDay))
    : [];

  async function createAppointment() {
    if (!form.serviceName.trim() || !form.clientName || !form.clientEmail || !selectedDay) return;
    setSaving(true);

    // Find existing service by name (case-insensitive) or create a new one on the fly
    let serviceId = services.find(
      (s) => s.name.toLowerCase() === form.serviceName.trim().toLowerCase()
    )?.id;

    if (!serviceId) {
      const res = await fetch("/api/booking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, name: form.serviceName.trim(), duration: 60, price: 0 }),
      });
      const data = await res.json();
      serviceId = data.service?.id;
    }

    if (!serviceId) { setSaving(false); return; }

    const dateObj = new Date(year, month, selectedDay, 9, 0, 0);
    await fetch("/api/booking/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        serviceId,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        date: dateObj.toISOString(),
        notes: form.notes,
      }),
    });
    setSaving(false);
    setModalOpen(false);
    setForm({ serviceName: "", clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    loadData();
  }

  const selectedDateLabel = selectedDay
    ? `${MONTHS[month]} ${selectedDay}, ${year}`
    : null;

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        minHeight: "calc(100vh - 120px)",
        background: "#111114",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Calendar grid */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={prevMonth}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 8px",
                cursor: "pointer",
                color: "#F2F2F5",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#F2F2F5",
                margin: 0,
                minWidth: 180,
                textAlign: "center",
              }}
            >
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 8px",
                cursor: "pointer",
                color: "#F2F2F5",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => {
              setModalOpen(true);
              if (!selectedDay) setSelectedDay(today.getDate());
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#F59E0B",
              color: "#111114",
              fontWeight: 600,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> New Appointment
          </button>
        </div>

        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                padding: "10px 0",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(242,242,245,0.4)",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            flex: 1,
          }}
        >
          {cells.map((day, i) => {
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const isSelected = day === selectedDay;
            const isWeekend = i % 7 === 0 || i % 7 === 6;
            const cellAppts = day
              ? appointments.filter((a) => matchesDay(a, year, month, day))
              : [];
            const visible = cellAppts.slice(0, 2);
            const overflow = cellAppts.length - 2;

            return (
              <div
                key={i}
                onClick={() => day && setSelectedDay(day)}
                style={{
                  minHeight: 88,
                  padding: "8px 6px 6px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  borderRight: i % 7 !== 6 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: isSelected
                    ? "rgba(245,158,11,0.07)"
                    : isWeekend
                    ? "rgba(0,0,0,0.2)"
                    : "transparent",
                  cursor: day ? "pointer" : "default",
                  transition: "background 0.15s",
                  position: "relative",
                }}
              >
                {day && (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          fontSize: 12,
                          fontWeight: isToday ? 700 : 500,
                          background: isToday ? "#F59E0B" : "transparent",
                          color: isToday ? "#111114" : isSelected ? "#F59E0B" : "rgba(242,242,245,0.8)",
                        }}
                      >
                        {day}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {visible.map((a) => {
                        const svc = a.service;
                        const color = svc?.color ?? STATUS_COLORS[a.status] ?? "#6366f1";
                        return (
                          <div
                            key={a.id}
                            style={{
                              background: color + "28",
                              borderLeft: `2px solid ${color}`,
                              borderRadius: 3,
                              padding: "1px 4px",
                              fontSize: 10,
                              fontWeight: 500,
                              color: color,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {fmtTime(a.date)} {a.service?.name ?? "Appt"}
                          </div>
                        );
                      })}
                      {overflow > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(242,242,245,0.4)",
                            paddingLeft: 4,
                          }}
                        >
                          +{overflow} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right sidebar */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#F2F2F5",
                  margin: 0,
                }}
              >
                {selectedDateLabel ?? "Select a day"}
              </p>
              {selectedDay && (
                <p style={{ fontSize: 11, color: "rgba(242,242,245,0.4)", margin: "2px 0 0" }}>
                  {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {selectedDay && (
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 12px",
                  borderRadius: 7,
                  background: "#F59E0B",
                  color: "#111114",
                  fontWeight: 600,
                  fontSize: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={12} /> Book
              </button>
            )}
          </div>
        </div>

        {/* Appointment list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {!selectedDay ? (
            <p style={{ fontSize: 12, color: "rgba(242,242,245,0.3)", textAlign: "center", marginTop: 40 }}>
              Click a day to view appointments
            </p>
          ) : loadingAppts ? (
            <p style={{ fontSize: 12, color: "rgba(242,242,245,0.3)", textAlign: "center", marginTop: 40 }}>
              Loading...
            </p>
          ) : dayAppointments.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <p style={{ fontSize: 12, color: "rgba(242,242,245,0.3)" }}>No appointments</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayAppointments.map((a) => {
                const svc = a.service;
                const dotColor = svc?.color ?? "#6366f1";
                const statusColor = STATUS_COLORS[a.status] ?? "#6366f1";
                const meetLink = a.meetingLink ?? svc?.meetingLink;
                const meetType = svc?.meetingType ?? "";

                return (
                  <div
                    key={a.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    {/* Service name + status */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: dotColor,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F5" }}>
                          {svc?.name ?? "Appointment"}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 7px",
                          borderRadius: 20,
                          background: statusColor + "22",
                          color: statusColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {a.status}
                      </span>
                    </div>

                    {/* Time + duration */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "rgba(242,242,245,0.5)" }}>
                      <Clock size={11} />
                      <span style={{ fontSize: 11 }}>
                        {fmtTime(a.date)}{svc?.duration ? ` · ${svc.duration} min` : ""}
                      </span>
                    </div>

                    {/* Client info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(242,242,245,0.6)" }}>
                        <User size={11} />
                        <span style={{ fontSize: 11 }}>{a.clientName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(242,242,245,0.6)" }}>
                        <Mail size={11} />
                        <span style={{ fontSize: 11 }}>{a.clientEmail}</span>
                      </div>
                      {a.clientPhone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(242,242,245,0.6)" }}>
                          <Phone size={11} />
                          <span style={{ fontSize: 11 }}>{a.clientPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Meeting link */}
                    {meetLink && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 10,
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "rgba(99,102,241,0.15)",
                          color: "#818cf8",
                          fontSize: 11,
                          fontWeight: 600,
                          textDecoration: "none",
                          border: "1px solid rgba(99,102,241,0.25)",
                        }}
                      >
                        <Video size={11} />
                        Join {meetType === "zoom" ? "Zoom" : meetType === "google_meet" ? "Meet" : "Meeting"}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Services legend */}
        {services.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(242,242,245,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
              Services
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {services.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "rgba(242,242,245,0.6)" }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(242,242,245,0.3)", marginLeft: "auto" }}>
                    {s.duration} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#1a1a1f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F2F2F5", margin: 0 }}>
                  New Appointment
                </h3>
                {selectedDateLabel && (
                  <p style={{ fontSize: 12, color: "rgba(242,242,245,0.4)", margin: "2px 0 0" }}>
                    {selectedDateLabel}
                  </p>
                )}
              </div>
              <button
                onClick={() => setModalOpen(false)}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Service text input with autocomplete */}
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Service *</label>
                <input
                  value={form.serviceName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, serviceName: e.target.value }));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  placeholder="e.g. Haircut, Consultation, 1-on-1 Call…"
                  style={inputStyle}
                  autoComplete="off"
                />
                {showSuggestions && services.filter((s) =>
                  s.name.toLowerCase().includes(form.serviceName.toLowerCase())
                ).length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, marginTop: 4, overflow: "hidden",
                  }}>
                    {services
                      .filter((s) => s.name.toLowerCase().includes(form.serviceName.toLowerCase()))
                      .map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={() => {
                            setForm((f) => ({ ...f, serviceName: s.name }));
                            setShowSuggestions(false);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, width: "100%",
                            padding: "9px 12px", background: "transparent", border: "none",
                            cursor: "pointer", textAlign: "left", color: "#F2F2F5",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13 }}>{s.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{s.duration} min</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Client name */}
              <div>
                <label style={labelStyle}>Client Name *</label>
                <input
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="Jane Smith"
                  style={inputStyle}
                />
              </div>

              {/* Client email */}
              <div>
                <label style={labelStyle}>Client Email *</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                  placeholder="jane@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Client phone */}
              <div>
                <label style={labelStyle}>Client Phone</label>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  style={inputStyle}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any additional notes..."
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={() => setModalOpen(false)}
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
                onClick={createAppointment}
                disabled={saving || !form.serviceName.trim() || !form.clientName || !form.clientEmail}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: "#F59E0B",
                  border: "none",
                  color: "#111114",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving || !form.serviceName.trim() || !form.clientName || !form.clientEmail ? 0.5 : 1,
                }}
              >
                {saving ? "Saving..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
