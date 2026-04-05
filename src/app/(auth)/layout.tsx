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
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 9C7.5 9 5 7 4.5 4C4 1.5 6 0.5 7.5 2C8.5 3 8 5.5 8.5 8" fill="#0a0800"/>
                <path d="M16.5 9C16.5 9 19 7 19.5 4C20 1.5 18 0.5 16.5 2C15.5 3 16 5.5 15.5 8" fill="#0a0800"/>
                <path d="M7.5 8.5C5.5 8.5 5 9.5 5 11V15.5C5 17.5 6.5 19.5 12 19.5C17.5 19.5 19 17.5 19 15.5V11C19 9.5 18.5 8.5 16.5 8.5H7.5Z" fill="#0a0800"/>
                <ellipse cx="12" cy="17.5" rx="4.5" ry="3" fill="#0a0800"/>
                <circle cx="10.2" cy="18" r="1.1" fill="#F59E0B" opacity="0.6"/>
                <circle cx="13.8" cy="18" r="1.1" fill="#F59E0B" opacity="0.6"/>
                <circle cx="9" cy="12.5" r="1.4" fill="#F59E0B" opacity="0.7"/>
                <circle cx="15" cy="12.5" r="1.4" fill="#F59E0B" opacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#EDEDF0", letterSpacing: "-0.02em" }}>Stactoro</span>
          </a>
        </div>

        {children}
      </div>
    </div>
  );
}
