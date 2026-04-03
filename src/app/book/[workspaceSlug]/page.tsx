"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Clock, DollarSign, ChevronLeft } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
}

interface WorkspaceInfo {
  name: string;
  slug: string;
}

// Generate 9am–5pm time slots every 30 min
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

type Step = "services" | "datetime" | "details" | "success";

export default function PublicBookingPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("services");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/booking/public/${workspaceSlug}`)
      .then(r => r.json())
      .then(d => { setWorkspace(d.workspace); setServices(d.services ?? []); setLoading(false); });
  }, [workspaceSlug]);

  async function submit() {
    if (!selectedService || !selectedDate || !selectedTime || !form.name || !form.email) return;
    setSubmitting(true);
    setError("");
    const dateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const res = await fetch(`/api/booking/public/${workspaceSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selectedService.id, clientName: form.name, clientEmail: form.email, clientPhone: form.phone, date: dateTime }),
    });
    if (res.ok) {
      setStep("success");
    } else {
      const d = await res.json();
      setError(d.error ?? "Something went wrong");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--obs-bg)" }}>
        <p className="text-sm" style={{ color: "var(--obs-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "var(--obs-bg)" }}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--obs-accent)" }}>
            <CalendarCheck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--obs-text)" }}>{workspace?.name ?? workspaceSlug}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--obs-muted)" }}>Book an appointment</p>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          {/* Step: services */}
          {step === "services" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Select a Service</h2>
              {services.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--obs-muted)" }}>No services available</p>
              ) : (
                <div className="space-y-2">
                  {services.map(s => (
                    <button key={s.id} onClick={() => { setSelectedService(s); setStep("datetime"); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors hover:opacity-90"
                      style={{ background: "var(--obs-elevated)", borderColor: "var(--obs-border)" }}>
                      <div className="w-3 h-10 rounded-full shrink-0" style={{ background: s.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{s.name}</p>
                        {s.description && <p className="text-xs mt-0.5" style={{ color: "var(--obs-muted)" }}>{s.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs justify-end" style={{ color: "var(--obs-muted)" }}>
                          <Clock size={11} />{s.duration} min
                        </div>
                        {s.price > 0 && (
                          <div className="flex items-center gap-1 text-xs justify-end mt-0.5" style={{ color: "var(--obs-accent)" }}>
                            <DollarSign size={11} />{s.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: datetime */}
          {step === "datetime" && selectedService && (
            <div className="space-y-4">
              <button onClick={() => setStep("services")} className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-muted)" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--obs-elevated)" }}>
                <div className="w-2 h-8 rounded-full" style={{ background: selectedService.color }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>{selectedService.name}</p>
                  <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{selectedService.duration} min{selectedService.price > 0 ? ` · $${selectedService.price.toFixed(2)}` : ""}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>Select Date</label>
                <input type="date" value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
              </div>
              {selectedDate && (
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: "var(--obs-muted)" }}>Select Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className="py-2 rounded-lg border text-xs font-medium transition-colors"
                        style={{
                          background: selectedTime === t ? "var(--obs-accent)" : "var(--obs-elevated)",
                          borderColor: selectedTime === t ? "var(--obs-accent)" : "var(--obs-border)",
                          color: selectedTime === t ? "#fff" : "var(--obs-muted)",
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedDate && selectedTime && (
                <button onClick={() => setStep("details")}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: "var(--obs-accent)" }}>
                  Continue
                </button>
              )}
            </div>
          )}

          {/* Step: details */}
          {step === "details" && (
            <div className="space-y-4">
              <button onClick={() => setStep("datetime")} className="flex items-center gap-1 text-xs" style={{ color: "var(--obs-muted)" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <h2 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Your Details</h2>
              {[
                { key: "name", label: "Full Name *", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email *", type: "email", placeholder: "john@example.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555-0000" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--obs-muted)" }}>{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                </div>
              ))}
              {error && <p className="text-xs" style={{ color: "var(--obs-danger)" }}>{error}</p>}
              <button onClick={submit} disabled={submitting || !form.name || !form.email}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--obs-accent)" }}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}

          {/* Step: success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--obs-success)18" }}>
                <CalendarCheck size={24} style={{ color: "var(--obs-success)" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--obs-text)" }}>Booking Confirmed!</h2>
              <p className="text-sm" style={{ color: "var(--obs-muted)" }}>
                Your appointment for <strong style={{ color: "var(--obs-text)" }}>{selectedService?.name}</strong> on{" "}
                <strong style={{ color: "var(--obs-text)" }}>{selectedDate} at {selectedTime}</strong> has been submitted.
              </p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>You'll receive a confirmation at {form.email}</p>
              <button onClick={() => { setStep("services"); setSelectedService(null); setSelectedDate(""); setSelectedTime(""); setForm({ name: "", email: "", phone: "" }); }}
                className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "var(--obs-accent)" }}>
                Book Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
