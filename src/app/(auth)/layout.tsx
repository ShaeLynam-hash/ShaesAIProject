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
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #C41E1E, #7B0F0F)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5,2 C18.5,0 22,0.5 22,4 C19.5,3.5 20.5,6.5 18,7 C20,9 17.5,12 14,9.5 C17,8 14.5,5 16.5,2.5Z" fill="#F59E0B"/>
                <path d="M7.5,11 C5,7 2.5,5.5 1.5,7 C3,8.5 5.5,10.5 7.5,11" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M11.5,10 C12,6.5 11,4 9,4.5 C9.5,6.5 11,9 11.5,10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M4,12 C1.5,13 1.5,16.5 2.5,19.5 C3.5,22 6.5,23.5 9.5,23.5 C12.5,23.5 15,21.5 15.5,18.5 C16,15.5 14.5,13 11.5,12 C9.5,11.5 6.5,11.5 4,12Z" fill="white" opacity="0.92"/>
                <circle cx="7" cy="15.5" r="1.5" fill="#B91C1C"/>
                <path d="M2.5,22.5 Q8.5,20.5 14.5,22.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
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
