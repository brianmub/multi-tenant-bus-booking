import { useState, useEffect } from "react";
import { useTenant } from "../tenants/useTenant";
import { getFleet } from "../utils/fleet";
import { getBusPosition } from "../utils/tracking";

export default function FleetMap() {
  const tenant = useTenant();
  const [buses, setBuses] = useState([]);
  const [forecasts, setForecasts] = useState({});
  
  useEffect(() => {
    const updatePositions = async () => {
      const fleet = getFleet(tenant.id).map(bus => {
        const position = getBusPosition(bus.id);
        return { ...bus, ...position };
      });
      setBuses(fleet);

      // Fetch AI forecasts for each route if not already fetched
      const { getDemandForecast } = await import("../utils/ai");
      const newForecasts = { ...forecasts };
      for (const bus of fleet) {
        if (!newForecasts[bus.id]) {
          newForecasts[bus.id] = await getDemandForecast(bus.route);
        }
      }
      setForecasts(newForecasts);
    };

    updatePositions();
    const interval = setInterval(updatePositions, 3000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", height: "100%", padding: "0 24px" }}>
      <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            AI-Enhanced Fleet Monitoring
          </h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 15 }}>
            Real-time GPS tracking with predictive demand heatmaps.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: "700", color: "#64748b" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#ef4444" }}></div> High Demand
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: "700", color: "#64748b" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#22c55e" }}></div> Normal
          </div>
        </div>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 24,
        height: "calc(100vh - 200px)"
      }}>
        {/* Visual Map Area */}
        <div style={{
          background: "#e2e8f0",
          borderRadius: 32,
          position: "relative",
          overflow: "hidden",
          border: "4px solid #fff",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)"
        }}>
           {/* Stylized Map SVG */}
           <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ background: "#cbd5e1" }}>
              <path d="M100,100 Q400,50 700,100 T700,500 T100,500 Z" fill="#94a3b8" opacity="0.3" />
              <path d="M50,300 L750,300 M400,50 L400,550" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10,10" />
              
              {/* Bus Markers */}
              {buses.map(bus => {
                const forecast = forecasts[bus.id];
                const isHighDemand = forecast?.score > 75;
                return (
                  <g key={bus.id} style={{ transition: "all 3s linear" }} transform={`translate(${200 + (bus.lat + 26) * 50}, ${300 + (bus.lng - 28) * 50})`}>
                    <circle r="12" fill={isHighDemand ? "#ef4444" : tenant.primaryColor} stroke="#fff" strokeWidth="3" />
                    <text y="-20" textAnchor="middle" style={{ fontSize: 10, fontWeight: "800", fill: "#1e293b" }}>{bus.id}</text>
                    <circle r="20" fill={isHighDemand ? "#ef4444" : tenant.primaryColor} opacity="0.2">
                      <animate attributeName="r" from="12" to="30" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
           </svg>
        </div>

        {/* Live Sidebar */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 32, 
          padding: 24, 
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflowY: "auto"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: "800", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            Live Updates
            <span style={{ fontSize: 10, background: "#f1f5f9", padding: "4px 8px", borderRadius: 8 }}>AI Active</span>
          </h3>
          {buses.map(bus => {
            const forecast = forecasts[bus.id];
            return (
              <div key={bus.id} style={{
                padding: 16,
                borderRadius: 20,
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                position: "relative",
                overflow: "hidden"
              }}>
                {forecast?.score > 75 && (
                  <div style={{ 
                    position: "absolute", 
                    top: 0, 
                    right: 0, 
                    background: "#ef4444", 
                    color: "#fff", 
                    fontSize: 8, 
                    padding: "2px 8px", 
                    fontWeight: "900",
                    borderBottomLeftRadius: 10
                  }}>HIGH DEMAND</div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: "800", color: "#1e293b", fontSize: 13 }}>{bus.id}</span>
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: "900", 
                    color: bus.status === "Arrived" ? "#16a34a" : tenant.primaryColor,
                    textTransform: "uppercase"
                  }}>{bus.status}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Route Demand: {forecast?.score || "..."}%</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Recommendation: {forecast?.recommendation || "Analyzing..."}</div>
                <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                  <div style={{ width: `${bus.progress}%`, height: "100%", background: tenant.primaryColor, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
