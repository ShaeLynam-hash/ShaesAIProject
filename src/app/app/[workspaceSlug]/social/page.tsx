"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Clock, CheckCircle2, Send, Calendar, Edit3, X, Sparkles, Globe, Camera, Users, Briefcase } from "lucide-react";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
}

const PLATFORMS = [
  { id: "twitter",   label: "X / Twitter", icon: Globe,     color: "#000000", limit: 280 },
  { id: "instagram", label: "Instagram",   icon: Camera,    color: "#E1306C", limit: 2200 },
  { id: "facebook",  label: "Facebook",    icon: Users,     color: "#1877F2", limit: 63206 },
  { id: "linkedin",  label: "LinkedIn",    icon: Briefcase, color: "#0A66C2", limit: 3000 },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: "rgba(255,255,255,0.06)", color: "var(--obs-muted)", label: "Draft" },
  SCHEDULED: { bg: "#3B82F622", color: "#3B82F6", label: "Scheduled" },
  PUBLISHED: { bg: "#10B98122", color: "#10B981", label: "Published" },
  FAILED:    { bg: "#EF444422", color: "#EF4444", label: "Failed" },
};

export default function SocialPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);

  // Composer state
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "instagram"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [activePreview, setActivePreview] = useState("twitter");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/social?workspace=${workspaceSlug}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openComposer = (post?: SocialPost) => {
    if (post) {
      setEditing(post);
      setContent(post.content);
      setSelectedPlatforms(post.platforms);
      setScheduledAt(post.scheduledAt ? post.scheduledAt.slice(0, 16) : "");
    } else {
      setEditing(null);
      setContent("");
      setSelectedPlatforms(["twitter", "instagram"]);
      setScheduledAt("");
    }
    setShowAi(false);
    setAiPrompt("");
    setComposing(true);
  };

  const closeComposer = () => { setComposing(false); setEditing(null); };

  const savePost = async () => {
    if (!content.trim() || !selectedPlatforms.length) return;
    setSaving(true);
    if (editing) {
      await fetch(`/api/social/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, scheduledAt: scheduledAt || null }),
      });
    } else {
      await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, content, platforms: selectedPlatforms, scheduledAt: scheduledAt || null }),
      });
    }
    setSaving(false);
    closeComposer();
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/social/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const markPublished = async (id: string) => {
    await fetch(`/api/social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED", publishedAt: new Date().toISOString() }),
    });
    fetchPosts();
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, type: "social", platforms: selectedPlatforms }),
      });
      const data = await res.json();
      if (data.content) setContent(data.content);
    } catch { /* silent */ }
    setAiLoading(false);
    setShowAi(false);
    setAiPrompt("");
  };

  const filtered = filter === "ALL" ? posts : posts.filter(p => p.status === filter);
  const activeLimit = PLATFORMS.find(p => p.id === activePreview)?.limit ?? 280;
  const charCount = content.length;
  const overLimit = charCount > activeLimit;

  // Stats
  const scheduled = posts.filter(p => p.status === "SCHEDULED").length;
  const published = posts.filter(p => p.status === "PUBLISHED").length;
  const drafts = posts.filter(p => p.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Social Media</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>Schedule and manage posts across all platforms</p>
        </div>
        <button onClick={() => openComposer()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "var(--obs-accent)", color: "#fff" }}>
          <Plus size={14} /> Create Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Scheduled", value: scheduled, color: "#3B82F6", icon: Clock },
          { label: "Published", value: published, color: "#10B981", icon: CheckCircle2 },
          { label: "Drafts", value: drafts, color: "var(--obs-muted)", icon: Edit3 },
          { label: "Total", value: posts.length, color: "var(--obs-accent)", icon: Send },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border p-4 flex items-center gap-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--obs-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: filter === f ? "var(--obs-accent)" : "var(--obs-surface)", color: filter === f ? "#fff" : "var(--obs-muted)", border: `1px solid ${filter === f ? "transparent" : "var(--obs-border)"}` }}>
            {f === "ALL" ? "All Posts" : STATUS_STYLE[f]?.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="text-center py-12 text-sm" style={{ color: "var(--obs-muted)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
          <Send size={36} style={{ color: "var(--obs-muted)", margin: "0 auto 12px", display: "block" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>No posts yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Create your first post to get started</p>
          <button onClick={() => openComposer()} className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--obs-accent)", color: "#fff" }}>
            <Plus size={12} className="inline mr-1" />Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const s = STATUS_STYLE[post.status] ?? STATUS_STYLE.DRAFT;
            return (
              <div key={post.id} className="rounded-xl border p-4" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Platform icons */}
                    <div className="flex items-center gap-2 mb-2">
                      {post.platforms.map(pid => {
                        const p = PLATFORMS.find(x => x.id === pid);
                        if (!p) return null;
                        const Icon = p.icon;
                        return <Icon key={pid} size={14} style={{ color: p.color }} />;
                      })}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      {post.scheduledAt && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--obs-muted)" }}>
                          <Calendar size={11} /> {new Date(post.scheduledAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    {/* Content preview */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--obs-text)" }}>{post.content.slice(0, 280)}{post.content.length > 280 ? "…" : ""}</p>
                    <p className="text-xs mt-2" style={{ color: "var(--obs-muted)" }}>Created {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {post.status !== "PUBLISHED" && (
                      <button onClick={() => markPublished(post.id)} className="p-2 rounded-lg text-xs" style={{ background: "#10B98115", color: "#10B981" }} title="Mark as published">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button onClick={() => openComposer(post)} className="p-2 rounded-lg" style={{ background: "var(--obs-elevated)", color: "var(--obs-muted)" }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deletePost(post.id)} className="p-2 rounded-lg" style={{ background: "var(--obs-elevated)", color: "var(--obs-danger)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Composer Modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col" style={{ background: "var(--obs-surface)", maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--obs-border)" }}>
              <h2 className="text-base font-semibold" style={{ color: "var(--obs-text)" }}>{editing ? "Edit Post" : "Create Post"}</h2>
              <button onClick={closeComposer} style={{ color: "var(--obs-muted)" }}><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Platform selector */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--obs-muted)" }}>PLATFORMS</label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORMS.map(p => {
                    const Icon = p.icon;
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button key={p.id}
                        onClick={() => setSelectedPlatforms(prev => active ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={{ borderColor: active ? p.color : "var(--obs-border)", background: active ? p.color + "15" : "var(--obs-elevated)", color: active ? p.color : "var(--obs-muted)" }}>
                        <Icon size={13} /> {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI helper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: "var(--obs-muted)" }}>CONTENT</label>
                  <button onClick={() => setShowAi(x => !x)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: "#8B5CF620", color: "#8B5CF6" }}>
                    <Sparkles size={11} /> AI Write
                  </button>
                </div>

                {showAi && (
                  <div className="flex gap-2 mb-3">
                    <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && generateWithAI()}
                      placeholder="Describe what to write (e.g. 'Announce our summer sale with emojis')"
                      className="flex-1 px-3 py-2 rounded-lg border text-sm"
                      style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                    <button onClick={generateWithAI} disabled={aiLoading} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "#8B5CF6", color: "#fff", opacity: aiLoading ? 0.7 : 1 }}>
                      {aiLoading ? "…" : "Generate"}
                    </button>
                  </div>
                )}

                <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
                  placeholder="What's on your mind? Use {{first_name}} for personalization…"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
                  style={{ background: "var(--obs-bg)", borderColor: overLimit ? "var(--obs-danger)" : "var(--obs-border)", color: "var(--obs-text)" }} />

                {/* Char counts per platform */}
                <div className="flex gap-4 mt-1.5">
                  {selectedPlatforms.map(pid => {
                    const p = PLATFORMS.find(x => x.id === pid);
                    if (!p) return null;
                    const over = charCount > p.limit;
                    return (
                      <span key={pid} className="text-xs" style={{ color: over ? "var(--obs-danger)" : "var(--obs-muted)" }}>
                        {p.label}: {charCount}/{p.limit}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Platform preview */}
              {content && selectedPlatforms.length > 0 && (
                <div>
                  <div className="flex gap-1 mb-3">
                    {selectedPlatforms.map(pid => {
                      const p = PLATFORMS.find(x => x.id === pid);
                      if (!p) return null;
                      const Icon = p.icon;
                      return (
                        <button key={pid} onClick={() => setActivePreview(pid)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                          style={{ background: activePreview === pid ? p.color + "20" : "var(--obs-elevated)", color: activePreview === pid ? p.color : "var(--obs-muted)" }}>
                          <Icon size={11} /> {p.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Preview card */}
                  <div className="rounded-xl border p-4" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Your Business</p>
                        <p className="text-xs text-gray-400">@yourbusiness · now</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{content.slice(0, activeLimit)}</p>
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--obs-muted)" }}>SCHEDULE (optional)</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }} />
                <p className="text-xs mt-1" style={{ color: "var(--obs-muted)" }}>Leave blank to save as draft</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--obs-border)" }}>
              <button onClick={closeComposer} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "var(--obs-border)", color: "var(--obs-muted)" }}>Cancel</button>
              <button onClick={savePost} disabled={saving || !content.trim() || !selectedPlatforms.length}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--obs-accent)", color: "#fff", opacity: (saving || !content.trim()) ? 0.6 : 1 }}>
                {saving ? "Saving…" : scheduledAt ? "Schedule Post" : editing ? "Save Changes" : "Save Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
