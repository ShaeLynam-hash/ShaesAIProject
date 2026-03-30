"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Calendar</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Schedule, events, and bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--obs-accent)" }}>
            <Plus size={15} /> New Event
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--obs-muted)" }}><ChevronLeft size={16} /></button>
          <h3 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--obs-muted)" }}><ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--obs-border)" }}>
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--obs-muted)" }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isWeekend = (i % 7 === 0 || i % 7 === 6);
            return (
              <div key={i} className="min-h-[80px] p-2 border-b border-r last:border-r-0 cursor-pointer hover:bg-white/2 transition-colors"
                style={{ borderColor: "var(--obs-border)", background: isWeekend ? "var(--obs-bg)" : "transparent" }}>
                {day && (
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "text-white" : ""}`}
                    style={{
                      background: isToday ? "var(--obs-accent)" : "transparent",
                      color: isToday ? "#fff" : "var(--obs-text)",
                    }}>
                    {day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
