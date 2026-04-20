"use client";
import { useState, useEffect, useRef } from "react";
import { Check, X, PenLine, ChevronDown } from "lucide-react";

interface LineItem { description: string; qty: number; unitPrice: number; }
interface Block { type: string; data: Record<string, unknown>; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ProposalSignPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [proposal, setProposal] = useState<Record<string, unknown> | null>(null);
  const [workspace, setWorkspace] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedBy, setSignedBy] = useState("");
  const [sigMode, setSigMode] = useState<"type" | "draw">("type");
  const [signed, setSigned] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    params.then(p => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/proposals/sign?token=${token}`).then(r => r.json()).then(d => {
      setProposal(d.proposal);
      setWorkspace(d.proposal?.workspace);
      setLoading(false);
    });
  }, [token]);

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const endDraw = () => { drawing.current = false; };
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSign = async () => {
    if (!signedBy.trim()) return;
    let signatureData = signedBy;
    if (sigMode === "draw" && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL();
    }
    setSubmitting(true);
    await fetch("/api/proposals/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signedBy, signatureData }),
    });
    setSubmitting(false);
    setSigned(true);
  };

  const handleDecline = async () => {
    setSubmitting(true);
    await fetch("/api/proposals/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "decline", signedBy: declineReason }),
    });
    setSubmitting(false);
    setDeclined(true);
    setShowDecline(false);
  };

  const accentColor = (workspace?.wlPrimaryColor as string) ?? "#F59E0B";
  const brandName = (workspace?.wlBrandName as string) ?? (workspace?.name as string) ?? "Stactoro";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Loading proposal…</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <div className="text-center">
          <p style={{ fontSize: 18, fontWeight: 600, color: "#111" }}>Proposal not found</p>
          <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <div className="text-center bg-white rounded-2xl p-10 shadow-lg max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#10B98120" }}>
            <Check size={32} style={{ color: "#10B981" }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>Proposal Signed!</h2>
          <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>Thank you, <strong>{signedBy}</strong>. Your signature has been recorded.</p>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <div className="text-center bg-white rounded-2xl p-10 shadow-lg max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#EF444420" }}>
            <X size={32} style={{ color: "#EF4444" }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>Proposal Declined</h2>
          <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>We've noted your response. Please reach out if you have questions.</p>
        </div>
      </div>
    );
  }

  const content = proposal.content as Block[];
  const total = proposal.total as number;
  const alreadySigned = proposal.status === "SIGNED";
  const alreadyDeclined = proposal.status === "DECLINED";

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {brandName[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{brandName}</span>
      </div>

      <div style={{ maxWidth: 760, margin: "32px auto", padding: "0 16px 64px" }}>
        {/* Content blocks */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {content.map((block, i) => {
            if (block.type === "heading") {
              const level = block.data.level as number;
              return <div key={i} style={{ fontSize: level === 1 ? 28 : 20, fontWeight: 700, color: "#111", marginBottom: 16 }}>{String(block.data.text)}</div>;
            }
            if (block.type === "text") {
              return <p key={i} style={{ color: "#555", lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>{String(block.data.text)}</p>;
            }
            if (block.type === "divider") {
              return <hr key={i} style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />;
            }
            if (block.type === "lineItems") {
              const items = block.data.items as LineItem[];
              return (
                <div key={i} style={{ marginBottom: 24, borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ textAlign: "left", padding: "10px 16px", color: "#666", fontWeight: 600 }}>Description</th>
                        <th style={{ textAlign: "right", padding: "10px 16px", color: "#666", fontWeight: 600, width: 60 }}>Qty</th>
                        <th style={{ textAlign: "right", padding: "10px 16px", color: "#666", fontWeight: 600, width: 100 }}>Price</th>
                        <th style={{ textAlign: "right", padding: "10px 16px", color: "#666", fontWeight: 600, width: 100 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, ii) => (
                        <tr key={ii} style={{ borderTop: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "12px 16px", color: "#111" }}>{item.description}</td>
                          <td style={{ padding: "12px 16px", color: "#666", textAlign: "right" }}>{item.qty}</td>
                          <td style={{ padding: "12px 16px", color: "#666", textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                          <td style={{ padding: "12px 16px", color: "#111", textAlign: "right", fontWeight: 600 }}>{fmt(item.qty * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #e5e7eb", background: "#f9fafb" }}>
                        <td colSpan={3} style={{ padding: "12px 16px", fontWeight: 700, textAlign: "right", color: "#111" }}>Total</td>
                        <td style={{ padding: "12px 16px", fontWeight: 800, textAlign: "right", color: accentColor, fontSize: 16 }}>{fmt(total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            }
            if (block.type === "signature") {
              if (alreadySigned) {
                return (
                  <div key={i} style={{ padding: 24, borderRadius: 12, border: "1px solid #10B98130", background: "#10B98108", marginBottom: 16 }}>
                    <p style={{ color: "#10B981", fontSize: 14 }}><Check size={14} style={{ display: "inline", marginRight: 6 }} />Signed by <strong>{proposal.signedBy as string}</strong></p>
                  </div>
                );
              }
              return (
                <div key={i} style={{ padding: 24, borderRadius: 12, border: "2px dashed #e5e7eb", marginBottom: 24, background: "#fafafa" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <PenLine size={16} style={{ color: accentColor }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{String(block.data.label ?? "Signature")}</span>
                  </div>

                  {/* Mode toggle */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {(["type", "draw"] as const).map(m => (
                      <button key={m} onClick={() => setSigMode(m)}
                        style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid", borderColor: sigMode === m ? accentColor : "#e5e7eb", background: sigMode === m ? accentColor : "#fff", color: sigMode === m ? "#fff" : "#666", fontSize: 13, cursor: "pointer", fontWeight: sigMode === m ? 600 : 400 }}>
                        {m === "type" ? "Type" : "Draw"}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>Full Name *</label>
                    <input value={signedBy} onChange={e => setSignedBy(e.target.value)} placeholder="Your full name"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111", background: "#fff", boxSizing: "border-box" }} />
                  </div>

                  {sigMode === "draw" && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>Draw your signature</label>
                      <canvas ref={canvasRef} width={600} height={120}
                        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                        style={{ border: "1px solid #e5e7eb", borderRadius: 8, cursor: "crosshair", width: "100%", display: "block", background: "#fff" }} />
                      <button onClick={clearCanvas} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Clear</button>
                    </div>
                  )}
                  {sigMode === "type" && signedBy && (
                    <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", marginBottom: 12 }}>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#111", fontStyle: "italic" }}>{signedBy}</p>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Action buttons */}
        {!alreadySigned && !alreadyDeclined && (
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setShowDecline(true)}
              style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#EF4444", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Decline
            </button>
            <button onClick={handleSign} disabled={submitting || !signedBy.trim()}
              style={{ padding: "12px 32px", borderRadius: 10, background: accentColor, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", opacity: (submitting || !signedBy.trim()) ? 0.6 : 1 }}>
              {submitting ? "Signing…" : "Sign & Accept"}
            </button>
          </div>
        )}

        {alreadySigned && (
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: "#10B98110", border: "1px solid #10B98130", textAlign: "center" }}>
            <Check size={20} style={{ color: "#10B981", display: "inline", marginRight: 8 }} />
            <span style={{ color: "#10B981", fontWeight: 600 }}>Signed by {proposal.signedBy as string}</span>
          </div>
        )}

        {alreadyDeclined && (
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: "#EF444410", border: "1px solid #EF444430", textAlign: "center" }}>
            <X size={20} style={{ color: "#EF4444", display: "inline", marginRight: 8 }} />
            <span style={{ color: "#EF4444", fontWeight: 600 }}>This proposal was declined</span>
          </div>
        )}
      </div>

      {/* Decline modal */}
      {showDecline && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>Decline Proposal</h3>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>Reason (optional)</label>
            <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3}
              placeholder="Let us know why you're declining…"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={() => setShowDecline(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#666", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDecline} disabled={submitting} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#EF4444", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
                {submitting ? "Declining…" : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
