"use client";
import { useState, use } from "react";
import { Copy, Check, Code2, ExternalLink } from "lucide-react";

interface Props { params: Promise<{ workspaceSlug: string }> }

export default function EmbedPage({ params }: Props) {
  const { workspaceSlug } = use(params);
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";
  const bookingUrl = `${baseUrl}/book/${workspaceSlug}`;

  const snippets = {
    button: `<!-- Stactoro Booking Widget -->
<script>
  (function() {
    var btn = document.createElement('button');
    btn.textContent = 'Book Now';
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#F59E0B;color:#000;font-weight:700;padding:12px 24px;border-radius:999px;border:none;cursor:pointer;font-size:15px;box-shadow:0 4px 20px rgba(245,158,11,0.4);z-index:9999';
    btn.onclick = function() {
      var iframe = document.getElementById('stactoro-iframe');
      if (iframe) { iframe.style.display = iframe.style.display === 'none' ? 'flex' : 'none'; return; }
      var overlay = document.createElement('div');
      overlay.id = 'stactoro-iframe';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px';
      var frame = document.createElement('iframe');
      frame.src = '${bookingUrl}';
      frame.style.cssText = 'width:100%;max-width:480px;height:80vh;border-radius:16px;border:none;background:#fff';
      overlay.appendChild(frame);
      overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };
      document.body.appendChild(overlay);
    };
    document.body.appendChild(btn);
  })();
</script>`,
    iframe: `<iframe
  src="${bookingUrl}"
  width="100%"
  height="600"
  style="border:none;border-radius:12px;"
  title="Book an appointment"
></iframe>`,
    link: bookingUrl,
  };

  function copy(key: string) {
    navigator.clipboard.writeText(snippets[key as keyof typeof snippets]);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--obs-text)" }}>Embed Booking Widget</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--obs-muted)" }}>
          Add a booking button or form to your own website in seconds.
        </p>
      </div>

      {/* Option 1: Floating button */}
      <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2">
          <Code2 size={15} style={{ color: "#F59E0B" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Option 1: Floating "Book Now" Button</h3>
        </div>
        <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
          Paste this before <code className="font-mono">&lt;/body&gt;</code> on any page. A floating amber button appears — clients click it to open your booking form in a popup.
        </p>
        <div className="relative">
          <pre className="text-xs font-mono p-4 rounded-lg overflow-x-auto"
            style={{ background: "var(--obs-bg)", color: "var(--obs-text)", border: "1px solid var(--obs-border)" }}>
            {snippets.button}
          </pre>
          <button onClick={() => copy("button")}
            className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-semibold"
            style={{ background: "var(--obs-elevated)", color: copied === "button" ? "#16a34a" : "var(--obs-text)" }}>
            {copied === "button" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Option 2: Inline iframe */}
      <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2">
          <Code2 size={15} style={{ color: "#6366f1" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Option 2: Inline Embed</h3>
        </div>
        <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
          Embed the booking form directly inside your page.
        </p>
        <div className="relative">
          <pre className="text-xs font-mono p-4 rounded-lg overflow-x-auto"
            style={{ background: "var(--obs-bg)", color: "var(--obs-text)", border: "1px solid var(--obs-border)" }}>
            {snippets.iframe}
          </pre>
          <button onClick={() => copy("iframe")}
            className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-semibold"
            style={{ background: "var(--obs-elevated)", color: copied === "iframe" ? "#16a34a" : "var(--obs-text)" }}>
            {copied === "iframe" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Option 3: Direct link */}
      <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--obs-surface)", borderColor: "var(--obs-border)" }}>
        <div className="flex items-center gap-2">
          <ExternalLink size={15} style={{ color: "#16a34a" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--obs-text)" }}>Option 3: Direct Link</h3>
        </div>
        <p className="text-xs" style={{ color: "var(--obs-muted)" }}>
          Share this link anywhere — email signature, Instagram bio, etc.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
            style={{ background: "var(--obs-bg)", borderColor: "var(--obs-border)", color: "var(--obs-text)" }}>
            {snippets.link}
          </div>
          <button onClick={() => copy("link")}
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-semibold whitespace-nowrap"
            style={{ background: "var(--obs-elevated)", color: copied === "link" ? "#16a34a" : "var(--obs-text)" }}>
            {copied === "link" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <a href={snippets.link} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-semibold whitespace-nowrap"
            style={{ background: "var(--obs-accent)", color: "#000" }}>
            Preview <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
