import { useState } from "react";
import { useTenant } from "../tenants/useTenant";
import AdminCutoffPanel from "./AdminCutoffPanel";
import { getFleet } from "../utils/fleet";
import { getAllBookings, getOccupancy } from "../utils/storage";
import { supabase } from "../utils/supabaseClient";
import { useEffect } from "react";

export default function AdminDashboard() {
  const tenant = useTenant();
  const [cutoffConfig, setCutoffConfig] = useState({
    bookingCutoffMins: tenant.bookingCutoffMins || 60,
    closingSoonMins: 120,
  });

  const [mapEnabled, setMapEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from("app_settings").select("settings").eq("id", "global").single();
        if (data && data.settings) setMapEnabled(data.settings.enable_live_map);
      } catch (e) {
        console.log("Settings not loaded", e.message);
      }
    };
    fetchSettings();
  }, []);

  const toggleMap = async () => {
    const newVal = !mapEnabled;
    setMapEnabled(newVal);
    await supabase.from("app_settings").update({ settings: { enable_live_map: newVal } }).eq("id", "global");
  };

  const today = new Date().toISOString().split('T')[0];
  const allBookings = getAllBookings();
  const tenantBookings = allBookings.filter(b => b.tenantId === tenant.id);
  const todayBookings = tenantBookings.filter(b => b.timestamp.startsWith(today));
  
  const totalRevenue = tenantBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const fleet = getFleet(tenant.id);
  const activeBuses = fleet.filter(b => b.status === "active").length;

  const stats = [
    { label: "Today's Bookings", value: todayBookings.length.toString(), change: "+100%", icon: "🎟️" },
    { label: "Active Buses", value: `${activeBuses}/${fleet.length}`, change: "Stable", icon: "🚌" },
    { label: "Total Revenue", value: `${tenant.baseCurrency} ${totalRevenue.toLocaleString()}`, change: "Live", icon: "💰" },
    { label: "Avg. Occupancy", value: "65%", change: "+2%", icon: "⭐" },
  ];

  return (
    <div>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
          Operational Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 15 }}>
          Welcome back. Here is what is happening across **{tenant.name}** today.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: "#fff",
            padding: 24,
            borderRadius: 24,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>{stat.icon}</div>
            <div style={{ fontSize: 13, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <div style={{ fontSize: 24, fontWeight: "900", color: "#0f172a" }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: "700", color: stat.change.includes("+") ? "#16a34a" : "#64748b" }}>{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Recent Activity */}
        <div style={{
          background: "#fff",
          padding: 32,
          borderRadius: 32,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 24 }}>Recent Departures</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { route: "Harare → Bulawayo", time: "10:30 AM", status: "Departed", passengers: "38/40" },
              { route: "Harare → Mutare", time: "11:45 AM", status: "Boarding", passengers: "42/50" },
              { route: "Bulawayo → Beit Bridge", time: "01:15 PM", status: "Scheduled", passengers: "12/50" },
            ].map((bus, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: i === 2 ? "none" : "1px solid #f1f5f9"
              }}>
                <div>
                  <div style={{ fontWeight: "700", color: "#1e293b" }}>{bus.route}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Scheduled for {bus.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: "800", 
                    padding: "4px 10px", 
                    borderRadius: 100,
                    background: bus.status === "Departed" ? "#f1f5f9" : bus.status === "Boarding" ? "#f0fdf4" : "#eff6ff",
                    color: bus.status === "Departed" ? "#64748b" : bus.status === "Boarding" ? "#16a34a" : "#2563eb",
                    display: "inline-block",
                    marginBottom: 4
                  }}>
                    {bus.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: "600", color: "#94a3b8" }}>{bus.passengers} Seats</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Controls Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 32,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: "800", marginBottom: 16 }}>Control Center</h3>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: "1.5", marginBottom: 20 }}>
              Adjust real-time booking windows and cutoff thresholds.
            </p>
            <AdminCutoffPanel config={cutoffConfig} onChange={setCutoffConfig} inline={true} />
          </div>

          {/* Tracking Configuration */}
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 32,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: "800", margin: 0 }}>Interactive Live Maps</h3>
              <button onClick={toggleMap} style={{
                background: mapEnabled ? "#16a34a" : "#e2e8f0",
                width: 48, height: 28, borderRadius: 100, border: "none", position: "relative", cursor: "pointer",
                transition: "background 0.2s"
              }}>
                <div style={{
                  background: "#fff", width: 20, height: 20, borderRadius: "50%", position: "absolute", top: 4,
                  left: mapEnabled ? 24 : 4, transition: "left 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: "1.5", margin: 0 }}>
              {mapEnabled ? "Leaflet GPS maps are active. Passengers see actual street maps." : "Map disabled. Passengers will see CSS estimation progress."}
            </p>
          </div>

          {/* AI Optimizer */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            padding: 24,
            borderRadius: 32,
            color: "#fff",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <h3 style={{ fontSize: 16, fontWeight: "800", margin: 0 }}>Revenue Optimizer</h3>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: "700", marginBottom: 4 }}>AI SUGGESTION</div>
              <div style={{ fontSize: 13, fontWeight: "600", lineHeight: "1.4" }}>
                Predicted demand for <span style={{ color: "#fbbf24" }}>Harare → Bulawayo</span> is up 40%. Suggest increasing price by 15% for the next 24h.
              </div>
            </div>
            <button style={{
              width: "100%",
              background: "#fff",
              color: "#0f172a",
              border: "none",
              padding: "12px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: "800",
              cursor: "pointer"
            }}>Apply Optimization</button>
          </div>
        </div>
      </div>
    </div>
  );
}
