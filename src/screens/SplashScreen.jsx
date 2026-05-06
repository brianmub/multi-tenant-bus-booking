import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";

export default function SplashScreen() {
  const tenant = useTenant();
  const navigate = useNavigate();

  // Auto-navigate to Home after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate("/home", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Logo shape styles
  const logoShapeStyle = {
    square: { borderRadius: "18px" },
    circle: { borderRadius: "50%" },
    diamond: { borderRadius: "4px", transform: "rotate(45deg)" },
  }[tenant.logoShape] || { borderRadius: "18px" };

  const logoInnerStyle = tenant.logoShape === "diamond"
    ? { display: "inline-block", transform: "rotate(-45deg)" }
    : {};

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      minHeight: "100vh",
      background: tenant.bgGradient,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative background circles */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 280, height: 280,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60,
        width: 200, height: 200,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{
        width: 90, height: 90,
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        ...logoShapeStyle,
      }}>
        <span style={{
          fontSize: 38,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: -1,
          ...logoInnerStyle,
        }}>
          {tenant.logo}
        </span>
      </div>

      {/* Operator name */}
      <div style={{ textAlign: "center", padding: "0 32px" }}>
        <h1 style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: -0.5,
          marginBottom: 8,
          lineHeight: 1.1,
        }}>
          {tenant.name}
        </h1>
        <p style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 500,
          letterSpacing: 0.2,
        }}>
          {tenant.tagline}
        </p>
      </div>

      {/* Loading dots */}
      <LoadingDots />

      {/* Bottom tagline */}
      <p style={{
        position: "absolute",
        bottom: 40,
        fontSize: 12,
        color: "rgba(255,255,255,0.45)",
        letterSpacing: 0.5,
        fontWeight: 500,
      }}>
        Powered by eTechZim
      </p>
    </div>
  );
}

function LoadingDots() {
  return (
    <>
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot { 
          width: 9px; height: 9px; border-radius: 50%; 
          background: rgba(255,255,255,0.8);
          animation: dotPulse 1.4s ease-in-out infinite;
          display: inline-block;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </>
  );
}
