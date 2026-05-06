import { useState, useEffect } from "react";
import { useTenant } from "../tenants/useTenant";
import { getFleet } from "../utils/fleet";
import { getOccupancy } from "../utils/storage";

export default function FleetStatus() {
  const tenant = useTenant();
  const [fleet, setFleet] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const tenantFleet = getFleet(tenant.id).map(bus => {
      const occupied = getOccupancy(bus.id, selectedDate);
      const percentage = Math.round((occupied / bus.capacity) * 100);
      return { ...bus, occupied, percentage };
    });
    setFleet(tenantFleet);
  }, [tenant.id, selectedDate]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Fleet Status
          </h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 15 }}>
            Real-time capacity and operational health of your fleet.
          </p>
        </div>

        <div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              fontWeight: "600",
              background: "#fff",
              cursor: "pointer"
            }}
          />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {fleet.map(bus => (
          <div key={bus.id} style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "800", color: "#0f172a" }}>{bus.id}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: "600" }}>{bus.reg} • {bus.model}</div>
              </div>
              <div style={{ 
                padding: "6px 12px", 
                borderRadius: 100, 
                fontSize: 10, 
                fontWeight: "800", 
                background: bus.status === "active" ? "#dcfce7" : "#fee2e2",
                color: bus.status === "active" ? "#16a34a" : "#dc2626",
                textTransform: "uppercase"
              }}>
                {bus.status}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: "700" }}>
                <span style={{ color: "#64748b" }}>Occupancy</span>
                <span style={{ color: "#1e293b" }}>{bus.percentage}%</span>
              </div>
              <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ 
                  width: `${bus.percentage}%`, 
                  height: "100%", 
                  background: bus.percentage > 90 ? "#dc2626" : bus.percentage > 70 ? "#f59e0b" : tenant.primaryColor,
                  transition: "0.5s ease"
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                {bus.occupied} / {bus.capacity} Seats Booked
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ 
                flex: 1, 
                padding: "10px", 
                borderRadius: 12, 
                border: "1px solid #e2e8f0", 
                background: "#f8fafc", 
                fontSize: 12, 
                fontWeight: "700",
                cursor: "pointer"
              }}>Manifest</button>
              <button style={{ 
                flex: 1, 
                padding: "10px", 
                borderRadius: 12, 
                border: "none", 
                background: "#1e293b", 
                color: "#fff", 
                fontSize: 12, 
                fontWeight: "700",
                cursor: "pointer"
              }}>Tracking</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
