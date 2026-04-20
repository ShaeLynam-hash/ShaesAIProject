"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Plus, Trash2, Edit2, AlertCircle, ArrowUp, Minus,
  ArrowDown, Calendar, Loader2, X, Check,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  dueDate: string | null;
  position: number;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  color: string;
  dueDate: string | null;
  tasks: Task[];
};

type ProjectSummary = {
  id: string;
  name: string;
  color: string;
  status: string;
  dueDate: string | null;
  _count: { tasks: number };
  tasks: { status: string }[];
};

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "TODO",        label: "To Do",      color: "#6B7280" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#3B82F6" },
  { key: "REVIEW",      label: "Review",      color: "#F59E0B" },
  { key: "DONE",        label: "Done",        color: "#10B981" },
];

const PRI: Record<string, { icon: React.ReactNode; color: string }> = {
  LOW:    { icon: <ArrowDown size={11} />,   color: "#6B7280" },
  MEDIUM: { icon: <Minus size={11} />,       color: "#F59E0B" },
  HIGH:   { icon: <ArrowUp size={11} />,     color: "#EF4444" },
  URGENT: { icon: <AlertCircle size={11} />, color: "#DC2626" },
};

const COLORS = ["#6366F1","#8B5CF6","#EC4899","#EF4444","#F59E0B","#10B981","#3B82F6","#06B6D4"];

export default function ProjectsPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selected, setSelected]   = useState<Project | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [newName, setNewName]     = useState("");
  const [newColor, setNewColor]   = useState("#6366F1");
  const [saving, setSaving]       = useState(false);
  const [addingCol, setAddingCol] = useState<string | null>(null);
  const [newTitle, setNewTitle]   = useState("");
  const [editing, setEditing]     = useState<Task | null>(null);
  const dragging = useRef<{ taskId: string; from: string } | null>(null);

  const fetchProjects = async () => {
    const r = await fetch(`/api/projects?workspace=${workspaceSlug}`);
    const d = await r.json();
    setProjects(d.projects ?? []);
    setLoading(false);
  };

  const fetchProject = async (id: string) => {
    const r = await fetch(`/api/projects/${id}`);
    const d = await r.json();
    setSelected(d.project);
  };

  useEffect(() => { fetchProjects(); }, [workspaceSlug]);

  const createProject = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, name: newName.trim(), color: newColor }),
    });
    setNewName(""); setNewColor("#6366F1"); setShowNew(false); setSaving(false);
    fetchProjects();
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchProjects();
  };

  const createTask = async (status: string) => {
    if (!newTitle.trim() || !selected) return;
    await fetch(`/api/projects/${selected.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), status }),
    });
    setNewTitle(""); setAddingCol(null);
    fetchProject(selected.id);
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!selected) return;
    await fetch(`/api/projects/${selected.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchProject(selected.id);
  };

  const deleteTask = async (taskId: string) => {
    if (!selected) return;
    await fetch(`/api/projects/${selected.id}/tasks/${taskId}`, { method: "DELETE" });
    fetchProject(selected.id);
  };

  const onDrop = async (toCol: string) => {
    if (!dragging.current || dragging.current.from === toCol) return;
    await updateTask(dragging.current.taskId, { status: toCol as Task["status"] });
    dragging.current = null;
  };

  const colTasks = (key: string) =>
    (selected?.tasks ?? []).filter((t) => t.status === key).sort((a, b) => a.position - b.position);

  const progress = (p: ProjectSummary) => {
    const done = p.tasks.filter((t) => t.status === "DONE").length;
    return p._count.tasks > 0 ? Math.round((done / p._count.tasks) * 100) : 0;
  };

  const inputStyle = {
    width: "100%", padding: "7px 11px", borderRadius: 7, fontSize: 13,
    background: "var(--obs-bg)", border: "1px solid var(--obs-border)",
    color: "var(--obs-text)", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--obs-bg)", color: "var(--obs-text)" }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: "1px solid var(--obs-border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 14px 12px", borderBottom: "1px solid var(--obs-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Projects</span>
          <button onClick={() => setShowNew(true)} style={{ background: "#F59E0B", color: "#000", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <Plus size={13} /> New
          </button>
        </div>

        {showNew && (
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--obs-border)", background: "var(--obs-elevated)" }}>
            <input autoFocus placeholder="Project name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createProject()} style={inputStyle} />
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: newColor === c ? `2px solid ${c}` : "none", outlineOffset: 2 }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button onClick={createProject} disabled={saving} style={{ flex: 1, padding: "6px", background: "#F59E0B", color: "#000", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {saving ? "Creating…" : "Create"}
              </button>
              <button onClick={() => setShowNew(false)} style={{ padding: "6px 10px", background: "var(--obs-surface)", color: "var(--obs-muted)", border: "1px solid var(--obs-border)", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--obs-muted)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--obs-muted)", fontSize: 13 }}>No projects yet</div>
          ) : projects.map((p) => (
            <div key={p.id} onClick={() => fetchProject(p.id)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: selected?.id === p.id ? "rgba(245,158,11,0.08)" : "transparent", border: selected?.id === p.id ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{p.name}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 2 }}>
                  <Trash2 size={11} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: "var(--obs-surface)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${progress(p)}%`, height: "100%", background: p.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--obs-muted)" }}>{progress(p)}%</span>
              </div>
              <div style={{ marginTop: 3, fontSize: 11, color: "var(--obs-muted)" }}>
                {p._count.tasks} task{p._count.tasks !== 1 ? "s" : ""}
                {p.dueDate && ` · Due ${new Date(p.dueDate).toLocaleDateString()}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--obs-muted)" }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ fontSize: 14 }}>Select a project to view its board</p>
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--obs-border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: selected.color }} />
              <span style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</span>
              {selected.description && <span style={{ fontSize: 13, color: "var(--obs-muted)" }}>{selected.description}</span>}
              <div style={{ flex: 1 }} />
              {selected.dueDate && (
                <span style={{ fontSize: 12, color: "var(--obs-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={12} /> Due {new Date(selected.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div style={{ flex: 1, display: "flex", gap: 14, padding: 18, overflowX: "auto", alignItems: "flex-start" }}>
              {COLUMNS.map((col) => {
                const tasks = colTasks(col.key);
                return (
                  <div key={col.key} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(col.key)}
                    style={{ width: 265, flexShrink: 0, background: "var(--obs-surface)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--obs-border)" }}>
                    <div style={{ padding: "11px 13px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid var(--obs-border)" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.color }} />
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{col.label}</span>
                      <span style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>{tasks.length}</span>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => { setAddingCol(col.key); setNewTitle(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)" }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ padding: 7, minHeight: 60, display: "flex", flexDirection: "column", gap: 5 }}>
                      {tasks.map((task) => {
                        const pri = PRI[task.priority];
                        return (
                          <div key={task.id} draggable onDragStart={() => { dragging.current = { taskId: task.id, from: col.key }; }}
                            style={{ background: "var(--obs-bg)", borderRadius: 7, padding: "9px 11px", border: "1px solid var(--obs-border)", cursor: "grab" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                              <span style={{ flex: 1, fontSize: 12, lineHeight: 1.4, fontWeight: 500 }}>{task.title}</span>
                              <button onClick={() => setEditing(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 2, flexShrink: 0 }}><Edit2 size={10} /></button>
                              <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)", padding: 2, flexShrink: 0 }}><Trash2 size={10} /></button>
                            </div>
                            {task.description && <p style={{ fontSize: 11, color: "var(--obs-muted)", marginTop: 3, lineHeight: 1.4 }}>{task.description}</p>}
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: pri.color }}>{pri.icon} {task.priority}</span>
                              {task.dueDate && (
                                <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: "var(--obs-muted)" }}>
                                  <Calendar size={9} /> {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {addingCol === col.key ? (
                        <div style={{ background: "var(--obs-bg)", borderRadius: 7, padding: 8, border: "1px solid #F59E0B" }}>
                          <input autoFocus placeholder="Task title…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") createTask(col.key); if (e.key === "Escape") setAddingCol(null); }}
                            style={{ width: "100%", background: "transparent", border: "none", color: "var(--obs-text)", fontSize: 12, outline: "none" }} />
                          <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                            <button onClick={() => createTask(col.key)} style={{ padding: "3px 9px", background: "#F59E0B", color: "#000", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Add</button>
                            <button onClick={() => setAddingCol(null)} style={{ padding: "3px 7px", background: "transparent", color: "var(--obs-muted)", border: "none", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setAddingCol(col.key); setNewTitle(""); }}
                          style={{ width: "100%", padding: "7px", background: "transparent", border: "1px dashed var(--obs-border)", borderRadius: 7, color: "var(--obs-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                          <Plus size={11} /> Add task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--obs-surface)", borderRadius: 12, padding: 22, width: 440, border: "1px solid var(--obs-border)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Edit Task</span>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--obs-muted)" }}><X size={16} /></button>
            </div>
            <input placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={inputStyle} />
            <textarea placeholder="Description (optional)" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--obs-muted)", display: "block", marginBottom: 3 }}>Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Task["status"] })} style={inputStyle}>
                  {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--obs-muted)", display: "block", marginBottom: 3 }}>Priority</label>
                <select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value as Task["priority"] })} style={inputStyle}>
                  {["LOW","MEDIUM","HIGH","URGENT"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--obs-muted)", display: "block", marginBottom: 3 }}>Due Date</label>
              <input type="date" value={editing.dueDate ? editing.dueDate.slice(0, 10) : ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value || null })} style={{ ...inputStyle, width: "auto" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={{ padding: "7px 14px", background: "var(--obs-bg)", color: "var(--obs-muted)", border: "1px solid var(--obs-border)", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => { await updateTask(editing.id, { title: editing.title, description: editing.description, status: editing.status, priority: editing.priority, dueDate: editing.dueDate }); setEditing(null); }}
                style={{ padding: "7px 18px", background: "#F59E0B", color: "#000", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={13} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
