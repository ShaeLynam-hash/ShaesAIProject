export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#070709",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: -200, left: "30%", width: 600, height: 400, background: "rgba(245,158,11,0.04)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, right: "10%", width: 400, height: 300, background: "rgba(99,102,241,0.03)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <img src="/stactoro-logo.png" alt="Stactoro" style={{ height: 80, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </a>
        </div>

        {children}
      </div>
    </div>
  );
}
