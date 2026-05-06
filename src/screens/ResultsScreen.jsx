import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import BusCard from "../components/BusCard";
import Nav from "../components/Nav";
import CurrencyBar from "../components/CurrencyBar";
import AdminCutoffPanel from "../admin/AdminCutoffPanel";
import { getFleet } from "../utils/fleet";
import { getOccupancy } from "../utils/storage";

const isAdminMode = import.meta.env.VITE_ADMIN_MODE === "true";

export default function ResultsScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenant = useTenant();

  const [cutoffConfig, setCutoffConfig] = useState({
    bookingCutoffMins: 30,
    closingSoonMins: 60
  });

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date") || new Date().toISOString();

  // Dynamic fleet with real-time capacity calculation
  const fleet = getFleet(tenant.id);
  const buses = fleet.map((bus, index) => {
    const occupied = getOccupancy(bus.id, date);
    const available = bus.capacity - occupied;
    
    // Simulate staggered times for demo purposes
    const hour = 8 + (index * 2);
    const time = `${hour < 10 ? '0' + hour : hour}:30 AM`;

    return {
      ...bus,
      time,
      routeName: `${from} to ${to}`,
      price: bus.class === "VIP" ? 25 : bus.class === "Executive" ? 20 : 15,
      availableSeats: available,
      busNumber: bus.reg
    };
  });

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        background: tenant.bgGradient,
        padding: "24px 24px 40px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: "rgba(255,255,255,0.2)", 
              border: "none", 
              width: 40, 
              height: 40, 
              borderRadius: "50%", 
              color: "#fff",
              fontSize: 20,
              cursor: "pointer"
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: "800" }}>{from} → {to}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        
        <CurrencyBar />
      </div>

      {/* Results */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "#666", fontWeight: "600" }}>{buses.length} Buses found</span>
          <button style={{ background: "none", border: "none", color: tenant.primaryColor, fontWeight: "700", fontSize: 14 }}>Filter ⚙️</button>
        </div>

        {buses.map(bus => (
          <BusCard 
            key={bus.id} 
            bus={bus} 
            cutoffConfig={cutoffConfig}
            onClick={() => navigate(`/seats/${bus.id}`)}
          />
        ))}
      </div>

      {isAdminMode && (
        <AdminCutoffPanel config={cutoffConfig} onChange={setCutoffConfig} />
      )}

      <Nav />
    </div>
  );
}
