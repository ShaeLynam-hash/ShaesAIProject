import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Params = { workspaceSlug: string; pageSlug: string };
type Block = { id: string; type: string; data: Record<string, unknown> };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { workspaceSlug, pageSlug } = await params;
  const page = await prisma.landingPage.findFirst({
    where: { workspace: { slug: workspaceSlug }, slug: pageSlug },
    select: { name: true, seoTitle: true, seoDesc: true },
  });
  return {
    title: page?.seoTitle ?? page?.name ?? "Page",
    description: page?.seoDesc ?? undefined,
  };
}

export default async function PublicPage({ params }: { params: Promise<Params> }) {
  const { workspaceSlug, pageSlug } = await params;
  const page = await prisma.landingPage.findFirst({
    where: { workspace: { slug: workspaceSlug }, slug: pageSlug, published: true },
  });
  if (!page) notFound();

  // Increment view count (non-blocking)
  prisma.landingPage.update({ where: { id: page.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const blocks = (page.blocks as Block[]) ?? [];

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #111; background: #fff; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
          .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none; cursor: pointer; transition: opacity .2s; }
          .btn:hover { opacity: .88; }
        `}</style>
      </head>
      <body>
        {blocks.map((block) => <BlockRenderer key={block.id} block={block} pageId={page.id} />)}
      </body>
    </html>
  );
}

function BlockRenderer({ block, pageId }: { block: Block; pageId: string }) {
  const d = block.data;
  switch (block.type) {
    case "hero": return (
      <section style={{
        background: d.bgImageUrl ? `url(${d.bgImageUrl}) center/cover` : String(d.bgColor ?? "#1a1a2e"),
        padding: "100px 24px",
        textAlign: "center",
        color: "#fff",
      }}>
        <div className="container">
          <h1 style={{ fontSize: "clamp(32px,5vw,64px)", fontWeight: 800, marginBottom: 20, lineHeight: 1.2 }}>{String(d.headline ?? "")}</h1>
          <p style={{ fontSize: "clamp(16px,2vw,22px)", opacity: 0.85, marginBottom: 36, maxWidth: 600, margin: "0 auto 36px" }}>{String(d.subheadline ?? "")}</p>
          {!!d.ctaText && <a href={String(d.ctaUrl ?? "#")} className="btn" style={{ background: "#F59E0B", color: "#fff" }}>{String(d.ctaText)}</a>}
        </div>
      </section>
    );

    case "features": {
      const items = (d.items as Array<{ icon: string; title: string; desc: string }>) ?? [];
      return (
        <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
          <div className="container">
            {!!d.heading && <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>{String(d.heading)}</h2>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 32 }}>
              {items.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "#666", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "text": return (
      <section style={{ padding: "60px 24px" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: "#444", whiteSpace: "pre-wrap" }}>{String(d.content ?? "")}</p>
        </div>
      </section>
    );

    case "image": return (
      <section style={{ padding: "40px 24px", textAlign: "center" }}>
        <div className="container">
          {!!d.src && <img src={String(d.src)} alt={String(d.alt ?? "")} style={{ maxWidth: "100%", borderRadius: 12 }} />}
          {!!d.caption && <p style={{ marginTop: 12, color: "#888", fontSize: 14 }}>{String(d.caption)}</p>}
        </div>
      </section>
    );

    case "cta": return (
      <section style={{ background: String(d.bgColor ?? "#6366F1"), padding: "80px 24px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontWeight: 800, color: "#fff", marginBottom: 32 }}>{String(d.headline ?? "")}</h2>
          {!!d.ctaText && <a href={String(d.ctaUrl ?? "#")} className="btn" style={{ background: "#fff", color: String(d.bgColor ?? "#6366F1") }}>{String(d.ctaText)}</a>}
        </div>
      </section>
    );

    case "form": {
      const fields = (d.fields as string[]) ?? ["name", "email"];
      return (
        <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
          <div className="container" style={{ maxWidth: 500 }}>
            {!!d.heading && <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>{String(d.heading)}</h2>}
            <form action={`/api/pages/${pageId}/submit`} method="POST" style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              {fields.includes("name") && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
                  <input name="name" placeholder="John Doe" required style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 15 }} />
                </div>
              )}
              {fields.includes("email") && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                  <input name="email" type="email" placeholder="you@example.com" required style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 15 }} />
                </div>
              )}
              {fields.includes("phone") && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Phone</label>
                  <input name="phone" type="tel" placeholder="+1 555 000 0000" style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 15 }} />
                </div>
              )}
              <button type="submit" className="btn" style={{ background: "#F59E0B", color: "#fff", width: "100%", textAlign: "center", border: "none" }}>
                {String(d.submitText ?? "Submit")}
              </button>
            </form>
          </div>
        </section>
      );
    }

    case "testimonials": {
      const items = (d.items as Array<{ name: string; role: string; quote: string; avatar?: string }>) ?? [];
      return (
        <section style={{ padding: "80px 24px" }}>
          <div className="container">
            {!!d.heading && <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>{String(d.heading)}</h2>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
              {items.map((t, i) => (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: "#444", marginBottom: 20, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                      <p style={{ color: "#888", fontSize: 13 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "pricing": {
      const tiers = (d.tiers as Array<{ name: string; price: string; features: string[]; cta: string; highlighted?: boolean }>) ?? [];
      return (
        <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
          <div className="container">
            {!!d.heading && <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>{String(d.heading)}</h2>}
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              {tiers.map((tier, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", border: tier.highlighted ? "2px solid #6366F1" : "1px solid #e5e7eb", minWidth: 260, flex: "1 1 260px", maxWidth: 340, boxShadow: tier.highlighted ? "0 4px 24px rgba(99,102,241,0.15)" : "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {tier.highlighted && <div style={{ background: "#6366F1", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 16 }}>POPULAR</div>}
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{tier.name}</p>
                  <p style={{ fontSize: 40, fontWeight: 800, color: "#111", marginBottom: 24 }}>{tier.price}<span style={{ fontSize: 16, color: "#888", fontWeight: 400 }}>/mo</span></p>
                  <ul style={{ listStyle: "none", marginBottom: 28 }}>
                    {tier.features.map((f, fi) => (
                      <li key={fi} style={{ padding: "6px 0", fontSize: 14, color: "#444", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="btn" style={{ background: tier.highlighted ? "#6366F1" : "#111", color: "#fff", width: "100%", textAlign: "center", display: "block" }}>{tier.cta}</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (d.items as Array<{ q: string; a: string }>) ?? [];
      return (
        <section style={{ padding: "80px 24px" }}>
          <div className="container" style={{ maxWidth: 720 }}>
            {!!d.heading && <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>{String(d.heading)}</h2>}
            {items.map((item, i) => (
              <details key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 20, marginBottom: 20 }}>
                <summary style={{ fontSize: 17, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>{item.q}</summary>
                <p style={{ color: "#555", lineHeight: 1.7, marginTop: 12, fontSize: 15 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    case "video": {
      const url = String(d.url ?? "");
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      const vmMatch = url.match(/vimeo\.com\/(\d+)/);
      const embedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : vmMatch ? `https://player.vimeo.com/video/${vmMatch[1]}` : null;
      return (
        <section style={{ padding: "60px 24px" }}>
          <div className="container" style={{ maxWidth: 800 }}>
            {embedUrl ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12 }}>
                <iframe src={embedUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
              </div>
            ) : url ? <a href={url} style={{ color: "#6366F1" }}>{url}</a> : null}
            {!!d.caption && <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginTop: 12 }}>{String(d.caption)}</p>}
          </div>
        </section>
      );
    }

    case "spacer": return <div style={{ height: `${Number(d.height ?? 40)}px` }} />;
    case "divider": return <div style={{ padding: "0 24px" }}><hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px auto", maxWidth: 1100 }} /></div>;
    default: return null;
  }
}
