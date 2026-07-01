import { useTenant } from "../tenants/useTenant";

export default function BorderChecklist() {
  const tenant = useTenant();

  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      padding: 24,
      marginTop: 24,
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 24 }}>🛂</div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: "800", margin: 0, color: "#1e293b" }}>Border Requirements</h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>Beitbridge Port of Entry</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${tenant.primaryColor}22`, color: tenant.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "800", flexShrink: 0, marginTop: 2 }}>✓</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>Valid Passport</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Must be valid for at least 6 months.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${tenant.primaryColor}22`, color: tenant.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "800", flexShrink: 0, marginTop: 2 }}>✓</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>Visas / Permits</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Ensure any necessary transit or work visas are valid.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${tenant.primaryColor}22`, color: tenant.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "800", flexShrink: 0, marginTop: 2 }}>✓</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>Customs Declaration</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>$200 USD equivalent limit on declared goods.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
