import { useState } from "react";
import { useTenant } from "../tenants/useTenant";

export default function AdminCutoffPanel({ config, onChange, inline = false }) {
  const [isOpen, setIsOpen] = useState(inline);
  const tenant = useTenant();

  if (!isOpen && !inline) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          background: "#1e293b",
          color: "#fff",
          border: "none",
          padding: "12px 16px",
          borderRadius: "100px",
          fontSize: "12px",
          fontWeight: "700",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 99,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        ⚙️ STAFF PANEL
      </button>
    );
  }

  const containerStyle = inline ? {
    width: "100%",
    background: "transparent",
    padding: 0,
    boxShadow: "none",
    border: "none",
    zIndex: "auto"
  } : {
    position: "fixed",
    bottom: 80,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 -20px 40px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.1)",
    zIndex: 1000,
    border: "1px solid #e2e8f0"
  };

  return (
    <div style={containerStyle}>
      {!inline && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Operational Controls</h3>
          <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: "700", color: "#64748b", marginBottom: 8, display: "block" }}>BOOKING CUTOFF (MINS)</label>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={config.bookingCutoffMins}
            onChange={(e) => onChange({ ...config, bookingCutoffMins: parseInt(e.target.value) })}
            style={{ width: "100%", accentColor: tenant.primaryColor }}
          />
          <div style={{ textAlign: "right", fontSize: 12, fontWeight: "600", color: tenant.primaryColor }}>{config.bookingCutoffMins}m before departure</div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: "700", color: "#64748b", marginBottom: 8, display: "block" }}>CLOSING SOON THRESHOLD (MINS)</label>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={config.closingSoonMins}
            onChange={(e) => onChange({ ...config, closingSoonMins: parseInt(e.target.value) })}
            style={{ width: "100%", accentColor: tenant.primaryColor }}
          />
          <div style={{ textAlign: "right", fontSize: 12, fontWeight: "600", color: tenant.primaryColor }}>{config.closingSoonMins}m before departure</div>
        </div>

        <div style={{ padding: 12, background: "#f8fafc", borderRadius: 12, fontSize: 11, color: "#64748b", lineHeight: "1.5" }}>
          ⚠️ These settings affect real-time booking availability for all passengers.
        </div>
      </div>
    </div>
  );
}
